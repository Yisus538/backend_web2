import { Test } from '@nestjs/testing';
import { MensajesService } from './mensajes.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

const mockConv = {
  id: 'conv-1',
  creadaEl: new Date('2026-01-01T10:00:00Z'),
  mensajes: [{ texto: 'Hola', creadoEn: new Date('2026-01-01T10:00:00Z') }],
  postulacion: {
    candidatoId: 'candidato-1',
    oferta: {
      id: 'oferta-1',
      titulo: 'Dev Frontend',
      empresaId: 'empresa-1',
      empresa: {
        usuarioId: 'empresa-1',
        nombreEmpresa: 'TechCorp',
        usuario: { id: 'empresa-1', fullName: 'TechCorp' },
      },
    },
    candidato: { usuario: { id: 'candidato-1', fullName: 'Juan García' } },
  },
};

const mockPrisma = {
  conversacion: {
    findMany:  jest.fn(),
    findUnique: jest.fn(),
    create:    jest.fn(),
  },
  mensaje: {
    findMany:    jest.fn(),
    findFirst:   jest.fn(),
    create:      jest.fn(),
    updateMany:  jest.fn(),
    count:       jest.fn(),
    groupBy:     jest.fn(),
  },
  postulacion: {
    findUnique: jest.fn(),
  },
};

