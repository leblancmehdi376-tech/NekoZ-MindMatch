import type { PublicRoom, RoomSettings } from './types';

/** Events emitted by clients to the server. */
export interface ClientToServerEvents {
  'room:create': (
    payload: { playerName: string; avatarId: string },
    callback: (result: { ok: true; code: string; playerId: string } | { ok: false; error: string }) => void
  ) => void;
  'room:join': (
    payload: { code: string; playerName: string; avatarId: string },
    callback: (result: { ok: true; code: string; playerId: string } | { ok: false; error: string }) => void
  ) => void;
  'room:rejoin': (
    payload: { code: string; playerId: string },
    callback: (result: { ok: true } | { ok: false; error: string }) => void
  ) => void;
  'room:updateSettings': (payload: { code: string; settings: Partial<RoomSettings> }) => void;
  'room:addCustomPrompt': (payload: { code: string; category: string; title: string; emoji?: string }) => void;
  'room:removeCustomPrompt': (payload: { code: string; promptId: string }) => void;
  'room:start': (payload: { code: string }) => void;
  'round:submit': (payload: { code: string; answer: string }) => void;
  'round:mergeGroups': (payload: { code: string; normalizedKeys: string[] }) => void;
  'round:invalidateGroup': (payload: { code: string; normalized: string }) => void;
  'round:lockReveal': (payload: { code: string }) => void;
  'round:next': (payload: { code: string }) => void;
}

/** Events emitted by the server to clients. */
export interface ServerToClientEvents {
  'room:state': (room: PublicRoom) => void;
  'room:error': (payload: { message: string }) => void;
}
