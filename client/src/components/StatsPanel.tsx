import type { GameStats } from '../stats';

export default function StatsPanel({ stats }: { stats: GameStats }) {
  const rows: { emoji: string; label: string }[] = [];

  if (stats.mostSynced) {
    rows.push({
      emoji: '🧠',
      label: `Le plus synchro : ${stats.mostSynced.player.name} (${stats.mostSynced.matches} match${stats.mostSynced.matches > 1 ? 's' : ''})`,
    });
  }
  if (stats.loneWolf) {
    rows.push({
      emoji: '🐺',
      label: `Le loup solitaire : ${stats.loneWolf.player.name} (seul ${stats.loneWolf.soloCount} fois)`,
    });
  }
  if (stats.biggestGroup) {
    rows.push({
      emoji: '💥',
      label: `Meilleur match : "${stats.biggestGroup.word}" à ${stats.biggestGroup.size}`,
    });
  }
  if (stats.bestStreak) {
    rows.push({
      emoji: '🔥',
      label: `Meilleure série : ${stats.bestStreak.player.name} (${stats.bestStreak.streak} d'affilée)`,
    });
  }

  if (rows.length === 0) return null;

  return (
    <div className="w-full max-w-md rounded-2xl bg-white/10 p-4 flex flex-col gap-2 text-left">
      {rows.map((row) => (
        <p key={row.label} className="text-sm">
          <span className="mr-2">{row.emoji}</span>
          {row.label}
        </p>
      ))}
    </div>
  );
}
