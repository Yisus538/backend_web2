import { ResponseInterceptor } from './response.interceptor';
import { of } from 'rxjs';

const mockCallHandler = (returnValue: unknown) => ({
  handle: () => of(returnValue),
});

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;

  beforeEach(() => { interceptor = new ResponseInterceptor(); });

  it('está definido', () => expect(interceptor).toBeDefined());

  it('pasa sin modificar si el handler ya retorna { ok, message }', (done) => {
    const response = { ok: true, message: 'Vacante creada', data: { id: '1' } };
    interceptor.intercept({} as any, mockCallHandler(response) as any).subscribe((result) => {
      expect(result).toEqual(response);
      done();
    });
  });

  it('envuelve respuestas desnudas en { ok, message, data }', (done) => {
    const response = { id: '1', name: 'Test' };
    interceptor.intercept({} as any, mockCallHandler(response) as any).subscribe((result: any) => {
      expect(result.ok).toBe(true);
      expect(result.message).toBe('OK');
      expect(result.data).toEqual(response);
      done();
    });
  });

  it('maneja null correctamente', (done) => {
    interceptor.intercept({} as any, mockCallHandler(null) as any).subscribe((result: any) => {
      expect(result.ok).toBe(true);
      expect(result.data).toBeNull();
      done();
    });
  });

  it('pasa sin modificar si ok es false (error ya formateado)', (done) => {
    const errResponse = { ok: false, message: 'No encontrado' };
    interceptor.intercept({} as any, mockCallHandler(errResponse) as any).subscribe((result) => {
      expect(result).toEqual(errResponse);
      done();
    });
  });
});
