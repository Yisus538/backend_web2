// lib/seed.vacantes.ts
// Correr con: npx dotenv -e .env -- tsx lib/seed.vacantes.ts

import { PrismaClient } from '@prisma/client';
import { PrismaPg }     from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter });

const VACANTES = [
  {
    titulo:            "Senior Fullstack Developer",
    descripcion:       "Buscamos un desarrollador fullstack con experiencia en React y Node.js para liderar el desarrollo de nuestra plataforma SaaS. Trabajarás en un equipo ágil de 8 personas, participando en decisiones arquitectónicas y mentoreando a desarrolladores junior.",
    estado:            "abierta",
    categoria:         "tech",
    modalidad:         "remoto",
    experienciaMinima: 5,
    salarioMin:        4500000,
    salarioMax:        5500000,
    ubicacion:         "Remoto (Argentina)",
    requisitos: {
      techSkills:    [{ label: "React", selected: true }, { label: "Node.js", selected: true }, { label: "TypeScript", selected: true }, { label: "PostgreSQL", selected: true }, { label: "Docker", selected: true }],
      softSkills:    [{ label: "Liderazgo", selected: true }, { label: "Comunicación Efectiva", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "c1",
      detallesExtra: "Experiencia liderando equipos de al menos 3 personas.",
    },
    matchingWeights: { experienciaTecnica: "alto", afinidadCultural: "medio", ubicacion: "bajo", expectativaSalarial: "medio" },
  },
  {
    titulo:            "Product Designer UX/UI",
    descripcion:       "Necesitamos un diseñador apasionado por la experiencia de usuario para rediseñar nuestro producto principal. Trabajarás de la mano con product managers y desarrolladores para crear interfaces intuitivas y accesibles.",
    estado:            "abierta",
    categoria:         "tech",
    modalidad:         "hibrido",
    experienciaMinima: 3,
    salarioMin:        3000000,
    salarioMax:        4000000,
    ubicacion:         "Buenos Aires (Híbrido)",
    requisitos: {
      techSkills:    [{ label: "Figma", selected: true }, { label: "Prototyping", selected: true }],
      softSkills:    [{ label: "Pensamiento Crítico", selected: true }, { label: "Comunicación Efectiva", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "b1",
      detallesExtra: "Portfolio con casos de estudio reales requerido.",
    },
    matchingWeights: { experienciaTecnica: "medio", afinidadCultural: "alto", ubicacion: "medio", expectativaSalarial: "bajo" },
  },
  {
    titulo:            "Data Scientist",
    descripcion:       "Buscamos un científico de datos para construir modelos predictivos que mejoren nuestro algoritmo de matching de candidatos. Tendrás acceso a millones de datos anonimizados y libertad para proponer soluciones innovadoras.",
    estado:            "abierta",
    categoria:         "tech",
    modalidad:         "remoto",
    experienciaMinima: 4,
    salarioMin:        5000000,
    salarioMax:        6500000,
    ubicacion:         "Remoto (LATAM)",
    requisitos: {
      techSkills:    [{ label: "Python", selected: true }, { label: "SQL", selected: true }, { label: "Machine Learning", selected: true }, { label: "AWS", selected: true }],
      softSkills:    [{ label: "Pensamiento Crítico", selected: true }, { label: "Resolución de Problemas", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "c1",
      detallesExtra: "Experiencia con modelos de NLP es un plus.",
    },
    matchingWeights: { experienciaTecnica: "alto", afinidadCultural: "bajo", ubicacion: "bajo", expectativaSalarial: "medio" },
  },
  {
    titulo:            "Marketing Manager",
    descripcion:       "Liderá nuestra estrategia de marketing digital para acelerar el crecimiento en LATAM. Gestionarás un equipo de 4 personas y un presupuesto de $50k mensuales en campañas pagas, content marketing y partnerships.",
    estado:            "abierta",
    categoria:         "mkt",
    modalidad:         "hibrido",
    experienciaMinima: 4,
    salarioMin:        3500000,
    salarioMax:        4500000,
    ubicacion:         "Córdoba (Híbrido)",
    requisitos: {
      techSkills:    [],
      softSkills:    [{ label: "Liderazgo", selected: true }, { label: "Comunicación Efectiva", selected: true }, { label: "Pensamiento Crítico", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "b1",
      detallesExtra: "Experiencia previa en empresas SaaS B2B.",
    },
    matchingWeights: { experienciaTecnica: "bajo", afinidadCultural: "alto", ubicacion: "medio", expectativaSalarial: "medio" },
  },
  {
    titulo:            "DevOps Engineer",
    descripcion:       "Necesitamos a alguien que tome ownership de nuestra infraestructura en AWS y establezca las mejores prácticas de CI/CD. Trabajarás con un stack moderno: Kubernetes, Terraform, GitHub Actions y Datadog.",
    estado:            "abierta",
    categoria:         "tech",
    modalidad:         "remoto",
    experienciaMinima: 4,
    salarioMin:        4000000,
    salarioMax:        5500000,
    ubicacion:         "Remoto (Argentina)",
    requisitos: {
      techSkills:    [{ label: "Kubernetes", selected: true }, { label: "Docker", selected: true }, { label: "AWS", selected: true }, { label: "Terraform", selected: true }],
      softSkills:    [{ label: "Resolución de Problemas", selected: true }, { label: "Trabajo en Equipo", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "b1",
      detallesExtra: "Certificación AWS es un diferencial.",
    },
    matchingWeights: { experienciaTecnica: "alto", afinidadCultural: "medio", ubicacion: "bajo", expectativaSalarial: "alto" },
  },
  {
    titulo:            "Customer Success Manager",
    descripcion:       "Serás la cara de la empresa para nuestros clientes enterprise. Tu misión es asegurar la adopción del producto, reducir el churn y detectar oportunidades de upsell. Gestionarás una cartera de 30 cuentas.",
    estado:            "abierta",
    categoria:         "mkt",
    modalidad:         "presencial",
    experienciaMinima: 2,
    salarioMin:        2500000,
    salarioMax:        3500000,
    ubicacion:         "Buenos Aires (Presencial)",
    requisitos: {
      techSkills:    [],
      softSkills:    [{ label: "Comunicación Efectiva", selected: true }, { label: "Adaptabilidad", selected: true }, { label: "Resolución de Problemas", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "b1",
      detallesExtra: "Experiencia previa en roles de CS o Account Management.",
    },
    matchingWeights: { experienciaTecnica: "bajo", afinidadCultural: "alto", ubicacion: "alto", expectativaSalarial: "medio" },
  },
  {
    titulo:            "Backend Engineer Python",
    descripcion:       "Buscamos un backend engineer para construir y escalar nuestra API REST que procesa más de 10 millones de requests diarios. Tendrás autonomía para proponer mejoras de performance y arquitectura.",
    estado:            "abierta",
    categoria:         "tech",
    modalidad:         "remoto",
    experienciaMinima: 3,
    salarioMin:        3500000,
    salarioMax:        5000000,
    ubicacion:         "Remoto (LATAM)",
    requisitos: {
      techSkills:    [{ label: "Python", selected: true }, { label: "PostgreSQL", selected: true }, { label: "Docker", selected: true }, { label: "AWS", selected: true }],
      softSkills:    [{ label: "Resolución de Problemas", selected: true }, { label: "Trabajo en Equipo", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "b1",
      detallesExtra: "Conocimiento de sistemas de colas (Redis, RabbitMQ) es un plus.",
    },
    matchingWeights: { experienciaTecnica: "alto", afinidadCultural: "medio", ubicacion: "bajo", expectativaSalarial: "medio" },
  },
  {
    titulo:            "HR Business Partner",
    descripcion:       "Acompañarás a los líderes de la empresa en la gestión de personas, cultura organizacional y desarrollo del talento. Serás el nexo entre la estrategia de negocio y las personas.",
    estado:            "borrador",
    categoria:         "hr",
    modalidad:         "hibrido",
    experienciaMinima: 3,
    salarioMin:        2800000,
    salarioMax:        3800000,
    ubicacion:         "Buenos Aires (Híbrido)",
    requisitos: {
      techSkills:    [],
      softSkills:    [{ label: "Comunicación Efectiva", selected: true }, { label: "Liderazgo", selected: true }, { label: "Adaptabilidad", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "b1",
      detallesExtra: "Experiencia en empresas de tecnología es un diferencial.",
    },
    matchingWeights: { experienciaTecnica: "bajo", afinidadCultural: "alto", ubicacion: "medio", expectativaSalarial: "bajo" },
  },
  {
    titulo:            "Frontend Engineer React",
    descripcion:       "Construirás las interfaces que usan miles de reclutadores diariamente. Trabajarás con React, TypeScript y un design system propio. Valoramos la atención al detalle y la pasión por el rendimiento.",
    estado:            "abierta",
    categoria:         "tech",
    modalidad:         "remoto",
    experienciaMinima: 2,
    salarioMin:        3000000,
    salarioMax:        4200000,
    ubicacion:         "Remoto (Argentina)",
    requisitos: {
      techSkills:    [{ label: "React", selected: true }, { label: "TypeScript", selected: true }, { label: "CSS", selected: true }, { label: "Git", selected: true }],
      softSkills:    [{ label: "Trabajo en Equipo", selected: true }, { label: "Comunicación Efectiva", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "b1",
      detallesExtra: "Experiencia con testing (Jest, Testing Library) es valorada.",
    },
    matchingWeights: { experienciaTecnica: "alto", afinidadCultural: "medio", ubicacion: "bajo", expectativaSalarial: "medio" },
  },
  {
    titulo:            "Talent Acquisition Specialist",
    descripcion:       "Serás responsable de atraer y seleccionar el mejor talento tech para nuestro equipo en crecimiento. Gestionarás el proceso completo de reclutamiento, desde la definición del perfil hasta el cierre de la oferta.",
    estado:            "abierta",
    categoria:         "hr",
    modalidad:         "hibrido",
    experienciaMinima: 2,
    salarioMin:        2200000,
    salarioMax:        3200000,
    ubicacion:         "Córdoba (Híbrido)",
    requisitos: {
      techSkills:    [],
      softSkills:    [{ label: "Comunicación Efectiva", selected: true }, { label: "Resolución de Problemas", selected: true }, { label: "Adaptabilidad", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "b1",
      detallesExtra: "Experiencia reclutando perfiles tech es excluyente.",
    },
    matchingWeights: { experienciaTecnica: "bajo", afinidadCultural: "alto", ubicacion: "medio", expectativaSalarial: "bajo" },
  },
  {
    titulo:            "QA Engineer",
    descripcion:       "Asegurarás la calidad de nuestro producto a través de testing manual y automatizado. Trabajarás junto al equipo de desarrollo para definir estrategias de testing, detectar bugs y mantener la cobertura del código.",
    estado:            "pausada",
    categoria:         "tech",
    modalidad:         "remoto",
    experienciaMinima: 2,
    salarioMin:        2500000,
    salarioMax:        3500000,
    ubicacion:         "Remoto (Argentina)",
    requisitos: {
      techSkills:    [{ label: "SQL", selected: true }, { label: "Git", selected: true }, { label: "Python", selected: true }],
      softSkills:    [{ label: "Pensamiento Crítico", selected: true }, { label: "Resolución de Problemas", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "b1",
      detallesExtra: "Experiencia con Cypress, Playwright o Selenium.",
    },
    matchingWeights: { experienciaTecnica: "alto", afinidadCultural: "medio", ubicacion: "bajo", expectativaSalarial: "bajo" },
  },
  {
    titulo:            "Content Marketing Specialist",
    descripcion:       "Crearás contenido de valor para nuestro blog, redes sociales y newsletters. Tu objetivo es posicionar a ReclutaIA como referente en HR Tech en LATAM a través de contenido educativo y de thought leadership.",
    estado:            "abierta",
    categoria:         "mkt",
    modalidad:         "remoto",
    experienciaMinima: 1,
    salarioMin:        1800000,
    salarioMax:        2800000,
    ubicacion:         "Remoto (LATAM)",
    requisitos: {
      techSkills:    [],
      softSkills:    [{ label: "Comunicación Efectiva", selected: true }, { label: "Pensamiento Crítico", selected: true }, { label: "Adaptabilidad", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "b1",
      detallesExtra: "Portfolio de artículos o piezas de contenido requerido.",
    },
    matchingWeights: { experienciaTecnica: "bajo", afinidadCultural: "alto", ubicacion: "bajo", expectativaSalarial: "bajo" },
  },
  {
    titulo:            "Mobile Developer React Native",
    descripcion:       "Desarrollarás nuestra app mobile para iOS y Android usando React Native. Serás el primer mobile developer del equipo, por lo que tendrás la oportunidad de definir la arquitectura y las decisiones técnicas desde cero.",
    estado:            "abierta",
    categoria:         "tech",
    modalidad:         "remoto",
    experienciaMinima: 3,
    salarioMin:        3800000,
    salarioMax:        5000000,
    ubicacion:         "Remoto (Argentina)",
    requisitos: {
      techSkills:    [{ label: "React", selected: true }, { label: "TypeScript", selected: true }, { label: "Git", selected: true }, { label: "Node.js", selected: true }],
      softSkills:    [{ label: "Adaptabilidad", selected: true }, { label: "Resolución de Problemas", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "b1",
      detallesExtra: "Experiencia publicando apps en App Store y Google Play.",
    },
    matchingWeights: { experienciaTecnica: "alto", afinidadCultural: "medio", ubicacion: "bajo", expectativaSalarial: "medio" },
  },
  {
    titulo:            "Sales Executive B2B",
    descripcion:       "Serás responsable de cerrar nuevos clientes enterprise para nuestra plataforma. Gestionarás el ciclo completo de ventas: prospección, demos, negociación y cierre. Comisiones sin techo.",
    estado:            "abierta",
    categoria:         "mkt",
    modalidad:         "presencial",
    experienciaMinima: 2,
    salarioMin:        2500000,
    salarioMax:        4000000,
    ubicacion:         "Buenos Aires (Presencial)",
    requisitos: {
      techSkills:    [],
      softSkills:    [{ label: "Comunicación Efectiva", selected: true }, { label: "Adaptabilidad", selected: true }, { label: "Liderazgo", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "b1",
      detallesExtra: "Track record de cierre de cuentas enterprise comprobable.",
    },
    matchingWeights: { experienciaTecnica: "bajo", afinidadCultural: "alto", ubicacion: "alto", expectativaSalarial: "medio" },
  },
  {
    titulo:            "Cloud Architect AWS",
    descripcion:       "Diseñarás y supervisarás la arquitectura cloud de toda la plataforma. Trabajarás con el CTO para definir la hoja de ruta de infraestructura, asegurando escalabilidad, seguridad y eficiencia de costos.",
    estado:            "borrador",
    categoria:         "tech",
    modalidad:         "remoto",
    experienciaMinima: 7,
    salarioMin:        6000000,
    salarioMax:        8000000,
    ubicacion:         "Remoto (Global)",
    requisitos: {
      techSkills:    [{ label: "AWS", selected: true }, { label: "Kubernetes", selected: true }, { label: "Terraform", selected: true }, { label: "Docker", selected: true }, { label: "Python", selected: true }],
      softSkills:    [{ label: "Liderazgo", selected: true }, { label: "Pensamiento Crítico", selected: true }, { label: "Comunicación Efectiva", selected: true }],
      idiomaEs:      "nativo",
      idiomaEn:      "c1",
      detallesExtra: "AWS Solutions Architect Professional requerido.",
    },
    matchingWeights: { experienciaTecnica: "alto", afinidadCultural: "medio", ubicacion: "bajo", expectativaSalarial: "alto" },
  },
];

async function main() {
  console.log("🌱 Seeding vacantes...");

  // Buscar el primer usuario con rol company
  const empresa = await prisma.user.findFirst({
    where: { role: "company" },
    select: { id: true, fullName: true, email: true },
  });

  if (!empresa) {
    console.error("❌ No se encontró ningún usuario con role = 'company'. Registrá una cuenta empresa primero.");
    process.exit(1);
  }

  console.log(`✅ Empresa encontrada: ${empresa.fullName} (${empresa.email})`);

  // Asegurar que existe la fila en la tabla empresas
  await prisma.empresa.upsert({
    where:  { usuarioId: empresa.id },
    update: {},
    create: { usuarioId: empresa.id },
  });

  // Crear las 15 vacantes
  let creadas = 0;
  for (const v of VACANTES) {
    await prisma.ofertaLaboral.create({
      data: {
        empresaId:         empresa.id,
        titulo:            v.titulo,
        descripcion:       v.descripcion,
        estado:            v.estado,
        categoria:         v.categoria,
        modalidad:         v.modalidad,
        experienciaMinima: v.experienciaMinima,
        salarioMin:        v.salarioMin,
        salarioMax:        v.salarioMax,
        ubicacion:         v.ubicacion,
        requisitos:        v.requisitos,
        matchingWeights:   v.matchingWeights,
      },
    });
    creadas++;
    console.log(`  ✓ ${v.titulo} (${v.estado})`);
  }

  console.log(`\n✅ ${creadas} vacantes creadas exitosamente.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());