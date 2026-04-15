import { PostulacionesService } from './postulaciones.service';
import { JwtPayload } from '../common/decorators/current-user.decorator';
export declare class PostulacionesController {
    private svc;
    constructor(svc: PostulacionesService);
    listar(u: JwtPayload, estado?: string): Promise<{
        ok: boolean;
        message: string;
        data: {
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
        };
    }>;
    crear(u: JwtPayload, ofertaId: string): Promise<{
        ok: boolean;
        message: string;
        data: {
            postulacion: {
                id: string;
                estado: string;
                creadaEl: Date;
                oferta: {
                    titulo: string;
                };
            };
        };
    }>;
    retirar(u: JwtPayload, id: string): Promise<{
        ok: boolean;
        message: string;
    }>;
}
