import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  idioma: {
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    delete:    jest.fn(),
  },
  educacion: {
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    delete:    jest.fn(),
  },
  experienciaLaboral: {
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    delete:    jest.fn(),
  },
};

describe('CurriculumService', () => {
  let service: CurriculumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurriculumService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<CurriculumService>(CurriculumService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getIdiomas', () => {
    it('llama a prisma.idioma.findMany con el userId correcto', async () => {
      mockPrisma.idioma.findMany.mockResolvedValue([]);
      await service.getIdiomas('user-1');
      expect(mockPrisma.idioma.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { candidatoId: 'user-1' } }),
      );
    });
  });

  describe('addIdioma', () => {
    it('crea un idioma válido', async () => {
      mockPrisma.idioma.findFirst.mockResolvedValue(null);
      mockPrisma.idioma.create.mockResolvedValue({ id: '1', idioma: 'Inglés', nivel: 'avanzado' });
      const result = await service.addIdioma('user-1', { idioma: 'Inglés', nivel: 'avanzado' });
      expect(result).toEqual(expect.objectContaining({ idioma: 'Inglés' }));
    });

    it('lanza BadRequestException si falta idioma', async () => {
      await expect(service.addIdioma('user-1', { nivel: 'basico' }))
        .rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si falta nivel', async () => {
      await expect(service.addIdioma('user-1', { idioma: 'Inglés' }))
        .rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si nivel es inválido', async () => {
      await expect(service.addIdioma('user-1', { idioma: 'Inglés', nivel: 'experto' }))
        .rejects.toThrow(BadRequestException);
    });

    it('lanza ConflictException si el idioma ya existe', async () => {
      mockPrisma.idioma.findFirst.mockResolvedValue({ id: '99' });
      await expect(service.addIdioma('user-1', { idioma: 'Inglés', nivel: 'avanzado' }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('updateIdioma', () => {
    it('lanza BadRequestException si no se pasa id', async () => {
      await expect(service.updateIdioma('user-1', { nivel: 'nativo' }))
        .rejects.toThrow(BadRequestException);
    });

    it('lanza NotFoundException si el registro no pertenece al usuario', async () => {
      mockPrisma.idioma.findFirst.mockResolvedValue(null);
      await expect(service.updateIdioma('user-1', { id: 'x', nivel: 'nativo' }))
        .rejects.toThrow(NotFoundException);
    });

    it('actualiza correctamente cuando existe', async () => {
      mockPrisma.idioma.findFirst.mockResolvedValue({ id: 'x' });
      mockPrisma.idioma.update.mockResolvedValue({ id: 'x', nivel: 'nativo' });
      const result = await service.updateIdioma('user-1', { id: 'x', nivel: 'nativo' });
      expect(result).toEqual(expect.objectContaining({ nivel: 'nativo' }));
    });
  });

  describe('deleteIdioma', () => {
    it('lanza BadRequestException si no se pasa id', async () => {
      await expect(service.deleteIdioma('user-1', '')).rejects.toThrow(BadRequestException);
    });

    it('lanza NotFoundException si el id no pertenece al usuario', async () => {
      mockPrisma.idioma.findFirst.mockResolvedValue(null);
      await expect(service.deleteIdioma('user-1', 'x')).rejects.toThrow(NotFoundException);
    });

    it('elimina correctamente cuando existe', async () => {
      mockPrisma.idioma.findFirst.mockResolvedValue({ id: 'x' });
      mockPrisma.idioma.delete.mockResolvedValue({});
      await service.deleteIdioma('user-1', 'x');
      expect(mockPrisma.idioma.delete).toHaveBeenCalledWith({ where: { id: 'x' } });
    });
  });

  describe('addEducacion', () => {
    it('lanza BadRequestException si falta institucion', async () => {
      await expect(service.addEducacion('user-1', { titulo: 'Lic.', fechaInicio: '2020-01' }))
        .rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si falta titulo', async () => {
      await expect(service.addEducacion('user-1', { institucion: 'UNC', fechaInicio: '2020-01' }))
        .rejects.toThrow(BadRequestException);
    });

    it('crea educación válida', async () => {
      mockPrisma.educacion.create.mockResolvedValue({ id: '1' });
      const result = await service.addEducacion('user-1', {
        institucion: 'UNC', titulo: 'Lic. Informática', fechaInicio: '2020-01',
      });
      expect(result).toBeDefined();
    });
  });

  describe('deleteEducacion', () => {
    it('lanza NotFoundException si no pertenece al usuario', async () => {
      mockPrisma.educacion.findFirst.mockResolvedValue(null);
      await expect(service.deleteEducacion('user-1', 'x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addExperiencia', () => {
    it('lanza BadRequestException si falta empresa', async () => {
      await expect(service.addExperiencia('user-1', { cargo: 'Dev', fechaInicio: '2020-01' }))
        .rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si falta cargo', async () => {
      await expect(service.addExperiencia('user-1', { empresa: 'Acme', fechaInicio: '2020-01' }))
        .rejects.toThrow(BadRequestException);
    });

    it('crea experiencia válida', async () => {
      mockPrisma.experienciaLaboral.create.mockResolvedValue({ id: '1' });
      const result = await service.addExperiencia('user-1', {
        empresa: 'Acme', cargo: 'Developer', fechaInicio: '2022-01',
      });
      expect(result).toBeDefined();
    });
  });

  describe('deleteExperiencia', () => {
    it('lanza NotFoundException si no pertenece al usuario', async () => {
      mockPrisma.experienciaLaboral.findFirst.mockResolvedValue(null);
      await expect(service.deleteExperiencia('user-1', 'x')).rejects.toThrow(NotFoundException);
    });
  });
});
