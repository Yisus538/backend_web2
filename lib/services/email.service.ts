import { config } from '../config';

// ─────────────────────────────────────────────────────────────
// Servicio de email simulado
// Para producción: reemplazar el console.log con nodemailer,
// Resend, SendGrid, AWS SES, etc.
// ─────────────────────────────────────────────────────────────

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
): Promise<void> => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

  // TODO: reemplazar con tu proveedor de email real
  console.log(`
  ─────────────────────────────────────────
  📧 EMAIL DE RESET DE CONTRASEÑA
  ─────────────────────────────────────────
  Para: ${email}
  Asunto: Restablecer contraseña - RecruitPro

  Hacé clic en el siguiente enlace para restablecer tu contraseña:
  ${resetUrl}

  Este enlace expira en ${config.resetToken.expiresMinutes} minutos.
  Si no solicitaste esto, ignorá este email.
  ─────────────────────────────────────────
  `);
};
