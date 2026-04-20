import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── Contraseña compartida para todas las empresas de seed ─────────
const SEED_PASSWORD = 'Test1234!';

// ── Datos de las 5 empresas ───────────────────────────────────────

const empresas = [
  {
    fullName: 'TechVentures Argentina',
    email: 'rrhh@techventures.demo',
    nombreEmpresa: 'TechVentures Argentina S.A.',
    descripcion: 'Empresa líder en desarrollo de software y consultoría tecnológica en Buenos Aires.',
  },
  {
    fullName: 'DataFlow Solutions',
    email: 'jobs@dataflow.demo',
    nombreEmpresa: 'DataFlow Solutions S.R.L.',
    descripcion: 'Especialistas en Big Data, Machine Learning e inteligencia artificial aplicada.',
  },
  {
    fullName: 'CloudNine Studios',
    email: 'talento@cloudnine.demo',
    nombreEmpresa: 'CloudNine Studios S.A.',
    descripcion: 'Agencia digital que crea experiencias web y mobile de alto impacto.',
  },
  {
    fullName: 'FinTech Córdoba',
    email: 'people@fintechcba.demo',
    nombreEmpresa: 'FinTech Córdoba S.A.',
    descripcion: 'Startup fintech que revoluciona los pagos digitales en Latinoamérica.',
  },
  {
    fullName: 'GreenCode Labs',
    email: 'hiring@greencode.demo',
    nombreEmpresa: 'GreenCode Labs S.R.L.',
    descripcion: 'Consultora de desarrollo sustentable con foco en tecnologías verdes y ESG.',
  },
];

// ── Plantillas de vacantes (10 por empresa, variando datos) ──────

