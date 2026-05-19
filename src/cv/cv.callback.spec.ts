/**
 * Tests del endpoint GET /api/cv/analisis-activo
 * Este es el endpoint que el frontend pollea tras subir un CV para saber
 * cuándo Make.com terminó el análisis y obtener los datos generados.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../common/decorators/current-user.decorator';

describe('CvController — getAnalisisActivo()', () => {
  let controller: CvController;
  let cvService: { getAnalisisActivo: jest.Mock; getAnalisis: jest.Mock; procesarAnalisis: jest.Mock };

  const mockUser: JwtPayload = {
    userId: 'uuid-candidato-test',
    email:  'test@reclutaia.com',
    role:   'candidate',
  };

  const analisisCompleto = {
    id:              'uuid-analisis-1',
    score:           85,
    apto:            true,
    resumen:         'Candidato con experiencia en backend',
    puestoEvaluado:  'Desarrollador Backend Senior',
    analizadoEl:     new Date('2026-05-14T00:00:00Z'),
    educacionGenerada:   [{ id: 'e1', titulo: 'Ingeniería en Sistemas', institucion: 'UTN' }],
    experienciaGenerada: [{ id: 'x1', cargo: 'Dev Backend', empresa: 'Tech Corp' }],
    idiomasGenerados:    [{ id: 'i1', idioma: 'Inglés', nivel: 'avanzado' }],
  };

  beforeEach(async () => {
    cvService = {
      getAnalisisActivo: jest.fn(),
      getAnalisis:       jest.fn(),
      procesarAnalisis:  jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvController],
      providers: [
        { provide: CvService,         useValue: cvService },
        { provide: CloudinaryService, useValue: { uploadFile: jest.fn() } },
        { provide: PrismaService,     useValue: {} },
      ],
    }).compile();

    controller = module.get<CvController>(CvController);
  });

  afterEach(() => jest.clearAllMocks());

  // ── Casos de éxito ──────────────────────────────────────────────

  it('debe retornar ok:true con el análisis más reciente del candidato', async () => {
    cvService.getAnalisisActivo.mockResolvedValue(analisisCompleto);

    const result = await controller.getAnalisisActivo(mockUser);

    expect(result).toEqual({
      ok:      true,
      message: 'Análisis obtenido',
      data:    { analisis: analisisCompleto },
    });
  });

  it('debe delegar a cvService.getAnalisisActivo con el userId del JWT', async () => {
    cvService.getAnalisisActivo.mockResolvedValue(null);

    await controller.getAnalisisActivo(mockUser);

    expect(cvService.getAnalisisActivo).toHaveBeenCalledTimes(1);
    expect(cvService.getAnalisisActivo).toHaveBeenCalledWith(mockUser.userId);
  });

  it('debe retornar data.analisis = null si el candidato no tiene análisis', async () => {
    cvService.getAnalisisActivo.mockResolvedValue(null);

    const result = await controller.getAnalisisActivo(mockUser);

    expect(result.ok).toBe(true);
    expect(result.data.analisis).toBeNull();
  });

  it('debe incluir los datos de educación, experiencia e idiomas generados', async () => {
    cvService.getAnalisisActivo.mockResolvedValue(analisisCompleto);

    const result = await controller.getAnalisisActivo(mockUser);

    expect(result.data.analisis.educacionGenerada).toHaveLength(1);
    expect(result.data.analisis.educacionGenerada[0].titulo).toBe('Ingeniería en Sistemas');
    expect(result.data.analisis.experienciaGenerada).toHaveLength(1);
    expect(result.data.analisis.idiomasGenerados).toHaveLength(1);
  });

  it('debe exponer el score del análisis en la respuesta', async () => {
    cvService.getAnalisisActivo.mockResolvedValue(analisisCompleto);

    const result = await controller.getAnalisisActivo(mockUser);

    expect(result.data.analisis.score).toBe(85);
    expect(result.data.analisis.apto).toBe(true);
  });

  it('debe manejar análisis con score null (aún no procesado)', async () => {
    const sinScore = { ...analisisCompleto, score: null, apto: null };
    cvService.getAnalisisActivo.mockResolvedValue(sinScore);

    const result = await controller.getAnalisisActivo(mockUser);

    expect(result.data.analisis.score).toBeNull();
    expect(result.data.analisis.apto).toBeNull();
  });

  it('NO debe llamar a getAnalisis (endpoint diferente, no confundir)', async () => {
    cvService.getAnalisisActivo.mockResolvedValue(null);

    await controller.getAnalisisActivo(mockUser);

    expect(cvService.getAnalisis).not.toHaveBeenCalled();
  });
});
