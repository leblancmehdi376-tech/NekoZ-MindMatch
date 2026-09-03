export type RoomStatus = 'lobby' | 'round_active' | 'round_reveal' | 'ended';

export interface Player {
  id: string;
  name: string;
  /** Opaque id resolved client-side to a face/hat/clothing combo (see client/src/avatars.ts). */
  avatarId: string;
  score: number;
  connected: boolean;
  isHost: boolean;
  /** Current consecutive count of scoring rounds (frozen during chaos rounds). */
  streak: number;
}

export interface Prompt {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  /** Big emoji shown alongside the title, standing in for a real illustration. */
  emoji?: string;
}

export interface RoomSettings {
  totalRounds: number;
  timerSeconds: number;
  categories: string[]; // empty array = all categories
  /** Prompts the host adds for this game only; always included regardless of `categories`. */
  customPrompts: Prompt[];
}

export interface SubmittedAnswer {
  raw: string;
  normalized: string;
  submittedAt: number;
}

export interface RevealGroup {
  normalized: string;
  /** One representative raw answer, for display */
  displayText: string;
  playerIds: string[];
  points: number;
  suggestedMergeWith: string[]; // normalized keys of other groups that look similar
  /** Host marked this group as off-topic/troll: always scores 0, regardless of size. */
  invalidated: boolean;
}

export interface Reveal {
  groups: RevealGroup[];
  /** player ids who never submitted before the deadline */
  timedOutPlayerIds: string[];
  /** true once the host has confirmed the groups and points were applied to scores */
  locked: boolean;
  /** true when literally every answering player matched on the same word ("Trop Parfait") */
  tooPerfect: boolean;
  /** true if this round was a "Chaos" round (unique answers score, matches don't) */
  chaos: boolean;
  /** Combo bonus points applied per player at lock time (playerId -> bonus). */
  streakBonuses: Record<string, number>;
}

export interface RoundSummary {
  roundIndex: number;
  prompt: Prompt;
  reveal: Reveal;
}

export interface Room {
  code: string;
  players: Player[];
  settings: RoomSettings;
  status: RoomStatus;
  currentRoundIndex: number; // 0-based
  currentPrompt: Prompt | null;
  roundDeadline: number | null; // epoch ms
  answers: Record<string, SubmittedAnswer>; // playerId -> answer, hidden from clients until reveal
  lastReveal: Reveal | null;
  history: RoundSummary[];
  usedPromptIds: string[];
  /** true while the current round is a "Chaos" round (scoring inverted) */
  isChaosRound: boolean;
}

/** What is broadcast to clients: same as Room, but answers are stripped until reveal. */
export type PublicRoom = Omit<Room, 'answers'> & {
  answeredPlayerIds: string[];
};
