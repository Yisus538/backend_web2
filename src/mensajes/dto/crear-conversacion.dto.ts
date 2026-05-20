import { IsUUID } from 'class-validator';

export class CrearConversacionDto {
  @IsUUID()
  postulacionId: string;
}
