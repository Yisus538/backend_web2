module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/lib/models/user.model.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createUser",
    ()=>createUser,
    "findByEmail",
    ()=>findByEmail,
    "findById",
    ()=>findById,
    "findByResetToken",
    ()=>findByResetToken,
    "findByVerificationToken",
    ()=>findByVerificationToken,
    "lockAccount",
    ()=>lockAccount,
    "markEmailVerified",
    ()=>markEmailVerified,
    "prisma",
    ()=>prisma,
    "resetFailedAttempts",
    ()=>resetFailedAttempts,
    "saveResetToken",
    ()=>saveResetToken,
    "saveVerificationToken",
    ()=>saveVerificationToken,
    "updateFailedAttempts",
    ()=>updateFailedAttempts,
    "updatePassword",
    ()=>updatePassword
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$neon$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@prisma/adapter-neon/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/serverless/index.mjs [app-route] (ecmascript)");
;
;
;
const pool = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL
});
const adapter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$neon$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaNeon"](pool);
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    adapter,
    log: [
        'error'
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
const findByEmail = (email)=>prisma.user.findUnique({
        where: {
            email: email.toLowerCase()
        }
    });
const findById = (id)=>prisma.user.findUnique({
        where: {
            id
        }
    });
const findByResetToken = (token)=>prisma.user.findFirst({
        where: {
            resetToken: token
        }
    });
const findByVerificationToken = (token)=>prisma.user.findFirst({
        where: {
            verificationToken: token
        }
    });
const createUser = (data)=>prisma.user.create({
        data: {
            fullName: data.fullName,
            email: data.email.toLowerCase(),
            passwordHash: data.passwordHash,
            role: data.role
        }
    });
const saveVerificationToken = (id, token, expiresAt)=>prisma.user.update({
        where: {
            id
        },
        data: {
            verificationToken: token,
            verificationTokenExpiresAt: expiresAt
        }
    });
const markEmailVerified = (id)=>prisma.user.update({
        where: {
            id
        },
        data: {
            isEmailVerified: true,
            verificationToken: null,
            verificationTokenExpiresAt: null
        }
    });
const updateFailedAttempts = (id, attempts)=>prisma.user.update({
        where: {
            id
        },
        data: {
            failedLoginAttempts: attempts
        }
    });
const lockAccount = (id, until)=>prisma.user.update({
        where: {
            id
        },
        data: {
            lockedUntil: until
        }
    });
const resetFailedAttempts = (id)=>prisma.user.update({
        where: {
            id
        },
        data: {
            failedLoginAttempts: 0,
            lockedUntil: null
        }
    });
const saveResetToken = (id, token, expiresAt)=>prisma.user.update({
        where: {
            id
        },
        data: {
            resetToken: token,
            resetTokenExpiresAt: expiresAt
        }
    });
const updatePassword = (id, passwordHash)=>prisma.user.update({
        where: {
            id
        },
        data: {
            passwordHash,
            resetToken: null,
            resetTokenExpiresAt: null,
            failedLoginAttempts: 0,
            lockedUntil: null
        }
    });
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/config/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config
]);
const env = (key, fallback)=>{
    const value = process.env[key] || fallback;
    if (!value) throw new Error(`Variable de entorno requerida: ${key}`);
    return value;
};
const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: ("TURBOPACK compile-time value", "development") || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    jwt: {
        secret: env('JWT_SECRET', 'dev_secret_change_in_production_min32chars'),
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        refreshSecret: env('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_in_production_32c'),
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    bcrypt: {
        rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10)
    },
    account: {
        maxFailedAttempts: 5,
        lockDurationMinutes: 15
    },
    resetToken: {
        expiresMinutes: parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES || '60', 10)
    }
};
}),
"[project]/lib/utils/password.utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "comparePassword",
    ()=>comparePassword,
    "hashPassword",
    ()=>hashPassword,
    "validatePasswordStrength",
    ()=>validatePasswordStrength
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/config/index.ts [app-route] (ecmascript)");
;
;
const hashPassword = (plain)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(plain, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].bcrypt.rounds);
const comparePassword = (plain, hash)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(plain, hash);
const validatePasswordStrength = (password)=>{
    const rules = [
        {
            test: password.length >= 8,
            msg: 'Mínimo 8 caracteres'
        },
        {
            test: password.length <= 128,
            msg: 'Máximo 128 caracteres'
        },
        {
            test: /[A-Z]/.test(password),
            msg: 'Al menos una mayúscula'
        },
        {
            test: /[a-z]/.test(password),
            msg: 'Al menos una minúscula'
        },
        {
            test: /[0-9]/.test(password),
            msg: 'Al menos un número'
        },
        {
            test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            msg: 'Al menos un carácter especial'
        }
    ];
    const errors = rules.filter((r)=>!r.test).map((r)=>r.msg);
    return {
        valid: errors.length === 0,
        errors
    };
};
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[project]/lib/utils/jwt.utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateTokens",
    ()=>generateTokens,
    "verifyAccessToken",
    ()=>verifyAccessToken,
    "verifyRefreshToken",
    ()=>verifyRefreshToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/config/index.ts [app-route] (ecmascript)");
