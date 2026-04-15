"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NavService = class NavService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getNavForRole(rol) {
        const config = await this.prisma.menuConfigRol.findUnique({ where: { rol } });
        const rolMenuItems = await this.prisma.rolMenu.findMany({
            where: { rol },
            orderBy: { ordenRender: 'asc' },
            include: { menuItem: true },
        });
        const items = rolMenuItems
            .filter((rm) => rm.menuItem.activo)
            .map((rm) => ({
            id: rm.menuItem.itemKey,
            icon: rm.menuItem.icon,
            label: rm.menuItem.label,
            hash: rm.menuItem.hashPath,
            activeKeyword: rm.menuItem.activeKeyword,
            esFallback: rm.menuItem.esFallback,
            esConfig: rm.menuItem.esItemConfig,
            activePriority: rm.activePriority,
        }));
        return {
            subtitle: config?.subtitle ?? 'Panel',
            config_hash: config?.configHash ?? '#/configuraciones',
            items,
        };
    }
};
exports.NavService = NavService;
exports.NavService = NavService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NavService);
//# sourceMappingURL=nav.service.js.map