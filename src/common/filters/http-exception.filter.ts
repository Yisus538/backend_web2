import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        // NestJS class-validator ValidationPipe emite { message: string[] }
        if (Array.isArray(res.message)) {
          message = 'Datos inválidos';
          errors  = res.message.map((m: string) => ({ field: 'unknown', message: m }));
        } else {
          message = res.message || message;
          errors  = res.errors;
        }
      }
    } else {
      this.logger.error(
        `Unhandled exception [${request.method} ${request.url}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      ok:      false,
      message,
      ...(errors ? { errors } : {}),
    });
  }
}
