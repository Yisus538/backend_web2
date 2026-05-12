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

const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/r7dc3o8jguw9t7olo1byd40knnfco6ks';
const MAKE_API_KEY     = 'jitKx-t9QAJBR2_';

@Controller('cv')
export class CvController {
  private readonly logger = new Logger(CvController.name);

  constructor(private readonly cvService: CvService) {}

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

    this.sendToMake(file, user.userId).catch(err =>
      this.logger.error('[analyze] Error enviando a Make.com:', err),
    );

    return { ok: true, message: 'CV recibido, procesando...' };
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

    this.logger.log('[callback] Payload crudo recibido: ' + JSON.stringify(rawPayload));

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

    const payload: CvAnalisisDto = { ...rawPayload, candidatoId } as CvAnalisisDto;

    await this.cvService.procesarAnalisis(candidatoId, payload);
    return { ok: true, message: 'Análisis procesado' };
  }

  // ────────────────────────────────────────────────────────────────
  // Envía el CV a Make.com incluyendo candidatoId como campo de texto.
  // ────────────────────────────────────────────────────────────────
  private async sendToMake(file: Express.Multer.File, candidatoId: string): Promise<void> {
    const formData = new FormData();
    formData.append('candidatoId', candidatoId);
    formData.append(
      'documento_cv',
      new Blob([file.buffer], { type: file.mimetype }),
      file.originalname,
    );

    const url = `${MAKE_WEBHOOK_URL}?candidatoId=${encodeURIComponent(candidatoId)}`;

    this.logger.log(`[sendToMake] Enviando CV a Make para candidato ${candidatoId}`);

    const response = await fetch(url, {
      method:  'POST',
      headers: { 'x-make-apikey': MAKE_API_KEY },
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
