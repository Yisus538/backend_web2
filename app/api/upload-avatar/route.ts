import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  const { user } = getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ message: 'No se envió imagen' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convertir a webp con sharp
    const webpBuffer = await sharp(buffer)
      .resize(500, 500, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    // Subir a Cloudinary
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
          public_id: `${user.userId}-${Date.now()}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result as { secure_url: string });
        }
      ).end(webpBuffer);
    });

    return NextResponse.json({ 
      success: true, 
      data: { url: result.secure_url },  
      message: "Avatar subido correctamente" 
    });

  } catch (error) {
    console.error('Error procesando imagen:', error);
    return NextResponse.json({ message: 'Error en el servidor al procesar la imagen' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}