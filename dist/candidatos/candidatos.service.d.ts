import { PrismaService } from '../prisma/prisma.service';
export declare class CandidatosService {
    private prisma;
    constructor(prisma: PrismaService);
    getPerfilPublico(companyId: string, candidatoId: string): Promise<{
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
    }>;
    listar(userId: string, q: any): Promise<{
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
            postulado: boolean;
            createdAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getHabilidades(userId: string): Promise<{
        skills: {
            id: string;
            nombre: string;
            nivel: string;
            aniosExp: number;
            verificada: boolean;
        }[];
    }>;
    getIdiomas(userId: string): Promise<{
        idioma: string;
        id: string;
        creadaEl: Date;
        candidatoId: string;
        nivel: string;
        certificacion: string | null;
    }[]>;
    addIdioma(userId: string, body: any): Promise<{
        idioma: string;
        id: string;
        creadaEl: Date;
        candidatoId: string;
        nivel: string;
        certificacion: string | null;
    }>;
    updateIdioma(userId: string, body: any): Promise<{
        idioma: string;
        id: string;
        creadaEl: Date;
        candidatoId: string;
        nivel: string;
        certificacion: string | null;
    }>;
    deleteIdioma(userId: string, id: string): Promise<void>;
    getExperiencia(userId: string): Promise<{
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
    }[]>;
    addExperiencia(userId: string, body: any): Promise<{
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
    }>;
    updateExperiencia(userId: string, body: any): Promise<{
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
    }>;
    deleteExperiencia(userId: string, id: string): Promise<void>;
    getEducacion(userId: string): Promise<{
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
    }[]>;
    addEducacion(userId: string, body: any): Promise<{
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
    }>;
    updateEducacion(userId: string, body: any): Promise<{
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
    }>;
    deleteEducacion(userId: string, id: string): Promise<void>;
}