;
;
const generateTokens = (payload)=>({
        accessToken: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].jwt.secret, {
            expiresIn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].jwt.expiresIn
        }),
        refreshToken: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].jwt.refreshSecret, {
            expiresIn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].jwt.refreshExpiresIn
        })
    });
const verifyAccessToken = (token)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].jwt.secret);
const verifyRefreshToken = (token)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].jwt.refreshSecret);
}),
"[project]/lib/utils/token.utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateResetToken",
    ()=>generateResetToken,
    "getResetTokenExpiry",
    ()=>getResetTokenExpiry,
    "isResetTokenValid",
    ()=>isResetTokenValid
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/config/index.ts [app-route] (ecmascript)");
;
;
const generateResetToken = ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
const getResetTokenExpiry = ()=>{
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].resetToken.expiresMinutes);
    return expiresAt;
};
const isResetTokenValid = (expiresAt)=>{
    if (!expiresAt) return false;
    return expiresAt > new Date();
};
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[project]/lib/services/email.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sendPasswordResetEmail",
    ()=>sendPasswordResetEmail,
    "sendVerificationEmail",
    ()=>sendVerificationEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nodemailer/lib/nodemailer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/config/index.ts [app-route] (ecmascript)");
;
;
const transporter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});
const sendVerificationEmail = async (email, fullName, token)=>{
    const verifyUrl = `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].frontendUrl}/index.html#/verify-email?token=${token}`;
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
    `
    });
};
const sendPasswordResetEmail = async (email, resetToken)=>{
    const resetUrl = `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].frontendUrl}/index.html#/reset-password?token=${resetToken}`;
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
          Este enlace expira en ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].resetToken.expiresMinutes} minutos.<br>
          Si no solicitaste esto, ignorá este mail.
        </p>
      </div>
    `
    });
};
}),
"[project]/lib/services/auth.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "forgotPassword",
    ()=>forgotPassword,
    "login",
    ()=>login,
    "refreshTokens",
    ()=>refreshTokens,
    "register",
    ()=>register,
    "resetPassword",
    ()=>resetPassword
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/models/user.model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$password$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/password.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$jwt$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/jwt.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$token$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/token.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$email$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/email.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/config/index.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const toPublicUser = (user)=>{
    if (!user) throw new Error('USER_NOT_FOUND');
    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        avatarUrl: user.avatarUrl
    };
};
const register = async (dto)=>{
    if (dto.password !== dto.confirmPassword) {
        throw new Error('PASSWORDS_DONT_MATCH');
    }
    const existingUser = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findByEmail"](dto.email);
    if (existingUser) {
        throw new Error('EMAIL_TAKEN');
    }
    const { valid, errors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$password$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validatePasswordStrength"])(dto.password);
    if (!valid) throw new Error(`PASSWORD_WEAK:${errors.join('|')}`);
    const passwordHash = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$password$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])(dto.password);
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createUser"]({
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
        role: dto.role
    });
    const verificationToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$token$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateResetToken"])();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveVerificationToken"](user.id, verificationToken, expiresAt);
    // Mandar mail (no bloqueamos si falla)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$email$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendVerificationEmail"])(user.email, user.fullName, verificationToken).catch((err)=>console.error('[email] Error enviando verificación:', err));
    return toPublicUser(user);
};
const login = async (dto)=>{
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findByEmail"](dto.email);
    // Respuesta genérica: no revelar si el email existe o no
    if (!user) throw new Error('INVALID_CREDENTIALS');
    if (!user.isActive) throw new Error('ACCOUNT_DISABLED');
    // Verificar si la cuenta está bloqueada por intentos fallidos
    if (user.lockedUntil && user.lockedUntil > new Date()) {
        const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        throw new Error(`ACCOUNT_LOCKED:${minutesLeft}`);
    }
    const isValid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$password$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["comparePassword"])(dto.password, user.passwordHash);
    if (!isValid) {
        const attempts = user.failedLoginAttempts + 1;
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateFailedAttempts"](user.id, attempts);
        if (attempts >= __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].account.maxFailedAttempts) {
            const lockUntil = new Date(Date.now() + __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].account.lockDurationMinutes * 60 * 1000);
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockAccount"](user.id, lockUntil);
            throw new Error(`ACCOUNT_LOCKED:${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].account.lockDurationMinutes}`);
        }
        throw new Error(`INVALID_CREDENTIALS:${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].account.maxFailedAttempts - attempts}`);
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resetFailedAttempts"](user.id);
    const tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$jwt$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateTokens"])({
        userId: user.id,
        email: user.email,
        role: user.role
    });
    return {
        user: toPublicUser(user),
        tokens
    };
};
const refreshTokens = async (refreshToken)=>{
    try {
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$jwt$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyRefreshToken"])(refreshToken);
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findById"](payload.userId);
        if (!user || !user.isActive) throw new Error();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$jwt$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateTokens"])({
            userId: user.id,
            email: user.email,
            role: user.role
        });
    } catch  {
        throw new Error('INVALID_REFRESH_TOKEN');
    }
};
const forgotPassword = async (dto)=>{
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findByEmail"](dto.email);
    if (!user || !user.isActive) return;
    const resetToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$token$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateResetToken"])();
    const expiresAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$token$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getResetTokenExpiry"])();
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveResetToken"](user.id, resetToken, expiresAt);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$email$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendPasswordResetEmail"])(user.email, resetToken).catch((err)=>console.error('[forgotPassword] Error al enviar email:', err));
};
const resetPassword = async (dto)=>{
    if (dto.newPassword !== dto.confirmPassword) {
        throw new Error('PASSWORDS_DONT_MATCH');
    }
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findByResetToken"](dto.token);
    if (!user) throw new Error('INVALID_RESET_TOKEN');
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$token$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isResetTokenValid"])(user.resetTokenExpiresAt)) {
        throw new Error('EXPIRED_RESET_TOKEN');
    }
    const { valid, errors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$password$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validatePasswordStrength"])(dto.newPassword);
    if (!valid) throw new Error(`PASSWORD_WEAK:${errors.join('|')}`);
    const passwordHash = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$password$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])(dto.newPassword);
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updatePassword"](user.id, passwordHash);
};
}),
"[project]/lib/validations/auth.validations.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "forgotPasswordSchema",
    ()=>forgotPasswordSchema,
    "formatZodErrors",
    ()=>formatZodErrors,
    "loginSchema",
    ()=>loginSchema,
    "registerSchema",
    ()=>registerSchema,
    "resetPasswordSchema",
    ()=>resetPasswordSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const registerSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    fullName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string({
        required_error: 'El nombre completo es requerido'
    }).trim().min(2, 'Entre 2 y 100 caracteres').max(100, 'Entre 2 y 100 caracteres'),
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string({
        required_error: 'El correo es requerido'
    }).trim().email('Correo inválido').toLowerCase(),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string({
        required_error: 'La contraseña es requerida'
    }).min(8, 'Entre 8 y 128 caracteres').max(128, 'Entre 8 y 128 caracteres'),
    confirmPassword: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string({
        required_error: 'Confirmá tu contraseña'
    }).nonempty('Confirmá tu contraseña'),
    role: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'candidate',
        'company'
    ], {
        required_error: 'El rol es requerido',
        message: 'Rol inválido. Debe ser candidate o company'
    })
});
const loginSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string({
        required_error: 'El correo es requerido'
    }).trim().email('Correo inválido').toLowerCase(),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string({
        required_error: 'La contraseña es requerida'
    }).nonempty('La contraseña es requerida')
});
const forgotPasswordSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string({
        required_error: 'El correo es requerido'
    }).trim().email('Correo inválido').toLowerCase()
});
const resetPasswordSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    token: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string({
        required_error: 'Token requerido'
    }).nonempty('Token requerido'),
    newPassword: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string({
        required_error: 'La nueva contraseña es requerida'
    }).min(8, 'Entre 8 y 128 caracteres').max(128, 'Entre 8 y 128 caracteres'),
    confirmPassword: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string({
        required_error: 'Confirmá tu contraseña'
    }).nonempty('Confirmá tu contraseña')
});
const formatZodErrors = (error)=>error.errors.map((e)=>({
            field: e.path.join('.') || 'unknown',
            message: e.message
        }));
}),
"[project]/lib/utils/rate-limiter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ─────────────────────────────────────────────────────────────
// Rate limiter en memoria — reemplaza express-rate-limit
// Para producción: usar @upstash/ratelimit con Redis
// ─────────────────────────────────────────────────────────────
__turbopack_context__.s([
    "createRateLimiter",
    ()=>createRateLimiter,
    "forgotPasswordLimiter",
    ()=>forgotPasswordLimiter,
    "loginLimiter",
    ()=>loginLimiter,
    "registerLimiter",
    ()=>registerLimiter
]);
const store = new Map();
// Limpia entradas expiradas periódicamente
setInterval(()=>{
    const now = Date.now();
    for (const [key, entry] of store.entries()){
        if (entry.resetAt <= now) store.delete(key);
    }
}, 60_000);
const createRateLimiter = (opts)=>{
    return (ip)=>{
        const now = Date.now();
        const key = `${ip}`;
        const entry = store.get(key);
        if (!entry || entry.resetAt <= now) {
            store.set(key, {
                count: 1,
                resetAt: now + opts.windowMs
            });
            return {
                allowed: true,
                remaining: opts.max - 1,
                resetAt: now + opts.windowMs
            };
        }
        entry.count++;
        if (entry.count > opts.max) {
            return {
                allowed: false,
                remaining: 0,
                resetAt: entry.resetAt,
                message: opts.message
            };
        }
        return {
            allowed: true,
            remaining: opts.max - entry.count,
            resetAt: entry.resetAt
        };
    };
};
const loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Demasiados intentos. Esperá 15 minutos.'
});
const registerLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Demasiados registros desde esta IP.'
});
const forgotPasswordLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Demasiados intentos. Esperá 1 hora.'
});
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/utils/api-response.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiResponse",
    ()=>apiResponse,
    "badRequest",
    ()=>badRequest,
    "conflict",
    ()=>conflict,
    "created",
    ()=>created,
    "forbidden",
    ()=>forbidden,
    "locked",
    ()=>locked,
    "ok",
    ()=>ok,
    "serverError",
    ()=>serverError,
    "tooManyRequests",
    ()=>tooManyRequests,
    "unauthorized",
    ()=>unauthorized
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const apiResponse = (data, status = 200)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data, {
        status
    });
const ok = (message, data)=>apiResponse({
        success: true,
        message,
        data
    }, 200);
const created = (message, data)=>apiResponse({
        success: true,
        message,
        data
    }, 201);
const badRequest = (message, errors)=>apiResponse({
        success: false,
        message,
        errors
    }, 400);
const unauthorized = (message)=>apiResponse({
        success: false,
        message
    }, 401);
const forbidden = (message)=>apiResponse({
        success: false,
        message
    }, 403);
const conflict = (message)=>apiResponse({
        success: false,
        message
    }, 409);
const locked = (message)=>apiResponse({
        success: false,
        message
    }, 423);
const serverError = (message = 'Error interno del servidor')=>apiResponse({
        success: false,
        message
    }, 500);
const tooManyRequests = (message)=>apiResponse({
        success: false,
        message
    }, 429);
}),
"[project]/app/api/auth/register/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OPTIONS",
    ()=>OPTIONS,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/auth.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validations$2f$auth$2e$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/validations/auth.validations.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$rate$2d$limiter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/rate-limiter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/api-response.ts [app-route] (ecmascript)");
;
;
;
;
async function POST(req) {
    // Rate limit
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
    const rl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$rate$2d$limiter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerLimiter"])(ip);
    if (!rl.allowed) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tooManyRequests"])(rl.message);
    // Parsear y validar body
    let body;
    try {
        body = await req.json();
    } catch  {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])('El cuerpo de la solicitud es inválido');
    }
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validations$2f$auth$2e$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerSchema"].safeParse(body);
    if (!parsed.success) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])('Datos inválidos', (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validations$2f$auth$2e$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatZodErrors"])(parsed.error));
    }
    // Lógica de negocio
    try {
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["register"](parsed.data);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["created"])('Cuenta creada exitosamente', {
            user
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message : '';
        const [code, detail] = msg.split(':');
        if (code === 'PASSWORD_WEAK') {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])('La contraseña no es segura', detail?.split('|').map((m)=>({
                    field: 'password',
                    message: m
                })));
        }
        if (code === 'EMAIL_TAKEN') return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["conflict"])('El correo electrónico ya está registrado');
        if (code === 'PASSWORDS_DONT_MATCH') return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])('Las contraseñas no coinciden');
        console.error('[register]', error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serverError"])();
    }
}
async function OPTIONS() {
    return new Response(null, {
        status: 204
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0u-2dri._.js.map