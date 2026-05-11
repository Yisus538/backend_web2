"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NavService", {
    enumerable: true,
    get: function() {
        return NavService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let NavService = class NavService {
    clearCache() {
        this.cache.clear();
    }
    async getNavForRole(rol) {
        if (this.cache.has(rol)) return this.cache.get(rol);
        const [config, rolMenuItems] = await Promise.all([
            this.prisma.menuConfigRol.findUnique({
                where: {
                    rol
                }
            }),
            this.prisma.rolMenu.findMany({
                where: {
                    rol
                },
                orderBy: {
                    ordenRender: 'asc'
                },
                include: {
                    menuItem: true
                }
            })
        ]);
        const items = rolMenuItems.filter((rm)=>rm.menuItem.activo).map((rm)=>({
                id: rm.menuItem.itemKey,
                icon: rm.menuItem.icon,
                label: rm.menuItem.label,
                hash: rm.menuItem.hashPath,
                activeKeyword: rm.menuItem.activeKeyword,
                esFallback: rm.menuItem.esFallback,
                esConfig: rm.menuItem.esItemConfig,
                activePriority: rm.activePriority
            }));
        const nav = {
            subtitle: config?.subtitle ?? 'Panel',
            config_hash: config?.configHash ?? '#/configuraciones',
            items
        };
        this.cache.set(rol, nav);
        return nav;
    }
    constructor(prisma){
        this.prisma = prisma;
        this.cache = new Map();
    }
};
NavService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], NavService);

//# sourceMappingURL=nav.service.js.map