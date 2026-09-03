import {
  computeReveal,
  normalizeAnswer,
  recomputeRevealPoints,
  type Player,
  type Room,
} from '@nekozmindmatch/shared';
import { PROMPTS } from './data/prompts.js';

export class GameEngineError extends Error {}

const CHAOS_MIN_ROUND_INDEX = 2; // never on round 1 or 2
const CHAOS_CHANCE = 0.3;
const STREAK_BONUS_PER_LEVEL = 2;
const STREAK_BONUS_CAP = 10;

function pickPrompt(room: Room) {
  const filteredBuiltins = PROMPTS.filter(
    (prompt) => room.settings.categories.length === 0 || room.settings.categories.includes(prompt.category)
  );
  // Prompts the host added for this game are always in the pool, regardless of category filters.
  const pool = [...filteredBuiltins, ...room.settings.customPrompts];
  if (pool.length === 0) throw new GameEngineError('Aucun prompt disponible pour ces catégories.');

  let available = pool.filter((prompt) => !room.usedPromptIds.includes(prompt.id));
  if (available.length === 0) {
    // Ran out of fresh prompts: allow repeats rather than crashing the game.
    room.usedPromptIds = [];
    available = pool;
  }
  return available[Math.floor(Math.random() * available.length)];
}

export function startRound(room: Room): void {
  if (room.status !== 'lobby' && room.status !== 'round_reveal') {
    throw new GameEngineError('La manche en cours doit être terminée avant de continuer.');
  }
  const prompt = pickPrompt(room);
  room.usedPromptIds.push(prompt.id);
  room.currentRoundIndex += 1;
  room.currentPrompt = prompt;
  room.roundDeadline = Date.now() + room.settings.timerSeconds * 1000;
  room.answers = {};
  room.lastReveal = null;
  // Never two Chaos rounds back to back, and never in the first couple of rounds.
  room.isChaosRound =
    room.currentRoundIndex >= CHAOS_MIN_ROUND_INDEX && !room.isChaosRound && Math.random() < CHAOS_CHANCE;
  room.status = 'round_active';
}

export function submitAnswer(room: Room, playerId: string, raw: string): { allAnswered: boolean } {
  if (room.status !== 'round_active') throw new GameEngineError("Ce n'est pas le moment de répondre.");
  const trimmed = raw.trim().slice(0, 40);
  if (!trimmed) throw new GameEngineError('Réponse vide.');

  room.answers[playerId] = {
    raw: trimmed,
    normalized: normalizeAnswer(trimmed),
    submittedAt: Date.now(),
  };

  const connectedIds = room.players.filter((p: Player) => p.connected).map((p) => p.id);
  const allAnswered = connectedIds.every((id) => room.answers[id]);
  return { allAnswered };
}

export function revealRound(room: Room): void {
  if (room.status !== 'round_active') return;
  room.lastReveal = computeReveal(room.players, room.answers, room.isChaosRound);
  room.status = 'round_reveal';
}

export function mergeGroups(room: Room, normalizedKeys: string[]): void {
  const reveal = room.lastReveal;
  if (!reveal || reveal.locked) throw new GameEngineError('Le reveal est déjà verrouillé.');
  const toMerge = reveal.groups.filter((g) => normalizedKeys.includes(g.normalized));
  if (toMerge.length < 2) return;

  const survivor = toMerge[0];
  survivor.playerIds = toMerge.flatMap((g) => g.playerIds);
  survivor.suggestedMergeWith = [];
  // Remove based on `toMerge`'s own order (derived from reveal.groups), not the client's
  // `normalizedKeys` array order — those can differ and previously caused the wrong group
  // (sometimes the survivor itself) to be dropped.
  const keysToRemove = new Set(toMerge.slice(1).map((g) => g.normalized));
  reveal.groups = reveal.groups.filter((g) => !keysToRemove.has(g.normalized));
  room.lastReveal = recomputeRevealPoints(reveal);
}

export function invalidateGroup(room: Room, normalized: string): void {
  const reveal = room.lastReveal;
  if (!reveal || reveal.locked) throw new GameEngineError('Le reveal est déjà verrouillé.');
  const group = reveal.groups.find((g) => g.normalized === normalized);
  if (!group) return;
  group.invalidated = !group.invalidated;
  room.lastReveal = recomputeRevealPoints(reveal);
}

export function lockReveal(room: Room): void {
  const reveal = room.lastReveal;
  if (!reveal || reveal.locked) return;

  const scoringPlayerIds = new Set<string>();
  for (const group of reveal.groups) {
    for (const playerId of group.playerIds) {
      const player = room.players.find((p) => p.id === playerId);
      if (!player) continue;
      player.score += group.points;
      if (group.points > 0) scoringPlayerIds.add(playerId);
    }
  }

  // Combo streaks are a "normal round" mechanic; freeze them during Chaos rounds so a wildcard
  // round never silently breaks a streak someone was building.
  const streakBonuses: Record<string, number> = {};
  if (!reveal.chaos) {
    for (const player of room.players) {
      if (scoringPlayerIds.has(player.id)) {
        player.streak += 1;
        if (player.streak >= 2) {
          const bonus = Math.min((player.streak - 1) * STREAK_BONUS_PER_LEVEL, STREAK_BONUS_CAP);
          player.score += bonus;
          streakBonuses[player.id] = bonus;
        }
      } else if (player.id in room.answers) {
        // Answered but didn't score this round: the combo is broken.
        player.streak = 0;
      }
      // Players who timed out (never answered) keep their streak untouched — a brief
      // disconnect shouldn't erase a combo they were building.
    }
  }

  reveal.locked = true;
  reveal.streakBonuses = streakBonuses;
  room.history.push({ roundIndex: room.currentRoundIndex, prompt: room.currentPrompt!, reveal });
}

export function nextRound(room: Room): void {
  if (!room.lastReveal?.locked) throw new GameEngineError('Valide les points avant de continuer.');
  if (room.currentRoundIndex + 1 >= room.settings.totalRounds) {
    room.status = 'ended';
    room.currentPrompt = null;
    room.roundDeadline = null;
    return;
  }
  startRound(room);
}

export function addCustomPrompt(room: Room, category: string, title: string, emoji: string | undefined): void {
  if (room.status !== 'lobby') throw new GameEngineError('Impossible d’ajouter un prompt en cours de partie.');
  const trimmedTitle = title.trim().slice(0, 60);
  if (!trimmedTitle) throw new GameEngineError('Titre vide.');
  room.settings.customPrompts.push({
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    category: category.trim().slice(0, 30) || 'Perso',
    title: trimmedTitle,
    emoji: emoji?.trim().slice(0, 8) || undefined,
  });
}

export function removeCustomPrompt(room: Room, promptId: string): void {
  room.settings.customPrompts = room.settings.customPrompts.filter((p) => p.id !== promptId);
}
