"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PrismaService", {
    enumerable: true,
    get: function() {
        return PrismaService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PrismaService = class PrismaService extends _client.PrismaClient {
    // Lazy connection: Prisma connects on the first query, not at startup.
    // This prevents the server from hanging if the DB is temporarily slow.
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Prisma disconnected');
    }
    constructor(){
        super({
            datasources: {
                db: {
                    // Append connection_limit and connect_timeout to avoid hanging the event loop
                    url: (()=>{
                        const base = process.env.DATABASE_URL ?? '';
                        try {
                            const u = new URL(base);
                            if (!u.searchParams.has('connection_limit')) u.searchParams.set('connection_limit', '5');
                            if (!u.searchParams.has('connect_timeout')) u.searchParams.set('connect_timeout', '10');
                            if (!u.searchParams.has('pool_timeout')) u.searchParams.set('pool_timeout', '10');
                            return u.toString();
                        } catch  {
                            return base;
                        }
                    })()
                }
            }
        }), this.logger = new _common.Logger(PrismaService.name);
    }
};
PrismaService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], PrismaService);

//# sourceMappingURL=prisma.service.js.map