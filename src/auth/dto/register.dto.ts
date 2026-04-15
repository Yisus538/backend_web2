import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @Length(2, 100, { message: 'Entre 2 y 100 caracteres' })
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  fullName: string;

  @IsEmail({}, { message: 'Correo inválido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  @Length(8, 128, { message: 'Entre 8 y 128 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirmá tu contraseña' })
  confirmPassword: string;

  @IsEnum(['candidate', 'company'], { message: 'Rol inválido. Debe ser candidate o company' })
  role: 'candidate' | 'company';
}
