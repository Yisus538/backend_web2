import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtPayload } from '../common/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, res: Response): Promise<{
        ok: boolean;
        message: string;
        data: {
            user: {
                id: any;
                fullName: any;
                email: any;
                role: any;
                isEmailVerified: any;
                createdAt: any;
                avatarUrl: any;
            };
            nav: {
                subtitle: string;
                config_hash: string;
                items: {
                    id: string;
                    icon: string;
                    label: string;
                    hash: string;
                    activeKeyword: string;
                    esFallback: boolean;
                    esConfig: boolean;
                    activePriority: number;
                }[];
            };
            accessToken: string;
        };
    }>;
    logout(res: Response): Promise<{
        ok: boolean;
        message: string;
    }>;
    register(dto: RegisterDto): Promise<{
        ok: boolean;
        message: string;
        data: {
            user: {
                id: any;
                fullName: any;
                email: any;
                role: any;
                isEmailVerified: any;
                createdAt: any;
                avatarUrl: any;
            };
        };
    }>;
    getMe(user: JwtPayload): Promise<{
        ok: boolean;
        message: string;
        data: {
            user: {
                id: string;
                email: string;
                fullName: string;
                role: string;
                isEmailVerified: boolean;
                avatarUrl: string;
                telefono: string;
                ubicacion: string;
                titulo: string;
            };
            nav: {
                subtitle: string;
                config_hash: string;
                items: {
                    id: string;
                    icon: string;
                    label: string;
                    hash: string;
                    activeKeyword: string;
                    esFallback: boolean;
                    esConfig: boolean;
                    activePriority: number;
                }[];
            };
        };
    }>;
    updateMe(user: JwtPayload, dto: UpdateProfileDto): Promise<{
        ok: boolean;
        message: string;
        data: {
            user: {
                id: string;
                email: string;
                fullName: string;
                role: string;
                avatarUrl: string;
                telefono: string;
                ubicacion: string;
                titulo: string;
            };
        };
    }>;
    verifyEmail(token: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        ok: boolean;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        ok: boolean;
        message: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
        ok: boolean;
        message: string;
    }>;
    resendVerification(email: string, req: Request): Promise<{
        ok: boolean;
        message: string;
    }>;
}
