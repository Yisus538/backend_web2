// ================================================================
// seed.candidato-habilidades.ts
// Crea habilidades y se las asigna al primer candidato registrado.
// Correr con: npx dotenv -e .env -- tsx lib/seed.candidato-habilidades.ts
// ================================================================

import { PrismaClient } from '@prisma/client';
import { PrismaPg }     from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter });

// Habilidades que va a tener el candidato (simula un perfil tech)
const SKILLS = [
  { nombre: 'React',         nivel: 'avanzado',     aniosExp: 4 },
  { nombre: 'TypeScript',    nivel: 'avanzado',     aniosExp: 3 },
  { nombre: 'Node.js',       nivel: 'intermedio',   aniosExp: 3 },
  { nombre: 'CSS',           nivel: 'avanzado',     aniosExp: 5 },
  { nombre: 'Git',           nivel: 'avanzado',     aniosExp: 5 },
  { nombre: 'Docker',        nivel: 'intermedio',   aniosExp: 2 },
  { nombre: 'PostgreSQL',    nivel: 'intermedio',   aniosExp: 2 },
  { nombre: 'Python',        nivel: 'básico',       aniosExp: 1 },
  { nombre: 'Figma',         nivel: 'intermedio',   aniosExp: 2 },
  { nombre: 'AWS',           nivel: 'básico',       aniosExp: 1 },
  // Soft skills
  { nombre: 'Trabajo en Equipo',        nivel: 'avanzado', aniosExp: 5 },
  { nombre: 'Comunicación Efectiva',    nivel: 'avanzado', aniosExp: 5 },
  { nombre: 'Resolución de Problemas',  nivel: 'avanzado', aniosExp: 4 },
  { nombre: 'Adaptabilidad',            nivel: 'intermedio', aniosExp: 3 },
];

async function main() {
  console.log('🌱 Seeding habilidades del candidato...');

  // Buscar primer candidato
  const candidato = await prisma.user.findFirst({
    where: { role: 'candidate' },
    select: { id: true, fullName: true, email: true },
  });

  if (!candidato) {
    console.error('❌ No se encontró ningún usuario con role = "candidate". Registrá una cuenta candidato primero.');
    process.exit(1);
  }

  console.log(`✅ Candidato: ${candidato.fullName} (${candidato.email})`);

  // Asegurar que existe la fila en candidatos
  await prisma.candidato.upsert({
    where:  { usuarioId: candidato.id },
    update: {},
    create: { usuarioId: candidato.id },
  });

  let creadas = 0;

  for (const skill of SKILLS) {
    // Upsert habilidad en catálogo global
    const hab = await prisma.habilidad.upsert({
      where:  { nombre: skill.nombre },
      update: {},
      create: { nombre: skill.nombre },
    });

    // Asignar al candidato (skip si ya existe)
    const existe = await prisma.candidatoHabilidad.findUnique({
      where: { candidatoId_habilidadId: { candidatoId: candidato.id, habilidadId: hab.id } },
    });

    if (!existe) {
      await prisma.candidatoHabilidad.create({
        data: {
          candidatoId: candidato.id,
          habilidadId: hab.id,
          nivel:       skill.nivel,
          aniosExp:    skill.aniosExp,
          verificada:  false,
        },
      });
      creadas++;
    }

    console.log(`  ✓ ${skill.nombre} (${skill.nivel}, ${skill.aniosExp} años)`);
  }

  console.log(`\n✅ ${creadas} habilidades asignadas al candidato.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());