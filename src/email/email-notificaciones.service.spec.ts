import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
const mockVerify   = jest.fn().mockResolvedValue(true);

(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: mockSendMail,
  verify:   mockVerify,
});

describe('EmailService — métodos de notificación', () => {
  let service: EmailService;

  beforeEach(async () => {
    process.env.MAIL_USER   = 'test@gmail.com';
    process.env.MAIL_PASS   = 'test-app-password';
    process.env.RESEND_FROM = 'ReclutaIA <test@gmail.com>';

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
    // Ejecutar onModuleInit manualmente (NestJS lo hace automáticamente en prod)
    await service.onModuleInit();
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

  it.each(METODOS)('%s llama a sendMail con los datos correctos', async (method, args) => {
    await (service as any)[method](...args);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'e@t.com' }),
    );
  });

  it('omite el envío si MAIL_USER no está configurado', async () => {
    delete process.env.MAIL_USER;
    delete process.env.MAIL_PASS;
    // Nuevo servicio sin credenciales
    const module2 = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();
    const service2 = module2.get<EmailService>(EmailService);
    await service2.onModuleInit();

    await service2.sendPostulacionRecibida('e@t.com', 'Juan', 'Dev', 'Co');
    // No debe lanzar ni llamar a sendMail
    expect(mockSendMail).not.toHaveBeenCalled();
  });
});
