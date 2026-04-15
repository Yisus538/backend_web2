import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NavService } from './nav.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthService {
    private prisma;
    private email;
    private navService;
    private resendCooldown;
    private readonly COOLDOWN_MS;
    constructor(prisma: PrismaService, email: EmailService, navService: NavService);
    private generateTokens;
    private toPublicUser;
    register(dto: RegisterDto): Promise<{
        id: any;
        fullName: any;
        email: any;
        role: any;
        isEmailVerified: any;
        createdAt: any;
        avatarUrl: any;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: any;
            fullName: any;
            email: any;
            role: any;
            isEmailVerified: any;
            createdAt: any;
            avatarUrl: any;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
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
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getMe(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            role: string;
            telefono: string;
            ubicacion: string;
            titulo: string;
            avatarUrl: string;
            isEmailVerified: boolean;
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
    }>;
    updateMe(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: string;
        telefono: string;
        ubicacion: string;
        titulo: string;
        avatarUrl: string;
    }>;
    verifyEmail(rawToken: string): Promise<"Tu cuenta ya estaba verificada" | "Cuenta verificada exitosamente. Ya podés iniciar sesión.">;
    forgotPassword(dto: ForgotPasswordDto): Promise<void>;
    resetPassword(dto: ResetPasswordDto): Promise<void>;
    resendVerification(email?: string, userId?: string): Promise<"Si el correo existe, se envió un nuevo enlace de verificación." | "Tu cuenta ya está verificada. Podés iniciar sesión." | "Enlace de verificación reenviado. Revisá tu correo.">;
}
