import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Correo inválido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;
}
