import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        candidatosTotales: number;
        candidatosVariacion: string;
        empresasTotales: number;
        empresasVariacion: string;
        vacantesActivas: number;
        vacantesCerradas: number;
        vacantesBorrador: number;
        postulacionesTotales: number;
        tasaAceptacion: number;
        cvAnalizados: number;
        cvSinAnalizar: number;
        scorePromedio: number;
        topEmpresas: {
            nombre: any;
            vacantes: number;
        }[];
        habilidades: {
            demandada: any;
            ofrecida: any;
        }[];
        scores: {
            rango: string;
            cantidad: number;
            porcentaje: number;
        }[];
        funnel: {
            pendientes: number;
            revisados: number;
            aceptados: number;
        };
    }>;
}
