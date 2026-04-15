// ─── login.dto.ts ────────────────────────────────────────────
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsEmail({}, { message: 'Correo inválido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  password: string;
}
