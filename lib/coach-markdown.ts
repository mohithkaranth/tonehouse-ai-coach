import type { PracticePlan } from "./coach-plan";

export function planToMarkdown(plan: PracticePlan): string {
  const lines: string[] = [];

  lines.push(`# ${plan.instrument} – ${plan.mode.replaceAll("_", " ")}`);
  lines.push(``);
  lines.push(`**Level:** ${plan.level}`);
  lines.push(`**Genre:** ${plan.genre}`);
  lines.push(`**Goals:** ${plan.goals}`);
  lines.push(``);
  lines.push(`## Focus Metric`);
  lines.push(`- ${plan.focusMetric}`);
  lines.push(``);
  lines.push(`## Day-by-day plan`);

  for (const d of plan.dayByDay) {
    lines.push(`### Day ${d.day}: ${d.title}`);
    for (const b of d.blocks) {
      lines.push(`**${b.name} (${b.minutes} min)**`);
      for (const bullet of b.bullets) {
        lines.push(`- ${bullet}`);
      }
      lines.push(``);
    }
  }

  if (plan.notes?.length) {
    lines.push(`## Notes`);
    for (const n of plan.notes) lines.push(`- ${n}`);
    lines.push(``);
  }

  return lines.join("\n");
}
