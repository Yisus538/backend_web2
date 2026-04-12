import { config } from '../config';

// ─────────────────────────────────────────────────────────────
// Email Service — Resend API (3,000 emails/mes gratis)
// Solo requiere RESEND_API_KEY y RESEND_FROM en las env vars.
//
// ⚠️  IMPORTANTE PARA EMAILS A DOMINIOS NO-GMAIL:
//   - El dominio del remitente (RESEND_FROM) debe estar verificado
//     en el dashboard de Resend con los DNS records (SPF, DKIM, DMARC).
//   - Sin verificación, Resend solo envía al email del owner de la cuenta.
//   - Para testing, usar: onboarding@resend.dev como RESEND_FROM
//
// Docs: https://resend.com/docs/api-reference/emails/send-email
// ─────────────────────────────────────────────────────────────

const RESEND_URL = 'https://api.resend.com/emails';

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY no configurada');

  const from = process.env.RESEND_FROM || 'ReclutaIA <onboarding@resend.dev>';

  console.log(`[Email] Enviando a: ${to} | From: ${from} | Subject: ${subject}`);

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  const responseBody = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error('[Resend Error]', {
      status: res.status,
      error: responseBody,
      to,
      from,
    });

    // Mensajes de error más claros
    if (res.status === 403 || responseBody?.name === 'validation_error') {
      console.error(
        '[Resend] ⚠️  Posible causa: el dominio del remitente no está verificado en Resend.',
        'Para emails a cualquier dirección, verificá el dominio en: https://resend.com/domains',
        'O usá RESEND_FROM=onboarding@resend.dev para testing.',
      );
    }

    throw new Error(responseBody.message || `Error al enviar email (${res.status})`);
  }

  console.log(`[Email] ✅ Enviado exitosamente a: ${to} | ID: ${responseBody.id}`);
}

// ─────────────────────────────────────────────────────────────
// Emails transaccionales
// ─────────────────────────────────────────────────────────────

export const sendVerificationEmail = async (
  email: string,
  fullName: string,
  token: string,
): Promise<void> => {
  const verifyUrl = `${config.frontendUrl}${config.emailRoutes.verifyEmail}?token=${token}`;

  await sendEmail(
    email,
    'Verificá tu cuenta — ReclutaIA',
    `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a405b;">Hola, ${fullName}!</h2>
        <p>Gracias por registrarte en <strong>ReclutaIA</strong>.</p>
        <p>Hacé clic en el botón para verificar tu cuenta:</p>
        <a href="${verifyUrl}"
           style="display:inline-block;background:#1a405b;color:#fff;padding:12px 24px;
                  border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
          Verificar cuenta
        </a>
        <p style="color:#888;font-size:13px;">
          Este enlace expira en 24 horas.<br>
          Si no creaste esta cuenta, ignorá este mail.
        </p>
        <p style="color:#888;font-size:12px;">
          O copiá este link: ${verifyUrl}
        </p>
      </div>
    `,
  );
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
): Promise<void> => {
  const resetUrl = `${config.frontendUrl}${config.emailRoutes.resetPassword}?token=${resetToken}`;

  await sendEmail(
    email,
    'Restablecer contraseña — ReclutaIA',
    `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a405b;">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#1a405b;color:#fff;padding:12px 24px;
                  border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
          Restablecer contraseña
        </a>
        <p style="color:#888;font-size:13px;">
          Este enlace expira en ${config.resetToken.expiresMinutes} minutos.<br>
          Si no solicitaste esto, ignorá este mail.
        </p>
      </div>
    `,
  );
};