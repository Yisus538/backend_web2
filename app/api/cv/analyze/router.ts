// backend_web2-main/app/api/cv/analyze/route.ts
import { NextRequest } from 'next/server';
import { ok, serverError, badRequest } from '@/lib/utils/api-response';

export const runtime = 'nodejs'; // ← agregá esta línea
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('documento_cv') as File | null;
    
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return badRequest('Se esperaba un archivo');
    }

    if (!file) {
      return badRequest('No se recibió el archivo del CV');
    }

    const makeUrl = "https://hook.us2.make.com/r7dc3o8jguw9t7olo1byd40knnfco6ks";
    const apiKey = "jitKx-t9QAJBR2_"; // ← corregí esto

    // Crear un nuevo FormData limpio para Make
    const makeFormData = new FormData();
    makeFormData.append('documento_cv', file, file.name);

    const response = await fetch(makeUrl, {
      method: 'POST', 
      headers: {
        'x-make-apikey': apiKey,
      },
      body: makeFormData,
    });

    const resultText = await response.text();

    if (!response.ok) {
      console.error("Make respondió:", response.status, resultText);
      return serverError(`Make respondió ${response.status}: ${resultText}`);
    }

    return ok('CV enviado a procesar correctamente');

  } catch (error) {
    console.error("Error crítico:", error);
    return serverError('Error al conectar con el servicio de IA');
  }
}