import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';

jest.mock('sharp', () => {
  const chain = {
    resize:   jest.fn().mockReturnThis(),
    webp:     jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-webp')),
  };
  return jest.fn(() => chain);
});

const mockUploadStream = jest.fn();
const mockCloudinary = {
  uploader: { upload_stream: mockUploadStream },
};

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        { provide: 'CLOUDINARY', useValue: mockCloudinary },
      ],
    }).compile();
    service = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => jest.clearAllMocks());

  it('está definido', () => {
    expect(service).toBeDefined();
  });

  it('llama a sharp con resize 500x500 y webp quality 80', async () => {
    mockUploadStream.mockImplementation((_opts, cb) => {
      cb(null, { secure_url: 'https://cdn.cloudinary.com/avatar.webp' });
      return { end: jest.fn() };
    });

    await service.uploadAvatar(Buffer.from('img'), 'user-123');

    const sharp = require('sharp');
    expect(sharp).toHaveBeenCalledWith(expect.any(Buffer));
    expect(sharp().resize).toHaveBeenCalledWith(500, 500, { fit: 'cover' });
    expect(sharp().webp).toHaveBeenCalledWith({ quality: 80 });
  });

  it('llama a upload_stream con folder avatars y public_id con userId', async () => {
    mockUploadStream.mockImplementation((_opts, cb) => {
      cb(null, { secure_url: 'https://cdn.cloudinary.com/avatar.webp' });
      return { end: jest.fn() };
    });

    await service.uploadAvatar(Buffer.from('img'), 'user-abc');

    const opts = mockUploadStream.mock.calls[0][0];
    expect(opts.folder).toBe('avatars');
    expect(opts.public_id).toMatch(/^user-abc-/);
    expect(opts.resource_type).toBe('image');
  });

  it('retorna { url } cuando Cloudinary responde correctamente', async () => {
    mockUploadStream.mockImplementation((_opts, cb) => {
      cb(null, { secure_url: 'https://cdn.cloudinary.com/test.webp' });
      return { end: jest.fn() };
    });

    const result = await service.uploadAvatar(Buffer.from('img'), 'user-1');
    expect(result).toEqual({ url: 'https://cdn.cloudinary.com/test.webp' });
  });

  it('rechaza la promesa si Cloudinary retorna error', async () => {
    mockUploadStream.mockImplementation((_opts, cb) => {
      cb(new Error('Cloudinary down'), null);
      return { end: jest.fn() };
    });

    await expect(service.uploadAvatar(Buffer.from('img'), 'user-1'))
      .rejects.toThrow('Cloudinary down');
  });
});
