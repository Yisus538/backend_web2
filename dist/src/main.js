"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _common = require("@nestjs/common");
const _cookieparser = /*#__PURE__*/ _interop_require_default(require("cookie-parser"));
const _appmodule = require("./app.module");
const _httpexceptionfilter = require("./common/filters/http-exception.filter");
const _responseinterceptor = require("./common/interceptors/response.interceptor");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
    'https://frontendweb2-production.up.railway.app'
];
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule);
    app.set('trust proxy', 1);
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: (origin, callback)=>{
            if (!origin || ALLOWED_ORIGINS.includes(origin)) callback(null, true);
            else callback(new Error(`CORS bloqueado: ${origin}`), false);
        },
        credentials: true,
        methods: [
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'OPTIONS',
            'PATCH'
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With'
        ]
    });
    // Necesario para que NestJS pueda leer req.cookies en los controllers
    app.use((0, _cookieparser.default)());
    app.useGlobalPipes(new _common.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true
        }
    }));
    app.useGlobalFilters(new _httpexceptionfilter.AllExceptionsFilter());
    app.useGlobalInterceptors(new _responseinterceptor.ResponseInterceptor());
    const port = process.env.PORT || 3000;
    app.enableShutdownHooks();
    await app.listen(port, '0.0.0.0');
    console.log(`\n  🚀  ReclutaIA NestJS\n  Local:  http://localhost:${port}/api\n  Health: http://localhost:${port}/api/health\n`);
}
bootstrap();

//# sourceMappingURL=main.js.map