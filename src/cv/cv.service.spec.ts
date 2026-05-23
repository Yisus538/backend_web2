import { Test, TestingModule } from '@nestjs/testing';
import { CvService } from './cv.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

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
      findUnique: jest.fn(),
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

  const mockCloudinary = {
    uploadCv: jest.fn().mockResolvedValue({ secureUrl: 'https://res.cloudinary.com/test/cv.pdf', publicId: 'test-id' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvService,
        { provide: PrismaService,     useValue: mockPrisma },
        { provide: CloudinaryService, useValue: mockCloudinary },
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
  // procesarAnalisis
  // ══════════════════════════════════════════════════════

  describe('procesarAnalisis()', () => {
    const candidatoId = 'uuid-candidato';
    const analisisId  = 'uuid-analisis-created';

    const basePayload = {
      candidatoId,
      nombre_completo:         'Juan Test',
      correo_cv:               'juan@test.com',
      telefono_cv:             '123456',
      puesto_evaluado:         'Dev Backend',
      motivo_rechazo:          null as any,
      resumen:                 'Perfil sólido',
      skills_detectadas:       [] as any[],
      tecnologias_detectadas:  [] as any[],
      experiencia_laboral:     [] as any[],
      educacion:               [] as any[],
      idiomas:                 [] as any[],
      confianza_datos:         '85',
    };

    beforeEach(() => {
      mockPrisma.candidato.upsert.mockResolvedValue({});
      mockPrisma.analisisCvDirecto.create.mockResolvedValue({ id: analisisId });
      mockPrisma.historialAnalisis.create.mockResolvedValue({});
    });

    it('debe crear AnalisisCvDirecto con score parseado de string "85"', async () => {
      await service.procesarAnalisis(candidatoId, basePayload);
      expect(mockPrisma.analisisCvDirecto.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ candidatoId, score: 85, apto: true }),
        }),
      );
    });

    it('debe parsear score "0.85" como 85 (valor decimal)', async () => {
      await service.procesarAnalisis(candidatoId, { ...basePayload, confianza_datos: '0.85' });
      expect(mockPrisma.analisisCvDirecto.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ score: 85 }) }),
      );
    });

    it('debe dejar score=null y apto=null cuando confianza_datos es null', async () => {
      await service.procesarAnalisis(candidatoId, { ...basePayload, confianza_datos: null as any });
      expect(mockPrisma.analisisCvDirecto.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ score: null, apto: null }) }),
      );
    });

    it('debe marcar apto=false cuando score < 60', async () => {
      await service.procesarAnalisis(candidatoId, { ...basePayload, confianza_datos: '55' });
      expect(mockPrisma.analisisCvDirecto.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ score: 55, apto: false }) }),
      );
    });

    it('debe crear registro en historialAnalisis con estado "completado"', async () => {
      await service.procesarAnalisis(candidatoId, basePayload);
      expect(mockPrisma.historialAnalisis.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            analisisDirectoId: analisisId,
            estado:            'completado',
          }),
        }),
      );
    });

    it('debe procesar skills y upsertear habilidad con tipo="habilidad"', async () => {
      const payload = {
        ...basePayload,
        skills_detectadas: [{ skill: 'React', nivel_estimado: 'avanzado', confianza: '90' }],
      };
      mockPrisma.habilidad.upsert.mockResolvedValue({ id: 'hab-1', nombre: 'React' });
      mockPrisma.candidatoHabilidad.findUnique.mockResolvedValue(null);
      mockPrisma.candidatoHabilidad.upsert.mockResolvedValue({});

      await service.procesarAnalisis(candidatoId, payload);

      expect(mockPrisma.habilidad.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { nombre: 'React' } }),
      );
      expect(mockPrisma.candidatoHabilidad.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ tipo: 'habilidad' }),
        }),
      );
    });

    it('debe procesar tecnologias con tipo="tecnologia"', async () => {
      const payload = { ...basePayload, tecnologias_detectadas: ['Node.js'] };
      mockPrisma.habilidad.upsert.mockResolvedValue({ id: 'hab-node', nombre: 'Node.js' });
      mockPrisma.candidatoHabilidad.findUnique.mockResolvedValue(null);
      mockPrisma.candidatoHabilidad.upsert.mockResolvedValue({});

      await service.procesarAnalisis(candidatoId, payload);

      expect(mockPrisma.candidatoHabilidad.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ tipo: 'tecnologia' }),
        }),
      );
    });

    it('no debe duplicar experiencia laboral ya existente', async () => {
      const payload = {
        ...basePayload,
        experiencia_laboral: [{ empresa: 'TechCorp', cargo: 'Dev', ubicacion: '', periodo: '2020 - 2022', descripcion: [] }],
      };
      mockPrisma.experienciaLaboral.findFirst.mockResolvedValue({ id: 'exp-existente' });

      await service.procesarAnalisis(candidatoId, payload);

      expect(mockPrisma.experienciaLaboral.create).not.toHaveBeenCalled();
    });

    it('debe insertar experiencia laboral nueva con analisisOrigenId', async () => {
      const payload = {
        ...basePayload,
        experiencia_laboral: [{ empresa: 'Corp', cargo: 'Dev', ubicacion: '', periodo: '2021 - 2023', descripcion: [] }],
      };
      mockPrisma.experienciaLaboral.findFirst.mockResolvedValue(null);
      mockPrisma.experienciaLaboral.create.mockResolvedValue({});

      await service.procesarAnalisis(candidatoId, payload);

      expect(mockPrisma.experienciaLaboral.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            empresa:          'Corp',
            cargo:            'Dev',
            analisisOrigenId: analisisId,
          }),
        }),
      );
    });

    it('debe parsear periodo "Ene 2022 - Actualidad" como actual=true, fechaFin=null', async () => {
      const payload = {
        ...basePayload,
        experiencia_laboral: [{ empresa: 'Corp', cargo: 'Dev', ubicacion: '', periodo: 'Ene 2022 - Actualidad', descripcion: [] }],
      };
      mockPrisma.experienciaLaboral.findFirst.mockResolvedValue(null);
      mockPrisma.experienciaLaboral.create.mockResolvedValue({});

      await service.procesarAnalisis(candidatoId, payload);

      expect(mockPrisma.experienciaLaboral.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ actual: true, fechaFin: null }),
        }),
      );
    });

    it('no debe duplicar educación ya existente', async () => {
      const payload = {
        ...basePayload,
        educacion: [{ institucion: 'UTN', titulo: 'Ing Sistemas', periodo: '2015 - 2020', observaciones: '' }],
      };
      mockPrisma.educacion.findFirst.mockResolvedValue({ id: 'edu-existente' });

      await service.procesarAnalisis(candidatoId, payload);

      expect(mockPrisma.educacion.create).not.toHaveBeenCalled();
    });

    it('no debe duplicar idiomas ya existentes', async () => {
      const payload = { ...basePayload, idiomas: [{ idioma: 'Inglés', nivel: 'avanzado' }] };
      mockPrisma.idioma.findFirst.mockResolvedValue({ id: 'idioma-existente' });

      await service.procesarAnalisis(candidatoId, payload);

      expect(mockPrisma.idioma.create).not.toHaveBeenCalled();
    });

    it('debe normalizar nivel de idioma "Advanced C1" → "avanzado"', async () => {
      const payload = { ...basePayload, idiomas: [{ idioma: 'Inglés', nivel: 'Advanced C1' }] };
      mockPrisma.idioma.findFirst.mockResolvedValue(null);
      mockPrisma.idioma.create.mockResolvedValue({});

      await service.procesarAnalisis(candidatoId, payload);

      expect(mockPrisma.idioma.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ nivel: 'avanzado' }) }),
      );
    });

    it('debe normalizar nivel de idioma "native" → "nativo"', async () => {
      const payload = { ...basePayload, idiomas: [{ idioma: 'Español', nivel: 'native' }] };
      mockPrisma.idioma.findFirst.mockResolvedValue(null);
      mockPrisma.idioma.create.mockResolvedValue({});

      await service.procesarAnalisis(candidatoId, payload);

      expect(mockPrisma.idioma.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ nivel: 'nativo' }) }),
      );
    });

    it('debe continuar procesando aunque una skill lance error', async () => {
      const payload = {
        ...basePayload,
        skills_detectadas: [
          { skill: 'React', nivel_estimado: '', confianza: '' },
          { skill: 'Vue',   nivel_estimado: '', confianza: '' },
        ],
      };
      mockPrisma.habilidad.upsert
        .mockRejectedValueOnce(new Error('DB error'))
        .mockResolvedValueOnce({ id: 'hab-vue', nombre: 'Vue' });
      mockPrisma.candidatoHabilidad.findUnique.mockResolvedValue(null);
      mockPrisma.candidatoHabilidad.upsert.mockResolvedValue({});

      await expect(service.procesarAnalisis(candidatoId, payload)).resolves.not.toThrow();
      expect(mockPrisma.historialAnalisis.create).toHaveBeenCalled();
    });

    it('debe aceptar skills_detectadas como string JSON (formato Make.com)', async () => {
      const payload = {
        ...basePayload,
        skills_detectadas: JSON.stringify([{ skill: 'Python', nivel_estimado: 'intermedio', confianza: '80' }]) as any,
      };
      mockPrisma.habilidad.upsert.mockResolvedValue({ id: 'hab-py', nombre: 'Python' });
      mockPrisma.candidatoHabilidad.findUnique.mockResolvedValue(null);
      mockPrisma.candidatoHabilidad.upsert.mockResolvedValue({});

      await service.procesarAnalisis(candidatoId, payload);

      expect(mockPrisma.habilidad.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { nombre: 'Python' } }),
      );
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
