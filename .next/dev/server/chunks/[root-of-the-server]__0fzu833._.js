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
"[project]/app/api/auth/verify-email/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "OPTIONS",
    ()=>OPTIONS
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/models/user.model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/api-response.ts [app-route] (ecmascript)");
;
;
async function GET(req) {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])('Token requerido');
    // 👇 1. Agregamos el await aquí
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findByVerificationToken"](token);
    if (!user) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])('El enlace de verificación es inválido');
    if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])('El enlace expiró. Registrate nuevamente.');
    }
    if (user.isEmailVerified) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])('Tu cuenta ya estaba verificada');
    }
    // 👇 2. Agregamos el await aquí
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$user$2e$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markEmailVerified"](user.id);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])('Cuenta verificada exitosamente. Ya podés iniciar sesión.');
}
async function OPTIONS() {
    return new Response(null, {
        status: 204
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0fzu833._.js.map