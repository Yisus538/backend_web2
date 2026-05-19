import { Injectable, Inject } from '@nestjs/common';
import { UploadApiResponse, v2 as CloudinaryType } from 'cloudinary';
import * as sharp from 'sharp';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary: typeof CloudinaryType,
  ) {}

  async uploadCv(
    buffer: Buffer,
    userId: string,
    originalName: string,
  ): Promise<{ secureUrl: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const sanitizedName = originalName
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const publicId = `cv-${userId}-${sanitizedName}`;

      this.cloudinary.uploader
        .upload_stream(
          {
            folder:        'cvs',
            public_id:     publicId,
            resource_type: 'raw',
            format:        'pdf',
            overwrite:     true,
          },
          (error, result) => {
            if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
            resolve({ secureUrl: result.secure_url, publicId: result.public_id });
          },
        )
        .end(buffer);
    });
  }

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
