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
import { CandidatosService } from './candidatos.service';
import { CurriculumService } from '../curriculum/curriculum.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { ok } from '../common/utils/response.utils';

@Controller('candidatos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidatosController {
  constructor(
    private svc: CandidatosService,
    private curriculumSvc: CurriculumService,
  ) {}

  // ────────────────────────────────────────────────────────────
  // GET /api/candidatos  — solo empresas
  // Query: search, vacanteId, page, limit
  // ────────────────────────────────────────────────────────────
  @Get()
  @Roles('company')
  async listar(@CurrentUser() u: JwtPayload, @Query() q: any) {
    const data = await this.svc.listar(u.userId, q);
    return ok('Candidatos obtenidos', data);
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/candidatos/habilidades  — candidatos
  // ────────────────────────────────────────────────────────────
  @Get('habilidades')
  @Roles('candidate')
  async habilidades(@CurrentUser() u: JwtPayload) {
    const data = await this.svc.getHabilidades(u.userId);
    return ok('Habilidades obtenidas', data);
  }

  // ══════════════════ IDIOMAS ══════════════════════════════════

  @Get('idiomas')
  @Roles('candidate')
  async getIdiomas(@CurrentUser() u: JwtPayload) {
    const idiomas = await this.curriculumSvc.getIdiomas(u.userId);
    return ok('Idiomas obtenidos', { idiomas });
  }

  @Post('idiomas')
  @Roles('candidate')
  @HttpCode(HttpStatus.CREATED)
  async addIdioma(@CurrentUser() u: JwtPayload, @Body() body: any) {
    const idioma = await this.curriculumSvc.addIdioma(u.userId, body);
    return ok('Idioma agregado', { idioma });
  }

  @Patch('idiomas')
  @Roles('candidate')
  @HttpCode(HttpStatus.OK)
  async updateIdioma(@CurrentUser() u: JwtPayload, @Body() body: any) {
    const idioma = await this.curriculumSvc.updateIdioma(u.userId, body);
    return ok('Idioma actualizado', { idioma });
  }

  // DELETE /api/candidatos/idiomas?id=xxx
  @Delete('idiomas')
  @Roles('candidate')
  @HttpCode(HttpStatus.OK)
  async deleteIdioma(@CurrentUser() u: JwtPayload, @Query('id') id: string) {
    await this.curriculumSvc.deleteIdioma(u.userId, id);
    return ok('Idioma eliminado');
  }

  // ══════════════════ EXPERIENCIA ══════════════════════════════

  @Get('experiencia')
  @Roles('candidate')
  async getExperiencia(@CurrentUser() u: JwtPayload) {
    const experiencia = await this.curriculumSvc.getExperiencia(u.userId);
    return ok('Experiencia obtenida', { experiencia });
  }

  @Post('experiencia')
  @Roles('candidate')
  @HttpCode(HttpStatus.CREATED)
  async addExperiencia(@CurrentUser() u: JwtPayload, @Body() body: any) {
    const experiencia = await this.curriculumSvc.addExperiencia(u.userId, body);
    return ok('Experiencia agregada', { experiencia });
  }

  @Patch('experiencia')
  @Roles('candidate')
  @HttpCode(HttpStatus.OK)
  async updateExperiencia(@CurrentUser() u: JwtPayload, @Body() body: any) {
    const experiencia = await this.curriculumSvc.updateExperiencia(u.userId, body);
    return ok('Experiencia actualizada', { experiencia });
  }

  // DELETE /api/candidatos/experiencia?id=xxx
  @Delete('experiencia')
  @Roles('candidate')
  @HttpCode(HttpStatus.OK)
  async deleteExperiencia(@CurrentUser() u: JwtPayload, @Query('id') id: string) {
    await this.curriculumSvc.deleteExperiencia(u.userId, id);
    return ok('Experiencia eliminada');
  }

  // ══════════════════ EDUCACIÓN ════════════════════════════════

  @Get('educacion')
  @Roles('candidate')
  async getEducacion(@CurrentUser() u: JwtPayload) {
    const educacion = await this.curriculumSvc.getEducacion(u.userId);
    return ok('Educación obtenida', { educacion });
  }

  @Post('educacion')
  @Roles('candidate')
  @HttpCode(HttpStatus.CREATED)
  async addEducacion(@CurrentUser() u: JwtPayload, @Body() body: any) {
    const educacion = await this.curriculumSvc.addEducacion(u.userId, body);
    return ok('Educación agregada', { educacion });
  }

  @Patch('educacion')
  @Roles('candidate')
  @HttpCode(HttpStatus.OK)
  async updateEducacion(@CurrentUser() u: JwtPayload, @Body() body: any) {
    const educacion = await this.curriculumSvc.updateEducacion(u.userId, body);
    return ok('Educación actualizada', { educacion });
  }

  // DELETE /api/candidatos/educacion?id=xxx
  @Delete('educacion')
  @Roles('candidate')
  @HttpCode(HttpStatus.OK)
  async deleteEducacion(@CurrentUser() u: JwtPayload, @Query('id') id: string) {
    await this.curriculumSvc.deleteEducacion(u.userId, id);
    return ok('Educación eliminada');
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/candidatos/:id  — empresa ve perfil público + cvUrl
  // Va al final para que las rutas específicas (/habilidades, etc.) tengan prioridad
  // ────────────────────────────────────────────────────────────
  @Get(':id')
  @Roles('company')
  async getPerfilPublico(@CurrentUser() u: JwtPayload, @Param('id') id: string) {
    const data = await this.svc.getPerfilPublico(u.userId, id);
    return ok('Perfil obtenido', data);
  }
}
