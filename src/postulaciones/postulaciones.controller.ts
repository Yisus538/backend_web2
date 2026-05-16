import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { PostulacionesService } from './postulaciones.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { PostulacionCallbackDto } from './dto/postulacion-callback.dto';

@Controller('postulaciones')
export class PostulacionesController {
  constructor(private svc: PostulacionesService) {}

  // ────────────────────────────────────────────────────────────
  // POST /api/postulaciones/callback  — Make.com llama esto
  // Sin JWT — protegido con WEBHOOK_SECRET en header
  // ────────────────────────────────────────────────────────────
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async callback(
    @Body() dto: PostulacionCallbackDto,
    @Headers('x-webhook-secret') secret: string,
  ) {
    const expected = process.env.WEBHOOK_SECRET;
    if (!expected || secret !== expected) {
      throw new UnauthorizedException('Webhook secret inválido');
    }
    const result = await this.svc.procesarCallback(dto);
    return { ok: true, message: 'Callback procesado', data: result };
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/postulaciones/vacante/:vacanteId  — empresa: postulantes de una vacante
  // IMPORTANTE: ruta estática antes del dinámico GET()
  // ────────────────────────────────────────────────────────────
  @Get('vacante/:vacanteId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  async listarPorVacante(
    @CurrentUser() u: JwtPayload,
    @Param('vacanteId') vacanteId: string,
  ) {
    const data = await this.svc.listarPorVacante(u.userId, vacanteId);
    return { ok: true, message: 'Postulantes obtenidos', data };
  }

  // ────────────────────────────────────────────────────────────
  // PATCH /api/postulaciones/:id/estado  — empresa: cambia estado con email
  // ────────────────────────────────────────────────────────────
  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @HttpCode(HttpStatus.OK)
  async cambiarEstado(
    @CurrentUser() u: JwtPayload,
    @Param('id')   id: string,
    @Body('estado') estado: string,
  ) {
    const data = await this.svc.cambiarEstadoEmpresa(u.userId, id, estado);
    return { ok: true, message: 'Estado actualizado', data };
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/postulaciones?estado=en-curso
  // ────────────────────────────────────────────────────────────
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  @HttpCode(HttpStatus.OK)
  async retirar(
    @CurrentUser() u: JwtPayload,
    @Query('id') id: string,
  ) {
    await this.svc.retirar(u.userId, id);
    return { ok: true, message: 'Postulación retirada exitosamente' };
  }
}
