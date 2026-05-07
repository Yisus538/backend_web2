import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── Contraseña compartida para los admins de seed ─────────────────
const SEED_PASSWORD = 'Admin1234!';

// ── Datos de los administradores ──────────────────────────────────

const admins = [
  {
    fullName: 'Juan Administrador',
    email: 'juan@admin.demo',
    departamento: 'Dirección General',
    nivelAcceso: 3,
    permisosExtra: {
      gestionUsuarios: true,
      gestionEmpresas: true,
      gestionCandidatos: true,
      verEstadisticas: true,
      moderarContenido: true,
    },
  },
  {
    fullName: 'Jesús Administrador',
    email: 'jesus@admin.demo',
    departamento: 'Tecnología',
    nivelAcceso: 3,
    permisosExtra: {
      gestionUsuarios: true,
      gestionEmpresas: true,
      gestionCandidatos: true,
      verEstadisticas: true,
      moderarContenido: true,
    },
  },
];

// ── Ítems de menú del portal admin ────────────────────────────────
// Basados en el diseño del dashboard admin
// IMPORTANTE: hashPath y activeKeyword DEBEN coincidir con ROUTES.js
//             y con HASH_TO_KEYWORD en router.js del frontend.

const adminMenuItems = [
  {
    itemKey: 'admin_panel',
    icon: 'dashboard',
    label: 'Panel Global',
    hashPath: '#/admin-panel',
    activeKeyword: 'admin-panel',
    esItemConfig: false,
    esFallback: true,
    activo: true,
  },
  {
    itemKey: 'admin_empresas',
    icon: 'business',
    label: 'Gestión de Empresas',
    hashPath: '#/admin-empresas',
    activeKeyword: 'admin-empresas',
    esItemConfig: false,
    esFallback: false,
    activo: true,
  },
  {
    itemKey: 'admin_candidatos',
    icon: 'person_search',
    label: 'Directorio de Candidatos',
    hashPath: '#/admin-candidatos',
    activeKeyword: 'admin-candidatos',
    esItemConfig: false,
    esFallback: false,
    activo: true,
  },
  {
    itemKey: 'admin_vacantes',
    icon: 'fact_check',
    label: 'Auditoría de Vacantes',
    hashPath: '#/admin-vacantes',
    activeKeyword: 'admin-vacantes',
    esItemConfig: false,
    esFallback: false,
    activo: true,
  },
  {
    itemKey: 'admin_ia',
    icon: 'psychology',
    label: 'Rendimiento IA',
    hashPath: '#/admin-ia',
    activeKeyword: 'admin-ia',
    esItemConfig: false,
    esFallback: false,
    activo: true,
  },
  {
    itemKey: 'admin_config',
    icon: 'settings',
    label: 'Configuración del Sistema',
    hashPath: '#/admin-config',
    activeKeyword: 'admin-config',
    esItemConfig: true,
    esFallback: false,
    activo: true,
  },
];

async function main() {
  console.log('🔑 Iniciando seed de administradores...\n');

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

  for (const admin of admins) {
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        fullName:        admin.fullName,
        passwordHash,
        isEmailVerified: true,
        isActive:        true,
        role:            'administrativo',
      },
      create: {
        fullName:        admin.fullName,
        email:           admin.email,
        passwordHash,
        role:            'administrativo',
        isEmailVerified: true,
        isActive:        true,
      },
    });

    await prisma.administrativo.upsert({
      where: { usuarioId: user.id },
      update: {
        departamento:  admin.departamento,
        nivelAcceso:   admin.nivelAcceso,
        permisosExtra: admin.permisosExtra,
      },
      create: {
        usuarioId:     user.id,
        departamento:  admin.departamento,
        nivelAcceso:   admin.nivelAcceso,
        permisosExtra: admin.permisosExtra,
      },
    });

    console.log(`  ✅ Admin "${admin.fullName}" (${admin.email})`);
  }

  // ── Insertar MenuItems ──────────────────────────────────────
  const menuItemMap: Record<string, string> = {};
  for (const item of adminMenuItems) {
    const created = await prisma.menuItem.upsert({
      where: { itemKey: item.itemKey },
      update: item,
      create: item,
    });
    menuItemMap[item.itemKey] = created.id;
  }
  console.log(`  ✅ ${adminMenuItems.length} MenuItem(s) de admin insertados/actualizados`);

  // ── MenuConfigRol ───────────────────────────────────────────
  await prisma.menuConfigRol.upsert({
    where: { rol: 'administrativo' },
    update: {
      subtitle:   'Administración',
      configHash: '#/admin-config',
    },
    create: {
      rol:        'administrativo',
      subtitle:   'Administración',
      configHash: '#/admin-config',
    },
  });
  console.log(`  ✅ MenuConfigRol para "administrativo" actualizado`);

  // ── Limpiar RolMenu previos del admin ───────────────────────
  await prisma.rolMenu.deleteMany({ where: { rol: 'administrativo' } });

  // ── Asignar ítems al rol ────────────────────────────────────
  // [itemKey, ordenRender, activePriority]
  const adminRolItems: [string, number, number][] = [
    ['admin_panel',      1, 99],   // fallback → prioridad baja
    ['admin_empresas',   2, 10],
    ['admin_candidatos', 3, 20],
    ['admin_vacantes',   4, 30],
    ['admin_ia',         5, 40],
    ['admin_config',     6, 50],
  ];

  let rolMenuCount = 0;
  for (const [itemKey, ordenRender, activePriority] of adminRolItems) {
    const menuItemId = menuItemMap[itemKey];
    if (!menuItemId) {
      console.warn(`  ⚠️  itemKey "${itemKey}" no encontrado, saltando...`);
      continue;
    }

    await prisma.rolMenu.create({
      data: { rol: 'administrativo', menuItemId, ordenRender, activePriority },
    });
    rolMenuCount++;
  }
  console.log(`  ✅ ${rolMenuCount} RolMenu asignados al rol "administrativo"`);

  console.log(`\n🎉 Seed de administradores completado.`);
  console.log(`   🔐 Contraseña: ${SEED_PASSWORD}`);
  console.log(`   📧 Emails: ${admins.map(a => a.email).join(', ')}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante seed_admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
