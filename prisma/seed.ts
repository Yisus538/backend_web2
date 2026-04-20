import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el poblado de datos (Seed)...');

  // ================================================================
  // 1. MENU ITEMS — Todos los ítems de navegación del sidebar
  // ================================================================
  //
  // ⚠️  IMPORTANTE: activeKeyword DEBE coincidir exactamente con los
  //     valores del mapa HASH_TO_KEYWORD en core/router.js del frontend.
  //     El router usa comparación estricta (===) en canAccess(), así que
  //     "vacante" ≠ "vacantes" bloquea la ruta.
  // ================================================================

  const menuItems = [
    // ── Portal Empresa ────────────────────────────────────────────
    {
      itemKey: 'dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
      hashPath: '#/dashboard-company',
      activeKeyword: 'dashboard',       // router: HASH_TO_KEYWORD["#/dashboard-company"] = "dashboard"
      esItemConfig: false,
      esFallback: true,
      activo: true,
    },
    {
      itemKey: 'vacantes',
      icon: 'work',
      label: 'Vacantes',
      hashPath: '#/vacantes',
      activeKeyword: 'vacantes',        // router: "vacantes" (plural)
      esItemConfig: false,
      esFallback: false,
      activo: true,
    },
    {
      itemKey: 'candidatos',
      icon: 'group',
      label: 'Candidatos',
      hashPath: '#/candidatos',
      activeKeyword: 'candidatos',      // router: "candidatos" (plural)
      esItemConfig: false,
      esFallback: false,
      activo: true,
    },
    {
      itemKey: 'entrevistas',
      icon: 'event',
      label: 'Entrevistas',
      hashPath: '#/entrevistas',
      activeKeyword: 'entrevistas',     // router: "entrevistas" (plural)
      esItemConfig: false,
      esFallback: false,
      activo: true,
    },
    {
      itemKey: 'informes',
      icon: 'bar_chart',
      label: 'Informes',
      hashPath: '#/informes',
      activeKeyword: 'informes',        // router: "informes" (plural)
      esItemConfig: false,
      esFallback: false,
      activo: true,
    },
    {
      itemKey: 'config_empresa',
      icon: 'settings',
      label: 'Configuración',
      hashPath: '#/configuraciones',
      activeKeyword: 'configuraciones', // router: "configuraciones" (plural)
      esItemConfig: true,
      esFallback: false,
      activo: true,
    },

    // ── Portal Candidato ──────────────────────────────────────────
    {
      itemKey: 'candidato_dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
      hashPath: '#/candidato-dashboard',
      activeKeyword: 'candidato-dashboard',   // router: "candidato-dashboard"
      esItemConfig: false,
      esFallback: true,
      activo: true,
    },
    {
      itemKey: 'candidato_perfil',
      icon: 'person',
      label: 'Mi Perfil',
      hashPath: '#/candidato-perfil',
      activeKeyword: 'candidato-perfil',      // router: "candidato-perfil"
      esItemConfig: false,
      esFallback: false,
      activo: true,
    },
    {
      itemKey: 'candidato_candidaturas',
      icon: 'assignment',
      label: 'Candidaturas',
      hashPath: '#/candidato-candidaturas',
      activeKeyword: 'candidato-candidaturas', // router: "candidato-candidaturas" (plural)
      esItemConfig: false,
      esFallback: false,
      activo: true,
    },
    {
      itemKey: 'candidato_vacantes',
      icon: 'search',
      label: 'Buscar Vacantes',
      hashPath: '#/candidato-vacantes',
      activeKeyword: 'candidato-vacantes',    // router: "candidato-vacantes" (plural)
      esItemConfig: false,
      esFallback: false,
      activo: true,
    },
    {
      itemKey: 'config_candidato',
      icon: 'settings',
      label: 'Configuración',
      hashPath: '#/candidato-configuraciones',
      activeKeyword: 'configuraciones',       // router: CANDIDATO_CONFIGURACIONES → "configuraciones"
      esItemConfig: true,
      esFallback: false,
      activo: true,
    },
  ];

  // Upsert cada MenuItem (idempotente)
  const menuItemMap: Record<string, string> = {};
  for (const item of menuItems) {
    const created = await prisma.menuItem.upsert({
      where: { itemKey: item.itemKey },
      update: item,
      create: item,
    });
    menuItemMap[item.itemKey] = created.id;
  }
  console.log(`✅ ${menuItems.length} MenuItems insertados/actualizados`);

  // ================================================================
  // 2. MENU CONFIG POR ROL — Subtítulo y hash de configuración
  // ================================================================

  const menuConfigRoles = [
    {
      rol: 'company',
      subtitle: 'Portal Empresa',
      configHash: '#/configuraciones',
    },
    {
      rol: 'candidate',
      subtitle: 'Portal Candidato',
      configHash: '#/candidato-configuraciones',
    },
    {
      rol: 'administrativo',
      subtitle: 'Administración',
      configHash: '#/configuraciones',
    },
  ];

  for (const cfg of menuConfigRoles) {
    await prisma.menuConfigRol.upsert({
      where: { rol: cfg.rol },
      update: cfg,
      create: cfg,
    });
  }
  console.log(`✅ ${menuConfigRoles.length} MenuConfigRol insertados/actualizados`);

  // ================================================================
  // 3. ROL ↔ MENU ITEMS — Qué ítems ve cada rol y en qué orden
  // ================================================================

  // Definimos las asignaciones: [itemKey, ordenRender, activePriority]
  const companyItems: [string, number, number][] = [
    ['dashboard', 1, 99],   // fallback → prioridad baja
    ['vacantes', 2, 10],
    ['candidatos', 3, 20],
    ['entrevistas', 4, 30],
    ['informes', 5, 40],
    ['config_empresa', 6, 50],
  ];

  const candidateItems: [string, number, number][] = [
    ['candidato_dashboard', 1, 99],   // fallback → prioridad baja
    ['candidato_perfil', 2, 10],
    ['candidato_candidaturas', 3, 20],
    ['candidato_vacantes', 4, 15],   // "candidato-vacantes" matchea antes que candidaturas
    ['config_candidato', 5, 50],
  ];

  // El admin ve lo mismo que empresa (ajustar si se necesita)
  const adminItems: [string, number, number][] = [
    ['dashboard', 1, 99],
    ['vacantes', 2, 10],
    ['candidatos', 3, 20],
    ['entrevistas', 4, 30],
    ['informes', 5, 40],
    ['config_empresa', 6, 50],
  ];

  const rolAssignments: { rol: string; items: [string, number, number][] }[] = [
    { rol: 'company', items: companyItems },
    { rol: 'candidate', items: candidateItems },
    { rol: 'administrativo', items: adminItems },
  ];

  let rolMenuCount = 0;
  for (const { rol, items } of rolAssignments) {
    for (const [itemKey, ordenRender, activePriority] of items) {
      const menuItemId = menuItemMap[itemKey];
      if (!menuItemId) {
        console.warn(`⚠️  itemKey "${itemKey}" no encontrado, saltando...`);
        continue;
      }

      await prisma.rolMenu.upsert({
        where: { rol_menuItemId: { rol, menuItemId } },
        update: { ordenRender, activePriority },
        create: { rol, menuItemId, ordenRender, activePriority },
      });
      rolMenuCount++;
    }
  }
  console.log(`✅ ${rolMenuCount} RolMenu (asignaciones rol↔item) insertados/actualizados`);

  // ================================================================
  // 4. ANÁLISIS CV DIRECTO — Datos de ejemplo
  // ================================================================

  const mockAnalisis = [
    {
      nombreCompleto: 'Ana García',
      correoCv: 'ana.garcia@example.com',
      telefonoCv: '+5491123456789',
      puestoEvaluado: 'Frontend Developer',
      score: 85,
      apto: true,
      motivoRechazo: null,
      cvCompleto: { educacion: 'Ingeniería en Sistemas', experiencia: '3 años React' },
      evaluacionCompleta: { comentarios: 'Excelente perfil técnico', fortalezas: ['React', 'TypeScript'] },
    },
    {
      nombreCompleto: 'Carlos Ruiz',
      correoCv: 'cruiz@example.com',
      telefonoCv: '+5491198765432',
      puestoEvaluado: 'Backend Developer',
      score: 45,
      apto: false,
      motivoRechazo: 'Falta de experiencia en Node.js',
      cvCompleto: { educacion: 'Tecnicatura en Programación', experiencia: '1 año PHP' },
      evaluacionCompleta: { comentarios: 'Buen perfil pero no cumple los requisitos actuales', debilidades: ['Node.js', 'NestJS'] },
    },
    {
      nombreCompleto: 'María Fernández',
      correoCv: 'maria.f@example.com',
      telefonoCv: '+5493512345678',
      puestoEvaluado: 'UX/UI Designer',
      score: 92,
      apto: true,
      motivoRechazo: null,
      cvCompleto: { educacion: 'Diseño Gráfico', portfolio: 'behance.net/mariaf' },
      evaluacionCompleta: { comentarios: 'Portfolio sobresaliente', nivel: 'Senior' },
    },
    {
      nombreCompleto: 'Juan Pérez',
      correoCv: 'jperez.dev@example.com',
      telefonoCv: '+5493518765432',
      puestoEvaluado: 'DevOps Engineer',
      score: 78,
      apto: true,
      motivoRechazo: null,
      cvCompleto: { certificaciones: ['AWS Solutions Architect'], experiencia: 'AWS, Docker, Kubernetes' },
      evaluacionCompleta: { comentarios: 'Apto para el puesto, agendar entrevista técnica' },
    },
    {
      nombreCompleto: 'Lucía Gómez',
      correoCv: 'lgomez@example.com',
      telefonoCv: '+5492612345678',
      puestoEvaluado: 'Data Analyst',
      score: 60,
      apto: false,
      motivoRechazo: 'No domina Python/Pandas',
      cvCompleto: { habilidades: ['Excel', 'PowerBI'] },
      evaluacionCompleta: { comentarios: 'Fuerte en BI, pero requerimos Python' },
    },
    {
      nombreCompleto: 'Martín Domínguez',
      correoCv: 'm.dominguez@example.com',
      telefonoCv: '+5492618765432',
      puestoEvaluado: 'Fullstack Developer',
      score: 88,
      apto: true,
      motivoRechazo: null,
      cvCompleto: { experiencia: '5 años en PERN stack' },
      evaluacionCompleta: { comentarios: 'Perfil muy completo', ingles: 'B2' },
    },
    {
      nombreCompleto: 'Sofía Torres',
      correoCv: 'storres@example.com',
      telefonoCv: '+5491133445566',
      puestoEvaluado: 'Product Manager',
      score: 55,
      apto: false,
      motivoRechazo: 'Expectativa salarial fuera de rango',
      cvCompleto: { educacion: 'MBA', experiencia: '7 años en startups' },
      evaluacionCompleta: { comentarios: 'Excelente candidata pero no hay presupuesto' },
    },
    {
      nombreCompleto: 'Diego Silva',
      correoCv: 'dsilva@example.com',
      telefonoCv: '+5491166778899',
      puestoEvaluado: 'QA Automation',
      score: 80,
      apto: true,
      motivoRechazo: null,
      cvCompleto: { habilidades: ['Cypress', 'Selenium', 'Playwright'] },
      evaluacionCompleta: { comentarios: 'Sólidos conocimientos en pruebas E2E' },
    },
    {
      nombreCompleto: 'Valentina Castro',
      correoCv: 'vcastro@example.com',
      telefonoCv: '+5493412233445',
      puestoEvaluado: 'Scrum Master',
      score: 75,
      apto: true,
      motivoRechazo: null,
      cvCompleto: { certificaciones: ['CSM', 'PSM I'] },
      evaluacionCompleta: { comentarios: 'Buena gestión de equipos ágiles' },
    },
    {
      nombreCompleto: 'Andrés Morales',
      correoCv: 'amorales@example.com',
      telefonoCv: '+5493415566778',
      puestoEvaluado: 'Frontend Developer',
      score: 30,
      apto: false,
      motivoRechazo: 'Prueba técnica reprobada',
      cvCompleto: { experiencia: 'Bootcamp de 3 meses' },
      evaluacionCompleta: { comentarios: 'Muchos errores de concepto en React' },
    },
  ];

  const resultado = await prisma.analisisCvDirecto.createMany({
    data: mockAnalisis,
    skipDuplicates: true,
  });
  console.log(`✅ ${resultado.count} AnalisisCvDirecto insertados`);

  console.log('\n🎉 Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });