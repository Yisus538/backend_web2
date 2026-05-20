import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { EnviarMensajeDto } from './dto/enviar-mensaje.dto';
import { CrearConversacionDto } from './dto/crear-conversacion.dto';

@Controller('mensajes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('candidate', 'company')
export class MensajesController {
  constructor(private svc: MensajesService) {}

  // GET /api/mensajes/no-leidos  — estática antes del dinámico
  @Get('no-leidos')
  async contarNoLeidos(@CurrentUser() u: JwtPayload) {
    const data = await this.svc.contarNoLeidos(u.userId);
    return { ok: true, message: 'Total no leídos', data };
  }

  // GET /api/mensajes/conversaciones
  @Get('conversaciones')
  async listar(@CurrentUser() u: JwtPayload) {
    const data = await this.svc.listar(u.userId, u.role);
    return { ok: true, message: 'Conversaciones obtenidas', data };
  }

  // POST /api/mensajes/conversaciones
  @Post('conversaciones')
  @HttpCode(HttpStatus.CREATED)
  async crear(@CurrentUser() u: JwtPayload, @Body() dto: CrearConversacionDto) {
    const data = await this.svc.crearConversacion(u.userId, u.role, dto);
    return { ok: true, message: 'Conversación lista', data };
  }

  // GET /api/mensajes/conversaciones/:convId
  @Get('conversaciones/:convId')
  async obtenerMensajes(
    @CurrentUser() u: JwtPayload,
    @Param('convId') convId: string,
  ) {
    const data = await this.svc.obtenerMensajes(u.userId, convId);
    return { ok: true, message: 'Mensajes obtenidos', data };
  }

  // PATCH /api/mensajes/conversaciones/:convId/leer
  @Patch('conversaciones/:convId/leer')
  @HttpCode(HttpStatus.OK)
  async marcarLeidos(
    @CurrentUser() u: JwtPayload,
    @Param('convId') convId: string,
  ) {
    await this.svc.marcarLeidos(u.userId, convId);
    return { ok: true, message: 'Mensajes marcados como leídos' };
  }

  // POST /api/mensajes
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async enviar(@CurrentUser() u: JwtPayload, @Body() dto: EnviarMensajeDto) {
    const data = await this.svc.enviar(u.userId, dto);
    return { ok: true, message: 'Mensaje enviado', data };
  }
}
