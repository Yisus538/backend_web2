import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendVerificationEmail = async (
  email: string,
  fullName: string,
  token: string,
): Promise<void> => {
  const verifyUrl = `${config.frontendUrl}${config.emailRoutes.verifyEmail}?token=${token}`;

  await transporter.sendMail({
    from: `"RecruitPro" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verificá tu cuenta — RecruitPro',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a405b;">Hola, ${fullName}!</h2>
        <p>Gracias por registrarte en <strong>RecruitPro</strong>.</p>
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
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
): Promise<void> => {
  const resetUrl = `${config.frontendUrl}${config.emailRoutes.resetPassword}?token=${resetToken}`;

  await transporter.sendMail({
    from: `"RecruitPro" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Restablecer contraseña — RecruitPro',
    html: `
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
  });
};