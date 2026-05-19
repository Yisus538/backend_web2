import { Test, TestingModule } from '@nestjs/testing';
import { CvService } from './cv.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CvService', () => {
  let service: CvService;

  const mockPrisma = {
    analisisCvDirecto: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    candidato: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    habilidad: {
      upsert: jest.fn(),
    },
    candidatoHabilidad: {
      upsert: jest.fn(),
    },
    experienciaLaboral: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    educacion: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    idioma: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    historialAnalisis: {
      create: jest.fn(),
    },
    candidatoHabilidades: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CvService>(CvService);
  });

  afterEach(() => jest.clearAllMocks());

  // ══════════════════════════════════════════════════════
  // getAnalisisActivo
  // ══════════════════════════════════════════════════════

  describe('getAnalisisActivo()', () => {
    const candidatoId = 'uuid-candidato-test';

    it('debe retornar el análisis más reciente con datos relacionados', async () => {
      const mockAnalisis = {
        id:              'uuid-analisis-1',
        score:           88,
        apto:            true,
        resumen:         'Perfil sólido en backend',
        puestoEvaluado:  'Desarrollador Backend',
        analizadoEl:     new Date('2026-05-14'),
        educacionGenerada:   [{ id: 'e1', titulo: 'Ingeniería en Sistemas', institucion: 'UTN' }],
        experienciaGenerada: [{ id: 'x1', cargo: 'Dev Backend', empresa: 'Tech Corp' }],
        idiomasGenerados:    [{ id: 'i1', idioma: 'Inglés', nivel: 'avanzado' }],
      };

      mockPrisma.analisisCvDirecto.findFirst.mockResolvedValue(mockAnalisis);

      const result = await service.getAnalisisActivo(candidatoId);

      expect(mockPrisma.analisisCvDirecto.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where:   { candidatoId },
          orderBy: { analizadoEl: 'desc' },
        }),
      );
      expect(result).toEqual(mockAnalisis);
    });

    it('debe retornar null si el candidato no tiene análisis previos', async () => {
      mockPrisma.analisisCvDirecto.findFirst.mockResolvedValue(null);

      const result = await service.getAnalisisActivo('uuid-sin-analisis');

      expect(result).toBeNull();
    });

    it('debe incluir select con educación, experiencia e idiomas', async () => {
      mockPrisma.analisisCvDirecto.findFirst.mockResolvedValue(null);

      await service.getAnalisisActivo(candidatoId);

      const call = mockPrisma.analisisCvDirecto.findFirst.mock.calls[0][0];
      expect(call.select).toMatchObject({
        id:              true,
        score:           true,
        apto:            true,
        educacionGenerada:   expect.any(Object),
        experienciaGenerada: expect.any(Object),
        idiomasGenerados:    expect.any(Object),
      });
    });

    it('debe retornar análisis con arrays vacíos si no hay datos relacionados', async () => {
      const mockAnalisis = {
        id:                  'uuid-analisis-vacio',
        score:               null,
        apto:                null,
        resumen:             null,
        puestoEvaluado:      null,
        analizadoEl:         new Date(),
        educacionGenerada:   [],
        experienciaGenerada: [],
        idiomasGenerados:    [],
      };

      mockPrisma.analisisCvDirecto.findFirst.mockResolvedValue(mockAnalisis);

      const result = await service.getAnalisisActivo(candidatoId);

      expect(result!.educacionGenerada).toHaveLength(0);
      expect(result!.experienciaGenerada).toHaveLength(0);
      expect(result!.idiomasGenerados).toHaveLength(0);
    });

    it('debe consultar siempre con orderBy analizadoEl desc (el más reciente primero)', async () => {
      mockPrisma.analisisCvDirecto.findFirst.mockResolvedValue(null);

      await service.getAnalisisActivo(candidatoId);

      const call = mockPrisma.analisisCvDirecto.findFirst.mock.calls[0][0];
      expect(call.orderBy).toEqual({ analizadoEl: 'desc' });
    });
  });

  // ══════════════════════════════════════════════════════
  // getAnalisis (método existente — smoke test)
  // ══════════════════════════════════════════════════════

  describe('getAnalisis()', () => {
    it('debe retornar null si no hay análisis para el candidato', async () => {
      // getAnalisis hace Promise.all([findFirst, findMany, findMany])
      mockPrisma.analisisCvDirecto.findFirst.mockResolvedValue(null);
      mockPrisma.experienciaLaboral.findMany.mockResolvedValue([]);
      mockPrisma.candidatoHabilidad.upsert.mockResolvedValue({});
      // candidatoHabilidad.findMany es usado por getAnalisis
      (mockPrisma.candidatoHabilidad as any).findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getAnalisis('uuid-sin-analisis');
      expect(result).toBeNull();
    });
  });
});
