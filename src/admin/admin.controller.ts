import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrativo')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ────────────────────────────────────────────────────────────
  // GET /api/admin/stats — estadísticas globales del sistema
  // ────────────────────────────────────────────────────────────
  @Get('stats')
  async getStats() {
    const data = await this.adminService.getStats();
    return { ok: true, message: 'Estadísticas del sistema', data };
  }
}
