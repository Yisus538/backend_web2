// ================================================================
// SEED — Navegación dinámica
// Ejecutar: npx ts-node lib/seed.ts
//           o agregar al script de setup inicial
// ================================================================
import { PrismaClient } from '@prisma/client';
import { PrismaPg }     from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding navegación dinámica...');

  // ── 1. menu_config_rol ────────────────────────────────────────
  await prisma.menuConfigRol.upsert({
    where:  { rol: 'company' },
    update: {},
    create: { rol: 'company', subtitle: 'Panel Admin', configHash: '#/configuraciones' },
  });
  await prisma.menuConfigRol.upsert({
    where:  { rol: 'candidate' },
    update: {},
    create: { rol: 'candidate', subtitle: 'Portal Candidato', configHash: '#/candidato-configuraciones' },
  });
  await prisma.menuConfigRol.upsert({
    where:  { rol: 'administrativo' },
    update: {},
    create: { rol: 'administrativo', subtitle: 'Panel Maestro', configHash: '#/admin-configuraciones' },
  });

  // ── 2. menu_items ─────────────────────────────────────────────
  const items = [
    // Portal empresa
    { itemKey: 'dashboard',      icon: 'grid_view',     label: 'Dashboard',          hashPath: '#/dashboard-company',   activeKeyword: 'dashboard',      esFallback: true,  esItemConfig: false },
    { itemKey: 'vacantes',       icon: 'work',          label: 'Mis Vacantes',        hashPath: '#/vacantes',            activeKeyword: 'vacantes',       esFallback: false, esItemConfig: false },
    { itemKey: 'candidatos',     icon: 'person_search', label: 'Buscar Candidatos',   hashPath: '#/candidatos',          activeKeyword: 'candidatos',     esFallback: false, esItemConfig: false },
    { itemKey: 'entrevistas',    icon: 'event',         label: 'Entrevistas',         hashPath: '#/entrevistas',         activeKeyword: 'entrevistas',    esFallback: false, esItemConfig: false },
    { itemKey: 'informes',       icon: 'bar_chart',     label: 'Informes',            hashPath: '#/informes',            activeKeyword: 'informes',       esFallback: false, esItemConfig: false },
    { itemKey: 'company-config', icon: 'settings',      label: 'Configuración',       hashPath: '#/configuraciones',     activeKeyword: 'configuraciones',esFallback: false, esItemConfig: true  },

    // Portal candidato
    { itemKey: 'candidato-dashboard',    icon: 'grid_view',    label: 'Dashboard',           hashPath: '#/candidato-dashboard',    activeKeyword: 'candidato-dashboard',    esFallback: true,  esItemConfig: false },
    { itemKey: 'candidato-perfil',       icon: 'person',       label: 'Mi Perfil',           hashPath: '#/candidato-perfil',       activeKeyword: 'candidato-perfil',       esFallback: false, esItemConfig: false },
    { itemKey: 'candidato-candidaturas', icon: 'work_history', label: 'Mis Candidaturas',    hashPath: '#/candidato-candidaturas', activeKeyword: 'candidato-candidaturas', esFallback: false, esItemConfig: false },
    { itemKey: 'candidato-config',       icon: 'settings',     label: 'Configuración',       hashPath: '#/candidato-configuraciones', activeKeyword: 'configuraciones',     esFallback: false, esItemConfig: true  },
  ];

  for (const item of items) {
    await prisma.menuItem.upsert({
      where:  { itemKey: item.itemKey },
      update: item,
      create: item,
    });
  }

  // ── 3. roles_menu ─────────────────────────────────────────────
  const companyItems = [
    { key: 'company-config', orden: 0, priority: 1  },
    { key: 'dashboard',      orden: 1, priority: 99 },
    { key: 'vacantes',       orden: 2, priority: 2  },
    { key: 'candidatos',     orden: 3, priority: 3  },
    { key: 'entrevistas',    orden: 4, priority: 4  },
    { key: 'informes',       orden: 5, priority: 5  },
  ];

  const candidateItems = [
    { key: 'candidato-config',       orden: 0, priority: 1  },
    { key: 'candidato-dashboard',    orden: 1, priority: 99 },
    { key: 'candidato-perfil',       orden: 2, priority: 2  },
    { key: 'candidato-candidaturas', orden: 3, priority: 3  },
  ];

  for (const ci of companyItems) {
    const item = await prisma.menuItem.findUnique({ where: { itemKey: ci.key } });
    if (!item) continue;
    await prisma.rolMenu.upsert({
      where:  { rol_menuItemId: { rol: 'company', menuItemId: item.id } },
      update: { ordenRender: ci.orden, activePriority: ci.priority },
      create: { rol: 'company', menuItemId: item.id, ordenRender: ci.orden, activePriority: ci.priority },
    });
  }

  for (const ci of candidateItems) {
    const item = await prisma.menuItem.findUnique({ where: { itemKey: ci.key } });
    if (!item) continue;
    await prisma.rolMenu.upsert({
      where:  { rol_menuItemId: { rol: 'candidate', menuItemId: item.id } },
      update: { ordenRender: ci.orden, activePriority: ci.priority },
      create: { rol: 'candidate', menuItemId: item.id, ordenRender: ci.orden, activePriority: ci.priority },
    });
  }

  console.log('✅ Seed completado.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
