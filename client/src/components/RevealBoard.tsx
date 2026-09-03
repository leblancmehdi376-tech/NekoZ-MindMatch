import { useEffect, useRef } from 'react';
import type { Player, Reveal } from '@nekozmindmatch/shared';
import { getAvatar } from '../avatars';
import Avatar from './Avatar';
import MergeControls from './MergeControls';
import { playDrumroll, playFail, playSuccess } from '../sounds';

function playerName(players: Player[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? '???';
}

export default function RevealBoard({
  reveal,
  players,
  roundKey,
  isHost,
  onMerge,
  onInvalidate,
  onLock,
}: {
  reveal: Reveal;
  players: Player[];
  /** Changes only when a brand new round's reveal appears (e.g. the round index) — retriggers the sting. */
  roundKey: number;
  isHost: boolean;
  onMerge: (keys: string[]) => void;
  onInvalidate: (key: string) => void;
  onLock: () => void;
}) {
  const sortedGroups = [...reveal.groups].sort((a, b) => b.playerIds.length - a.playerIds.length);
  const playedForRoundRef = useRef<number | null>(null);

  useEffect(() => {
    if (playedForRoundRef.current === roundKey) return;
    playedForRoundRef.current = roundKey;
    playDrumroll();
    const timer = setTimeout(() => {
      const someoneScored = reveal.groups.some((g) => g.points > 0);
      if (someoneScored) playSuccess();
      else playFail();
    }, 550);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundKey]);

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-4">
      {reveal.chaos && (
        <div className="rounded-2xl bg-orange-500/90 text-white font-bold px-4 py-2 text-center text-sm">
          ⚡ Manche Chaos : les réponses UNIQUES ont marqué des points, les matches non !
        </div>
      )}

      {reveal.tooPerfect && (
        <div className="animate-pop-in rounded-2xl bg-yellow-400 text-black font-black text-xl px-6 py-3 text-center">
          {reveal.chaos ? 'MANCHE CHAOS RATÉE... TOUT LE MONDE A PENSÉ PAREIL 🙃' : 'TROP PARFAIT... PERSONNE NE MARQUE 😂'}
        </div>
      )}

      <div className="flex flex-col gap-3 w-full">
        {sortedGroups.map((group, index) => (
          <div
            key={group.normalized}
            style={{ animationDelay: `${index * 150}ms` }}
            className={`animate-pop-in rounded-2xl px-4 py-3 flex items-center gap-3 ${
              group.invalidated
                ? 'bg-red-900/40 line-through opacity-60'
                : group.points > 0
                  ? 'bg-emerald-500/30 ring-2 ring-emerald-300'
                  : 'bg-white/10'
            }`}
          >
            <span className="font-black text-lg flex-1">{group.displayText}</span>
            <div className="flex -space-x-2">
              {group.playerIds.map((id) => (
                <span key={id} className="relative" title={playerName(players, id)}>
                  <span className="block rounded-full border-2 border-black/40">
                    <Avatar preset={getAvatar(players.find((p) => p.id === id)?.avatarId)} size={28} />
                  </span>
                  {reveal.streakBonuses[id] > 0 && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-orange-500 text-[9px] leading-none px-1 py-0.5 font-black">
                      +{reveal.streakBonuses[id]}🔥
                    </span>
                  )}
                </span>
              ))}
            </div>
            <span className="font-black tabular-nums w-16 text-right">
              {group.points > 0 ? `+${group.points}` : '0'}
            </span>
          </div>
        ))}

        {reveal.timedOutPlayerIds.length > 0 && (
          <div className="rounded-2xl px-4 py-3 bg-black/30 text-white/60 text-sm">
            ⏱️ Trop lent : {reveal.timedOutPlayerIds.map((id) => playerName(players, id)).join(', ')}
          </div>
        )}
      </div>

      {isHost && !reveal.locked && (
        <>
          <MergeControls groups={reveal.groups} onMerge={onMerge} onInvalidate={onInvalidate} />
          <button
            onClick={onLock}
            className="rounded-xl px-6 py-3 font-black bg-pink-500 hover:bg-pink-400 transition"
          >
            Valider les points
          </button>
        </>
      )}
    </div>
  );
}
