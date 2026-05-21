import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
//Buscar el usuario por email, si existe, enviar un email con un link para resetear la contraseña
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Correo inválido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;
}
