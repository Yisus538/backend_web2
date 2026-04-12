import { prisma } from './user.model';

// ─────────────────────────────────────────────────────────────
// Tipos de navegación — espejo de v_nav_por_rol
// ─────────────────────────────────────────────────────────────

export interface NavItem {
  id:             string;
  icon:           string;
  label:          string;
  hash:           string;
  activeKeyword:  string;
  esFallback:     boolean;
  esConfig:       boolean;
  activePriority: number;
}

export interface NavData {
  subtitle:    string;
  config_hash: string;
  items:       NavItem[];
}

// ─────────────────────────────────────────────────────────────
// Obtiene la navegación completa para un rol desde la DB.
// Usa la vista v_nav_por_rol cuando está disponible;
// si no, construye la misma query manualmente.
// ─────────────────────────────────────────────────────────────

export async function getNavForRole(rol: string): Promise<NavData> {
  // Query directa a las tablas (sin depender de la vista SQL)
  const config = await prisma.menuConfigRol.findUnique({ where: { rol } });

  const rolMenuItems = await prisma.rolMenu.findMany({
    where: { rol },
    orderBy: { ordenRender: 'asc' },
    include: { menuItem: true },
  });

  const items: NavItem[] = rolMenuItems
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
    subtitle:    config?.subtitle    ?? 'Panel',
    config_hash: config?.configHash  ?? '#/configuraciones',
    items,
  };
}

// ─────────────────────────────────────────────────────────────
// Verifica si un rol tiene acceso a un activeKeyword específico
// ─────────────────────────────────────────────────────────────

export async function roleHasAccess(
  rol: string,
  activeKeyword: string,
): Promise<boolean> {
  const count = await prisma.rolMenu.count({
    where: {
      rol,
      menuItem: { activeKeyword, activo: true },
    },
  });
  return count > 0;
}

// ─────────────────────────────────────────────────────────────
// Retorna todos los activeKeywords accesibles para un rol
// ─────────────────────────────────────────────────────────────

export async function getAllowedKeywords(rol: string): Promise<string[]> {
  const items = await prisma.rolMenu.findMany({
    where: { rol },
    include: { menuItem: { select: { activeKeyword: true, activo: true } } },
  });
  return items
    .filter((rm) => rm.menuItem.activo)
    .map((rm) => rm.menuItem.activeKeyword);
}
