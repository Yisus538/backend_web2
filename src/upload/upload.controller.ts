import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import * as sharp from 'sharp';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

// Configurar Cloudinary una sola vez al cargar el módulo
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

@Controller('upload-avatar')
@UseGuards(JwtAuthGuard)
export class UploadController {
  // ────────────────────────────────────────────────────────────
  // POST /api/upload-avatar
  // Recibe multipart/form-data con campo "avatar"
  // Convierte a WebP con sharp, sube a Cloudinary
  // ────────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máx
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se envió imagen');
    }

    try {
      // Convertir a WebP 500×500 (réplica exacta del route.ts original)
      const webpBuffer = await sharp(file.buffer)
        .resize(500, 500, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();

      // Subir a Cloudinary
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder:        'avatars',
              public_id:     `${user.userId}-${Date.now()}`,
              resource_type: 'image',
            },
            (error, res) => {
              if (error || !res) return reject(error);
              resolve(res as { secure_url: string });
            },
          )
          .end(webpBuffer);
      });

      return {
        success: true,
        data:    { url: result.secure_url },
        message: 'Avatar subido correctamente',
      };
    } catch (error) {
      console.error('[upload-avatar] Error procesando imagen:', error);
      throw new InternalServerErrorException('Error en el servidor al procesar la imagen');
    }
  }
}