const vacantesTemplate = [
  {
    titulo: 'Frontend Developer React',
    descripcion: 'Buscamos un/a desarrollador/a frontend con experiencia sólida en React, TypeScript y diseño responsive. Trabajarás en productos usados por miles de usuarios.',
    categoria: 'Desarrollo',
    modalidad: 'remoto',
    experienciaMinima: 2,
    salarioMin: 800000,
    salarioMax: 1400000,
    ubicacion: 'Buenos Aires, Argentina',
    requisitos: { skills: ['React', 'TypeScript', 'CSS', 'Git'], nivel: 'Semi-Senior' },
  },
  {
    titulo: 'Backend Developer Node.js',
    descripcion: 'Desarrollador/a backend para diseñar APIs REST y microservicios escalables con NestJS y PostgreSQL.',
    categoria: 'Desarrollo',
    modalidad: 'hibrido',
    experienciaMinima: 3,
    salarioMin: 900000,
    salarioMax: 1600000,
    ubicacion: 'Buenos Aires, Argentina',
    requisitos: { skills: ['Node.js', 'NestJS', 'PostgreSQL', 'Docker'], nivel: 'Semi-Senior' },
  },
  {
    titulo: 'Fullstack Developer',
    descripcion: 'Perfil fullstack para trabajar en un equipo ágil desarrollando plataformas SaaS de punta a punta.',
    categoria: 'Desarrollo',
    modalidad: 'remoto',
    experienciaMinima: 3,
    salarioMin: 1000000,
    salarioMax: 1800000,
    ubicacion: 'Córdoba, Argentina',
    requisitos: { skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'], nivel: 'Senior' },
  },
  {
    titulo: 'UX/UI Designer',
    descripcion: 'Diseñador/a de interfaces centrado/a en el usuario para crear experiencias intuitivas y accesibles.',
    categoria: 'Diseño',
    modalidad: 'remoto',
    experienciaMinima: 2,
    salarioMin: 700000,
    salarioMax: 1200000,
    ubicacion: 'Rosario, Argentina',
    requisitos: { skills: ['Figma', 'Design Systems', 'Usability Testing'], nivel: 'Semi-Senior' },
  },
  {
    titulo: 'Data Engineer',
    descripcion: 'Ingeniero/a de datos para construir pipelines ETL y arquitecturas de datos modernas en la nube.',
    categoria: 'Data',
    modalidad: 'hibrido',
    experienciaMinima: 3,
    salarioMin: 1100000,
    salarioMax: 1900000,
    ubicacion: 'Buenos Aires, Argentina',
    requisitos: { skills: ['Python', 'Apache Spark', 'AWS Glue', 'SQL'], nivel: 'Senior' },
  },
  {
    titulo: 'DevOps Engineer',
    descripcion: 'Responsable de CI/CD, infraestructura como código y monitoreo de plataformas en producción.',
    categoria: 'Infraestructura',
    modalidad: 'remoto',
    experienciaMinima: 4,
    salarioMin: 1200000,
    salarioMax: 2000000,
    ubicacion: 'Buenos Aires, Argentina',
    requisitos: { skills: ['Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'], nivel: 'Senior' },
  },
  {
    titulo: 'QA Automation Engineer',
    descripcion: 'Ingeniero/a de calidad para diseñar e implementar suites de pruebas automatizadas E2E.',
    categoria: 'QA',
    modalidad: 'hibrido',
    experienciaMinima: 2,
    salarioMin: 750000,
    salarioMax: 1300000,
    ubicacion: 'Mendoza, Argentina',
    requisitos: { skills: ['Cypress', 'Playwright', 'Jest', 'CI/CD'], nivel: 'Semi-Senior' },
  },
  {
    titulo: 'Product Manager',
    descripcion: 'Liderá la visión del producto, el roadmap y la priorización junto a equipos de ingeniería y diseño.',
    categoria: 'Producto',
    modalidad: 'presencial',
    experienciaMinima: 5,
    salarioMin: 1300000,
    salarioMax: 2200000,
    ubicacion: 'Buenos Aires, Argentina',
    requisitos: { skills: ['Roadmapping', 'Métricas', 'Agile', 'Stakeholder Management'], nivel: 'Senior' },
  },
  {
    titulo: 'Mobile Developer React Native',
    descripcion: 'Desarrollo de aplicaciones móviles cross-platform con React Native y Expo para iOS y Android.',
    categoria: 'Desarrollo',
    modalidad: 'remoto',
    experienciaMinima: 2,
    salarioMin: 850000,
    salarioMax: 1500000,
    ubicacion: 'Tucumán, Argentina',
    requisitos: { skills: ['React Native', 'Expo', 'TypeScript', 'REST APIs'], nivel: 'Semi-Senior' },
  },
  {
    titulo: 'Scrum Master',
    descripcion: 'Facilitá ceremonias ágiles, eliminá impedimentos y fomentá la mejora continua en equipos de desarrollo.',
    categoria: 'Gestión',
    modalidad: 'hibrido',
    experienciaMinima: 3,
    salarioMin: 900000,
    salarioMax: 1500000,
    ubicacion: 'Córdoba, Argentina',
    requisitos: { skills: ['Scrum', 'Kanban', 'Jira', 'Facilitación'], nivel: 'Semi-Senior' },
  },
];

// ── Variaciones de estado para darle vida a los datos ─────────────
const estados = ['abierta', 'abierta', 'abierta', 'abierta', 'abierta', 'abierta', 'abierta', 'pausada', 'borrador', 'cerrada'];

async function main() {
  console.log('🏢 Iniciando seed de empresas y vacantes...\n');

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

  for (const emp of empresas) {
    // 1. Crear o actualizar el User con role=company
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {
        fullName:        emp.fullName,
        passwordHash,
        isEmailVerified: true,
        isActive:        true,
      },
      create: {
        fullName:        emp.fullName,
        email:           emp.email,
        passwordHash,
        role:            'company',
        isEmailVerified: true,
        isActive:        true,
      },
    });

    // 2. Crear o actualizar la subclase Empresa
    await prisma.empresa.upsert({
      where: { usuarioId: user.id },
      update: {
        nombreEmpresa: emp.nombreEmpresa,
        descripcion:   emp.descripcion,
      },
      create: {
        usuarioId:     user.id,
        nombreEmpresa: emp.nombreEmpresa,
        descripcion:   emp.descripcion,
      },
    });

    console.log(`  ✅ Empresa "${emp.nombreEmpresa}" (${emp.email})`);

    // 3. Crear 10 vacantes para esta empresa
    let vacCount = 0;
    for (let i = 0; i < vacantesTemplate.length; i++) {
      const v = vacantesTemplate[i];
      const estado = estados[i];

      // Hacer cada vacante ligeramente única por empresa
      const tituloUnico = `${v.titulo} — ${emp.nombreEmpresa.split(' ')[0]}`;

      await prisma.ofertaLaboral.upsert({
        where: {
          // No hay unique natural, usamos create + skipDuplicates pattern
          // Mejor: buscamos por título + empresa
          id: `seed-${emp.email}-${i}`,
        },
        update: {
          titulo:            tituloUnico,
          descripcion:       v.descripcion,
          estado,
          categoria:         v.categoria,
          modalidad:         v.modalidad,
          experienciaMinima: v.experienciaMinima,
          salarioMin:        v.salarioMin,
          salarioMax:        v.salarioMax,
          ubicacion:         v.ubicacion,
          requisitos:        v.requisitos,
        },
        create: {
          id:                `seed-${emp.email}-${i}`,
          empresaId:         user.id,
          titulo:            tituloUnico,
          descripcion:       v.descripcion,
          estado,
          categoria:         v.categoria,
          modalidad:         v.modalidad,
          experienciaMinima: v.experienciaMinima,
          salarioMin:        v.salarioMin,
          salarioMax:        v.salarioMax,
          ubicacion:         v.ubicacion,
          requisitos:        v.requisitos,
        },
      });
      vacCount++;
    }

    console.log(`     └─ ${vacCount} vacantes insertadas/actualizadas`);
  }

  console.log(`\n🎉 Seed de empresas completado.`);
  console.log(`   📧 Todas las empresas usan la contraseña: ${SEED_PASSWORD}`);
  console.log(`   📧 Emails: ${empresas.map(e => e.email).join(', ')}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante seed_empresa:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
