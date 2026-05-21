export function sumarDiasHabiles(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha);
  let agregados = 0;
  while (agregados < dias) {
    resultado.setDate(resultado.getDate() + 1);
    const diaSemana = resultado.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      agregados++;
    }
  }
  return resultado;
}
