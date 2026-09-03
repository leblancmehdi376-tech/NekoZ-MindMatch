import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  PublicRoom,
  Room,
  ServerToClientEvents,
} from '@nekozmindmatch/shared';
import { createRoom, deleteRoom, getRoom, newPlayerId } from './rooms.js';
import {
  GameEngineError,
  addCustomPrompt,
  invalidateGroup,
  lockReveal,
  mergeGroups,
  nextRound,
  removeCustomPrompt,
  revealRound,
  startRound,
  submitAnswer,
} from './gameEngine.js';

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const EMPTY_ROOM_TTL_MS = 10 * 60 * 1000;

const socketToPlayer = new Map<string, { code: string; playerId: string }>();
const revealTimers = new Map<string, NodeJS.Timeout>();
const emptyRoomTimers = new Map<string, NodeJS.Timeout>();

function toPublicRoom(room: Room): PublicRoom {
  const { answers, ...rest } = room;
  return { ...rest, answeredPlayerIds: Object.keys(answers) };
}

function broadcast(io: IOServer, room: Room): void {
  io.to(room.code).emit('room:state', toPublicRoom(room));
}

function scheduleReveal(io: IOServer, room: Room): void {
  clearTimeout(revealTimers.get(room.code));
  const delay = Math.max(0, (room.roundDeadline ?? Date.now()) - Date.now());
  const timer = setTimeout(() => {
    const current = getRoom(room.code);
    if (!current || current.status !== 'round_active') return;
    revealRound(current);
    broadcast(io, current);
  }, delay);
  revealTimers.set(room.code, timer);
}

function cancelEmptyRoomCleanup(code: string): void {
  clearTimeout(emptyRoomTimers.get(code));
  emptyRoomTimers.delete(code);
}

function scheduleEmptyRoomCleanup(code: string): void {
  cancelEmptyRoomCleanup(code);
  const timer = setTimeout(() => {
    emptyRoomTimers.delete(code);
    const room = getRoom(code);
    if (room && room.players.every((p) => !p.connected)) deleteRoom(code);
  }, EMPTY_ROOM_TTL_MS);
  emptyRoomTimers.set(code, timer);
}

function withRoom(
  socket: IOSocket,
  code: string,
  fn: (room: Room) => void,
  onError: (message: string) => void
): void {
  const room = getRoom(code);
  if (!room) return onError('Cette partie n’existe plus.');
  try {
    fn(room);
  } catch (err) {
    onError(err instanceof GameEngineError ? err.message : 'Erreur inattendue.');
  }
}

export function registerSocketHandlers(io: IOServer, socket: IOSocket): void {
  socket.on('room:create', ({ playerName, avatarId }, callback) => {
    const room = createRoom();
    const playerId = newPlayerId();
    room.players.push({ id: playerId, name: playerName.slice(0, 20) || 'Host', avatarId, score: 0, connected: true, isHost: true, streak: 0 });
    socketToPlayer.set(socket.id, { code: room.code, playerId });
    socket.join(room.code);
    callback({ ok: true, code: room.code, playerId });
    broadcast(io, room);
  });

  socket.on('room:join', ({ code, playerName, avatarId }, callback) => {
    const room = getRoom(code);
    if (!room) return callback({ ok: false, error: 'Code de partie invalide.' });
    if (room.status !== 'lobby') return callback({ ok: false, error: 'La partie a déjà commencé.' });
    if (room.players.length >= 10) return callback({ ok: false, error: 'Cette partie est complète.' });

    const playerId = newPlayerId();
    room.players.push({ id: playerId, name: playerName.slice(0, 20) || 'Joueur', avatarId, score: 0, connected: true, isHost: false, streak: 0 });
    socketToPlayer.set(socket.id, { code: room.code, playerId });
    socket.join(room.code);
    cancelEmptyRoomCleanup(room.code);
    callback({ ok: true, code: room.code, playerId });
    broadcast(io, room);
  });

  socket.on('room:rejoin', ({ code, playerId }, callback) => {
    const room = getRoom(code);
    const player = room?.players.find((p) => p.id === playerId);
    if (!room || !player) return callback({ ok: false, error: 'Impossible de rejoindre cette partie.' });

    player.connected = true;
    socketToPlayer.set(socket.id, { code, playerId });
    socket.join(code);
    cancelEmptyRoomCleanup(code);
    callback({ ok: true });
    broadcast(io, room);
  });

  socket.on('room:addCustomPrompt', ({ code, category, title, emoji }) => {
    withRoom(
      socket,
      code,
      (room) => {
        addCustomPrompt(room, category, title, emoji);
        broadcast(io, room);
      },
      (message) => socket.emit('room:error', { message })
    );
  });

  socket.on('room:removeCustomPrompt', ({ code, promptId }) => {
    withRoom(
      socket,
      code,
      (room) => {
        removeCustomPrompt(room, promptId);
        broadcast(io, room);
      },
      (message) => socket.emit('room:error', { message })
    );
  });

  socket.on('room:updateSettings', ({ code, settings }) => {
    withRoom(
      socket,
      code,
      (room) => {
        if (room.status !== 'lobby') throw new GameEngineError('Impossible de modifier les réglages en cours de partie.');
        Object.assign(room.settings, settings);
        broadcast(io, room);
      },
      (message) => socket.emit('room:error', { message })
    );
  });

  socket.on('room:start', ({ code }) => {
    withRoom(
      socket,
      code,
      (room) => {
        startRound(room);
        broadcast(io, room);
        scheduleReveal(io, room);
      },
      (message) => socket.emit('room:error', { message })
    );
  });

  socket.on('round:submit', ({ code, answer }) => {
    const link = socketToPlayer.get(socket.id);
    if (!link) return;
    withRoom(
      socket,
      code,
      (room) => {
        const { allAnswered } = submitAnswer(room, link.playerId, answer);
        if (allAnswered) {
          clearTimeout(revealTimers.get(room.code));
          revealRound(room);
        }
        broadcast(io, room);
      },
      (message) => socket.emit('room:error', { message })
    );
  });

  socket.on('round:mergeGroups', ({ code, normalizedKeys }) => {
    withRoom(
      socket,
      code,
      (room) => {
        mergeGroups(room, normalizedKeys);
        broadcast(io, room);
      },
      (message) => socket.emit('room:error', { message })
    );
  });

  socket.on('round:invalidateGroup', ({ code, normalized }) => {
    withRoom(
      socket,
      code,
      (room) => {
        invalidateGroup(room, normalized);
        broadcast(io, room);
      },
      (message) => socket.emit('room:error', { message })
    );
  });

  socket.on('round:lockReveal', ({ code }) => {
    withRoom(
      socket,
      code,
      (room) => {
        lockReveal(room);
        broadcast(io, room);
      },
      (message) => socket.emit('room:error', { message })
    );
  });

  socket.on('round:next', ({ code }) => {
    withRoom(
      socket,
      code,
      (room) => {
        nextRound(room);
        broadcast(io, room);
        if (room.status === 'round_active') scheduleReveal(io, room);
      },
      (message) => socket.emit('room:error', { message })
    );
  });

  socket.on('disconnect', () => {
    const link = socketToPlayer.get(socket.id);
    if (!link) return;
    socketToPlayer.delete(socket.id);
    const room = getRoom(link.code);
    const player = room?.players.find((p) => p.id === link.playerId);
    if (room && player) {
      player.connected = false;
      broadcast(io, room);
      if (room.players.every((p) => !p.connected)) scheduleEmptyRoomCleanup(room.code);
    }
  });
}
