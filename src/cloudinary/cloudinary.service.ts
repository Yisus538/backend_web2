import { Injectable, Inject } from '@nestjs/common';
import { UploadApiResponse, v2 as CloudinaryType } from 'cloudinary';
import * as sharp from 'sharp';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary: typeof CloudinaryType,
  ) {}

  async uploadAvatar(buffer: Buffer, userId: string): Promise<{ url: string }> {
    const webpBuffer = await sharp(buffer)
      .resize(500, 500, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream(
          { folder: 'avatars', public_id: `${userId}-${Date.now()}`, resource_type: 'image' },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve({ url: (result as UploadApiResponse).secure_url });
          },
        )
        .end(webpBuffer);
    });
  }
}
