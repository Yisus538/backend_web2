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