describe('MensajesService', () => {
  let service: MensajesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MensajesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<MensajesService>(MensajesService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── listar() ─────────────────────────────────────────────────────
  describe('listar()', () => {
    it('retorna lista vacía si no hay conversaciones', async () => {
      mockPrisma.conversacion.findMany.mockResolvedValue([]);
      const result = await service.listar('candidato-1', 'candidate');
      expect(result).toEqual([]);
      expect(mockPrisma.mensaje.groupBy).not.toHaveBeenCalled();
    });

    it('retorna conversaciones formateadas para candidato', async () => {
      mockPrisma.conversacion.findMany.mockResolvedValue([mockConv]);
      mockPrisma.mensaje.groupBy.mockResolvedValue([
        { conversacionId: 'conv-1', _count: { id: 2 } },
      ]);

      const result = await service.listar('candidato-1', 'candidate');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('conv-1');
      expect(result[0].noLeidos).toBe(2);
      expect(result[0].participante.nombre).toBe('TechCorp');
      expect(result[0].vacanteTitulo).toBe('Dev Frontend');
    });

    it('retorna conversaciones formateadas para empresa', async () => {
      mockPrisma.conversacion.findMany.mockResolvedValue([mockConv]);
      mockPrisma.mensaje.groupBy.mockResolvedValue([]);

      const result = await service.listar('empresa-1', 'company');

      expect(result[0].participante.nombre).toBe('Juan García');
      expect(result[0].noLeidos).toBe(0);
    });

    it('usa creadaEl cuando no hay mensajes', async () => {
      const convSinMensajes = { ...mockConv, mensajes: [] };
      mockPrisma.conversacion.findMany.mockResolvedValue([convSinMensajes]);
      mockPrisma.mensaje.groupBy.mockResolvedValue([]);

      const result = await service.listar('candidato-1', 'candidate');

      expect(result[0].ultimaFecha).toBe(mockConv.creadaEl.toISOString());
      expect(result[0].ultimoMensaje).toBe('');
    });
  });

  // ── obtenerMensajes() ─────────────────────────────────────────────
  describe('obtenerMensajes()', () => {
    const mockMsgs = [
      { id: 'm1', texto: 'Hola', creadoEn: new Date('2026-01-01T10:00:00Z'), autorId: 'candidato-1' },
      { id: 'm2', texto: 'Buenos días', creadoEn: new Date('2026-01-01T11:00:00Z'), autorId: 'empresa-1' },
    ];

    it('retorna mensajes con esPropio correcto', async () => {
      mockPrisma.conversacion.findUnique.mockResolvedValue(mockConv);
      mockPrisma.mensaje.findMany.mockResolvedValue(mockMsgs);

      const result = await service.obtenerMensajes('candidato-1', 'conv-1');

      expect(result).toHaveLength(2);
      expect(result[0].esPropio).toBe(true);
      expect(result[1].esPropio).toBe(false);
    });

    it('lanza NotFoundException si la conversación no existe', async () => {
      mockPrisma.conversacion.findUnique.mockResolvedValue(null);

      await expect(service.obtenerMensajes('candidato-1', 'conv-x')).rejects.toThrow(NotFoundException);
    });

    it('lanza ForbiddenException si el usuario no es participante', async () => {
      mockPrisma.conversacion.findUnique.mockResolvedValue(mockConv);

      await expect(service.obtenerMensajes('otro-usuario', 'conv-1')).rejects.toThrow(ForbiddenException);
    });
  });

  // ── enviar() ──────────────────────────────────────────────────────
  describe('enviar()', () => {
    const dto = { conversacionId: 'conv-1', texto: 'Hola mundo' };

    it('crea y retorna el mensaje con esPropio: true', async () => {
      mockPrisma.conversacion.findUnique.mockResolvedValue(mockConv);
      mockPrisma.mensaje.create.mockResolvedValue({
        id: 'msg-new',
        texto: 'Hola mundo',
        creadoEn: new Date('2026-01-01T12:00:00Z'),
      });

      const result = await service.enviar('candidato-1', dto);

      expect(result.esPropio).toBe(true);
      expect(result.texto).toBe('Hola mundo');
      expect(mockPrisma.mensaje.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { conversacionId: 'conv-1', autorId: 'candidato-1', texto: 'Hola mundo' },
        }),
      );
    });

    it('lanza BadRequestException si texto está vacío', async () => {
      await expect(service.enviar('candidato-1', { ...dto, texto: '   ' })).rejects.toThrow(BadRequestException);
    });

    it('lanza ForbiddenException si el usuario no es participante', async () => {
      mockPrisma.conversacion.findUnique.mockResolvedValue(mockConv);

      await expect(service.enviar('intruso', dto)).rejects.toThrow(ForbiddenException);
    });
  });

  // ── marcarLeidos() ────────────────────────────────────────────────
  describe('marcarLeidos()', () => {
    it('actualiza mensajes no leídos del otro participante', async () => {
      mockPrisma.conversacion.findUnique.mockResolvedValue(mockConv);
      mockPrisma.mensaje.updateMany.mockResolvedValue({ count: 2 });

      await service.marcarLeidos('candidato-1', 'conv-1');

      expect(mockPrisma.mensaje.updateMany).toHaveBeenCalledWith({
        where: { conversacionId: 'conv-1', autorId: { not: 'candidato-1' }, leido: false },
        data: { leido: true },
      });
    });

    it('lanza ForbiddenException si el usuario no es participante', async () => {
      mockPrisma.conversacion.findUnique.mockResolvedValue(mockConv);

      await expect(service.marcarLeidos('intruso', 'conv-1')).rejects.toThrow(ForbiddenException);
    });
  });

  // ── contarNoLeidos() ──────────────────────────────────────────────
  describe('contarNoLeidos()', () => {
    it('retorna el total de mensajes no leídos', async () => {
      mockPrisma.mensaje.count.mockResolvedValue(5);

      const result = await service.contarNoLeidos('candidato-1');

      expect(result).toEqual({ total: 5 });
    });

    it('retorna 0 si no hay mensajes no leídos', async () => {
      mockPrisma.mensaje.count.mockResolvedValue(0);

      const result = await service.contarNoLeidos('candidato-1');

      expect(result).toEqual({ total: 0 });
    });
  });

  // ── crearConversacion() ───────────────────────────────────────────
  describe('crearConversacion()', () => {
    const mockPostCompleto = {
      id: 'post-1',
      candidatoId: 'candidato-1',
      oferta: {
        id: 'oferta-1',
        titulo: 'Dev Frontend',
        empresaId: 'empresa-1',
        empresa: {
          usuarioId: 'empresa-1',
          nombreEmpresa: 'TechCorp',
          usuario: { id: 'empresa-1', fullName: 'TechCorp SA' },
        },
      },
      candidato: { usuario: { id: 'candidato-1', fullName: 'Juan García' } },
    };

    beforeEach(() => {
      mockPrisma.mensaje.count.mockResolvedValue(0);
      mockPrisma.mensaje.findFirst.mockResolvedValue(null);
    });

    it('devuelve la conversación existente con shape completo', async () => {
      mockPrisma.postulacion.findUnique.mockResolvedValue(mockPostCompleto);
      mockPrisma.conversacion.findUnique.mockResolvedValue({ id: 'conv-exist' });

      const result = await service.crearConversacion('candidato-1', 'candidate', { postulacionId: 'post-1' });

      expect(result.id).toBe('conv-exist');
      expect(result.participante.nombre).toBe('TechCorp');
      expect(result.vacanteTitulo).toBe('Dev Frontend');
      expect(result.noLeidos).toBe(0);
      expect(mockPrisma.conversacion.create).not.toHaveBeenCalled();
    });

    it('crea nueva conversación y devuelve shape completo', async () => {
      mockPrisma.postulacion.findUnique.mockResolvedValue(mockPostCompleto);
      mockPrisma.conversacion.findUnique.mockResolvedValue(null);
      mockPrisma.conversacion.create.mockResolvedValue({ id: 'conv-nueva' });

      const result = await service.crearConversacion('empresa-1', 'company', { postulacionId: 'post-1' });

      expect(result.id).toBe('conv-nueva');
      expect(result.participante.nombre).toBe('Juan García');
      expect(result.vacanteId).toBe('oferta-1');
      expect(mockPrisma.conversacion.create).toHaveBeenCalledWith({
        data: { postulacionId: 'post-1' },
        select: { id: true },
      });
    });

    it('devuelve noLeidos correcto cuando hay mensajes sin leer', async () => {
      mockPrisma.postulacion.findUnique.mockResolvedValue(mockPostCompleto);
      mockPrisma.conversacion.findUnique.mockResolvedValue({ id: 'conv-exist' });
      mockPrisma.mensaje.count.mockResolvedValue(3);
      mockPrisma.mensaje.findFirst.mockResolvedValue({
        texto: 'Último mensaje',
        creadoEn: new Date('2026-05-01T10:00:00Z'),
      });

      const result = await service.crearConversacion('empresa-1', 'company', { postulacionId: 'post-1' });

      expect(result.noLeidos).toBe(3);
      expect(result.ultimoMensaje).toBe('Último mensaje');
    });

    it('lanza NotFoundException si la postulación no existe', async () => {
      mockPrisma.postulacion.findUnique.mockResolvedValue(null);

      await expect(
        service.crearConversacion('candidato-1', 'candidate', { postulacionId: 'no-existe' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza ForbiddenException si el usuario no es participante', async () => {
      mockPrisma.postulacion.findUnique.mockResolvedValue(mockPostCompleto);

      await expect(
        service.crearConversacion('intruso', 'candidate', { postulacionId: 'post-1' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
