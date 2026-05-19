import { Test, TestingModule } from '@nestjs/testing';
import { VacantesService } from './vacantes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('VacantesService', () => {
  let service: VacantesService;

  const mockPrisma = {
    ofertaLaboral: { findMany: jest.fn() },
    candidatoHabilidad: { findMany: jest.fn() },
    postulacion: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VacantesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VacantesService>(VacantesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('habilidadesDemandadas()', () => {
    it('debe retornar habilidades ordenadas por count desc', async () => {
      mockPrisma.ofertaLaboral.findMany.mockResolvedValue([
        {
          id: '1',
          requisitos: {
            techSkills: [
              { label: 'React',      selected: true },
              { label: 'TypeScript', selected: true },
              { label: 'Node.js',    selected: true },
            ],
            softSkills: [],
          },
        },
        {
          id: '2',
          requisitos: {
            techSkills: [
              { label: 'React',      selected: true },
              { label: 'TypeScript', selected: true },
            ],
            softSkills: [],
          },
        },
        {
          id: '3',
          requisitos: {
            techSkills: [{ label: 'React', selected: true }],
            softSkills: [],
          },
        },
      ]);

      const result = await service.habilidadesDemandadas();

      expect(result.habilidades[0].nombre).toBe('React');
      expect(result.habilidades[0].count).toBe(3);
      expect(result.habilidades[1].nombre).toBe('TypeScript');
      expect(result.habilidades[1].count).toBe(2);
      expect(result.habilidades[2].nombre).toBe('Node.js');
      expect(result.habilidades[2].count).toBe(1);
      expect(result.totalVacantes).toBe(3);
    });

    it('debe ignorar habilidades con selected: false', async () => {
      mockPrisma.ofertaLaboral.findMany.mockResolvedValue([
        {
          id: '1',
          requisitos: {
            techSkills: [{ label: 'Vue', selected: false }],
            softSkills: [],
          },
        },
      ]);

      const result = await service.habilidadesDemandadas();

      expect(result.habilidades).toEqual([]);
    });

    it('debe retornar lista vacía si no hay vacantes abiertas', async () => {
      mockPrisma.ofertaLaboral.findMany.mockResolvedValue([]);

      const result = await service.habilidadesDemandadas();

      expect(result.habilidades).toEqual([]);
      expect(result.totalVacantes).toBe(0);
    });

    it('debe limitar el resultado a top 15', async () => {
      const techSkills = Array.from({ length: 20 }, (_, i) => ({
        label: `Skill${i}`,
        selected: true,
      }));

      mockPrisma.ofertaLaboral.findMany.mockResolvedValue([
        { id: '1', requisitos: { techSkills, softSkills: [] } },
      ]);

      const result = await service.habilidadesDemandadas();

      expect(result.habilidades.length).toBe(15);
    });

    it('debe combinar techSkills y softSkills', async () => {
      mockPrisma.ofertaLaboral.findMany.mockResolvedValue([
        {
          id: '1',
          requisitos: {
            techSkills: [{ label: 'TypeScript', selected: true }],
            softSkills: [{ label: 'Liderazgo',  selected: true }],
          },
        },
      ]);

      const result = await service.habilidadesDemandadas();

      expect(result.habilidades.length).toBe(2);
      const nombres = result.habilidades.map((h) => h.nombre);
      expect(nombres).toContain('TypeScript');
      expect(nombres).toContain('Liderazgo');
    });
  });
});
