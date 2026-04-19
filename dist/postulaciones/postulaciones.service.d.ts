import { PrismaService } from '../prisma/prisma.service';
export declare class PostulacionesService {
    private prisma;
    constructor(prisma: PrismaService);
    listar(userId: string, estado?: string): Promise<{
        candidaturas: {
            id: string;
            title: string;
            company: string;
            date: Date;
            status: string;
            statusLabel: any;
            statusClass: any;
            matchScore: number;
            nextStep: any;
            nextStepType: any;
        }[];
        total: number;
    }>;
    crear(userId: string, ofertaId: string): Promise<{
        id: string;
        estado: string;
        creadaEl: Date;
        oferta: {
            titulo: string;
        };
    }>;
    listarPorVacante(empresaUserId: string, vacanteId: string): Promise<{
        id: string;
        estado: string;
        creadaEl: Date;
        candidato: {
            id: string;
            fullName: string;
            email: string;
        };
    }[]>;
    actualizarEstado(empresaUserId: string, postulacionId: string, estado: string): Promise<{
        id: string;
        estado: string;
    }>;
    retirar(userId: string, id: string): Promise<void>;
}
