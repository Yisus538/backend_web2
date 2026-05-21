import { calcMatchScore, calcMatchScoreDetailed } from './match-score.utils';

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

describe('calcMatchScoreDetailed', () => {
  const req = {
    techSkills: [{ selected: true, label: 'JavaScript' }],
    softSkills: [{ selected: true, label: 'Liderazgo' }],
  };

  it('retorna total igual a skillsScore cuando experienciaMinima es 0', () => {
    const result = calcMatchScoreDetailed(['JavaScript', 'Liderazgo'], 5, req, 0);
    expect(result.skillsScore).toBe(100);
    expect(result.expScore).toBeNull();
    expect(result.total).toBe(100);
  });

  it('pondera 70% habilidades y 30% experiencia cuando hay experienciaMinima', () => {
    // 1 de 2 skills = 50%; 4 años sobre 4 mínimos = 100%
    const result = calcMatchScoreDetailed(['JavaScript'], 4, req, 4);
    expect(result.skillsScore).toBe(50);
    expect(result.expScore).toBe(100);
    expect(result.total).toBe(Math.round(50 * 0.7 + 100 * 0.3)); // 65
  });

  it('limita expScore a 100 cuando totalExp supera experienciaMinima', () => {
    const result = calcMatchScoreDetailed(['JavaScript', 'Liderazgo'], 10, req, 2);
    expect(result.expScore).toBe(100);
  });

  it('retorna skillsScore 75 cuando no hay requisitos definidos', () => {
    const result = calcMatchScoreDetailed([], 3, null, 2);
    expect(result.skillsScore).toBe(75);
  });

  it('retorna 0 de skillsScore cuando no hay ninguna coincidencia', () => {
    const result = calcMatchScoreDetailed(['Python'], 3, req, 0);
    expect(result.skillsScore).toBe(0);
    expect(result.total).toBe(0);
  });
});
