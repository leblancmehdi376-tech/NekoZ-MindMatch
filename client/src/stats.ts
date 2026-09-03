import type { Player, RoundSummary } from '@nekozmindmatch/shared';

export interface GameStats {
  mostSynced: { player: Player; matches: number } | null;
  loneWolf: { player: Player; soloCount: number } | null;
  biggestGroup: { size: number; word: string } | null;
  bestStreak: { player: Player; streak: number } | null;
}

/** True max consecutive-scoring streak per player across the whole game (mirrors gameEngine's lockReveal logic). */
function computeMaxStreaks(players: Player[], history: RoundSummary[]): Map<string, number> {
  const current = new Map(players.map((p) => [p.id, 0]));
  const max = new Map(players.map((p) => [p.id, 0]));

  for (const round of history) {
    if (round.reveal.chaos) continue; // streaks are frozen during Chaos rounds

    const scoredIds = new Set(round.reveal.groups.filter((g) => g.points > 0).flatMap((g) => g.playerIds));
    const answeredIds = new Set(round.reveal.groups.flatMap((g) => g.playerIds));

    for (const player of players) {
      if (scoredIds.has(player.id)) {
        const next = (current.get(player.id) ?? 0) + 1;
        current.set(player.id, next);
        if (next > (max.get(player.id) ?? 0)) max.set(player.id, next);
      } else if (answeredIds.has(player.id)) {
        current.set(player.id, 0);
      }
      // Didn't answer at all (timed out): leave the running streak untouched.
    }
  }

  return max;
}

export function computeStats(players: Player[], history: RoundSummary[]): GameStats {
  const matchCounts = new Map<string, number>();
  const soloCounts = new Map<string, number>();
  let biggestGroup: GameStats['biggestGroup'] = null;

  for (const round of history) {
    for (const group of round.reveal.groups) {
      if (group.playerIds.length >= 2 && group.points > 0) {
        for (const id of group.playerIds) matchCounts.set(id, (matchCounts.get(id) ?? 0) + 1);
        if (!biggestGroup || group.playerIds.length > biggestGroup.size) {
          biggestGroup = { size: group.playerIds.length, word: group.displayText };
        }
      } else if (group.playerIds.length === 1) {
        soloCounts.set(group.playerIds[0], (soloCounts.get(group.playerIds[0]) ?? 0) + 1);
      }
    }
    for (const id of round.reveal.timedOutPlayerIds) {
      soloCounts.set(id, (soloCounts.get(id) ?? 0) + 1);
    }
  }

  const findPlayer = (id: string) => players.find((pl) => pl.id === id);
  const top = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1])[0];

  const mostSyncedEntry = top(matchCounts);
  const loneWolfEntry = top(soloCounts);

  const maxStreaks = computeMaxStreaks(players, history);
  const bestStreakEntry = [...maxStreaks.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    mostSynced: mostSyncedEntry ? { player: findPlayer(mostSyncedEntry[0])!, matches: mostSyncedEntry[1] } : null,
    loneWolf: loneWolfEntry ? { player: findPlayer(loneWolfEntry[0])!, soloCount: loneWolfEntry[1] } : null,
    biggestGroup,
    bestStreak:
      bestStreakEntry && bestStreakEntry[1] >= 2
        ? { player: findPlayer(bestStreakEntry[0])!, streak: bestStreakEntry[1] }
        : null,
  };
}
