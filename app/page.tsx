import { NextResponse } from 'next/server';

// Redirige la raíz al health check
export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>RecruitPro — Auth API</h1>
      <p>Endpoints disponibles:</p>
      <ul>
        <li>GET  <a href="/api/health">/api/health</a></li>
        <li>POST /api/auth/register</li>
        <li>POST /api/auth/login</li>
        <li>POST /api/auth/refresh</li>
        <li>POST /api/auth/forgot-password</li>
        <li>POST /api/auth/reset-password</li>
        <li>GET  /api/auth/me  (requiere Bearer token)</li>
      </ul>
    </main>
  );
}
