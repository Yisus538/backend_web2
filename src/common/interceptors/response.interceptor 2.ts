import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      map((response) => {
        if (response && typeof response === 'object' && 'ok' in response) return response;
        return { ok: true, message: 'OK', data: response };
      }),
    );
  }
}
