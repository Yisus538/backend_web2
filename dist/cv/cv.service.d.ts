import { PrismaService } from '../prisma/prisma.service';
export declare class CvService {
    private prisma;
    constructor(prisma: PrismaService);
    getAnalisis(candidatoId: string): Promise<{
        id: string;
        candidatoId: string | null;
        apto: boolean | null;
        analizadoEl: Date;
        score: number | null;
        nombreCompleto: string | null;
        correoCv: string | null;
        telefonoCv: string | null;
        puestoEvaluado: string | null;
        motivoRechazo: string | null;
        cvCompleto: import("@prisma/client/runtime/library").JsonValue | null;
        evaluacionCompleta: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
