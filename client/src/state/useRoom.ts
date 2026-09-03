import { useEffect, useState } from 'react';
import type { PublicRoom } from '@nekozmindmatch/shared';
import { readSession, socket } from '../socket';

export function useRoom(code: string | undefined) {
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    const onState = (next: PublicRoom) => {
      if (next.code === code) setRoom(next);
    };
    const onError = (payload: { message: string }) => setError(payload.message);

    socket.on('room:state', onState);
    socket.on('room:error', onError);

    const session = readSession();
    if (session && session.code === code) {
      socket.emit('room:rejoin', session, (result) => {
        if (!result.ok) setError(result.error);
      });
    }

    return () => {
      socket.off('room:state', onState);
      socket.off('room:error', onError);
    };
  }, [code]);

  const session = readSession();
  const myPlayerId = session && session.code === code ? session.playerId : null;

  return { room, error, myPlayerId, clearError: () => setError(null) };
}
