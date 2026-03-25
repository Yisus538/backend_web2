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
"[project]/app/api/cv/analyze/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/api-response.ts [app-route] (ecmascript)");
;
const runtime = 'nodejs';
const dynamic = 'force-dynamic';
async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('documento_cv');
        if (!file) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["badRequest"])('No se recibió el archivo del CV');
        const makeUrl = "https://hook.us2.make.com/r7dc3o8jguw9t7olo1byd40knnfco6ks";
        const apiKey = "jitKx-t9QAJBR2_"; // ← completá la clave acá
        const makeFormData = new FormData();
        makeFormData.append('documento_cv', file, file.name);
        // Fire and forget — no esperamos respuesta de Make
        fetch(makeUrl, {
            method: 'POST',
            headers: {
                'x-make-apikey': apiKey
            },
            body: makeFormData
        }).catch((err)=>console.error("Error enviando a Make:", err));
        // Respuesta inmediata al frontend
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])('CV recibido, procesando...');
    } catch (error) {
        console.error("Error crítico:", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serverError"])('Error al conectar con el servicio de IA');
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0nsn.rh._.js.map