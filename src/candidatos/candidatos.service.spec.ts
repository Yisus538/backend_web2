import { Test } from '@nestjs/testing';
import { CandidatosService } from './candidatos.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findMany:  jest.fn(),
    count:     jest.fn(),
  },
  postulacion: {
    findFirst: jest.fn(),
    findMany:  jest.fn(),
  },
  ofertaLaboral: {
    findFirst: jest.fn(),
  },
  candidatoHabilidad: {
    findMany: jest.fn(),
  },
};

describe('CandidatosService', () => {
  let service: CandidatosService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CandidatosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<CandidatosService>(CandidatosService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── getPerfilPublico() ────────────────────────────────────────────
  describe('getPerfilPublico()', () => {
    const mockUser = {
      id:        'candidato-1',
      fullName:  'Ana López',
      email:     'ana@test.com',
      avatarUrl: 'https://img.test/a.jpg',
      titulo:    'Frontend Developer',
      ubicacion: 'Buenos Aires',
      candidato: {
        biografia: 'Desarrolladora con 5 años',
        habilidades: [
          { nivel: 'avanzado', aniosExp: 5, habilidad: { nombre: 'React' } },
        ],
        idiomas:    [],
        experiencia: [],
        educacion:  [],
        analisisDirectos: [{ resumen: 'Buen perfil', score: 85, analizadoEl: new Date() }],
      },
    };

    it('devuelve perfil con cvUrl y postulacionId cuando hay postulación', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.postulacion.findFirst.mockResolvedValue({
        id: 'post-123',
        urlCv: 'https://cv.test/cv.pdf',
      });

      const result = await service.getPerfilPublico('empresa-1', 'candidato-1');

      expect(result.postulacionId).toBe('post-123');
      expect(result.cvUrl).toBe('https://cv.test/cv.pdf');
      expect(result.name).toBe('Ana López');
    });

    it('devuelve postulacionId null cuando no hay postulación', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.postulacion.findFirst.mockResolvedValue(null);

      const result = await service.getPerfilPublico('empresa-1', 'candidato-1');

      expect(result.postulacionId).toBeNull();
      expect(result.cvUrl).toBeNull();
    });

    it('lanza NotFoundException si el candidato no existe', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.getPerfilPublico('empresa-1', 'no-existe')).rejects.toThrow(NotFoundException);
    });

    it('calcula experience a partir de las habilidades', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.postulacion.findFirst.mockResolvedValue(null);

      const result = await service.getPerfilPublico('empresa-1', 'candidato-1');

      expect(result.experience).toBe('5 años');
    });
  });

  // ── listar() ─────────────────────────────────────────────────────
  describe('listar()', () => {
    const mockRow = {
      id:        'candidato-2',
      fullName:  'Carlos Ruiz',
      email:     'carlos@test.com',
      avatarUrl: 'https://img.test/b.jpg',
      titulo:    'Backend Dev',
      ubicacion: 'Córdoba',
      createdAt: new Date(),
      candidato: {
        habilidades: [
          { nivel: 'avanzado', aniosExp: 3, habilidad: { nombre: 'NestJS' } },
        ],
      },
    };

    it('devuelve candidatos con postulacionId null cuando no hay vacanteId', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockRow]);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.listar('empresa-1', {});

      expect(result.candidatos[0].postulacionId).toBeNull();
      expect(result.candidatos[0].postulado).toBe(false);
    });

    it('devuelve postulacionId correcto cuando el candidato postuló a la vacante', async () => {
      mockPrisma.ofertaLaboral.findFirst.mockResolvedValue({
        id: 'vacante-1',
        requisitos: null,
        experienciaMinima: 0,
      });
      mockPrisma.postulacion.findMany.mockResolvedValue([
        { id: 'post-555', candidatoId: 'candidato-2' },
      ]);
      mockPrisma.user.findMany.mockResolvedValue([mockRow]);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.listar('empresa-1', { vacanteId: 'vacante-1' });

      expect(result.candidatos[0].postulacionId).toBe('post-555');
      expect(result.candidatos[0].postulado).toBe(true);
    });

    it('devuelve postulacionId null cuando el candidato no postuló', async () => {
      mockPrisma.ofertaLaboral.findFirst.mockResolvedValue({
        id: 'vacante-1',
        requisitos: null,
        experienciaMinima: 0,
      });
      mockPrisma.postulacion.findMany.mockResolvedValue([]);
      mockPrisma.user.findMany.mockResolvedValue([mockRow]);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.listar('empresa-1', { vacanteId: 'vacante-1' });

      expect(result.candidatos[0].postulacionId).toBeNull();
      expect(result.candidatos[0].postulado).toBe(false);
    });

    it('devuelve paginación correcta', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockRow]);
      mockPrisma.user.count.mockResolvedValue(10);

      const result = await service.listar('empresa-1', { page: '2', limit: '5' });

      expect(result.pagination.total).toBe(10);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.totalPages).toBe(2);
    });
  });
});
