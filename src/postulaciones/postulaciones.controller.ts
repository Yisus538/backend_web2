import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
// ✅ FIX: @Roles removido del nivel de clase.
// Tenerlo aquí como 'candidate' hacía que el RolesGuard pudiera combinar
// ambos roles (clase + método) en vez de que el método sobrescriba la clase,
// bloqueando a usuarios 'company' en las rutas que los necesitan.
// Cada método declara su propio @Roles explícitamente.
export class PostulacionesController {
  constructor(private svc: PostulacionesService) {}

  // ────────────────────────────────────────────────────────────
  // GET /api/postulaciones/vacante/:vacanteId  — empresa: postulantes de una vacante
  // IMPORTANTE: ruta estática antes del dinámico GET()
  // ────────────────────────────────────────────────────────────
  @Get('vacante/:vacanteId')
  @Roles('company')                        // ✅ solo empresa puede ver sus postulantes
  async listarPorVacante(
    @CurrentUser() u: JwtPayload,
    @Param('vacanteId') vacanteId: string,
  ) {
    const data = await this.svc.listarPorVacante(u.userId, vacanteId);
    return { ok: true, message: 'Postulantes obtenidos', data };
  }

  // ────────────────────────────────────────────────────────────
  // PATCH /api/postulaciones/:id/estado  — empresa: actualiza estado
  // ────────────────────────────────────────────────────────────
  @Patch(':id/estado')
  @Roles('company')                        // ✅ solo empresa puede cambiar estado
  async actualizarEstado(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
    @Body('estado') estado: string,
  ) {
    const data = await this.svc.actualizarEstado(u.userId, id, estado);
    return { ok: true, message: 'Estado actualizado', data };
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/postulaciones?estado=en-curso
  // ────────────────────────────────────────────────────────────
  @Get()
  @Roles('candidate')                      // ✅ solo candidato ve sus candidaturas
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
  @Roles('candidate')                      // ✅ solo candidato puede postularse
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
  // ────────────────────────────────────────────────────────────
  @Delete()
  @Roles('candidate')                      // ✅ solo candidato puede retirar su postulación
  @HttpCode(HttpStatus.OK)
  async retirar(
    @CurrentUser() u: JwtPayload,
    @Query('id') id: string,
  ) {
    await this.svc.retirar(u.userId, id);
    return { ok: true, message: 'Postulación retirada exitosamente' };
  }
}