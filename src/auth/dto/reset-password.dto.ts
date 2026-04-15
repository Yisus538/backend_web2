import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Token requerido' })
  token: string;

  @IsString()
  @Length(8, 128, { message: 'Entre 8 y 128 caracteres' })
  newPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirmá tu contraseña' })
  confirmPassword: string;
}
