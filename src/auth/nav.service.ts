import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NavService {
  constructor(private prisma: PrismaService) {}

  async getNavForRole(rol: string) {
    const config = await this.prisma.menuConfigRol.findUnique({ where: { rol } });

    const rolMenuItems = await this.prisma.rolMenu.findMany({
      where:   { rol },
      orderBy: { ordenRender: 'asc' },
      include: { menuItem: true },
    });

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

    return {
      subtitle:    config?.subtitle   ?? 'Panel',
      config_hash: config?.configHash ?? '#/configuraciones',
      items,
    };
  }
}
