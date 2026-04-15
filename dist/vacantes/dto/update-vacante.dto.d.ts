import { CreateVacanteDto } from './create-vacante.dto';
declare const UpdateVacanteDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateVacanteDto>>;
export declare class UpdateVacanteDto extends UpdateVacanteDto_base {
}
export declare class UpdateEstadoDto {
    estado: string;
}
export {};
