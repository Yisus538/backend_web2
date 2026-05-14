import { calcMatchScore } from './match-score.utils';

describe('calcMatchScore', () => {
  it('retorna 75 cuando no hay requisitos definidos', () => {
    expect(calcMatchScore(['JavaScript'], null)).toBe(75);
  });

  it('retorna 75 cuando requisitos están vacíos', () => {
    expect(calcMatchScore(['JS'], { techSkills: [], softSkills: [] })).toBe(75);
  });

  it('retorna 100 cuando el candidato cumple todo', () => {
    const req = { techSkills: [{ selected: true, label: 'JavaScript' }], softSkills: [] };
    expect(calcMatchScore(['JavaScript'], req)).toBe(100);
  });

  it('retorna 0 cuando no hay ninguna coincidencia', () => {
    const req = { techSkills: [{ selected: true, label: 'Python' }], softSkills: [] };
    expect(calcMatchScore(['JavaScript'], req)).toBe(0);
  });

  it('retorna 50 cuando cumple 2 de 4 requisitos', () => {
    const req = {
      techSkills: [
        { selected: true, label: 'Python' },
        { selected: true, label: 'JavaScript' },
      ],
      softSkills: [
        { selected: true, label: 'Liderazgo' },
        { selected: true, label: 'Comunicación' },
      ],
    };
    expect(calcMatchScore(['JavaScript', 'Comunicación'], req)).toBe(50);
  });

  it('la comparación es case-insensitive', () => {
    const req = { techSkills: [{ selected: true, label: 'JAVASCRIPT' }], softSkills: [] };
    expect(calcMatchScore(['javascript'], req)).toBe(100);
  });

  it('ignora skills con selected: false', () => {
    const req = {
      techSkills: [
        { selected: false, label: 'Python' },
        { selected: true,  label: 'JavaScript' },
      ],
      softSkills: [],
    };
    expect(calcMatchScore(['JavaScript'], req)).toBe(100);
  });

  it('funciona con solo softSkills', () => {
    const req = {
      techSkills: [],
      softSkills: [{ selected: true, label: 'Liderazgo' }],
    };
    expect(calcMatchScore(['Liderazgo'], req)).toBe(100);
  });
});
