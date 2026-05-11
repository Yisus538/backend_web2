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
    @Body() payload: CvAnalisisDto,
  ) {
    const expected = process.env.WEBHOOK_SECRET ?? 'reclutaia-make-2024';
    if (!secret || secret !== expected) {
      this.logger.warn('[callback] Intento con secret inválido');
      throw new UnauthorizedException('Secret inválido');
    }

    if (!payload?.candidatoId) {
      throw new BadRequestException('candidatoId requerido en el payload');
    }

    this.logger.log(`[callback] Payload recibido para candidato ${payload.candidatoId}`);

    await this.cvService.procesarAnalisis(payload.candidatoId, payload);
    return { ok: true, message: 'Análisis procesado' };
  }

  // ────────────────────────────────────────────────────────────────
  // Envía el CV a Make.com incluyendo candidatoId como campo de texto.
  // ────────────────────────────────────────────────────────────────
  private async sendToMake(file: Express.Multer.File, candidatoId: string): Promise<void> {
    const boundary = `----FormBoundary${Date.now()}`;

    // Part 1: candidatoId (texto plano)
    const idPart = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="candidatoId"\r\n\r\n${candidatoId}\r\n`,
    );

    // Part 2: archivo CV
    const fileHeader = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="documento_cv"; filename="${file.originalname}"\r\nContent-Type: ${file.mimetype}\r\n\r\n`,
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);

    const body = Buffer.concat([idPart, fileHeader, file.buffer, footer]);

    await fetch(MAKE_WEBHOOK_URL, {
      method:  'POST',
      headers: {
        'x-make-apikey':  MAKE_API_KEY,
        'Content-Type':   `multipart/form-data; boundary=${boundary}`,
        'Content-Length': String(body.length),
      },
      body:   body as any,
      signal: AbortSignal.timeout(15_000),
    });
  }
}
