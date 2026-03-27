import { NextRequest, NextResponse } from 'next/server';

// Aquí están todos tus puertos (Live Server, Next.js frontend, Vite, etc.)
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://frontendweb2-production.up.railway.app',
];

export function middleware(req: NextRequest) {
  // Obtenemos el origen de la petición
  const origin = req.headers.get('origin') ?? '';
  
  // Verificamos si el origen está en nuestra lista blanca
  const isAllowed = allowedOrigins.includes(origin);
  const allowOrigin = isAllowed ? origin : allowedOrigins[0];

  // 1. Manejo de las peticiones de "Preflight" (OPTIONS) que hace el navegador
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers' : 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  // 2. Manejo de las peticiones reales (GET, POST, etc.)
  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', allowOrigin);
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return res;
}

export const config = {
  // Aplicar el middleware solo a las rutas de la API
  matcher: '/api/:path*',
};