import { useEffect, useRef } from 'react';
import type { PublicRoom } from '@nekozmindmatch/shared';
import { playChaosAlarm, playFanfare } from '../sounds';

/** Plays ambient stingers (Chaos round alarm, end-of-game fanfare) from wherever a room is shown. */
export function useRoomSounds(room: PublicRoom | null): void {
  const lastChaosRoundRef = useRef(-1);
  const fanfarePlayedRef = useRef(false);

  useEffect(() => {
    if (!room) return;

    if (room.status === 'round_active' && room.isChaosRound && room.currentRoundIndex !== lastChaosRoundRef.current) {
      lastChaosRoundRef.current = room.currentRoundIndex;
      playChaosAlarm();
    }

    if (room.status === 'ended' && !fanfarePlayedRef.current) {
      fanfarePlayedRef.current = true;
      playFanfare();
    }
  }, [room?.status, room?.currentRoundIndex, room?.isChaosRound]);
}
