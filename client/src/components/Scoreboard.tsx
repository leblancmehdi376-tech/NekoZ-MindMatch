import type { Player } from '@nekozmindmatch/shared';
import { getAvatar } from '../avatars';
import Avatar from './Avatar';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Scoreboard({ players, final = false }: { players: Player[]; final?: boolean }) {
  const ranked = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full max-w-md flex flex-col gap-2">
      {ranked.map((player, index) => (
        <div
          key={player.id}
          className={`flex items-center gap-3 rounded-2xl px-4 py-2 bg-white/10 ${
            final && index < 3 ? 'ring-2 ring-yellow-300' : ''
          }`}
        >
          <span className="w-8 text-center font-black">{final && index < 3 ? MEDALS[index] : `#${index + 1}`}</span>
          <Avatar preset={getAvatar(player.avatarId)} size={28} />
          <span className="flex-1 font-semibold truncate">
            {player.name}
            {player.streak >= 2 && <span className="ml-1 text-xs">🔥{player.streak}</span>}
          </span>
          <span className="font-black tabular-nums">{player.score}</span>
        </div>
      ))}
    </div>
  );
}
