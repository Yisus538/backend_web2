import { JwtPayload } from '../common/decorators/current-user.decorator';
import { CvService } from './cv.service';
export declare class CvController {
    private readonly cvService;
    constructor(cvService: CvService);
    analyze(file: Express.Multer.File): Promise<{
        ok: boolean;
        message: string;
    }>;
    getAnalisis(candidatoId: string, user: JwtPayload): Promise<{
        ok: boolean;
        data: {
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
        };
    }>;
    private sendToMake;
}
