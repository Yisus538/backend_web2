import { PrismaService } from '../prisma/prisma.service';
import { CreateVacanteDto } from './dto/create-vacante.dto';
import { UpdateVacanteDto } from './dto/update-vacante.dto';
export declare class VacantesService {
    private prisma;
    constructor(prisma: PrismaService);
    private ensureEmpresa;
    listar(userId: string, filters: {
        estado?: string;
        search?: string;
    }, pagination: {
        page: number;
        limit: number;
    }): Promise<{
        items: ({
            _count: {
                postulaciones: number;
            };
        } & {
            id: string;
            empresaId: string;
            titulo: string;
            descripcion: string;
            estado: string;
            categoria: string | null;
            modalidad: string | null;
            experienciaMinima: number;
            salarioMin: number | null;
            salarioMax: number | null;
            ubicacion: string | null;
            requisitos: import("@prisma/client/runtime/library").JsonValue | null;
            matchingWeights: import("@prisma/client/runtime/library").JsonValue | null;
            creadaEl: Date;
            actualizadoEl: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    obtener(userId: string, id: string): Promise<{
        id: string;
        empresaId: string;
        titulo: string;
        descripcion: string;
        estado: string;
        categoria: string | null;
        modalidad: string | null;
        experienciaMinima: number;
        salarioMin: number | null;
        salarioMax: number | null;
        ubicacion: string | null;
        requisitos: import("@prisma/client/runtime/library").JsonValue | null;
        matchingWeights: import("@prisma/client/runtime/library").JsonValue | null;
        creadaEl: Date;
        actualizadoEl: Date;
    }>;
    crear(userId: string, dto: CreateVacanteDto): Promise<{
        id: string;
        empresaId: string;
        titulo: string;
        descripcion: string;
        estado: string;
        categoria: string | null;
        modalidad: string | null;
        experienciaMinima: number;
        salarioMin: number | null;
        salarioMax: number | null;
        ubicacion: string | null;
        requisitos: import("@prisma/client/runtime/library").JsonValue | null;
        matchingWeights: import("@prisma/client/runtime/library").JsonValue | null;
        creadaEl: Date;
        actualizadoEl: Date;
    }>;
    actualizar(userId: string, id: string, dto: UpdateVacanteDto): Promise<{
        id: string;
        empresaId: string;
        titulo: string;
        descripcion: string;
        estado: string;
        categoria: string | null;
        modalidad: string | null;
        experienciaMinima: number;
        salarioMin: number | null;
        salarioMax: number | null;
        ubicacion: string | null;
        requisitos: import("@prisma/client/runtime/library").JsonValue | null;
        matchingWeights: import("@prisma/client/runtime/library").JsonValue | null;
        creadaEl: Date;
        actualizadoEl: Date;
    }>;
    cambiarEstado(userId: string, id: string, estado: string): Promise<{
        id: string;
        empresaId: string;
        titulo: string;
        descripcion: string;
        estado: string;
        categoria: string | null;
        modalidad: string | null;
        experienciaMinima: number;
        salarioMin: number | null;
        salarioMax: number | null;
        ubicacion: string | null;
        requisitos: import("@prisma/client/runtime/library").JsonValue | null;
        matchingWeights: import("@prisma/client/runtime/library").JsonValue | null;
        creadaEl: Date;
        actualizadoEl: Date;
    }>;
    eliminar(userId: string, id: string): Promise<void>;
    publicas(userId: string, search?: string, page?: number, limit?: number): Promise<{
        vacantes: {
            id: string;
            titulo: string;
            descripcion: string;
            categoria: string;
            modalidad: string;
            empresa: string;
            ubicacion: string;
            creadaEl: Date;
            yaAplico: boolean;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    recomendadas(userId: string, limit?: number): Promise<{
        jobs: {
            id: string;
            icon: string;
            title: string;
            company: string;
            location: string;
            skills: any[];
            salaryMin: string;
            salaryMax: string;
            matchScore: number;
            matchColor: string;
        }[];
    }>;
    publicaById(userId: string, id: string): Promise<{
        id: string;
        titulo: string;
        descripcion: string;
        categoria: string;
        modalidad: string;
        experienciaMinima: number;
        requisitos: {
            nombre: string;
            nivel: string | null;
            matched: boolean;
        }[];
        salario: string;
        empresa: string;
        ubicacion: string;
        creadaEl: Date;
        postulantes: number;
        matchScore: number;
        yaAplico: boolean;
    }>;
}
