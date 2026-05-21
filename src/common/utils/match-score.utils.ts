export function calcMatchScore(
  candidateSkills: string[],
  requisitos: unknown,
): number {
  const req = requisitos as Record<string, { selected: boolean; label: string }[]> | null;
  const techSkills = (req?.techSkills ?? []).filter(s => s.selected).map(s => s.label.toLowerCase());
  const softSkills = (req?.softSkills ?? []).filter(s => s.selected).map(s => s.label.toLowerCase());
  const allRequired = [...techSkills, ...softSkills];
  if (allRequired.length === 0) return 75;
  const lower   = candidateSkills.map(s => s.toLowerCase());
  const matches = allRequired.filter(r => lower.includes(r));
  return Math.round((matches.length / allRequired.length) * 100);
}

export function calcMatchScoreDetailed(
  skillNames: string[],
  totalExp: number,
  requisitos: unknown,
  experienciaMinima: number,
): { skillsScore: number; expScore: number | null; total: number } {
  const req = requisitos as Record<string, { selected: boolean; label: string }[]> | null;
  const techSkills = (req?.techSkills ?? []).filter((s) => s.selected).map((s) => s.label.toLowerCase());
  const softSkills = (req?.softSkills ?? []).filter((s) => s.selected).map((s) => s.label.toLowerCase());
  const allRequired = [...techSkills, ...softSkills];
  const lower = skillNames.map((s) => s.toLowerCase());
  const skillsScore = allRequired.length === 0
    ? 75
    : Math.round((allRequired.filter((r) => lower.includes(r)).length / allRequired.length) * 100);

  if (!experienciaMinima) {
    return { skillsScore, expScore: null, total: skillsScore };
  }

  const expScore = Math.round(Math.min(totalExp / experienciaMinima, 1) * 100);
  const total    = Math.round(skillsScore * 0.7 + expScore * 0.3);
  return { skillsScore, expScore, total };
}
