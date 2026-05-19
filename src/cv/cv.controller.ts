import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Headers,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { CvService } from './cv.service';
import { CvAnalisisDto } from './dto/cv-analisis.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';


@Controller('cv')
export class CvController {
  private readonly logger = new Logger(CvController.name);

  constructor(
    private readonly cvService:        CvService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly prisma:            PrismaService,
  ) {}

  // ────────────────────────────────────────────────────────────────
  // POST /api/cv/analyze
  // Solo candidatos autenticados. Envía el CV a Make.com (fire-and-forget).
  // ────────────────────────────────────────────────────────────────
  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  @UseInterceptors(FileInterceptor('documento_cv', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('No se recibió el archivo del CV');

    // Make es fire-and-forget; Cloudinary se espera para retornar la URL al frontend
    this.sendToMake(file, user.userId).catch(err =>
      this.logger.error('[analyze] Error enviando a Make.com:', err),
    );
    const cvUrl = await this.uploadCvToCloudinary(file, user.userId);

    return { ok: true, message: 'CV recibido, procesando...', data: { cvUrl } };
  }

  // ────────────────────────────────────────────────────────────────
  // GET /api/cv/analisis-activo
  // Retorna el análisis más reciente del candidato autenticado,
  // incluyendo educación, experiencia e idiomas generados.
  // ────────────────────────────────────────────────────────────────
  @Get('analisis-activo')
  @UseGuards(JwtAuthGuard)
  async getAnalisisActivo(@CurrentUser() user: JwtPayload) {
    const analisis = await this.cvService.getAnalisisActivo(user.userId);
    return { ok: true, message: 'Análisis obtenido', data: { analisis } };
  }

  // ────────────────────────────────────────────────────────────────
  // GET /api/cv/analisis?candidatoId=<uuid>
  // Devuelve el último análisis IA del candidato.
  // ────────────────────────────────────────────────────────────────
  @Get('analisis')
  @UseGuards(JwtAuthGuard)
  async getAnalisis(
    @Query('candidatoId') candidatoId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const id   = candidatoId || user.userId;
    const data = await this.cvService.getAnalisis(id);
    return { ok: true, data };
  }

  // ────────────────────────────────────────────────────────────────
  // POST /api/cv/callback
  // Receptor del análisis de Make.com. Sin JWT — autenticado por header.
  // Make llama a este endpoint cuando termina de analizar el CV.
  // ────────────────────────────────────────────────────────────────
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async callback(
    @Headers('x-webhook-secret') secret: string,
    @Query('candidatoId') candidatoIdQuery: string,
    @Body() rawPayload: Record<string, any>,
  ) {
    const expected = process.env.WEBHOOK_SECRET ?? 'reclutaia-make-2024';
    if (!secret || secret !== expected) {
      this.logger.warn('[callback] Intento con secret inválido');
      throw new UnauthorizedException('Secret inválido');
    }

    this.logger.log('[callback] v2 — Payload crudo recibido: ' + JSON.stringify(rawPayload));

    const candidatoId =
      rawPayload?.candidatoId ||
      rawPayload?.candidato_id ||
      rawPayload?.CandidatoId ||
      rawPayload?.CANDIDATOID ||
      candidatoIdQuery ||
      '';

    if (!candidatoId) {
      this.logger.error(
        '[callback] candidatoId ausente. Campos recibidos: [' +
          Object.keys(rawPayload ?? {}).join(', ') +
          ']',
      );
      throw new BadRequestException('candidatoId requerido en el payload');
    }

    const p = rawPayload;
    const datosRaw = p.datos_del_candidato ?? {};
    const datos: Record<string, any> =
      typeof datosRaw === 'string' && datosRaw.trim()
        ? (() => { try { return JSON.parse(datosRaw); } catch { return {}; } })()
        : (typeof datosRaw === 'object' ? datosRaw : {});

    // ── Escalares: intentar múltiples nombres que Make puede usar ──
    const nombre_completo =
      p.nombre_completo ?? datos.nombre ?? p.nombre ?? p.name ?? p.full_name ?? null;

    const correo_cv =
      p.correo_cv ?? datos.email ?? datos.correo ?? p.correo ?? p.email ?? p.mail ?? null;

    const telefono_cv =
      p.telefono_cv ?? datos.telefono ?? p.telefono ?? p.phone ?? p.tel ?? p.celular ?? null;

    const puesto_evaluado =
      p.puesto_evaluado ?? datos.puesto ?? p.puesto ?? p.cargo_actual ??
      p.titulo_profesional ?? p.titulo ?? p.position ?? null;

    const motivo_rechazo =
      p.motivo_rechazo ?? p.motivo ?? p.rechazo ?? null;

    const resumen =
      p.resumen ?? p.resumen_ia ?? p.summary ?? p.descripcion_perfil ?? null;

    const confianza_datos =
      p.confianza_datos ?? p.confianza ?? p.score ?? p.puntuacion ?? null;

    // ── Arrays: normalizar aunque lleguen como string JSON serializado ──
    // Make a veces envía arrays como string: "{\"key\":\"val\"}, {\"key\":\"val\"}"
    const parseJsonArrayString = (v: any): any[] => {
      if (Array.isArray(v)) return v;
      if (typeof v !== 'string' || !v.trim()) return [];
      const trimmed = v.trim();
      if (trimmed.startsWith('[')) {
        try { return JSON.parse(trimmed); } catch { /* continuar */ }
      }
      if (trimmed.startsWith('{')) {
        try {
          const parts = trimmed.split(/\}\s*,\s*\{/);
          return parts.map((part, i) => {
            let s = part.trim();
            if (!s.startsWith('{')) s = '{' + s;
            if (!s.endsWith('}')) s = s + '}';
            return JSON.parse(s);
          });
        } catch { return []; }
      }
      // Strings planos separados por coma/punto y coma (para tecnologias)
      return trimmed.split(/[,;]/).map((s: string) => s.trim()).filter(Boolean);
    };

    const tecnologias_detectadas: string[] = parseJsonArrayString(
      p.tecnologias_detectadas ?? p.tecnologias ?? p.technologies ?? null,
    );
    const skills_detectadas    = parseJsonArrayString(p.skills_detectadas);
    const experiencia_laboral  = parseJsonArrayString(p.experiencia_laboral);
    const educacion            = parseJsonArrayString(p.educacion);
    const idiomas              = parseJsonArrayString(p.idiomas);

    // Log para confirmar qué valores se extrajeron
    this.logger.log(
      `[callback] Campos extraídos — nombre: ${nombre_completo}, correo: ${correo_cv}, ` +
      `telefono: ${telefono_cv}, puesto: ${puesto_evaluado}, ` +
      `skills: ${skills_detectadas.length}, tecno: ${tecnologias_detectadas.length}, ` +
      `exp: ${experiencia_laboral.length}, edu: ${educacion.length}, idiomas: ${idiomas.length}`,
    );

    const payload: CvAnalisisDto = {
      ...rawPayload,
      candidatoId,
      nombre_completo,
      correo_cv,
      telefono_cv,
      puesto_evaluado,
      motivo_rechazo,
      resumen,
      confianza_datos,
      tecnologias_detectadas,
      skills_detectadas,
      experiencia_laboral,
      educacion,
      idiomas,
    } as CvAnalisisDto;

    await this.cvService.procesarAnalisis(candidatoId, payload);
    return { ok: true, message: 'Análisis procesado' };
  }

  // Sube el CV a Cloudinary y persiste la URL en el registro de Candidato.
  // Retorna la secureUrl, o null si falla (el análisis IA sigue igual).
  private async uploadCvToCloudinary(
    file: Express.Multer.File,
    candidatoId: string,
  ): Promise<string | null> {
    if (file.mimetype !== 'application/pdf') return null;
    try {
      const { secureUrl } = await this.cloudinaryService.uploadCv(
        file.buffer,
        candidatoId,
        file.originalname,
      );
      await this.prisma.candidato.upsert({
        where:  { usuarioId: candidatoId },
        create: { usuarioId: candidatoId, urlCv: secureUrl },
        update: { urlCv: secureUrl },
      });
      this.logger.log(`[analyze] CV subido a Cloudinary: ${secureUrl}`);
      return secureUrl;
    } catch (err) {
      this.logger.error('[analyze] Error subiendo CV a Cloudinary:', err);
      return null;
    }
  }

  // ────────────────────────────────────────────────────────────────
  // Envía el CV a Make.com incluyendo candidatoId como campo de texto.
  // ────────────────────────────────────────────────────────────────
  private async sendToMake(file: Express.Multer.File, candidatoId: string): Promise<void> {
    const formData = new FormData();
    formData.append('candidatoId', candidatoId);
    formData.append(
      'documento_cv',
      new Blob([file.buffer as unknown as ArrayBuffer], { type: file.mimetype }),
      file.originalname,
    );

    const makeUrl = process.env.MAKE_CV_WEBHOOK_URL ?? '';
    if (!makeUrl) {
      this.logger.warn('[sendToMake] MAKE_CV_WEBHOOK_URL no configurada — saltando análisis IA');
      return;
    }
    const url = `${makeUrl}?candidatoId=${encodeURIComponent(candidatoId)}`;

    this.logger.log(`[sendToMake] Enviando CV a Make para candidato ${candidatoId}`);

    const apiKey = process.env.MAKE_API_KEY ?? '';
    const headers: Record<string, string> = {};
    if (apiKey) headers['x-make-apikey'] = apiKey;

    const response = await fetch(url, {
      method:  'POST',
      headers,
      body:    formData,
      signal:  AbortSignal.timeout(15_000),
    });

    this.logger.log(`[sendToMake] Respuesta de Make: ${response.status}`);

    if (!response.ok) {
      const text = await response.text();
      this.logger.error(`[sendToMake] Error de Make (${response.status}): ${text}`);
    }
  }
}
