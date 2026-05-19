import { Test, TestingModule } from '@nestjs/testing';
import { EntrevistasService } from './entrevistas.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const buildEntrevista = (overrides: any = {}) => ({
  id: 'ent-1',
  postulacionId: 'post-1',
  fecha: new Date('2026-06-01T10:00:00Z'),
  duracionMin: 60,
  tipo: 'pendiente',
  linkMeet: null,
  ubicacion: null,
  notas: null,
  estado: 'pendiente',
  postulacion: {
    candidato: {
      usuario: { email: 'c@test.com', fullName: 'Ana', avatarUrl: null },
      usuarioId: 'cand-1',
    },
    oferta: {
      titulo: 'Dev Backend',
      empresa: {
        nombreEmpresa: 'TechCo',
        usuario: { fullName: 'TechCo SA' },
      },
    },
    analisis: null,
  },
  ...overrides,
});

const mockPrisma = {
  empresa:     { findUnique: jest.fn() },
  entrevista:  { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
};

const mockEmail = {
  sendConfirmacionEntrevista: jest.fn().mockResolvedValue(undefined),
};

describe('EntrevistasService', () => {
  let service: EntrevistasService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntrevistasService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService,  useValue: mockEmail  },
      ],
    }).compile();
    service = module.get<EntrevistasService>(EntrevistasService);
  });

  describe('listarEmpresa()', () => {
    it('debe lanzar NotFound si empresa no existe', async () => {
      mockPrisma.empresa.findUnique.mockResolvedValue(null);
      await expect(service.listarEmpresa('user-404')).rejects.toThrow(NotFoundException);
    });

    it('debe devolver lista mapeada correctamente', async () => {
      mockPrisma.empresa.findUnique.mockResolvedValue({ usuarioId: 'emp-1' });
      mockPrisma.entrevista.findMany.mockResolvedValue([buildEntrevista()]);
      const result = await service.listarEmpresa('emp-1');
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('candidato');
      expect(result[0]).toHaveProperty('vacante', 'Dev Backend');
    });

    it('debe incluir matchScore null si no hay análisis', async () => {
      mockPrisma.empresa.findUnique.mockResolvedValue({ usuarioId: 'emp-1' });
      mockPrisma.entrevista.findMany.mockResolvedValue([buildEntrevista({ postulacion: { ...buildEntrevista().postulacion, analisis: null } })]);
      const result = await service.listarEmpresa('emp-1');
      expect(result[0].matchScore).toBeNull();
    });
  });

  describe('confirmar()', () => {
    it('debe lanzar NotFound si la entrevista no pertenece a la empresa', async () => {
      mockPrisma.entrevista.findFirst.mockResolvedValue(null);
      await expect(service.confirmar('emp-1', 'ent-999', { estado: 'confirmada' }))
        .rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequest con tipo inválido', async () => {
      await expect(service.confirmar('emp-1', 'ent-1', { tipo: 'invalido' }))
        .rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequest con estado de entrevista inválido', async () => {
      await expect(service.confirmar('emp-1', 'ent-1', { estado: 'invalido' }))
        .rejects.toThrow(BadRequestException);
    });

    it('debe enviar email de confirmación al pasar a "confirmada"', async () => {
      mockPrisma.entrevista.findFirst.mockResolvedValue(buildEntrevista({ estado: 'pendiente' }));
      mockPrisma.entrevista.update.mockResolvedValue(
        buildEntrevista({ estado: 'confirmada', linkMeet: 'https://meet.google.com/abc' })
      );
      await service.confirmar('emp-1', 'ent-1', { estado: 'confirmada', linkMeet: 'https://meet.google.com/abc' });
      expect(mockEmail.sendConfirmacionEntrevista).toHaveBeenCalled();
    });

    it('NO debe enviar email si ya estaba confirmada', async () => {
      mockPrisma.entrevista.findFirst.mockResolvedValue(buildEntrevista({ estado: 'confirmada' }));
      mockPrisma.entrevista.update.mockResolvedValue(buildEntrevista({ estado: 'confirmada', notas: 'nueva nota' }));
      await service.confirmar('emp-1', 'ent-1', { notas: 'nueva nota' });
      expect(mockEmail.sendConfirmacionEntrevista).not.toHaveBeenCalled();
    });

    it('debe actualizar solo los campos proporcionados', async () => {
      mockPrisma.entrevista.findFirst.mockResolvedValue(buildEntrevista());
      mockPrisma.entrevista.update.mockResolvedValue(buildEntrevista({ notas: 'nueva nota' }));
      await service.confirmar('emp-1', 'ent-1', { notas: 'nueva nota' });
      expect(mockPrisma.entrevista.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { notas: 'nueva nota' } })
      );
    });
  });
});
