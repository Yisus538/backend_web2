export function formatSalary(amount: number | null): string {
  if (!amount) return '';
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)     return `$${Math.round(amount / 1_000)}K`;
  return `$${amount}`;
}

export function matchColor(score: number): string {
  if (score >= 85) return 'green';
  if (score >= 70) return 'blue';
  return 'yellow';
}
