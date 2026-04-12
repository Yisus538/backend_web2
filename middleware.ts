import { NextRequest, NextResponse } from 'next/server';

// Creacion de db
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://frontendweb2-production.up.railway.app'
];

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin') ?? '';
  const isAllowed = allowedOrigins.includes(origin);

  // Preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        // Si el origin no está en la lista, no se expone el header — el browser bloquea la request
        ...(isAllowed && {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
        }),
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      },
    });
  }

  const res = NextResponse.next();
  if (isAllowed && origin) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  return res;
}

export const config = {
  // Aplicar el middleware solo a las rutas de la API
  matcher: '/api/:path*',
};