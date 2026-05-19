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
const _nodemailer = /*#__PURE__*/ _interop_require_wildcard(require("nodemailer"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
let EmailService = class EmailService {
    onModuleInit() {
        const user = process.env.MAIL_USER;
        const pass = process.env.MAIL_PASS;
        if (!user || !pass) {
            this.logger.warn('MAIL_USER o MAIL_PASS no configurados — emails deshabilitados');
            return;
        }
        this.transporter = _nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user,
                pass
            }
        });
        this.transporter.verify().then(()=>{
            this.logger.log(`✅ Gmail SMTP listo → ${user}`);
        }).catch((err)=>{
            this.logger.error(`❌ Gmail SMTP falló al verificar: ${err.message}`);
        });
    }
    async send(to, subject, html) {
        if (!this.transporter) {
            this.logger.warn(`Email omitido (transporter no configurado) → ${to}`);
            return;
        }
        const from = process.env.RESEND_FROM || `ReclutaIA <${process.env.MAIL_USER}>`;
        this.logger.log(`Enviando a: ${to} | Subject: ${subject}`);
        const info = await this.transporter.sendMail({
            from,
            to,
            subject,
            html
        });
        this.logger.log(`✅ Email enviado a ${to} | ID: ${info.messageId}`);
    }
    // ─── Verificación de cuenta ─────────────────────────────────
    async sendVerificationEmail(email, fullName, token) {
        const verifyUrl = `${FRONTEND_URL}/#/verify-email?token=${token}`;
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
        const resetUrl = `${FRONTEND_URL}/#/reset-password?token=${resetToken}`;
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
    // ─── Postulación recibida → candidato ───────────────────────
    async sendPostulacionRecibida(email, nombre, vacante, empresa) {
        await this.send(email, `Recibimos tu postulación — ${vacante}`, `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a405b;">Hola, ${nombre}!</h2>
        <p>Tu postulación a <strong>${vacante}</strong> en <strong>${empresa}</strong> fue recibida correctamente.</p>
        <p>Nuestra IA está evaluando tu perfil para esta posición. Te notificaremos el resultado en los próximos minutos.</p>
        <p style="color:#888;font-size:13px;">Si no te postulaste, ignorá este mensaje.</p>
      </div>`);
    }
    // ─── IA aceptó → candidato ───────────────────────────────────
    async sendEntrevistaAgendada(email, nombre, vacante, empresa, matchScore, fecha) {
        const scoreStr = matchScore ? `Score de compatibilidad: <strong>${matchScore}%</strong><br>` : '';
        const fechaStr = fecha ? `Fecha tentativa: <strong>${fecha.toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</strong>` : 'La empresa te confirmará la fecha y hora en breve.';
        await this.send(email, `¡Tu postulación avanzó! — ${vacante}`, `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a405b;">¡Felicitaciones, ${nombre}!</h2>
        <p>Tu postulación a <strong>${vacante}</strong>${empresa ? ` en <strong>${empresa}</strong>` : ''} fue <strong style="color:#16a34a;">aceptada</strong> por nuestra IA.</p>
        <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:4px;margin:20px 0;">
          ${scoreStr}
          ${fechaStr}
        </div>
        <p>Próximos pasos: la empresa confirmará la fecha, hora y link de la entrevista.</p>
        <p style="color:#888;font-size:13px;">Podés ver el estado en tu portal de candidato.</p>
      </div>`);
    }
    // ─── Candidato aceptado automáticamente → empresa ────────────
    async sendCandidatoAceptadoEmpresa(email, nombreEmpresa, candidato, vacante, matchScore, fortalezas) {
        const fortList = fortalezas.slice(0, 3).map((f)=>`<li>${f}</li>`).join('');
        await this.send(email, `Candidato aceptado automáticamente — ${vacante}`, `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a405b;">Nuevo candidato aceptado</h2>
        <p>Hola${nombreEmpresa ? ` ${nombreEmpresa}` : ''}. La IA evaluó a <strong>${candidato}</strong> para <strong>${vacante}</strong> y obtuvo un score de <strong>${matchScore}%</strong>.</p>
        ${fortList ? `<p>Principales fortalezas detectadas:</p><ul>${fortList}</ul>` : ''}
        <p>Ingresá a ReclutaIA para confirmar la fecha y hora de la entrevista.</p>
      </div>`);
    }
    // ─── Score < umbral → empresa (revisión manual) ──────────────
    async sendPostulantePendiente(email, vacante, candidato) {
        await this.send(email, `Nuevo postulante para revisar — ${vacante}`, `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a405b;">Revisión manual requerida</h2>
        <p><strong>${candidato}</strong> se postuló a <strong>${vacante}</strong>. El score de compatibilidad no alcanzó el umbral automático.</p>
        <p>Revisá su perfil en ReclutaIA para decidir si avanza al proceso.</p>
      </div>`);
    }
    // ─── Entrevista confirmada con fecha → candidato ─────────────
    async sendConfirmacionEntrevista(email, nombre, vacante, fecha, linkMeet, ubicacion, tipo) {
        const fechaStr = fecha ? fecha.toLocaleString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'A confirmar';
        const lugarStr = tipo === 'remota' && linkMeet ? `<p>Link de videollamada: <a href="${linkMeet}">${linkMeet}</a></p>` : ubicacion ? `<p>Lugar: ${ubicacion}</p>` : '';
        await this.send(email, `Entrevista confirmada — ${vacante}`, `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a405b;">Tu entrevista está confirmada</h2>
        <p>Hola ${nombre}. Tu entrevista para <strong>${vacante}</strong> fue confirmada.</p>
        <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px;border-radius:4px;margin:20px 0;">
          <p style="margin:0;"><strong>📅 Fecha:</strong> ${fechaStr}</p>
          <p style="margin:8px 0 0;"><strong>📍 Modalidad:</strong> ${tipo === 'remota' ? 'Remota' : tipo === 'presencial' ? 'Presencial' : 'A confirmar'}</p>
        </div>
        ${lugarStr}
        <p style="color:#888;font-size:13px;">Ante cualquier inconveniente, contactá directamente a la empresa.</p>
      </div>`);
    }
    // ─── Recordatorio 24hs → candidato y empresa ─────────────────
    async sendRecordatorioEntrevista(email, nombre, vacante, fecha, linkMeet) {
        const fechaStr = fecha.toLocaleString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const linkStr = linkMeet ? `<p>Link: <a href="${linkMeet}">${linkMeet}</a></p>` : '';
        await this.send(email, `Recordatorio: entrevista mañana — ${vacante}`, `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a405b;">Tu entrevista es mañana</h2>
        <p>Hola ${nombre}. Te recordamos que mañana a las <strong>${fechaStr}</strong> tenés tu entrevista para <strong>${vacante}</strong>.</p>
        ${linkStr}
      </div>`);
    }
    // ─── Candidato es finalista → candidato ──────────────────────
    async sendFinalistaNotification(email, nombre, vacante) {
        await this.send(email, `¡Sos finalista en ${vacante}!`, `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a405b;">¡Llegaste a la etapa final!</h2>
        <p>Hola ${nombre}. Nos complace informarte que avanzaste a la etapa de <strong>finalistas</strong> para <strong>${vacante}</strong>.</p>
        <p>La empresa se pondrá en contacto contigo a la brevedad para los próximos pasos.</p>
      </div>`);
    }
    // ─── Candidato rechazado → candidato (con feedback IA) ───────
    async sendRechazoPostulacion(email, nombre, vacante, fortalezas, debilidades) {
        const fortHtml = fortalezas.length ? `<p><strong>Tus puntos fuertes detectados:</strong></p><ul>${fortalezas.map((f)=>`<li>${f}</li>`).join('')}</ul>` : '';
        const debHtml = debilidades.length ? `<p><strong>Áreas de mejora:</strong></p><ul>${debilidades.map((d)=>`<li>${d}</li>`).join('')}</ul>` : '';
        await this.send(email, `Actualización sobre tu postulación — ${vacante}`, `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a405b;">Gracias por participar</h2>
        <p>Hola ${nombre}. Lamentablemente en esta oportunidad tu perfil no fue seleccionado para <strong>${vacante}</strong>.</p>
        ${fortHtml}${debHtml}
        <p>Te animamos a seguir aplicando. ¡Mucho éxito!</p>
        <p style="color:#888;font-size:13px;">Este análisis fue generado automáticamente por nuestra IA.</p>
      </div>`);
    }
    // ─── Candidato contratado → candidato ────────────────────────
    async sendContratadoNotification(email, nombre, vacante) {
        await this.send(email, `¡Felicitaciones, fuiste seleccionado! — ${vacante}`, `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a405b;">¡Felicitaciones, ${nombre}!</h2>
        <p>Nos complace informarte que fuiste seleccionado/a para <strong>${vacante}</strong>.</p>
        <p>La empresa se comunicará contigo para coordinar tu incorporación. ¡Mucho éxito en esta nueva etapa!</p>
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