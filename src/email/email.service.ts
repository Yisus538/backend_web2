import { Injectable, Logger } from '@nestjs/common';

const RESEND_URL   = 'https://api.resend.com/emails';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private async send(to: string, subject: string, html: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY no configurada');

    const from = process.env.RESEND_FROM || 'ReclutaIA <onboarding@resend.dev>';
    this.logger.log(`Enviando a: ${to} | Subject: ${subject}`);

    const res = await fetch(RESEND_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 403 || (body as any)?.name === 'validation_error') {
        this.logger.error(
          '⚠️  Dominio de remitente no verificado en Resend. ' +
          'Verificá en https://resend.com/domains o usá onboarding@resend.dev',
        );
      }
      throw new Error((body as any).message || `Error Resend (${res.status})`);
    }

    this.logger.log(`✅ Email enviado a ${to} | ID: ${(body as any).id}`);
  }

  // ─── Verificación de cuenta ─────────────────────────────────
  async sendVerificationEmail(email: string, fullName: string, token: string): Promise<void> {
    const verifyUrl = `${FRONTEND_URL}/index.html#/verify-email?token=${token}`;
    await this.send(
      email,
      'Verificá tu cuenta — ReclutaIA',
      `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
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
        <p style="color:#888;font-size:12px;">O copiá este link: ${verifyUrl}</p>
      </div>`,
    );
  }

  // ─── Reseteo de contraseña ───────────────────────────────────
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl  = `${FRONTEND_URL}/index.html#/reset-password?token=${resetToken}`;
    const expiryMin = process.env.RESET_TOKEN_EXPIRES_MINUTES || '60';
    await this.send(
      email,
      'Restablecer contraseña — ReclutaIA',
      `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a405b;">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#1a405b;color:#fff;padding:12px 24px;
                  border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
          Restablecer contraseña
        </a>
        <p style="color:#888;font-size:13px;">
          Este enlace expira en ${expiryMin} minutos.<br>
          Si no solicitaste esto, ignorá este mail.
        </p>
      </div>`,
    );
  }
}
