import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { JwtPayload } from '../common/decorators/current-user.decorator';

describe('CvController', () => {
  let controller: CvController;
  let cvService: jest.Mocked<
    Pick<CvService, 'getAnalisis' | 'procesarAnalisis' | 'uploadCvAndPersist'>
  >;
  let fetchSpy: jest.SpyInstance;

  const mockUser: JwtPayload = {
    userId: 'uuid-candidato-123',
    email: 'test@test.com',
    role: 'candidate',
  };

  const mockFile = {
    originalname: 'mi-cv.pdf',
    mimetype: 'application/pdf',
    buffer: Buffer.from('fake-pdf-content'),
    size: 1024,
  } as Express.Multer.File;

  beforeEach(async () => {
    process.env.WEBHOOK_SECRET = 'reclutaia-make-2024';
    process.env.MAKE_CV_WEBHOOK_URL = 'https://hook.make.com/mock-webhook';
    process.env.MAKE_API_KEY = 'test-api-key';

    const mockCvService = {
      getAnalisis: jest.fn(),
      procesarAnalisis: jest.fn().mockResolvedValue(undefined),
      uploadCvAndPersist: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvController],
      providers: [{ provide: CvService, useValue: mockCvService }],
    }).compile();

    controller = module.get<CvController>(CvController);
    cvService = module.get(CvService);

    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'Accepted',
    } as Response);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.MAKE_CV_WEBHOOK_URL;
    delete process.env.MAKE_API_KEY;
  });

  // ══════════════════════════════════════════════════════
  // POST /cv/analyze
  // ══════════════════════════════════════════════════════

  describe('analyze()', () => {
    it('debe retornar ok:true cuando recibe archivo y usuario válidos', async () => {
      const result = await controller.analyze(mockFile, mockUser);
      expect(result.ok).toBe(true);
      expect(result.message).toBe('CV recibido, procesando...');
    });

    it('debe llamar sendToMake en fire-and-forget con el archivo y userId', async () => {
      const sendSpy = jest.spyOn(controller as any, 'sendToMake').mockResolvedValue(undefined);

      await controller.analyze(mockFile, mockUser);

      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy).toHaveBeenCalledWith(mockFile, mockUser.userId);
    });

    it('debe lanzar BadRequestException si no se recibe archivo', async () => {
      await expect(controller.analyze(undefined as any, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('no debe rechazar aunque sendToMake falle (fire-and-forget)', async () => {
      fetchSpy.mockRejectedValue(new Error('Make.com no disponible'));

      const result = await controller.analyze(mockFile, mockUser);
      await new Promise((r) => setTimeout(r, 10));

      expect(result.ok).toBe(true);
    });
  });

  // ══════════════════════════════════════════════════════
  // sendToMake (privado — accedido via cast a any)
  // ══════════════════════════════════════════════════════

  describe('sendToMake()', () => {
    it('debe incluir candidatoId en el FormData body', async () => {
      await (controller as any).sendToMake(mockFile, 'uuid-test-456');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const body: FormData = fetchSpy.mock.calls[0][1].body;
      expect(body.get('candidatoId')).toBe('uuid-test-456');
    });

    it('debe incluir el archivo como Blob en el campo documento_cv', async () => {
      await (controller as any).sendToMake(mockFile, 'uuid-test-456');

      const body: FormData = fetchSpy.mock.calls[0][1].body;
      const blob = body.get('documento_cv');
      expect(blob).toBeInstanceOf(Blob);
    });

    it('debe incluir candidatoId como query param en la URL', async () => {
      await (controller as any).sendToMake(mockFile, 'uuid-qp-789');

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toContain('candidatoId=uuid-qp-789');
    });

    it('debe enviar el header x-make-apikey', async () => {
      await (controller as any).sendToMake(mockFile, 'uuid-test');

      const [, options] = fetchSpy.mock.calls[0];
      expect(options.headers['x-make-apikey']).toBeDefined();
    });

    it('no debe lanzar si Make responde con status no-ok (solo loguea)', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);

      await expect((controller as any).sendToMake(mockFile, 'uuid-test')).resolves.toBeUndefined();
    });

    it('debe lanzar si fetch falla por error de red', async () => {
      fetchSpy.mockRejectedValue(new Error('Network Error'));

      await expect((controller as any).sendToMake(mockFile, 'uuid-test')).rejects.toThrow(
        'Network Error',
      );
    });
  });

  // ══════════════════════════════════════════════════════
  // GET /cv/analisis
  // ══════════════════════════════════════════════════════

  describe('getAnalisis()', () => {
    it('debe delegar al servicio con userId del JWT si no hay query param', async () => {
      (cvService.getAnalisis as jest.Mock).mockResolvedValue(null);

      const result = await controller.getAnalisis(undefined as any, mockUser);

      expect(cvService.getAnalisis).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toEqual({ ok: true, message: 'Análisis obtenido', data: null });
    });

    it('debe usar candidatoId del query param si se provee', async () => {
      (cvService.getAnalisis as jest.Mock).mockResolvedValue({ id: 'analisis-1' });

      await controller.getAnalisis('otro-candidato-id', mockUser);

      expect(cvService.getAnalisis).toHaveBeenCalledWith('otro-candidato-id');
    });

    it('debe retornar los datos del servicio en data', async () => {
      const analisis = { id: 'a1', score: 85, resumen: 'Perfil sólido' };
      (cvService.getAnalisis as jest.Mock).mockResolvedValue(analisis);

      const result = await controller.getAnalisis(undefined as any, mockUser);

      expect(result).toEqual({ ok: true, message: 'Análisis obtenido', data: analisis });
    });
  });

  // ══════════════════════════════════════════════════════
  // POST /cv/callback
  // ══════════════════════════════════════════════════════

  describe('callback()', () => {
    const VALID_SECRET = 'reclutaia-make-2024';
    const basePayload = { candidatoId: 'uuid-candidato-123' };

    it('debe lanzar UnauthorizedException si el secret es incorrecto', async () => {
      await expect(
        controller.callback('secreto-malo', undefined as any, basePayload),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si no hay secret en el header', async () => {
      await expect(
        controller.callback(undefined as any, undefined as any, basePayload),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar BadRequestException si no hay candidatoId en payload ni query', async () => {
      await expect(controller.callback(VALID_SECRET, undefined as any, {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe procesar el análisis y retornar ok:true con candidatoId en body', async () => {
      const result = await controller.callback(VALID_SECRET, undefined as any, basePayload);

      expect(cvService.procesarAnalisis).toHaveBeenCalledWith(
        'uuid-candidato-123',
        expect.objectContaining({ candidatoId: 'uuid-candidato-123' }),
      );
      expect(result).toEqual({ ok: true, message: 'Análisis procesado' });
    });

    it('debe aceptar candidatoId desde query param si el body no lo tiene', async () => {
      const result = await controller.callback(VALID_SECRET, 'uuid-desde-query', {});

      expect(cvService.procesarAnalisis).toHaveBeenCalledWith(
        'uuid-desde-query',
        expect.any(Object),
      );
      expect(result).toEqual({ ok: true, message: 'Análisis procesado' });
    });

    it('debe parsear datos_del_candidato como string JSON y extraer campos', async () => {
      const payload = {
        candidatoId: 'uuid-candidato-123',
        datos_del_candidato: JSON.stringify({ nombre: 'Juan Test', email: 'j@test.com' }),
      };

      const result = await controller.callback(VALID_SECRET, undefined as any, payload);

      expect(cvService.procesarAnalisis).toHaveBeenCalledWith(
        'uuid-candidato-123',
        expect.objectContaining({ nombre_completo: 'Juan Test' }),
      );
      expect(result).toEqual({ ok: true, message: 'Análisis procesado' });
    });

    it('debe normalizar arrays como JSON array string (formato "[{...}]")', async () => {
      const payload = {
        candidatoId: 'uuid-candidato-123',
        skills_detectadas: '[{"skill":"JavaScript","nivel_estimado":"avanzado"}]',
        tecnologias_detectadas: '["React","Node.js"]',
        idiomas: '[{"idioma":"Inglés","nivel":"avanzado"}]',
      };

      await controller.callback(VALID_SECRET, undefined as any, payload);

      expect(cvService.procesarAnalisis).toHaveBeenCalledWith(
        'uuid-candidato-123',
        expect.objectContaining({
          skills_detectadas: expect.arrayContaining([
            expect.objectContaining({ skill: 'JavaScript' }),
          ]),
          tecnologias_detectadas: ['React', 'Node.js'],
        }),
      );
    });

    it('debe normalizar arrays como string plano separado por comas (tecnologias)', async () => {
      const payload = {
        candidatoId: 'uuid-candidato-123',
        tecnologias_detectadas: 'React, Node.js, TypeScript',
      };

      await controller.callback(VALID_SECRET, undefined as any, payload);

      expect(cvService.procesarAnalisis).toHaveBeenCalledWith(
        'uuid-candidato-123',
        expect.objectContaining({
          tecnologias_detectadas: ['React', 'Node.js', 'TypeScript'],
        }),
      );
    });

    it('debe normalizar arrays como objetos JSON concatenados formato "{...}, {...}"', async () => {
      const payload = {
        candidatoId: 'uuid-candidato-123',
        experiencia_laboral:
          '{"empresa":"Acme","cargo":"Dev","periodo":"2020-2022"},{"empresa":"Corp","cargo":"Lead","periodo":"2022-Actualidad"}',
      };

      await controller.callback(VALID_SECRET, undefined as any, payload);

      expect(cvService.procesarAnalisis).toHaveBeenCalledWith(
        'uuid-candidato-123',
        expect.objectContaining({
          experiencia_laboral: expect.arrayContaining([
            expect.objectContaining({ empresa: 'Acme' }),
            expect.objectContaining({ empresa: 'Corp' }),
          ]),
        }),
      );
    });

    it('debe aceptar candidatoId en variantes de nombre (CandidatoId, candidato_id)', async () => {
      const result1 = await controller.callback(VALID_SECRET, undefined as any, {
        CandidatoId: 'uuid-variant-1',
      });
      expect(result1).toEqual({ ok: true, message: 'Análisis procesado' });

      const result2 = await controller.callback(VALID_SECRET, undefined as any, {
        candidato_id: 'uuid-variant-2',
      });
      expect(result2).toEqual({ ok: true, message: 'Análisis procesado' });
    });
  });
});
