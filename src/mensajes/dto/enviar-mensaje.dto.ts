import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';

export class EnviarMensajeDto {
  @IsUUID()
  conversacionId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  texto: string;
}
