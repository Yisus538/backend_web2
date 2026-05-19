import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() ubicacion?: string;
  @IsOptional() @IsString() titulo?: string;
  @IsOptional() avatarUrl?: string | null;
  @IsOptional() @IsIn(['dark', 'light', 'auto']) theme?: string;
}
