import { NextResponse } from 'next/server';
import { ApiResponse } from '../types';

// Helper para respuestas JSON tipadas
export const apiResponse = <T = unknown>(
  data: ApiResponse<T>,
  status = 200,
): NextResponse => NextResponse.json(data, { status });

export const ok = <T = unknown>(message: string, data?: T): NextResponse =>
  apiResponse({ success: true, message, data }, 200);

export const created = <T = unknown>(message: string, data?: T): NextResponse =>
  apiResponse({ success: true, message, data }, 201);

export const badRequest = (
  message: string,
  errors?: { field: string; message: string }[],
): NextResponse => apiResponse({ success: false, message, errors }, 400);

export const unauthorized = (message: string): NextResponse =>
  apiResponse({ success: false, message }, 401);

export const forbidden = (message: string): NextResponse =>
  apiResponse({ success: false, message }, 403);

export const conflict = (message: string): NextResponse =>
  apiResponse({ success: false, message }, 409);

export const locked = (message: string): NextResponse =>
  apiResponse({ success: false, message }, 423);

export const serverError = (message = 'Error interno del servidor'): NextResponse =>
  apiResponse({ success: false, message }, 500);

export const tooManyRequests = (message: string): NextResponse =>
  apiResponse({ success: false, message }, 429);
