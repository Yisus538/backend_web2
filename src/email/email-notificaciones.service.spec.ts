import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

global.fetch = jest.fn();

describe('EmailService — métodos de notificación', () => {
  let service: EmailService;

  beforeEach(async () => {
    process.env.RESEND_API_KEY = 'test-key';
    process.env.RESEND_FROM    = 'test@resend.dev';
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email-123' }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();
    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => jest.clearAllMocks());

  const METODOS: [string, any[]][] = [
    ['sendPostulacionRecibida',      ['e@t.com', 'Juan', 'Dev', 'TechCo']],
    ['sendEntrevistaAgendada',        ['e@t.com', 'Juan', 'Dev', 'TechCo', 85, new Date()]],
    ['sendCandidatoAceptadoEmpresa',  ['e@t.com', 'TechCo', 'Juan', 'Dev', 85, ['TS']]],
    ['sendPostulantePendiente',       ['e@t.com', 'Dev', 'Juan']],
    ['sendConfirmacionEntrevista',    ['e@t.com', 'Juan', 'Dev', new Date(), 'https://meet.g', null, 'remota']],
    ['sendRecordatorioEntrevista',    ['e@t.com', 'Juan', 'Dev', new Date(), 'https://meet.g']],
    ['sendFinalistaNotification',     ['e@t.com', 'Juan', 'Dev']],
    ['sendRechazoPostulacion',        ['e@t.com', 'Juan', 'Dev', ['TS'], ['Docker']]],
    ['sendContratadoNotification',    ['e@t.com', 'Juan', 'Dev']],
  ];

  it.each(METODOS)('%s llama a fetch con los datos correctos', async (method, args) => {
    await (service as any)[method](...args);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('no lanza si RESEND_API_KEY no está configurada — lanza error descriptivo', async () => {
    delete process.env.RESEND_API_KEY;
    await expect(
      service.sendPostulacionRecibida('e@t.com', 'Juan', 'Dev', 'Co')
    ).rejects.toThrow('RESEND_API_KEY no configurada');
  });
});
