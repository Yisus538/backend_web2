import { Test, TestingModule } from '@nestjs/testing';
import { NavService } from './nav.service';
import { PrismaService } from '../prisma/prisma.service';

const mockMenuItems = [
  {
    ordenRender: 1,
    activePriority: 10,
    menuItem: { itemKey: 'dashboard', icon: 'home', label: 'Dashboard', hashPath: '#/dashboard', activeKeyword: 'dashboard', esFallback: true, esItemConfig: false, activo: true },
  },
  {
    ordenRender: 2,
    activePriority: 5,
    menuItem: { itemKey: 'vacantes', icon: 'work', label: 'Vacantes', hashPath: '#/vacantes', activeKeyword: 'vacantes', esFallback: false, esItemConfig: false, activo: true },
  },
  {
    ordenRender: 3,
    activePriority: 1,
    menuItem: { itemKey: 'config', icon: 'settings', label: 'Config', hashPath: '#/configuraciones', activeKeyword: 'configuraciones', esFallback: false, esItemConfig: true, activo: false },
  },
];

const mockPrisma = {
  menuConfigRol: { findUnique: jest.fn() },
  rolMenu:       { findMany:   jest.fn() },
};

describe('NavService', () => {
  let service: NavService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NavService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<NavService>(NavService);
  });

  afterEach(() => jest.clearAllMocks());

  it('está definido', () => expect(service).toBeDefined());

  it('retorna subtitle y config_hash desde MenuConfigRol', async () => {
    mockPrisma.menuConfigRol.findUnique.mockResolvedValue({
      subtitle: 'Portal Empresa', configHash: '#/empresa/configuraciones',
    });
    mockPrisma.rolMenu.findMany.mockResolvedValue([]);

    const result = await service.getNavForRole('company');
    expect(result.subtitle).toBe('Portal Empresa');
    expect(result.config_hash).toBe('#/empresa/configuraciones');
  });

  it('usa fallbacks cuando MenuConfigRol no existe', async () => {
    mockPrisma.menuConfigRol.findUnique.mockResolvedValue(null);
    mockPrisma.rolMenu.findMany.mockResolvedValue([]);

    const result = await service.getNavForRole('unknown');
    expect(result.subtitle).toBe('Panel');
    expect(result.config_hash).toBe('#/configuraciones');
  });

  it('filtra items inactivos (activo: false)', async () => {
    mockPrisma.menuConfigRol.findUnique.mockResolvedValue(null);
    mockPrisma.rolMenu.findMany.mockResolvedValue(mockMenuItems);

    const result = await service.getNavForRole('company');
    expect(result.items).toHaveLength(2);
    expect(result.items.every(i => i.id !== 'config')).toBe(true);
  });

  it('mapea correctamente las propiedades de cada item', async () => {
    mockPrisma.menuConfigRol.findUnique.mockResolvedValue(null);
    mockPrisma.rolMenu.findMany.mockResolvedValue([mockMenuItems[0]]);

    const result = await service.getNavForRole('company');
    const item = result.items[0];

    expect(item).toEqual({
      id:            'dashboard',
      icon:          'home',
      label:         'Dashboard',
      hash:          '#/dashboard',
      activeKeyword: 'dashboard',
      esFallback:    true,
      esConfig:      false,
      activePriority: 10,
    });
  });

  it('retorna items vacíos si no hay rolMenu configurado', async () => {
    mockPrisma.menuConfigRol.findUnique.mockResolvedValue(null);
    mockPrisma.rolMenu.findMany.mockResolvedValue([]);

    const result = await service.getNavForRole('candidate');
    expect(result.items).toEqual([]);
  });
});
