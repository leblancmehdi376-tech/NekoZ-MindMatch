import { randomUUID } from 'node:crypto';
import type { Room } from '@nekozmindmatch/shared';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I ambiguity
const rooms = new Map<string, Room>();

function generateCode(): string {
  let code: string;
  do {
    code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  } while (rooms.has(code));
  return code;
}

export function createRoom(): Room {
  const code = generateCode();
  const room: Room = {
    code,
    players: [],
    settings: { totalRounds: 8, timerSeconds: 20, categories: [], customPrompts: [] },
    status: 'lobby',
    currentRoundIndex: -1,
    currentPrompt: null,
    roundDeadline: null,
    answers: {},
    lastReveal: null,
    history: [],
    usedPromptIds: [],
    isChaosRound: false,
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function deleteRoom(code: string): void {
  rooms.delete(code.toUpperCase());
}

export function newPlayerId(): string {
  return randomUUID();
}
