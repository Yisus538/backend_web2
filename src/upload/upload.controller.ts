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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

// Lazy-load both heavy native modules so they don't block NestJS startup.
// cloudinary v2 and sharp both hang the event loop for several seconds on macOS
// when required at module load time.
let cloudinaryLib: typeof import('cloudinary') | null = null;
let sharpLib: typeof import('sharp') | null = null;

async function getCloudinary() {
  if (!cloudinaryLib) {
    cloudinaryLib = await import('cloudinary');
    cloudinaryLib.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key:    process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    });
  }
  return cloudinaryLib.v2;
}

async function getSharp() {
  if (!sharpLib) sharpLib = (await import('sharp')).default as any;
  return sharpLib!;
}

@Controller('upload-avatar')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 },
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
      const sharp     = await getSharp();
      const cloudinary = await getCloudinary();

      const webpBuffer = await sharp(file.buffer)
        .resize(500, 500, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();

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
