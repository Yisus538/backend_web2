import { NextRequest } from 'next/server';
import { ok, serverError, badRequest } from '@/lib/utils/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('documento_cv') as File | null;

    if (!file) return badRequest('No se recibió el archivo del CV');

    const makeUrl = "https://hook.us2.make.com/r7dc3o8jguw9t7olo1byd40knnfco6ks";
    const apiKey = "jitKx-t9QAJBR2_"; // ← completá la clave acá

    const makeFormData = new FormData();
    makeFormData.append('documento_cv', file, file.name);

    // Fire and forget — no esperamos respuesta de Make
    fetch(makeUrl, {
      method: 'POST',
      headers: { 'x-make-apikey': apiKey },
      body: makeFormData,
    }).catch(err => console.error("Error enviando a Make:", err));

    // Respuesta inmediata al frontend
    return ok('CV recibido, procesando...');

  } catch (error) {
    console.error("Error crítico:", error);
    return serverError('Error al conectar con el servicio de IA');
  }
}