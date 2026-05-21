import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle }       from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService }    from './auth.service';
import { JwtAuthGuard }   from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { LoginDto }           from './dto/login.dto';
import { RegisterDto }        from './dto/register.dto';
import { ForgotPasswordDto }  from './dto/forgot-password.dto';
import { ResetPasswordDto }   from './dto/reset-password.dto';
import { UpdateProfileDto }   from './dto/update-profile.dto';
import { ok }                from '../common/utils/response.utils';

// ── Helpers de cookies ────────────────────────────────────────────────────────
// SameSite: 'none' + Secure: true  → requerido para dominios cruzados en producción
//   (frontend en Railway != backend en Railway → orígenes distintos)
// SameSite: 'lax'  + Secure: false → desarrollo local (localhost)

function cookieOptions(res: Response): { base: object } {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    base: {
      httpOnly: true,
      secure:   isProd,
      sameSite: isProd ? 'none' : 'lax',
      path:     '/',
    },
  };
}

function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  const { base } = cookieOptions(res);
  res.cookie('accessToken',  tokens.accessToken,  { ...base, maxAge: 60 * 60 * 1000 });           // 1h
  res.cookie('refreshToken', tokens.refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7d
}

function clearAuthCookies(res: Response) {
  const { base } = cookieOptions(res);
  res.clearCookie('accessToken',  base);
  res.clearCookie('refreshToken', base);
}

// ─────────────────────────────────────────────────────────────────────────────

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ── POST /api/auth/login ──────────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 900_000, limit: 5 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    // Los tokens van en cookies HttpOnly — el navegador los adjunta
    // automáticamente en cada request. El JS del cliente nunca los ve.
    setAuthCookies(res, result.tokens);

    return ok('Sesión iniciada', { user: result.user, nav: result.nav });
  }

  // ── POST /api/auth/logout ─────────────────────────────────────────────────
  // Las cookies HttpOnly no pueden borrarse desde JS, por eso existe este endpoint.
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res);
    return ok('Sesión cerrada');
  }

  // ── POST /api/auth/register ───────────────────────────────────────────────
  @Post('register')
  @Throttle({ default: { ttl: 900_000, limit: 5 } })
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return ok('Cuenta creada exitosamente', { user });
  }

  // ── GET /api/auth/me ──────────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: JwtPayload) {
    const data = await this.authService.getMe(user.userId);
    return ok('Usuario autenticado', data);
  }

  // ── PATCH /api/auth/me ────────────────────────────────────────────────────
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    const updated = await this.authService.updateMe(user.userId, dto);
    return ok('Perfil actualizado', { user: updated });
  }

  // ── DELETE /api/auth/me ───────────────────────────────────────────────────
  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.deleteAccount(user.userId);
    clearAuthCookies(res);
  }

  // ── GET /api/auth/verify-email?token=xxx ─────────────────────────────────
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const message = await this.authService.verifyEmail(token);
    return ok(message);
  }

  // ── POST /api/auth/forgot-password ───────────────────────────────────────
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 900_000, limit: 3 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto);
    return ok('Si el correo existe, recibirás un enlace para restablecer tu contraseña.');
  }

  // ── POST /api/auth/reset-password ─────────────────────────────────────────
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return ok('Contraseña restablecida exitosamente');
  }

  // ── POST /api/auth/refresh ────────────────────────────────────────────────
  // Lee el refreshToken de la cookie (ya no del body).
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyRefreshToken?: string,
  ) {
    const refreshToken = req.cookies?.refreshToken || bodyRefreshToken;
    if (!refreshToken) throw new UnauthorizedException('No hay refresh token');

    const tokens = await this.authService.refreshTokens(refreshToken);
    setAuthCookies(res, tokens);

    return ok('Tokens renovados');
  }

  // ── POST /api/auth/resend-verification ───────────────────────────────────
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body('email') email: string, @Req() req: Request) {
    const cookieToken = req.cookies?.accessToken;
    const message = await this.authService.resendVerification(email, cookieToken);
    return ok(message);
  }
}