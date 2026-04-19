import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { VacantesService } from './vacantes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { CreateVacanteDto } from './dto/create-vacante.dto';
import { UpdateVacanteDto } from './dto/update-vacante.dto';

@Controller('vacantes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VacantesController {
  constructor(private svc: VacantesService) {}

  // ⚠️  IMPORTANTE: Las rutas estáticas (publicas, recomendadas) DEBEN ir
  //     ANTES del parámetro dinámico (:id) para que NestJS las resuelva bien.

  // ────────────────────────────────────────────────────────────
  // GET /api/vacantes/publicas  — candidatos: listado paginado
  // ────────────────────────────────────────────────────────────
  @Get('publicas')
  @Roles('candidate')
  async publicas(
    @CurrentUser() u: JwtPayload,
    @Query('search') search?: string,
    @Query('page')   page   = 1,
    @Query('limit')  limit  = 10,
  ) {
    const data = await this.svc.publicas(u.userId, search, +page, +limit);
    return { ok: true, message: 'Vacantes obtenidas', data };
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/vacantes/publicas/:id  — candidatos: detalle      🆕
  // ────────────────────────────────────────────────────────────
  @Get('publicas/:id')
  @Roles('candidate')
  async publicaById(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
  ) {
    const data = await this.svc.publicaById(u.userId, id);
    return { ok: true, message: 'Vacante obtenida', data: { vacante: data } };
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/vacantes/recomendadas  — candidatos
  // ────────────────────────────────────────────────────────────
  @Get('recomendadas')
  @Roles('candidate')
  async recomendadas(
    @CurrentUser() u: JwtPayload,
    @Query('limit') limit = 6,
  ) {
    const data = await this.svc.recomendadas(u.userId, +limit);
    return { ok: true, message: 'Vacantes recomendadas', data };
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/vacantes  — empresa: lista sus propias vacantes
  // ────────────────────────────────────────────────────────────
  @Get()
  @Roles('company')
  async listar(
    @CurrentUser() u: JwtPayload,
    @Query('estado') estado?: string,
    @Query('search') search?: string,
    @Query('page')   page   = 1,
    @Query('limit')  limit  = 10,
  ) {
    const result = await this.svc.listar(u.userId, { estado, search }, { page: +page, limit: +limit });
    return {
      ok: true,
      message: 'Vacantes obtenidas',
      data: {
        vacantes:   result.items,
        pagination: {
          total:      result.total,
          page:       result.page,
          limit:      result.limit,
          totalPages: result.totalPages,
        },
      },
    };
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/vacantes  — empresa: crea vacante
  // ────────────────────────────────────────────────────────────
  @Post()
  @Roles('company')
  @HttpCode(HttpStatus.CREATED)
  async crear(
    @CurrentUser() u: JwtPayload,
    @Body() dto: CreateVacanteDto,
  ) {
    const vacante = await this.svc.crear(u.userId, dto);
    return { ok: true, message: 'Vacante creada exitosamente', data: { vacante } };
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/vacantes/:id  — empresa: detalle de su vacante
  // ────────────────────────────────────────────────────────────
  @Get(':id')
  @Roles('company')
  async obtener(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
  ) {
    const vacante = await this.svc.obtener(u.userId, id);
    return { ok: true, message: 'Vacante obtenida', data: { vacante } };
  }

  // ────────────────────────────────────────────────────────────
  // PATCH /api/vacantes/:id  — empresa: actualiza / cambia estado
  // ────────────────────────────────────────────────────────────
  @Patch(':id')
  @Roles('company')
  async actualizar(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const keys = Object.keys(body ?? {});
    if (keys.length === 1 && keys[0] === 'estado') {
      const vacante = await this.svc.cambiarEstado(u.userId, id, body.estado);
      return { ok: true, message: 'Estado actualizado', data: { vacante } };
    }
    const vacante = await this.svc.actualizar(u.userId, id, body as UpdateVacanteDto);
    return { ok: true, message: 'Vacante actualizada', data: { vacante } };
  }

  // ────────────────────────────────────────────────────────────
  // DELETE /api/vacantes/:id  — empresa: elimina vacante
  // ────────────────────────────────────────────────────────────
  @Delete(':id')
  @Roles('company')
  async eliminar(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
  ) {
    await this.svc.eliminar(u.userId, id);
    return { ok: true, message: 'Vacante eliminada' };
  }
}