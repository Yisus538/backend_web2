import { Test, TestingModule } from '@nestjs/testing';
import { PostulacionesService } from './postulaciones.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrisma = {
  ofertaLaboral:         { findFirst: jest.fn() },
  candidato:             { findUnique: jest.fn(), create: jest.fn() },
  postulacion:           { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), delete: jest.fn() },
  analisisCvDirecto:     { findFirst: jest.fn() },
  analisisCvPostulacion: { upsert: jest.fn(), findUnique: jest.fn() },
  entrevista:            { create: jest.fn(), findUnique: jest.fn() },
  empresa:               { findUnique: jest.fn() },
};

const mockEmail = {
  sendPostulacionRecibida:      jest.fn().mockResolvedValue(undefined),
  sendEntrevistaAgendada:       jest.fn().mockResolvedValue(undefined),
  sendCandidatoAceptadoEmpresa: jest.fn().mockResolvedValue(undefined),
  sendPostulantePendiente:      jest.fn().mockResolvedValue(undefined),
  sendFinalistaNotification:    jest.fn().mockResolvedValue(undefined),
  sendRechazoPostulacion:       jest.fn().mockResolvedValue(undefined),
  sendContratadoNotification:   jest.fn().mockResolvedValue(undefined),
};

describe('PostulacionesService', () => {
  let service: PostulacionesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostulacionesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService,  useValue: mockEmail  },
      ],
    }).compile();
    service = module.get<PostulacionesService>(PostulacionesService);
  });

  // ── crear ───────────────────────────────────────────────────
  describe('crear()', () => {
    const userId   = 'user-123';
    const ofertaId = 'oferta-456';

    const mockOferta = {
      id: ofertaId, titulo: 'Dev Senior', descripcion: 'Desc',
      estado: 'abierta', requisitos: [], matchingWeights: null,
      experienciaMinima: 2, categoria: 'Tech', modalidad: 'remota',
      empresa: {
        nombreEmpresa: 'Acme Corp',
        usuario: { email: 'empresa@test.com', fullName: 'Empresa SA' },
      },
    };

    const mockCandidato = {
      usuarioId: userId,
      usuario: { email: 'cand@test.com', fullName: 'Juan Pérez' },
    };

    it('debe lanzar BadRequest si ofertaId es vacío', async () => {
      await expect(service.crear(userId, '')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar NotFound si la vacante no existe o no está abierta', async () => {
      mockPrisma.ofertaLaboral.findFirst.mockResolvedValue(null);
      await expect(service.crear(userId, ofertaId)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ConflictException si ya existe una postulación', async () => {
      mockPrisma.ofertaLaboral.findFirst.mockResolvedValue(mockOferta);
      mockPrisma.candidato.findUnique.mockResolvedValue(mockCandidato);
      mockPrisma.analisisCvDirecto.findFirst.mockResolvedValue(null);
      mockPrisma.postulacion.findUnique.mockResolvedValue({ id: 'exist-123' });
      await expect(service.crear(userId, ofertaId)).rejects.toThrow(ConflictException);
    });

    it('debe crear postulación con estado "analizando" si hay cvUrl', async () => {
      mockPrisma.ofertaLaboral.findFirst.mockResolvedValue(mockOferta);
      mockPrisma.candidato.findUnique.mockResolvedValue(mockCandidato);
      mockPrisma.analisisCvDirecto.findFirst.mockResolvedValue({
        cvCompleto: { cvUrl: 'https://example.com/cv.pdf' },
      });
      mockPrisma.postulacion.findUnique.mockResolvedValue(null);
      mockPrisma.postulacion.create.mockResolvedValue({
        id: 'post-789', estado: 'analizando', creadaEl: new Date(),
        oferta: { titulo: 'Dev Senior' },
      });

      const result = await service.crear(userId, ofertaId);

      expect(mockPrisma.postulacion.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ estado: 'analizando' }) })
      );
      expect(mockEmail.sendPostulacionRecibida).toHaveBeenCalled();
      expect(result.estado).toBe('analizando');
    });

    it('debe pasar a "pendiente" directamente si no hay cvUrl', async () => {
      mockPrisma.ofertaLaboral.findFirst.mockResolvedValue(mockOferta);
      mockPrisma.candidato.findUnique.mockResolvedValue(mockCandidato);
      mockPrisma.analisisCvDirecto.findFirst.mockResolvedValue(null);
      mockPrisma.postulacion.findUnique.mockResolvedValue(null);
      mockPrisma.postulacion.create.mockResolvedValue({
        id: 'post-789', estado: 'analizando', creadaEl: new Date(),
        oferta: { titulo: 'Dev Senior' },
      });
      mockPrisma.postulacion.update.mockResolvedValue({});

      await service.crear(userId, ofertaId);

      expect(mockPrisma.postulacion.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { estado: 'pendiente' } })
      );
    });

    it('debe auto-crear perfil candidato si no existe', async () => {
      mockPrisma.ofertaLaboral.findFirst.mockResolvedValue(mockOferta);
      // Primer llamado retorna null, segundo retorna el candidato creado
      mockPrisma.candidato.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCandidato);
      mockPrisma.candidato.create.mockResolvedValue({});
      mockPrisma.analisisCvDirecto.findFirst.mockResolvedValue(null);
      mockPrisma.postulacion.findUnique.mockResolvedValue(null);
      mockPrisma.postulacion.create.mockResolvedValue({
        id: 'post-789', estado: 'analizando', creadaEl: new Date(),
        oferta: { titulo: 'Dev Senior' },
      });
      mockPrisma.postulacion.update.mockResolvedValue({});

      await service.crear(userId, ofertaId);

      expect(mockPrisma.candidato.create).toHaveBeenCalledWith({ data: { usuarioId: userId } });
    });
  });

  // ── procesarCallback ────────────────────────────────────────
  describe('procesarCallback()', () => {
    const baseDto = {
      postulacionId: 'post-001',
      matchScore: 80,
      apto: true,
      resumen: 'Perfil sólido',
      fortalezas: ['TypeScript', 'NestJS'],
      debilidades: ['Docker'],
    };

    const mockPostulacion = {
      id: 'post-001',
      candidato: { usuario: { email: 'c@test.com', fullName: 'Ana' } },
      oferta: {
        titulo: 'Dev Backend',
        empresa: {
          nombreEmpresa: 'TechCo',
          usuario: { email: 'emp@test.com', fullName: 'TechCo SA' },
        },
      },
    };

    it('debe lanzar NotFound si la postulación no existe', async () => {
      mockPrisma.postulacion.findUnique.mockResolvedValue(null);
      await expect(service.procesarCallback(baseDto as any)).rejects.toThrow(NotFoundException);
    });

    it('debe cambiar estado a "entrevista" si score >= umbral', async () => {
      mockPrisma.postulacion.findUnique.mockResolvedValue(mockPostulacion);
      mockPrisma.analisisCvPostulacion.upsert.mockResolvedValue({});
      mockPrisma.postulacion.update.mockResolvedValue({});
      mockPrisma.entrevista.create.mockResolvedValue({});

      await service.procesarCallback(baseDto as any);

      expect(mockPrisma.postulacion.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { estado: 'entrevista' } })
      );
      expect(mockPrisma.entrevista.create).toHaveBeenCalled();
      expect(mockEmail.sendEntrevistaAgendada).toHaveBeenCalled();
      expect(mockEmail.sendCandidatoAceptadoEmpresa).toHaveBeenCalled();
    });

    it('debe cambiar estado a "pendiente" si score < umbral', async () => {
      mockPrisma.postulacion.findUnique.mockResolvedValue(mockPostulacion);
      mockPrisma.analisisCvPostulacion.upsert.mockResolvedValue({});
      mockPrisma.postulacion.update.mockResolvedValue({});

      await service.procesarCallback({ ...baseDto, matchScore: 50, apto: false } as any);

      expect(mockPrisma.postulacion.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { estado: 'pendiente' } })
      );
      expect(mockPrisma.entrevista.create).not.toHaveBeenCalled();
      expect(mockEmail.sendPostulantePendiente).toHaveBeenCalled();
    });

    it('debe persistir el análisis en AnalisisCvPostulacion', async () => {
      mockPrisma.postulacion.findUnique.mockResolvedValue(mockPostulacion);
      mockPrisma.analisisCvPostulacion.upsert.mockResolvedValue({});
      mockPrisma.postulacion.update.mockResolvedValue({});
      mockPrisma.entrevista.create.mockResolvedValue({});

      await service.procesarCallback(baseDto as any);

      expect(mockPrisma.analisisCvPostulacion.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where:  { postulacionId: 'post-001' },
          create: expect.objectContaining({ puntuacion: 80 }),
        })
      );
    });
  });

  // ── cambiarEstadoEmpresa ────────────────────────────────────
  describe('cambiarEstadoEmpresa()', () => {
    it('debe lanzar BadRequest con estado completamente inválido', async () => {
      mockPrisma.empresa.findUnique.mockResolvedValue({ usuarioId: 'emp-1' });
      await expect(
        service.cambiarEstadoEmpresa('emp-1', 'post-1', 'inexistente')
      ).rejects.toThrow(BadRequestException);
    });

    it('debe aceptar "aceptado" como alias de "entrevista"', async () => {
      mockPrisma.empresa.findUnique.mockResolvedValue({ usuarioId: 'emp-1' });
      mockPrisma.postulacion.findFirst.mockResolvedValue({
        id: 'post-1',
        candidato: { usuario: { email: 'c@test.com', fullName: 'Ana' } },
        oferta: { titulo: 'Dev Backend' },
      });
      mockPrisma.postulacion.update.mockResolvedValue({});
      mockPrisma.entrevista.findUnique.mockResolvedValue(null);
      mockPrisma.entrevista.create.mockResolvedValue({});

      const result = await service.cambiarEstadoEmpresa('emp-1', 'post-1', 'aceptado');

      expect(mockPrisma.postulacion.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { estado: 'entrevista' } })
      );
      expect(result.nuevoEstado).toBe('entrevista');
    });

    it('debe lanzar NotFound si la empresa no existe', async () => {
      mockPrisma.empresa.findUnique.mockResolvedValue(null);
      await expect(
        service.cambiarEstadoEmpresa('emp-1', 'post-1', 'finalista')
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar NotFound si la postulación no pertenece a la empresa', async () => {
      mockPrisma.empresa.findUnique.mockResolvedValue({ usuarioId: 'emp-1' });
      mockPrisma.postulacion.findFirst.mockResolvedValue(null);
      await expect(
        service.cambiarEstadoEmpresa('emp-1', 'post-999', 'finalista')
      ).rejects.toThrow(NotFoundException);
    });

    it('debe disparar email de finalista al candidato', async () => {
      mockPrisma.empresa.findUnique.mockResolvedValue({ usuarioId: 'emp-1' });
      mockPrisma.postulacion.findFirst.mockResolvedValue({
        id: 'post-1',
        candidato: { usuario: { email: 'c@test.com', fullName: 'Ana' } },
        oferta: { titulo: 'Dev Backend' },
      });
      mockPrisma.postulacion.update.mockResolvedValue({});
      mockPrisma.analisisCvPostulacion.findUnique.mockResolvedValue(null);

      await service.cambiarEstadoEmpresa('emp-1', 'post-1', 'finalista');

      expect(mockEmail.sendFinalistaNotification).toHaveBeenCalledWith(
        'c@test.com', 'Ana', 'Dev Backend'
      );
    });

    it('debe disparar email de rechazo con feedback si hay análisis', async () => {
      mockPrisma.empresa.findUnique.mockResolvedValue({ usuarioId: 'emp-1' });
      mockPrisma.postulacion.findFirst.mockResolvedValue({
        id: 'post-1',
        candidato: { usuario: { email: 'c@test.com', fullName: 'Ana' } },
        oferta: { titulo: 'Dev Backend' },
      });
      mockPrisma.postulacion.update.mockResolvedValue({});
      mockPrisma.analisisCvPostulacion.findUnique.mockResolvedValue({
        fortalezas: ['TypeScript'], debilidades: ['Docker'],
      });

      await service.cambiarEstadoEmpresa('emp-1', 'post-1', 'rechazado');

      expect(mockEmail.sendRechazoPostulacion).toHaveBeenCalledWith(
        'c@test.com', 'Ana', 'Dev Backend',
        ['TypeScript'], ['Docker'],
      );
    });

    it('debe disparar email de contratado al candidato', async () => {
      mockPrisma.empresa.findUnique.mockResolvedValue({ usuarioId: 'emp-1' });
      mockPrisma.postulacion.findFirst.mockResolvedValue({
        id: 'post-1',
        candidato: { usuario: { email: 'c@test.com', fullName: 'Ana' } },
        oferta: { titulo: 'Dev Backend' },
      });
      mockPrisma.postulacion.update.mockResolvedValue({});

      await service.cambiarEstadoEmpresa('emp-1', 'post-1', 'contratado');

      expect(mockEmail.sendContratadoNotification).toHaveBeenCalledWith(
        'c@test.com', 'Ana', 'Dev Backend'
      );
    });
  });

  // ── sumarDiasHabiles (testeo indirecto vía procesarCallback) ─
  describe('sumarDiasHabiles()', () => {
    it('la fecha tentativa de entrevista debe ser posterior al día actual', async () => {
      const mockPostulacion = {
        id: 'post-001',
        candidato: { usuario: { email: 'c@test.com', fullName: 'Ana' } },
        oferta: {
          titulo: 'Dev',
          empresa: {
            nombreEmpresa: 'Co',
            usuario: { email: 'e@test.com', fullName: 'Co SA' },
          },
        },
      };
      mockPrisma.postulacion.findUnique.mockResolvedValue(mockPostulacion);
      mockPrisma.analisisCvPostulacion.upsert.mockResolvedValue({});
      mockPrisma.postulacion.update.mockResolvedValue({});
      let capturedData: any;
      mockPrisma.entrevista.create.mockImplementation(({ data }: any) => {
        capturedData = data;
        return Promise.resolve({});
      });

      await service.procesarCallback({
        postulacionId: 'post-001', matchScore: 90, apto: true,
      } as any);

      expect(capturedData.fecha.getTime()).toBeGreaterThan(new Date().getTime());
    });
  });
});
