import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CandidatosService } from './candidatos.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('candidatos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidatosController {
  constructor(private svc: CandidatosService) {}

  // ────────────────────────────────────────────────────────────
  // GET /api/candidatos  — solo empresas
  // Query: search, vacanteId, page, limit
  // ────────────────────────────────────────────────────────────
  @Get()
  @Roles('company')
  async listar(@CurrentUser() u: JwtPayload, @Query() q: any) {
    const data = await this.svc.listar(u.userId, q);
    return { ok: true, message: 'Candidatos obtenidos', data };
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/candidatos/habilidades  — candidatos
  // ────────────────────────────────────────────────────────────
  @Get('habilidades')
  @Roles('candidate')
  async habilidades(@CurrentUser() u: JwtPayload) {
    const data = await this.svc.getHabilidades(u.userId);
    return { ok: true, message: 'Habilidades obtenidas', data };
  }

  // ══════════════════ IDIOMAS ══════════════════════════════════

  @Get('idiomas')
  @Roles('candidate')
  async getIdiomas(@CurrentUser() u: JwtPayload) {
    const idiomas = await this.svc.getIdiomas(u.userId);
    return { ok: true, message: 'Idiomas obtenidos', data: { idiomas } };
  }

  @Post('idiomas')
  @Roles('candidate')
  @HttpCode(HttpStatus.CREATED)
  async addIdioma(@CurrentUser() u: JwtPayload, @Body() body: any) {
    const idioma = await this.svc.addIdioma(u.userId, body);
    return { ok: true, message: 'Idioma agregado', data: { idioma } };
  }

  @Patch('idiomas')
  @Roles('candidate')
  @HttpCode(HttpStatus.OK)
  async updateIdioma(@CurrentUser() u: JwtPayload, @Body() body: any) {
    const idioma = await this.svc.updateIdioma(u.userId, body);
    return { ok: true, message: 'Idioma actualizado', data: { idioma } };
  }

  // DELETE /api/candidatos/idiomas?id=xxx
  @Delete('idiomas')
  @Roles('candidate')
  @HttpCode(HttpStatus.OK)
  async deleteIdioma(@CurrentUser() u: JwtPayload, @Query('id') id: string) {
    await this.svc.deleteIdioma(u.userId, id);
    return { ok: true, message: 'Idioma eliminado' };
  }

  // ══════════════════ EXPERIENCIA ══════════════════════════════

  @Get('experiencia')
  @Roles('candidate')
  async getExperiencia(@CurrentUser() u: JwtPayload) {
    const experiencia = await this.svc.getExperiencia(u.userId);
    return { ok: true, message: 'Experiencia obtenida', data: { experiencia } };
  }

  @Post('experiencia')
  @Roles('candidate')
  @HttpCode(HttpStatus.CREATED)
  async addExperiencia(@CurrentUser() u: JwtPayload, @Body() body: any) {
    const experiencia = await this.svc.addExperiencia(u.userId, body);
    return { ok: true, message: 'Experiencia agregada', data: { experiencia } };
  }

  @Patch('experiencia')
  @Roles('candidate')
  @HttpCode(HttpStatus.OK)
  async updateExperiencia(@CurrentUser() u: JwtPayload, @Body() body: any) {
    const experiencia = await this.svc.updateExperiencia(u.userId, body);
    return { ok: true, message: 'Experiencia actualizada', data: { experiencia } };
  }

  // DELETE /api/candidatos/experiencia?id=xxx
  @Delete('experiencia')
  @Roles('candidate')
  @HttpCode(HttpStatus.OK)
  async deleteExperiencia(@CurrentUser() u: JwtPayload, @Query('id') id: string) {
    await this.svc.deleteExperiencia(u.userId, id);
    return { ok: true, message: 'Experiencia eliminada' };
  }

  // ══════════════════ EDUCACIÓN ════════════════════════════════

  @Get('educacion')
  @Roles('candidate')
  async getEducacion(@CurrentUser() u: JwtPayload) {
    const educacion = await this.svc.getEducacion(u.userId);
    return { ok: true, message: 'Educación obtenida', data: { educacion } };
  }

  @Post('educacion')
  @Roles('candidate')
  @HttpCode(HttpStatus.CREATED)
  async addEducacion(@CurrentUser() u: JwtPayload, @Body() body: any) {
    const educacion = await this.svc.addEducacion(u.userId, body);
    return { ok: true, message: 'Educación agregada', data: { educacion } };
  }

  @Patch('educacion')
  @Roles('candidate')
  @HttpCode(HttpStatus.OK)
  async updateEducacion(@CurrentUser() u: JwtPayload, @Body() body: any) {
    const educacion = await this.svc.updateEducacion(u.userId, body);
    return { ok: true, message: 'Educación actualizada', data: { educacion } };
  }

  // DELETE /api/candidatos/educacion?id=xxx
  @Delete('educacion')
  @Roles('candidate')
  @HttpCode(HttpStatus.OK)
  async deleteEducacion(@CurrentUser() u: JwtPayload, @Query('id') id: string) {
    await this.svc.deleteEducacion(u.userId, id);
    return { ok: true, message: 'Educación eliminada' };
  }
}
