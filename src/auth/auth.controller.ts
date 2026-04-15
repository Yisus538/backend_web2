import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ────────────────────────────────────────────────────────────
  // POST /api/auth/login   — rate limit: 5 req / 15 min por IP
  // ────────────────────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 900_000, limit: 5 } })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return { ok: true, message: 'Sesión iniciada', data: result };
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/auth/register — rate limit: 5 req / 15 min por IP
  // ────────────────────────────────────────────────────────────
  @Post('register')
  @Throttle({ default: { ttl: 900_000, limit: 5 } })
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return { ok: true, message: 'Cuenta creada exitosamente', data: { user } };
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/auth/me
  // ────────────────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: JwtPayload) {
    const data = await this.authService.getMe(user.userId);
    return { ok: true, message: 'Usuario autenticado', data };
  }

  // ────────────────────────────────────────────────────────────
  // PATCH /api/auth/me
  // ────────────────────────────────────────────────────────────
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    const updated = await this.authService.updateMe(user.userId, dto);
    return { ok: true, message: 'Perfil actualizado', data: { user: updated } };
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/auth/verify-email?token=xxx
  // ────────────────────────────────────────────────────────────
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const message = await this.authService.verifyEmail(token);
    return { ok: true, message };
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/auth/forgot-password — rate limit: 3 req / 15 min
  // ────────────────────────────────────────────────────────────
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 900_000, limit: 3 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto);
    return {
      ok: true,
      message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
    };
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/auth/reset-password
  // ────────────────────────────────────────────────────────────
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { ok: true, message: 'Contraseña restablecida exitosamente' };
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/auth/refresh
  // ────────────────────────────────────────────────────────────
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    const tokens = await this.authService.refreshTokens(refreshToken);
    return { ok: true, message: 'Tokens renovados', data: { tokens } };
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/auth/resend-verification
  // Acepta: body.email (sin auth) o JWT en header (con auth)
  // ────────────────────────────────────────────────────────────
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body('email') email: string, @Request() req: any) {
    // Intentar extraer userId del JWT si está presente (sin fallar si no lo está)
    let userId: string | undefined;
    try {
      const authHeader = req.headers['authorization'];
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        const jwt   = require('jsonwebtoken');
        const payload = jwt.verify(
          token,
          process.env.JWT_SECRET || 'dev_secret_change_in_production_min32chars',
        ) as any;
        userId = payload?.userId;
      }
    } catch {
      // Token expirado o ausente → se usa el email del body
    }

    const message = await this.authService.resendVerification(email, userId);
    return { ok: true, message };
  }
}
