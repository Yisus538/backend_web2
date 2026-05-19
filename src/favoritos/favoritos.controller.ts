import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('favoritos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('candidate')
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) {}

  // ────────────────────────────────────────────────────────────────
  // GET /api/favoritos
  // Devuelve todas las vacantes guardadas por el candidato autenticado.
  // ────────────────────────────────────────────────────────────────
  @Get()
  async listar(@CurrentUser() user: JwtPayload) {
    const data = await this.favoritosService.listar(user.userId);
    return { ok: true, message: 'Favoritos obtenidos', data };
  }

  // ────────────────────────────────────────────────────────────────
  // POST /api/favoritos/:ofertaId
  // Guarda una vacante en favoritos.
  // ────────────────────────────────────────────────────────────────
  @Post(':ofertaId')
  @HttpCode(HttpStatus.CREATED)
  async guardar(
    @CurrentUser() user: JwtPayload,
    @Param('ofertaId') ofertaId: string,
  ) {
    const data = await this.favoritosService.guardar(user.userId, ofertaId);
    return { ok: true, message: 'Vacante guardada en favoritos', data };
  }

  // ────────────────────────────────────────────────────────────────
  // DELETE /api/favoritos/:ofertaId
  // Elimina una vacante de favoritos.
  // ────────────────────────────────────────────────────────────────
  @Delete(':ofertaId')
  @HttpCode(HttpStatus.OK)
  async eliminar(
    @CurrentUser() user: JwtPayload,
    @Param('ofertaId') ofertaId: string,
  ) {
    await this.favoritosService.eliminar(user.userId, ofertaId);
    return { ok: true, message: 'Vacante eliminada de favoritos' };
  }
}
