/**
 * Test de integración del flujo CV:
 * Verifica que al subir CVs, candidatoId llega correctamente a Make.com
 * y que el webhook recibiría los datos necesarios para hacer UPSERT por candidato.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { JwtPayload } from '../common/decorators/current-user.decorator';

describe('CV Flow — Integración', () => {
  let controller: CvController;
  let fetchSpy: jest.SpyInstance;

  const candidato1: JwtPayload = {
    userId: 'uuid-candidato-A',
    email: 'juan@test.com',
    role: 'candidate',
  };

  const makeFile = (name: string): Express.Multer.File =>
    ({
      originalname: name,
      mimetype: 'application/pdf',
      buffer: Buffer.from(`contenido-de-${name}`),
      size: 2048,
    }) as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvController],
      providers: [
        {
          provide: CvService,
          useValue: {
            getAnalisis: jest.fn().mockResolvedValue(null),
            procesarAnalisis: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<CvController>(CvController);

    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'Accepted',
    } as Response);
  });

  afterEach(() => jest.clearAllMocks());

  it('primer CV: Make recibe candidatoId correcto y el archivo', async () => {
    await controller.analyze(makeFile('cv-v1.pdf'), candidato1);
    await new Promise(r => setTimeout(r, 10));

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, options] = fetchSpy.mock.calls[0];
    const body: FormData = options.body;

    expect(url).toContain('make.com');
    expect(body.get('candidatoId')).toBe(candidato1.userId);
    expect(body.get('documento_cv')).toBeInstanceOf(Blob);
  });

  it('segundo CV del mismo candidato: Make recibe el MISMO candidatoId (permite UPSERT)', async () => {
    await controller.analyze(makeFile('cv-v1.pdf'), candidato1);
    await new Promise(r => setTimeout(r, 10));

    await controller.analyze(makeFile('cv-v2.pdf'), candidato1);
    await new Promise(r => setTimeout(r, 10));

    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const body1: FormData = fetchSpy.mock.calls[0][1].body;
    const body2: FormData = fetchSpy.mock.calls[1][1].body;

    expect(body1.get('candidatoId')).toBe(candidato1.userId);
    expect(body2.get('candidatoId')).toBe(candidato1.userId);
  });

  it('dos candidatos distintos: Make recibe candidatoIds distintos', async () => {
    const candidato2: JwtPayload = {
      userId: 'uuid-candidato-B',
      email: 'ana@test.com',
      role: 'candidate',
    };

    await controller.analyze(makeFile('cv-juan.pdf'), candidato1);
    await controller.analyze(makeFile('cv-ana.pdf'), candidato2);
    await new Promise(r => setTimeout(r, 10));

    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const body1: FormData = fetchSpy.mock.calls[0][1].body;
    const body2: FormData = fetchSpy.mock.calls[1][1].body;

    expect(body1.get('candidatoId')).toBe('uuid-candidato-A');
    expect(body2.get('candidatoId')).toBe('uuid-candidato-B');
  });

  it('la URL enviada a Make incluye candidatoId como query param', async () => {
    await controller.analyze(makeFile('cv-test.pdf'), candidato1);
    await new Promise(r => setTimeout(r, 10));

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain(`candidatoId=${encodeURIComponent(candidato1.userId)}`);
  });
});
