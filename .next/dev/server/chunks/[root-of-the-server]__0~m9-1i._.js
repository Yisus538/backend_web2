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
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[project]/prisma.config.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file was generated by Prisma, and assumes you have installed the following:
// npm install --save-dev prisma dotenv
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dotenv$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dotenv/config.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$prisma$2f$config__$5b$external$5d$__$28$prisma$2f$config$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$prisma$29$__ = __turbopack_context__.i("[externals]/prisma/config [external] (prisma/config, cjs, [project]/node_modules/prisma)");
;
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$prisma$2f$config__$5b$external$5d$__$28$prisma$2f$config$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$prisma$29$__["defineConfig"])({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations"
    },
    datasource: {
        url: process.env["DATABASE_URL"]
    }
});
}),
"[project]/app/api/auth/me/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "OPTIONS",
    ()=>OPTIONS,
    "PATCH",
    ()=>PATCH
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$auth$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/auth.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/api-response.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prisma$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prisma.config.ts [app-route] (ecmascript)");
;
;
;
async function GET(req) {
    const { user, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$auth$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthUser"])(req);
    if (!user) {
        if (error === 'NO_TOKEN') return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unauthorized"])('Token no proporcionado');
        if (error === 'EXPIRED') return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unauthorized"])('Token expirado');
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unauthorized"])('Token inválido');
    }
    try {
        const dbUser = await __TURBOPACK__imported__module__$5b$project$5d2f$prisma$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
            where: {
                id: user.id
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                avatarUrl: true,
                telefono: true,
                ubicacion: true,
                titulo: true
            }
        });
        if (!dbUser) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unauthorized"])('Usuario no encontrado');
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])('Usuario autenticado', {
            user: dbUser
        });
    } catch (err) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serverError"])('Error al obtener los datos');
    }
}
async function PATCH(req) {
    const { user, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$auth$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthUser"])(req);
    if (!user) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unauthorized"])('No autorizado');
    try {
        const body = await req.json();
        const { fullName, telefono, ubicacion, titulo, avatarUrl } = body;
        const updatedUser = await __TURBOPACK__imported__module__$5b$project$5d2f$prisma$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.update({
            where: {
                id: user.id
            },
            data: {
                ...fullName && {
                    fullName
                },
                ...telefono !== undefined && {
                    telefono
                },
                ...ubicacion !== undefined && {
                    ubicacion
                },
                ...titulo !== undefined && {
                    titulo
                },
                ...avatarUrl !== undefined && {
                    avatarUrl
                }
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                avatarUrl: true,
                telefono: true,
                ubicacion: true,
                titulo: true
            }
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])('Perfil actualizado', {
            user: updatedUser
        });
    } catch (err) {
        console.error(err);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serverError"])('Error al guardar en DB');
    }
}
async function OPTIONS() {
    return new Response(null, {
        status: 204
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0~m9-1i._.js.map