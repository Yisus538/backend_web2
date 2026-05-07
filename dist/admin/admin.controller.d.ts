import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
        ok: boolean;
        message: string;
        data: {
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
        };
    }>;
}
