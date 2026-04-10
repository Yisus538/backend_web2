import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Agregando navegación: candidato-vacantes...');

  // 1. Crear el menu_item nuevo
  const item = await prisma.menuItem.upsert({
    where: { itemKey: 'candidato-vacantes' },
    update: { icon: 'work', label: 'Explorar Vacantes', hashPath: '#/candidato-vacantes', activeKeyword: 'candidato-vacantes', esFallback: false, esItemConfig: false },
    create: { itemKey: 'candidato-vacantes', icon: 'work', label: 'Explorar Vacantes', hashPath: '#/candidato-vacantes', activeKeyword: 'candidato-vacantes', esFallback: false, esItemConfig: false },
  });

  // 2. Vincularlo al rol candidate
  await prisma.rolMenu.upsert({
    where: { rol_menuItemId: { rol: 'candidate', menuItemId: item.id } },
    update: { ordenRender: 2, activePriority: 2 },
    create: { rol: 'candidate', menuItemId: item.id, ordenRender: 2, activePriority: 2 },
  });

  // 3. Reordenar los existentes que quedaron abajo
  const perfil = await prisma.menuItem.findUnique({ where: { itemKey: 'candidato-perfil' } });
  if (perfil) {
    await prisma.rolMenu.update({
      where: { rol_menuItemId: { rol: 'candidate', menuItemId: perfil.id } },
      data: { ordenRender: 3 },
    });
  }

  const candidaturas = await prisma.menuItem.findUnique({ where: { itemKey: 'candidato-candidaturas' } });
  if (candidaturas) {
    await prisma.rolMenu.update({
      where: { rol_menuItemId: { rol: 'candidate', menuItemId: candidaturas.id } },
      data: { ordenRender: 4 },
    });
  }

  console.log('✅ candidato-vacantes agregado correctamente.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
