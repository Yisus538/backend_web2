import { Test } from '@nestjs/testing';
import { MensajesController } from './mensajes.controller';
import { MensajesService } from './mensajes.service';

const mockService = {
  listar:             jest.fn(),
  obtenerMensajes:    jest.fn(),
  enviar:             jest.fn(),
  marcarLeidos:       jest.fn(),
  contarNoLeidos:     jest.fn(),
  crearConversacion:  jest.fn(),
};

const user = { userId: 'u1', email: 'a@b.com', role: 'company' };

describe('MensajesController', () => {
  let controller: MensajesController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [MensajesController],
      providers: [{ provide: MensajesService, useValue: mockService }],
    }).compile();
    controller = module.get<MensajesController>(MensajesController);
  });

  afterEach(() => jest.clearAllMocks());

  it('GET conversaciones — llama listar y responde ok:true', async () => {
    mockService.listar.mockResolvedValue([]);
    const res = await controller.listar(user);
    expect(res.ok).toBe(true);
    expect(mockService.listar).toHaveBeenCalledWith('u1', 'company');
  });

  it('POST conversaciones — llama crearConversacion y responde ok:true', async () => {
    mockService.crearConversacion.mockResolvedValue({ id: 'conv-1' });
    const res = await controller.crear(user, { postulacionId: 'post-1' });
    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ id: 'conv-1' });
  });

  it('GET conversaciones/:convId — llama obtenerMensajes y responde ok:true', async () => {
    mockService.obtenerMensajes.mockResolvedValue([{ id: 'm1', texto: 'Hola' }]);
    const res = await controller.obtenerMensajes(user, 'conv-1');
    expect(res.ok).toBe(true);
    expect(mockService.obtenerMensajes).toHaveBeenCalledWith('u1', 'conv-1');
  });

  it('PATCH conversaciones/:convId/leer — llama marcarLeidos y responde ok:true', async () => {
    mockService.marcarLeidos.mockResolvedValue(undefined);
    const res = await controller.marcarLeidos(user, 'conv-1');
    expect(res.ok).toBe(true);
    expect(mockService.marcarLeidos).toHaveBeenCalledWith('u1', 'conv-1');
  });

  it('GET no-leidos — llama contarNoLeidos y responde ok:true', async () => {
    mockService.contarNoLeidos.mockResolvedValue({ total: 3 });
    const res = await controller.contarNoLeidos(user);
    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ total: 3 });
  });

  it('POST mensajes — llama enviar y responde ok:true', async () => {
    const msg = { id: 'm1', texto: 'Hola', creadoEn: '2026-01-01', esPropio: true };
    mockService.enviar.mockResolvedValue(msg);
    const res = await controller.enviar(user, { conversacionId: 'conv-1', texto: 'Hola' });
    expect(res.ok).toBe(true);
    expect(res.data).toEqual(msg);
  });
});
