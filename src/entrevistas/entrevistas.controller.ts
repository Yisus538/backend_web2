import {
  Controller, Get, Patch, Param, Body,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { EntrevistasService } from './entrevistas.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('entrevistas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EntrevistasController {
  constructor(private svc: EntrevistasService) {}

  // GET /api/entrevistas — empresa
  @Get()
  @Roles('company')
  async listarEmpresa(@CurrentUser() u: JwtPayload) {
    const data = await this.svc.listarEmpresa(u.userId);
    return { ok: true, message: 'Entrevistas obtenidas', data };
  }

  // GET /api/entrevistas/candidato — candidato
  @Get('candidato')
  @Roles('candidate')
  async listarCandidato(@CurrentUser() u: JwtPayload) {
    const data = await this.svc.listarCandidato(u.userId);
    return { ok: true, message: 'Entrevistas obtenidas', data };
  }

  // PATCH /api/entrevistas/:id — empresa confirma/actualiza
  @Patch(':id')
  @Roles('company')
  @HttpCode(HttpStatus.OK)
  async confirmar(
    @CurrentUser() u: JwtPayload,
    @Param('id')   id: string,
    @Body()        body: any,
  ) {
    const data = await this.svc.confirmar(u.userId, id, body);
    return { ok: true, message: 'Entrevista actualizada', data };
  }
}
