export function parseJsonArray(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (typeof v !== 'string' || !v.trim()) return [];
  const t = v.trim();
  if (t.startsWith('[')) {
    try { return JSON.parse(t); } catch { /* continuar */ }
  }
  if (t.startsWith('{')) {
    try { return JSON.parse('[' + t + ']'); } catch { /* continuar */ }
    try {
      return t.split(/\}\s*,\s*\{/).map((p) => {
        let s = p.trim();
        if (!s.startsWith('{')) s = '{' + s;
        if (!s.endsWith('}')) s = s + '}';
        return JSON.parse(s);
      });
    } catch { /* continuar */ }
  }
  return t.split(/[,;]/).map((s: string) => s.trim()).filter(Boolean);
}
