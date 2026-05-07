import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { CvService } from './cv.service';

const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/r7dc3o8jguw9t7olo1byd40knnfco6ks';
const MAKE_API_KEY     = 'jitKx-t9QAJBR2_';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('documento_cv', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async analyze(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió el archivo del CV');

    this.sendToMake(file).catch(err =>
      console.error('[cv/analyze] Error enviando a Make.com:', err),
    );

    return { ok: true, message: 'CV recibido, procesando...' };
  }

  // GET /api/cv/analisis?candidatoId=<uuid>
  // Si candidatoId no se pasa, devuelve el análisis del usuario autenticado.
  @Get('analisis')
  @UseGuards(JwtAuthGuard)
  async getAnalisis(
    @Query('candidatoId') candidatoId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const id = candidatoId || user.userId;
    const data = await this.cvService.getAnalisis(id);
    return { ok: true, data };
  }

  private async sendToMake(file: Express.Multer.File): Promise<void> {
    const boundary = `----FormBoundary${Date.now()}`;

    const header = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="documento_cv"; filename="${file.originalname}"\r\nContent-Type: ${file.mimetype}\r\n\r\n`,
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);

    const body = Buffer.concat([header, file.buffer, footer]);

    await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'x-make-apikey':  MAKE_API_KEY,
        'Content-Type':   `multipart/form-data; boundary=${boundary}`,
        'Content-Length': String(body.length),
      },
      body: body as any,
    });
  }
}
