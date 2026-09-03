import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@nekozmindmatch/shared';
import { SERVER_URL } from './config';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL || undefined, {
  autoConnect: true,
});

export function storeSession(code: string, playerId: string): void {
  sessionStorage.setItem('mindmatch:code', code);
  sessionStorage.setItem('mindmatch:playerId', playerId);
}

export function readSession(): { code: string; playerId: string } | null {
  const code = sessionStorage.getItem('mindmatch:code');
  const playerId = sessionStorage.getItem('mindmatch:playerId');
  return code && playerId ? { code, playerId } : null;
}

export function clearSession(): void {
  sessionStorage.removeItem('mindmatch:code');
  sessionStorage.removeItem('mindmatch:playerId');
}
