import type { Player } from '@nekozmindmatch/shared';
import { getAvatar } from '../avatars';
import Avatar from './Avatar';

const SIZES = { sm: 32, md: 44, lg: 68 } as const;

export default function PlayerBubble({
  player,
  hasAnswered,
  size = 'md',
}: {
  player: Player;
  hasAnswered?: boolean;
  size?: keyof typeof SIZES;
}) {
  return (
    <div className="flex flex-col items-center gap-1" title={player.name}>
      <div
        className={`relative rounded-full transition-all ${player.connected ? '' : 'opacity-30 grayscale'} ${
          hasAnswered ? 'ring-4 ring-white scale-110' : 'ring-2 ring-transparent'
        }`}
      >
        <Avatar preset={getAvatar(player.avatarId)} size={SIZES[size]} />
        {player.streak >= 2 && (
          <span className="absolute -top-1 -right-1 rounded-full bg-orange-500 text-[10px] leading-none px-1.5 py-1 font-black shadow">
            🔥{player.streak}
          </span>
        )}
      </div>
      <span className="text-xs text-white/80 max-w-[5rem] truncate">{player.name}</span>
    </div>
  );
}
