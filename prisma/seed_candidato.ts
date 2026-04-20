import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── Contraseña compartida para todos los candidatos
const SEED_PASSWORD = 'Test1234!';

const candidatoTemplates = [
  {
    fullName: 'Ana Martínez',
    email: 'ana.martinez@demo.candidato.com',
    telefono: '+54 11 5555-0001',
    ubicacion: 'Buenos Aires, Argentina',
    titulo: 'Frontend Developer Ssr',
    avatarUrl: 'https://i.pravatar.cc/150?u=ana.martinez',
    biografia: 'Desarrolladora apasionada por crear interfaces de usuario hermosas y accesibles. Fan de React y del ecosistema web.',
    habilidades: [
      { nombre: 'React', nivel: 'Avanzado', aniosExp: 3 },
      { nombre: 'TypeScript', nivel: 'Intermedio', aniosExp: 2 },
      { nombre: 'CSS', nivel: 'Avanzado', aniosExp: 4 },
      { nombre: 'Git', nivel: 'Avanzado', aniosExp: 4 }
    ],
    experiencias: [
      { empresa: 'WebSolutions BA', cargo: 'Frontend Developer', fechaInicio: '2021-02', actual: true, modalidad: 'remoto', descripcion: 'Desarrollo de SPAs en React para clientes internacionales.' },
      { empresa: 'Agencia Digital', cargo: 'Junior Developer', fechaInicio: '2019-03', fechaFin: '2021-01', actual: false, modalidad: 'hibrido', descripcion: 'Maquetado e integración con APIs REST.' }
    ],
    educaciones: [
      { institucion: 'Universidad Tecnológica Nacional', titulo: 'Ingeniería en Sistemas', fechaInicio: '2016-03', fechaFin: '2021-12', cursando: false }
    ],
    idiomas: [
      { idioma: 'Inglés', nivel: 'avanzado' },
      { idioma: 'Español', nivel: 'nativo' }
    ]
  },
  {
    fullName: 'Carlos Gómez',
    email: 'carlos.gomez@demo.candidato.com',
    telefono: '+54 351 555-0002',
    ubicacion: 'Córdoba, Argentina',
    titulo: 'Backend Engineer',
    avatarUrl: 'https://i.pravatar.cc/150?u=carlos.gomez',
    biografia: 'Ingeniero de backend enfocado en arquitecturas escalables y microservicios.',
    habilidades: [
      { nombre: 'Node.js', nivel: 'Avanzado', aniosExp: 5 },
      { nombre: 'NestJS', nivel: 'Avanzado', aniosExp: 3 },
      { nombre: 'PostgreSQL', nivel: 'Avanzado', aniosExp: 4 },
      { nombre: 'Docker', nivel: 'Intermedio', aniosExp: 2 }
    ],
    experiencias: [
      { empresa: 'Tech Hub VCP', cargo: 'Backend Engineer', fechaInicio: '2020-01', actual: true, modalidad: 'remoto', descripcion: 'Diseño e implementación de microservicios con NestJS.' }
    ],
    educaciones: [
      { institucion: 'Universidad Nacional de Córdoba', titulo: 'Licenciatura en Computación', fechaInicio: '2014-03', fechaFin: '2019-12', cursando: false }
    ],
    idiomas: [
      { idioma: 'Inglés', nivel: 'intermedio' }
    ]
  },
  {
    fullName: 'Lucía Fernández',
    email: 'lucia.fernandez@demo.candidato.com',
    telefono: '+54 341 555-0003',
    ubicacion: 'Rosario, Argentina',
    titulo: 'UX/UI Designer',
    avatarUrl: 'https://i.pravatar.cc/150?u=lucia.fernandez',
    biografia: 'Diseñadora orientada al usuario con un enfoque en accesibilidad e interfaces minimalistas.',
    habilidades: [
      { nombre: 'Figma', nivel: 'Avanzado', aniosExp: 4 },
      { nombre: 'Design Systems', nivel: 'Avanzado', aniosExp: 3 },
      { nombre: 'Usability Testing', nivel: 'Intermedio', aniosExp: 2 }
    ],
    experiencias: [
      { empresa: 'Creative Minds', cargo: 'Product Designer', fechaInicio: '2021-08', actual: true, modalidad: 'remoto', descripcion: 'Liderando el diseño del producto insignia de la empresa.' }
    ],
    educaciones: [
      { institucion: 'Da Vinci', titulo: 'Diseño Multimedia', fechaInicio: '2018-03', fechaFin: '2021-07', cursando: false }
    ],
    idiomas: [
      { idioma: 'Inglés', nivel: 'intermedio' }
    ]
  },
  {
    fullName: 'Javier Rodríguez',
    email: 'javier.rodriguez@demo.candidato.com',
    telefono: '+54 261 555-0004',
    ubicacion: 'Mendoza, Argentina',
    titulo: 'Fullstack Dev & DevOps',
    avatarUrl: 'https://i.pravatar.cc/150?u=javier.rodriguez',
    biografia: 'Desarrollador fullstack con fuerte orientación a infraestructura y despliegue continuo.',
    habilidades: [
      { nombre: 'React', nivel: 'Intermedio', aniosExp: 3 },
      { nombre: 'Node.js', nivel: 'Intermedio', aniosExp: 3 },
      { nombre: 'Kubernetes', nivel: 'Intermedio', aniosExp: 2 },
      { nombre: 'AWS', nivel: 'Avanzado', aniosExp: 4 }
    ],
    experiencias: [
      { empresa: 'CloudSys', cargo: 'DevOps Engineer', fechaInicio: '2022-03', actual: true, modalidad: 'remoto', descripcion: 'Mantenimiento del cluster de K8s y pipelines de CI/CD.' }
    ],
    educaciones: [
      { institucion: 'UTN Mendoza', titulo: 'Ingeniería Informática', fechaInicio: '2015-03', fechaFin: '2020-12', cursando: false }
    ],
    idiomas: []
  },
  {
    fullName: 'Sofía Díaz',
    email: 'sofia.diaz@demo.candidato.com',
    telefono: '+54 11 5555-0005',
    ubicacion: 'Buenos Aires, Argentina',
    titulo: 'Data Engineer',
    avatarUrl: 'https://i.pravatar.cc/150?u=sofia.diaz',
    biografia: 'Transformando datos crudos en conocimiento accionable. Experiencia comprobable en arquitecturas Big Data.',
    habilidades: [
      { nombre: 'Python', nivel: 'Avanzado', aniosExp: 5 },
      { nombre: 'Apache Spark', nivel: 'Intermedio', aniosExp: 3 },
      { nombre: 'AWS Glue', nivel: 'Intermedio', aniosExp: 2 },
      { nombre: 'SQL', nivel: 'Avanzado', aniosExp: 6 }
    ],
    experiencias: [
      { empresa: 'DataFin', cargo: 'Data Engineer', fechaInicio: '2019-06', actual: true, modalidad: 'hibrido', descripcion: 'Desarrollo de ETLs y optimización de pipelines de datos.' }
    ],
    educaciones: [
      { institucion: 'UBA', titulo: 'Licenciatura en Ciencias de Datos', fechaInicio: '2014-03', fechaFin: '2019-12', cursando: false }
    ],
    idiomas: [
      { idioma: 'Inglés', nivel: 'avanzado' }
    ]
  },
  {
    fullName: 'Martín Pérez',
    email: 'martin.perez@demo.candidato.com',
    telefono: '+54 381 555-0006',
    ubicacion: 'Tucumán, Argentina',
    titulo: 'Mobile Developer (React Native)',
    avatarUrl: 'https://i.pravatar.cc/150?u=martin.perez',
    biografia: 'Creador de apps móviles eficientes y nativas utilizando React Native. Fan de Expo.',
    habilidades: [
      { nombre: 'React Native', nivel: 'Avanzado', aniosExp: 4 },
      { nombre: 'Expo', nivel: 'Avanzado', aniosExp: 3 },
      { nombre: 'TypeScript', nivel: 'Intermedio', aniosExp: 2 },
      { nombre: 'REST APIs', nivel: 'Intermedio', aniosExp: 4 }
    ],
    experiencias: [
      { empresa: 'AppMakers', cargo: 'Mobile Developer', fechaInicio: '2021-01', actual: true, modalidad: 'remoto', descripcion: 'Desarrollo de una app financiera desde cero hasta producción.' }
    ],
    educaciones: [
      { institucion: 'Universidad de Tucumán', titulo: 'Técnico Universitario en Programación', fechaInicio: '2018-03', fechaFin: '2020-12', cursando: false }
    ],
    idiomas: []
  },
  {
    fullName: 'Valeria Sánchez',
    email: 'valeria.sanchez@demo.candidato.com',
    telefono: '+54 11 5555-0007',
    ubicacion: 'CABA, Argentina',
    titulo: 'Product Manager',
    avatarUrl: 'https://i.pravatar.cc/150?u=valeria.sanchez',
    biografia: 'Manejo el ciclo de vida completo del producto. Me encanta hablar con los usuarios e iterar rápido.',
    habilidades: [
      { nombre: 'Roadmapping', nivel: 'Avanzado', aniosExp: 5 },
      { nombre: 'Métricas', nivel: 'Avanzado', aniosExp: 4 },
      { nombre: 'Agile', nivel: 'Avanzado', aniosExp: 6 },
      { nombre: 'Stakeholder Management', nivel: 'Avanzado', aniosExp: 5 }
    ],
    experiencias: [
      { empresa: 'Fintech Solutions', cargo: 'Product Manager', fechaInicio: '2019-05', actual: true, modalidad: 'presencial', descripcion: 'Defino el roadmap del producto principal de la compañía.' }
    ],
    educaciones: [
      { institucion: 'Universidad Austral', titulo: 'Administración de Empresas', fechaInicio: '2013-03', fechaFin: '2018-12', cursando: false }
    ],
    idiomas: [
      { idioma: 'Inglés', nivel: 'avanzado' },
      { idioma: 'Portugués', nivel: 'basico' }
    ]
  },
  {
    fullName: 'Diego Herrera',
    email: 'diego.herrera@demo.candidato.com',
    telefono: '+54 261 555-0008',
    ubicacion: 'Mendoza, Argentina',
    titulo: 'QA Automation Engineer',
    avatarUrl: 'https://i.pravatar.cc/150?u=diego.herrera',
    biografia: 'Me aseguro de que el código llegue a producción libre de bugs. Experto en Cypress y Playwright.',
    habilidades: [
      { nombre: 'Cypress', nivel: 'Avanzado', aniosExp: 4 },
      { nombre: 'Playwright', nivel: 'Intermedio', aniosExp: 2 },
      { nombre: 'Jest', nivel: 'Intermedio', aniosExp: 3 },
      { nombre: 'CI/CD', nivel: 'Avanzado', aniosExp: 4 }
    ],
    experiencias: [
      { empresa: 'Quality First', cargo: 'Sr. QA Engineer', fechaInicio: '2020-02', actual: true, modalidad: 'remoto', descripcion: 'Implementación de pipelines de testing E2E automation.' }
    ],
    educaciones: [
      { institucion: 'Mendoza Tech', titulo: 'Tecnicatura Superior en QA', fechaInicio: '2017-03', fechaFin: '2019-12', cursando: false }
    ],
    idiomas: []
  },
  {
    fullName: 'Camila Ríos',
    email: 'camila.rios@demo.candidato.com',
    telefono: '+54 351 555-0009',
    ubicacion: 'Córdoba, Argentina',
    titulo: 'Scrum Master / Agile Coach',
    avatarUrl: 'https://i.pravatar.cc/150?u=camila.rios',
    biografia: 'Facilitadora de equipos ágiles. Apasionada por hacer el trabajo de todxs más sencillo y efectivo con metodologías comprobadas.',
    habilidades: [
      { nombre: 'Scrum', nivel: 'Avanzado', aniosExp: 5 },
      { nombre: 'Kanban', nivel: 'Avanzado', aniosExp: 4 },
      { nombre: 'Jira', nivel: 'Avanzado', aniosExp: 5 },
      { nombre: 'Facilitación', nivel: 'Avanzado', aniosExp: 6 }
    ],
    experiencias: [
      { empresa: 'AgileCorp', cargo: 'Agile Coach', fechaInicio: '2021-06', actual: true, modalidad: 'hibrido', descripcion: 'Transformación ágil de la estructura de desarrollo de la empresa.' }
    ],
    educaciones: [
      { institucion: 'Siglo 21', titulo: 'Licenciatura en Psicología Organizacional', fechaInicio: '2012-03', fechaFin: '2017-12', cursando: false }
    ],
    idiomas: [
      { idioma: 'Inglés', nivel: 'avanzado' }
    ]
  },
  {
    fullName: 'Pedro Morales',
    email: 'pedro.morales@demo.candidato.com',
    telefono: '+54 11 5555-0010',
    ubicacion: 'Buenos Aires, Argentina',
    titulo: 'Fullstack Developer',
    avatarUrl: 'https://i.pravatar.cc/150?u=pedro.morales',
    biografia: 'Generalista tecnológico. Me gusta abordar el stack completo, desde las queries SQL hasta los componentes de frontend.',
    habilidades: [
      { nombre: 'React', nivel: 'Intermedio', aniosExp: 2 },
      { nombre: 'Node.js', nivel: 'Intermedio', aniosExp: 2 },
      { nombre: 'PostgreSQL', nivel: 'Intermedio', aniosExp: 2 },
      { nombre: 'TypeScript', nivel: 'Intermedio', aniosExp: 1 }
    ],
    experiencias: [
      { empresa: 'Startup Inc.', cargo: 'Fullstack Dev Ssr', fechaInicio: '2022-09', actual: true, modalidad: 'remoto', descripcion: 'Creación del MVP y constante iteración de nuevas features en el equipo originador.' }
    ],
    educaciones: [
      { institucion: 'Bootcamp SoyHenry', titulo: 'Full Stack Web Developer', fechaInicio: '2022-01', fechaFin: '2022-06', cursando: false }
    ],
    idiomas: [
      { idioma: 'Inglés', nivel: 'intermedio' }
    ]
  }
];

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => 0.5 - Math.random());
}

