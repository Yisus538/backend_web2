"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Iniciando el poblado de datos (Seed)...');
    const mockData = [
        {
            nombreCompleto: 'Ana García',
            correoCv: 'ana.garcia@example.com',
            telefonoCv: '+5491123456789',
            puestoEvaluado: 'Frontend Developer',
            score: 85,
            apto: true,
            motivoRechazo: null,
            cvCompleto: { educacion: 'Ingeniería en Sistemas', experiencia: '3 años React' },
            evaluacionCompleta: { comentarios: 'Excelente perfil técnico', fortalezas: ['React', 'TypeScript'] }
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
            evaluacionCompleta: { comentarios: 'Buen perfil pero no cumple los requisitos actuales', debilidades: ['Node.js', 'NestJS'] }
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
            evaluacionCompleta: { comentarios: 'Portfolio sobresaliente', nivel: 'Senior' }
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
            evaluacionCompleta: { comentarios: 'Apto para el puesto, agendar entrevista técnica' }
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
            evaluacionCompleta: { comentarios: 'Fuerte en BI, pero requerimos Python' }
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
            evaluacionCompleta: { comentarios: 'Perfil muy completo', ingles: 'B2' }
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
            evaluacionCompleta: { comentarios: 'Excelente candidata pero no hay presupuesto' }
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
            evaluacionCompleta: { comentarios: 'Sólidos conocimientos en pruebas E2E' }
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
            evaluacionCompleta: { comentarios: 'Buena gestión de equipos ágiles' }
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
            evaluacionCompleta: { comentarios: 'Muchos errores de concepto en React' }
        }
    ];
    const resultado = await prisma.analisisCvDirecto.createMany({
        data: mockData,
        skipDuplicates: true,
    });
    console.log(`Se han insertado ${resultado.count} registros exitosamente.`);
}
main()
    .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map