import { NextRequest } from 'next/server';
import * as authService from '@/lib/services/auth.service';
import { resetPasswordSchema, formatZodErrors } from '@/lib/validations/auth.validations';
import { badRequest, ok, serverError } from '@/lib/utils/api-response';
import { seedDatabase } from '@/lib/seed';

// ─────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// Pantalla: Restablecer contraseña (llegó por el link del email)
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  await seedDatabase();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('El cuerpo de la solicitud es inválido');
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Datos inválidos', formatZodErrors(parsed.error));
  }

  try {
    await authService.resetPassword(parsed.data);
    return ok('Contraseña restablecida exitosamente');
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    const [code, detail] = msg.split(':');

    if (code === 'PASSWORD_WEAK') {
      return badRequest(
        'La contraseña no es segura',
        detail?.split('|').map(m => ({ field: 'newPassword', message: m })),
      );
    }

    const messages: Record<string, [number, string]> = {
      PASSWORDS_DONT_MATCH: [400, 'Las contraseñas no coinciden'],
      INVALID_RESET_TOKEN:  [400, 'El enlace de restablecimiento es inválido'],
      EXPIRED_RESET_TOKEN:  [400, 'El enlace expiró. Solicitá uno nuevo.'],
    };

    const [status, message] = messages[code] ?? [500, 'Error interno del servidor'];
    if (status === 500) {
      console.error('[reset-password]', error);
      return serverError();
    }
    return badRequest(message);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
