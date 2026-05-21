export function ok(message = 'OK', data?: any) {
  return data !== undefined
    ? { ok: true as const, message, data }
    : { ok: true as const, message };
}
