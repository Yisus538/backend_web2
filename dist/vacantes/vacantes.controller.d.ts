import { VacantesService } from './vacantes.service';
import { JwtPayload } from '../common/decorators/current-user.decorator';
import { CreateVacanteDto } from './dto/create-vacante.dto';
export declare class VacantesController {
    private svc;
    constructor(svc: VacantesService);
    publicas(u: JwtPayload, search?: string, page?: number, limit?: number): Promise<{
        ok: boolean;
        message: string;
        data: {
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
        };
    }>;
    publicaById(u: JwtPayload, id: string): Promise<{
        ok: boolean;
        message: string;
        data: {
            vacante: {
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
            };
        };
    }>;
    recomendadas(u: JwtPayload, limit?: number): Promise<{
        ok: boolean;
        message: string;
        data: {
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
        };
    }>;
    listar(u: JwtPayload, estado?: string, search?: string, page?: number, limit?: number): Promise<{
        ok: boolean;
        message: string;
        data: {
            vacantes: ({
                _count: {
                    postulaciones: number;
                };
            } & {
                id: string;
                ubicacion: string | null;
                titulo: string;
                descripcion: string;
                estado: string;
                categoria: string | null;
                modalidad: string | null;
                experienciaMinima: number;
                salarioMin: number | null;
                salarioMax: number | null;
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
                matchingWeights: import("@prisma/client/runtime/library").JsonValue | null;
                empresaId: string;
                creadaEl: Date;
                actualizadoEl: Date;
            })[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    crear(u: JwtPayload, dto: CreateVacanteDto): Promise<{
        ok: boolean;
        message: string;
        data: {
            vacante: {
                id: string;
                ubicacion: string | null;
                titulo: string;
                descripcion: string;
                estado: string;
                categoria: string | null;
                modalidad: string | null;
                experienciaMinima: number;
                salarioMin: number | null;
                salarioMax: number | null;
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
                matchingWeights: import("@prisma/client/runtime/library").JsonValue | null;
                empresaId: string;
                creadaEl: Date;
                actualizadoEl: Date;
            };
        };
    }>;
    obtener(u: JwtPayload, id: string): Promise<{
        ok: boolean;
        message: string;
        data: {
            vacante: {
                id: string;
                ubicacion: string | null;
                titulo: string;
                descripcion: string;
                estado: string;
                categoria: string | null;
                modalidad: string | null;
                experienciaMinima: number;
                salarioMin: number | null;
                salarioMax: number | null;
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
                matchingWeights: import("@prisma/client/runtime/library").JsonValue | null;
                empresaId: string;
                creadaEl: Date;
                actualizadoEl: Date;
            };
        };
    }>;
    actualizar(u: JwtPayload, id: string, body: any): Promise<{
        ok: boolean;
        message: string;
        data: {
            vacante: {
                id: string;
                ubicacion: string | null;
                titulo: string;
                descripcion: string;
                estado: string;
                categoria: string | null;
                modalidad: string | null;
                experienciaMinima: number;
                salarioMin: number | null;
                salarioMax: number | null;
                requisitos: import("@prisma/client/runtime/library").JsonValue | null;
                matchingWeights: import("@prisma/client/runtime/library").JsonValue | null;
                empresaId: string;
                creadaEl: Date;
                actualizadoEl: Date;
            };
        };
    }>;
    eliminar(u: JwtPayload, id: string): Promise<{
        ok: boolean;
        message: string;
    }>;
}
