import {
  Controller, Post, UseGuards, UploadedFile, UseInterceptors,
  BadRequestException, InternalServerErrorException, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('upload-avatar')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/'))
          return cb(new BadRequestException('Solo se permiten imágenes'), false);
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se envió imagen');
    try {
      const { url } = await this.cloudinaryService.uploadAvatar(file.buffer, user.userId);
      return { ok: true, message: 'Avatar subido correctamente', data: { url } };
    } catch (error) {
      console.error('[upload-avatar] Error procesando imagen:', error);
      throw new InternalServerErrorException('Error en el servidor al procesar la imagen');
    }
  }
}
