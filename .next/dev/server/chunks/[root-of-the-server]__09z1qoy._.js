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
;
;
// 1. Ya no necesitamos importar 'Pool', le pasamos la URL directo al adaptador
const adapter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$neon$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaNeon"]({
    connectionString: process.env.DATABASE_URL
});
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
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5500',
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
"[project]/lib/services/email.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sendPasswordResetEmail",
    ()=>sendPasswordResetEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/config/index.ts [app-route] (ecmascript)");
;
const sendPasswordResetEmail = async (email, resetToken)=>{
    const resetUrl = `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].frontendUrl}/reset-password?token=${resetToken}`;
    // TODO: reemplazar con tu proveedor de email real
    console.log(`
  ─────────────────────────────────────────
  📧 EMAIL DE RESET DE CONTRASEÑA
  ─────────────────────────────────────────
  Para: ${email}
  Asunto: Restablecer contraseña - RecruitPro

  Hacé clic en el siguiente enlace para restablecer tu contraseña:
  ${resetUrl}

  Este enlace expira en ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"].resetToken.expiresMinutes} minutos.
  Si no solicitaste esto, ignorá este email.
  ─────────────────────────────────────────
  `);
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
"[project]/lib/utils/auth.utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAuthUser",
    ()=>getAuthUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$jwt$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/jwt.utils.ts [app-route] (ecmascript)");
;
const getAuthUser = (req)=>{
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return {
        user: null,
        error: 'NO_TOKEN'
    };
    try {
        const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$jwt$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyAccessToken"])(token);
        return {
            user
        };
    } catch (error) {
        const expired = error instanceof Error && error.name === 'TokenExpiredError';
        return {
            user: null,
            error: expired ? 'EXPIRED' : 'INVALID'
        };
    }
};
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
"[project]/app/api/auth/resend-verification/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OPTIONS",
    ()=>OPTIONS,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/models/user.model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$token$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/token.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$email$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/email.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$auth$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/auth.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/api-response.ts [app-route] (ecmascript)");
;
;
;
;
;
// Rate limit simple en memoria: 1 reenvío cada 2 minutos por usuario
const resendCooldown = new Map();
async function POST(req) {
    // Requiere estar logueado
    const { user, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$auth$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthUser"])(req);
    if (!user) {
        if (error === 'EXPIRED') return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unauthorized"])('Token expirado');
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unauthorized"])('Token no proporcionado');
    }
    // Buscar usuario en DB
    const dbUser = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findById"](user.userId);
    if (!dbUser || !dbUser.isActive) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unauthorized"])('Usuario no encontrado');
    }
    // Si ya está verificado no hace falta reenviar
    if (dbUser.isEmailVerified) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])('Tu cuenta ya está verificada. Podés iniciar sesión.');
    }
    // Cooldown: no permitir más de 1 reenvío cada 2 minutos
    const lastSent = resendCooldown.get(user.userId);
    const now = Date.now();
    const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutos
    if (lastSent && now - lastSent < COOLDOWN_MS) {
        const secondsLeft = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 1000);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tooManyRequests"])(`Esperá ${secondsLeft} segundos antes de reenviar.`);
    }
    // Generar nuevo token y enviarlo
    const verificationToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$token$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateResetToken"])();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hs
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveVerificationToken"](dbUser.id, verificationToken, expiresAt);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$email$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendVerificationEmail"])(dbUser.email, dbUser.fullName, verificationToken);
    resendCooldown.set(user.userId, now);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])('Enlace de verificación reenviado. Revisá tu correo.');
}
async function OPTIONS() {
    return new Response(null, {
        status: 204
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__09z1qoy._.js.map