async function main() {
  console.log('🧑‍💻 Iniciando seed de candidatos y postulaciones...\n');

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

  // Obtener todas las vacantes publicadas para que postulen de a pares al azar
  const todasLasVacantes = await prisma.ofertaLaboral.findMany({
    where: { estado: 'abierta' },
    select: { id: true, titulo: true }
  });

  const POSIBLES_ESTADOS_POSTULACION = ['pendiente', 'en-curso', 'entrevista', 'finalista', 'rechazado'];

  for (const c of candidatoTemplates) {
    // 1. Crear / Actualizar el User
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {
        fullName: c.fullName,
        telefono: c.telefono,
        ubicacion: c.ubicacion,
        titulo: c.titulo,
        avatarUrl: c.avatarUrl,
        passwordHash,
        isEmailVerified: true,
        isActive: true,
      },
      create: {
        fullName: c.fullName,
        email: c.email,
        role: 'candidate',
        telefono: c.telefono,
        ubicacion: c.ubicacion,
        titulo: c.titulo,
        avatarUrl: c.avatarUrl,
        passwordHash,
        isEmailVerified: true,
        isActive: true,
      }
    });

    // 2. Crear / Actualizar Subclase Candidato
    await prisma.candidato.upsert({
      where: { usuarioId: user.id },
      update: { biografia: c.biografia },
      create: { usuarioId: user.id, biografia: c.biografia }
    });

    console.log(`  ✅ Candidato perfilado: "${c.fullName}" (${c.email})`);

    // ── Limpiar datos previos de listas (Educaciones, Experiencias, Habilidades, Idiomas) ──
    await prisma.candidatoHabilidad.deleteMany({ where: { candidatoId: user.id } });
    await prisma.experienciaLaboral.deleteMany({ where: { candidatoId: user.id } });
    await prisma.educacion.deleteMany({ where: { candidatoId: user.id } });
    await prisma.idioma.deleteMany({ where: { candidatoId: user.id } });

    // 3. Poblar Habilidades
    for (const skill of c.habilidades) {
      const hab = await prisma.habilidad.upsert({
        where: { nombre: skill.nombre.toLowerCase() },
        update: {},
        create: { nombre: skill.nombre.toLowerCase() }
      });
      await prisma.candidatoHabilidad.create({
        data: {
          candidatoId: user.id,
          habilidadId: hab.id,
          nivel: skill.nivel,
          aniosExp: skill.aniosExp,
          verificada: true
        }
      });
    }

    // 4. Poblar Experiencias Laborales
    for (const exp of c.experiencias) {
      await prisma.experienciaLaboral.create({
        data: {
          candidatoId: user.id,
          empresa: exp.empresa,
          cargo: exp.cargo,
          fechaInicio: exp.fechaInicio,
          fechaFin: exp.fechaFin,
          actual: exp.actual,
          descripcion: exp.descripcion,
          modalidad: exp.modalidad,
        }
      });
    }

    // 5. Poblar Educacion
    for (const edu of c.educaciones) {
      await prisma.educacion.create({
        data: {
          candidatoId: user.id,
          institucion: edu.institucion,
          titulo: edu.titulo,
          fechaInicio: edu.fechaInicio,
          fechaFin: edu.fechaFin,
          cursando: edu.cursando
        }
      });
    }

    // 6. Poblar Idiomas
    for (const idm of c.idiomas) {
      await prisma.idioma.create({
        data: {
          candidatoId: user.id,
          idioma: idm.idioma,
          nivel: idm.nivel
        }
      });
    }

    // 7. Simular Postulaciones aleatorias a 3 a 5 ofertas (solo si hay vacantes abiertas)
    if (todasLasVacantes.length > 0) {
      const postularCount = Math.min(Math.floor(Math.random() * 3) + 3, todasLasVacantes.length); 
      const vacantesElegidas = shuffle(todasLasVacantes).slice(0, postularCount);

      for (const vacante of vacantesElegidas) {
        const estAleatorio = POSIBLES_ESTADOS_POSTULACION[Math.floor(Math.random() * POSIBLES_ESTADOS_POSTULACION.length)];
        
        await prisma.postulacion.upsert({
          where: { ofertaId_candidatoId: { ofertaId: vacante.id, candidatoId: user.id } },
          update: { estado: estAleatorio },
          create: {
            ofertaId: vacante.id,
            candidatoId: user.id,
            urlCv: `https://archivos.demo.candidato.com/cv_${user.id}.pdf`,
            estado: estAleatorio
          }
        });
      }
      console.log(`     └─ Postulado a ${postularCount} ofertas laborales aleatorias.`);
    } else {
      console.log(`     └─ ¡No hay ofertas abiertas para que aplique!`);
    }

  }

  console.log(`\n🎉 Seed de candidatos completado exitosamente.`);
  console.log(`   🔑 Todos los candidatos usan la contraseña compartida: ${SEED_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante seed_candidato:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
