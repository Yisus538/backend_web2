import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Nav data is static — roles don't change at runtime. Cache indefinitely per process.
// Call NavService.clearCache() from an admin endpoint if menu items ever need refreshing.
@Injectable()
export class NavService {
  private readonly cache = new Map<string, any>();

  constructor(private prisma: PrismaService) {}

  clearCache() {
    this.cache.clear();
  }

  async getNavForRole(rol: string) {
    if (this.cache.has(rol)) return this.cache.get(rol);

    const [config, rolMenuItems] = await Promise.all([
      this.prisma.menuConfigRol.findUnique({ where: { rol } }),
      this.prisma.rolMenu.findMany({
        where:   { rol },
        orderBy: { ordenRender: 'asc' },
        include: { menuItem: true },
      }),
    ]);

    const items = rolMenuItems
      .filter((rm) => rm.menuItem.activo)
      .map((rm) => ({
        id:             rm.menuItem.itemKey,
        icon:           rm.menuItem.icon,
        label:          rm.menuItem.label,
        hash:           rm.menuItem.hashPath,
        activeKeyword:  rm.menuItem.activeKeyword,
        esFallback:     rm.menuItem.esFallback,
        esConfig:       rm.menuItem.esItemConfig,
        activePriority: rm.activePriority,
      }));

    const nav = {
      subtitle:    config?.subtitle   ?? 'Panel',
      config_hash: config?.configHash ?? '#/configuraciones',
      items,
    };

    this.cache.set(rol, nav);
    return nav;
  }
}
