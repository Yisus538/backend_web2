import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostulacionesService } from './postulaciones.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('postulaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('candidate')
export class PostulacionesController {
  constructor(private svc: PostulacionesService) {}

  // ────────────────────────────────────────────────────────────
  // GET /api/postulaciones?estado=en-curso
  // ────────────────────────────────────────────────────────────
  @Get()
  async listar(
    @CurrentUser() u: JwtPayload,
    @Query('estado') estado?: string,
  ) {
    const data = await this.svc.listar(u.userId, estado);
    return { ok: true, message: 'Candidaturas obtenidas', data };
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/postulaciones
  // ────────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(
    @CurrentUser() u: JwtPayload,
    @Body('ofertaId') ofertaId: string,
  ) {
    const postulacion = await this.svc.crear(u.userId, ofertaId);
    return {
      ok:      true,
      message: 'Postulación creada exitosamente',
      data:    { postulacion },
    };
  }

  // ────────────────────────────────────────────────────────────
  // DELETE /api/postulaciones?id=xxx
  // Mismo contrato que el route.ts original (query param, no path param)
  // ────────────────────────────────────────────────────────────
  @Delete()
  @HttpCode(HttpStatus.OK)
  async retirar(
    @CurrentUser() u: JwtPayload,
    @Query('id') id: string,
  ) {
    await this.svc.retirar(u.userId, id);
    return { ok: true, message: 'Postulación retirada exitosamente' };
  }
}
