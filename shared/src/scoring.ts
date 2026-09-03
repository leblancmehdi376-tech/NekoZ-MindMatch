import { isCloseMatch } from './normalize';
import type { Player, Reveal, RevealGroup, SubmittedAnswer } from './types';

/** Points earned by each player in a matched group of size g (g >= 2) in a normal round. */
export function pointsForGroupSize(groupSize: number): number {
  return 10 + 5 * (groupSize - 2);
}

/** Flat reward for standing alone during a Chaos round, where uniqueness is the goal. */
export const CHAOS_UNIQUE_POINTS = 15;

function pointsFor(groupSize: number, chaos: boolean, tooPerfect: boolean, invalidated: boolean): number {
  if (invalidated) return 0;
  if (chaos) return groupSize === 1 ? CHAOS_UNIQUE_POINTS : 0;
  return tooPerfect || groupSize < 2 ? 0 : pointsForGroupSize(groupSize);
}

/** Recomputes each group's fuzzy-merge suggestions against the current group list. */
function attachSuggestedMerges(groups: RevealGroup[]): void {
  for (const group of groups) {
    group.suggestedMergeWith = groups
      .filter((other) => other !== group && isCloseMatch(group.normalized, other.normalized))
      .map((other) => other.normalized);
  }
}

/**
 * Groups submitted answers by normalized value, computes points, flags
 * near-identical groups for the host to consider merging, and applies the
 * "Trop Parfait" rule: if every single connected player who answered gave the
 * exact same word, nobody scores. During a Chaos round the scoring flips:
 * standing alone scores, matching someone else doesn't.
 */
export function computeReveal(
  players: Player[],
  answers: Record<string, SubmittedAnswer>,
  chaos = false
): Reveal {
  const connectedIds = players.filter((p) => p.connected).map((p) => p.id);
  const answeredIds = connectedIds.filter((id) => answers[id]);
  const timedOutPlayerIds = connectedIds.filter((id) => !answers[id]);

  const byNormalized = new Map<string, string[]>();
  for (const id of answeredIds) {
    const key = answers[id].normalized;
    if (!byNormalized.has(key)) byNormalized.set(key, []);
    byNormalized.get(key)!.push(id);
  }

  const tooPerfect = byNormalized.size === 1 && answeredIds.length >= 2;

  const groups: RevealGroup[] = [...byNormalized.entries()].map(([normalized, playerIds]) => {
    const representativeId = playerIds[0];
    return {
      normalized,
      displayText: answers[representativeId].raw,
      playerIds,
      points: pointsFor(playerIds.length, chaos, tooPerfect, false),
      suggestedMergeWith: [],
      invalidated: false,
    };
  });

  attachSuggestedMerges(groups);

  return { groups, timedOutPlayerIds, locked: false, tooPerfect, chaos, streakBonuses: {} };
}

/** Recomputes points and merge suggestions for a reveal after the host merges/invalidates groups. */
export function recomputeRevealPoints(reveal: Reveal): Reveal {
  const answeringPlayers = reveal.groups.reduce((sum, g) => sum + g.playerIds.length, 0);
  const tooPerfect = reveal.groups.length === 1 && answeringPlayers >= 2;

  const groups = reveal.groups.map((group) => ({
    ...group,
    points: pointsFor(group.playerIds.length, reveal.chaos, tooPerfect, group.invalidated),
  }));
  attachSuggestedMerges(groups);

  return { ...reveal, groups, tooPerfect };
}
