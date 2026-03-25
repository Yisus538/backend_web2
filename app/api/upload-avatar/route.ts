import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

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


    const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
    try {
      await fs.access(avatarsDir);
    } catch {
      await fs.mkdir(avatarsDir, { recursive: true });
    }


    const filename = `${user.userId}-${Date.now()}.webp`;
    const filepath = path.join(avatarsDir, filename);

    // Convertimos a WebP y recortamos a 500x500
    await sharp(buffer)
      .resize(500, 500, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(filepath);

    return NextResponse.json({ success: true, url: `/avatars/${filename}` });

  } catch (error) {
    console.error('Error procesando imagen:', error);
    return NextResponse.json({ message: 'Error en el servidor al procesar la imagen' }, { status: 500 });
  }
}