(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/[root-of-the-server]__11ru_ap._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
;
// Aquí están todos tus puertos (Live Server, Next.js frontend, Vite, etc.)
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://localhost:5173'
];
function middleware(req) {
    // Obtenemos el origen de la petición
    const origin = req.headers.get('origin') ?? '';
    // Verificamos si el origen está en nuestra lista blanca
    const isAllowed = allowedOrigins.includes(origin);
    const allowOrigin = isAllowed ? origin : allowedOrigins[0];
    // 1. Manejo de las peticiones de "Preflight" (OPTIONS) que hace el navegador
    if (req.method === 'OPTIONS') {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"](null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': allowOrigin,
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                'Access-Control-Allow-Credentials': 'true'
            }
        });
    }
    // 2. Manejo de las peticiones reales (GET, POST, etc.)
    const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    res.headers.set('Access-Control-Allow-Origin', allowOrigin);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    return res;
}
const config = {
    // Aplicar el middleware solo a las rutas de la API
    matcher: '/api/:path*'
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__11ru_ap._.js.map