import { CandidatosService } from './candidatos.service';
import { JwtPayload } from '../common/decorators/current-user.decorator';
export declare class CandidatosController {
    private svc;
    constructor(svc: CandidatosService);
    listar(u: JwtPayload, q: any): Promise<{
        ok: boolean;
        message: string;
        data: {
            candidatos: {
                id: string;
                name: string;
                role: string;
                avatar: string;
                available: boolean;
                skills: string[];
                location: string;
                experience: string;
                techInitials: string[];
                score: number;
                scoreDesglose: {
                    habilidades: number;
                    experiencia: number;
                };
                postulado: boolean;
                createdAt: Date;
            }[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    habilidades(u: JwtPayload): Promise<{
        ok: boolean;
        message: string;
        data: {
            skills: {
                id: string;
                nombre: string;
                nivel: string;
                aniosExp: number;
                verificada: boolean;
            }[];
        };
    }>;
    getIdiomas(u: JwtPayload): Promise<{
        ok: boolean;
        message: string;
        data: {
            idiomas: {
                idioma: string;
                id: string;
                creadaEl: Date;
                candidatoId: string;
                nivel: string;
                certificacion: string | null;
            }[];
        };
    }>;
    addIdioma(u: JwtPayload, body: any): Promise<{
        ok: boolean;
        message: string;
        data: {
            idioma: {
                idioma: string;
                id: string;
                creadaEl: Date;
                candidatoId: string;
                nivel: string;
                certificacion: string | null;
            };
        };
    }>;
    updateIdioma(u: JwtPayload, body: any): Promise<{
        ok: boolean;
        message: string;
        data: {
            idioma: {
                idioma: string;
                id: string;
                creadaEl: Date;
                candidatoId: string;
                nivel: string;
                certificacion: string | null;
            };
        };
    }>;
    deleteIdioma(u: JwtPayload, id: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    getExperiencia(u: JwtPayload): Promise<{
        ok: boolean;
        message: string;
        data: {
            experiencia: {
                empresa: string;
                id: string;
                descripcion: string | null;
                modalidad: string | null;
                creadaEl: Date;
                actualizadoEl: Date;
                candidatoId: string;
                fechaInicio: string;
                cargo: string;
                fechaFin: string | null;
                actual: boolean;
            }[];
        };
    }>;
    addExperiencia(u: JwtPayload, body: any): Promise<{
        ok: boolean;
        message: string;
        data: {
            experiencia: {
                empresa: string;
                id: string;
                descripcion: string | null;
                modalidad: string | null;
                creadaEl: Date;
                actualizadoEl: Date;
                candidatoId: string;
                fechaInicio: string;
                cargo: string;
                fechaFin: string | null;
                actual: boolean;
            };
        };
    }>;
    updateExperiencia(u: JwtPayload, body: any): Promise<{
        ok: boolean;
        message: string;
        data: {
            experiencia: {
                empresa: string;
                id: string;
                descripcion: string | null;
                modalidad: string | null;
                creadaEl: Date;
                actualizadoEl: Date;
                candidatoId: string;
                fechaInicio: string;
                cargo: string;
                fechaFin: string | null;
                actual: boolean;
            };
        };
    }>;
    deleteExperiencia(u: JwtPayload, id: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    getEducacion(u: JwtPayload): Promise<{
        ok: boolean;
        message: string;
        data: {
            educacion: {
                id: string;
                titulo: string;
                descripcion: string | null;
                creadaEl: Date;
                actualizadoEl: Date;
                candidatoId: string;
                fechaInicio: string;
                fechaFin: string | null;
                institucion: string;
                campo: string | null;
                cursando: boolean;
            }[];
        };
    }>;
    addEducacion(u: JwtPayload, body: any): Promise<{
        ok: boolean;
        message: string;
        data: {
            educacion: {
                id: string;
                titulo: string;
                descripcion: string | null;
                creadaEl: Date;
                actualizadoEl: Date;
                candidatoId: string;
                fechaInicio: string;
                fechaFin: string | null;
                institucion: string;
                campo: string | null;
                cursando: boolean;
            };
        };
    }>;
    updateEducacion(u: JwtPayload, body: any): Promise<{
        ok: boolean;
        message: string;
        data: {
            educacion: {
                id: string;
                titulo: string;
                descripcion: string | null;
                creadaEl: Date;
                actualizadoEl: Date;
                candidatoId: string;
                fechaInicio: string;
                fechaFin: string | null;
                institucion: string;
                campo: string | null;
                cursando: boolean;
            };
        };
    }>;
    deleteEducacion(u: JwtPayload, id: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    getPerfilPublico(u: JwtPayload, id: string): Promise<{
        ok: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            email: string;
            avatar: string;
            role: string;
            location: string;
            biografia: string;
            experience: string;
            skills: string[];
            idiomas: {
                idioma: string;
                id: string;
                creadaEl: Date;
                candidatoId: string;
                nivel: string;
                certificacion: string | null;
            }[];
            educacion: {
                id: string;
                titulo: string;
                descripcion: string | null;
                creadaEl: Date;
                actualizadoEl: Date;
                candidatoId: string;
                fechaInicio: string;
                fechaFin: string | null;
                institucion: string;
                campo: string | null;
                cursando: boolean;
            }[];
            experiencia: {
                empresa: string;
                id: string;
                descripcion: string | null;
                modalidad: string | null;
                creadaEl: Date;
                actualizadoEl: Date;
                candidatoId: string;
                fechaInicio: string;
                cargo: string;
                fechaFin: string | null;
                actual: boolean;
            }[];
            cvUrl: string;
        };
    }>;
}
