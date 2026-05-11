"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EmailService", {
    enumerable: true,
    get: function() {
        return EmailService;
    }
});
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const RESEND_URL = 'https://api.resend.com/emails';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
let EmailService = class EmailService {
    async send(to, subject, html) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) throw new Error('RESEND_API_KEY no configurada');
        const from = process.env.RESEND_FROM || 'ReclutaIA <onboarding@resend.dev>';
        this.logger.log(`Enviando a: ${to} | Subject: ${subject}`);
        const res = await fetch(RESEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                from,
                to: [
                    to
                ],
                subject,
                html
            }),
            signal: AbortSignal.timeout(10_000)
        });
        const body = await res.json().catch(()=>({}));
        if (!res.ok) {
            if (res.status === 403 || body?.name === 'validation_error') {
                this.logger.error('⚠️  Dominio de remitente no verificado en Resend. ' + 'Verificá en https://resend.com/domains o usá onboarding@resend.dev');
            }
            throw new Error(body.message || `Error Resend (${res.status})`);
        }
        this.logger.log(`✅ Email enviado a ${to} | ID: ${body.id}`);
    }
    // ─── Verificación de cuenta ─────────────────────────────────
    async sendVerificationEmail(email, fullName, token) {
        const verifyUrl = `${FRONTEND_URL}/index.html#/verify-email?token=${token}`;
        await this.send(email, 'Verificá tu cuenta — ReclutaIA', `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
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
      </div>`);
    }
    // ─── Reseteo de contraseña ───────────────────────────────────
    async sendPasswordResetEmail(email, resetToken) {
        const resetUrl = `${FRONTEND_URL}/index.html#/reset-password?token=${resetToken}`;
        const expiryMin = process.env.RESET_TOKEN_EXPIRES_MINUTES || '60';
        await this.send(email, 'Restablecer contraseña — ReclutaIA', `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
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
      </div>`);
    }
    constructor(){
        this.logger = new _common.Logger(EmailService.name);
    }
};
EmailService = _ts_decorate([
    (0, _common.Injectable)()
], EmailService);

//# sourceMappingURL=email.service.js.map