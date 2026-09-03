import { useId } from 'react';
import type { AvatarPreset, FaceId, HatId } from '../avatars';

const SKIN = '#f4c9a0';
const INK = '#241a15';
const MOUTH = '#3a2014';

/** Lightens (positive percent) or darkens (negative) a hex color, for cheap gradient shading. */
function shade(hex: string, percent: number): string {
  const num = parseInt(hex.slice(1), 16);
  const target = percent < 0 ? 0 : 255;
  const p = Math.abs(percent);
  const channel = (shift: number) => {
    const c = (num >> shift) & 0xff;
    return Math.round((target - c) * p + c);
  };
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

function Face({ face }: { face: FaceId }) {
  switch (face) {
    case 'happy':
      return (
        <>
          <path d="M32 38 Q39 28 46 38" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M54 38 Q61 28 68 38" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M36 50 Q50 66 64 50 Q50 58 36 50 Z" fill={MOUTH} />
        </>
      );
    case 'wink':
      return (
        <>
          <ellipse cx="39" cy="40" rx="5.5" ry="7" fill={INK} />
          <circle cx="37.5" cy="37" r="1.8" fill="white" opacity={0.9} />
          <path d="M56 40 h10" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <path d="M36 50 Q50 64 64 50 Q50 57 36 50 Z" fill={MOUTH} />
        </>
      );
    case 'cool':
      return (
        <>
          <rect x="28" y="34" width="44" height="12" rx="5" fill={INK} />
          <rect x="30" y="35.5" width="17" height="9" rx="3" fill="#5fb5ff" />
          <rect x="53" y="35.5" width="17" height="9" rx="3" fill="#5fb5ff" />
          <path d="M40 54 Q50 58 60 54" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
        </>
      );
    case 'surprised':
      return (
        <>
          <circle cx="39" cy="40" r="6.5" fill="white" stroke={INK} strokeWidth={2.5} />
          <circle cx="61" cy="40" r="6.5" fill="white" stroke={INK} strokeWidth={2.5} />
          <circle cx="39" cy="40" r="3" fill={INK} />
          <circle cx="61" cy="40" r="3" fill={INK} />
          <circle cx="50" cy="56" r="7" fill={MOUTH} />
        </>
      );
    case 'heart':
      return (
        <>
          {[39, 61].map((cx) => (
            <path
              key={cx}
              d={`M${cx} 35 c-3 -5 -10 -2.5 -10 3 c0 4.5 10 9.5 10 9.5 s10 -5 10 -9.5 c0 -5.5 -7 -8 -10 -3z`}
              fill="#e0245e"
            />
          ))}
          <path d="M36 52 Q50 64 64 52 Q50 59 36 52 Z" fill={MOUTH} />
        </>
      );
    case 'star':
      return (
        <>
          {[39, 61].map((cx) => (
            <path
              key={cx}
              d={`M${cx} 32 l2.8 6.4 6.9 0.6 -5.2 4.6 1.6 6.8 -6.1 -3.8 -6.1 3.8 1.6 -6.8 -5.2 -4.6 6.9 -0.6z`}
              fill="#f5c518"
            />
          ))}
          <path d="M36 54 Q50 66 64 54 Q50 61 36 54 Z" fill={MOUTH} />
        </>
      );
    case 'sleepy':
      return (
        <>
          <path d="M32 41 Q39 45 46 41" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M54 41 Q61 45 68 41" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
          <ellipse cx="50" cy="55" rx="5" ry="3.5" fill={MOUTH} />
        </>
      );
    case 'angry':
      return (
        <>
          <path d="M31 32 L47 38" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <path d="M69 32 L53 38" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <ellipse cx="39" cy="43" rx="4.5" ry="5.5" fill={INK} />
          <ellipse cx="61" cy="43" rx="4.5" ry="5.5" fill={INK} />
          <path d="M38 60 Q50 52 62 60" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
        </>
      );
    case 'cat':
      return (
        <>
          <path d="M30 39 Q38 30 46 39" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M54 39 Q62 30 70 39" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M47 48 l3 3.5 3 -3.5" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path
            d="M26 47 h-12 M26 52 h-13 M74 47 h12 M74 52 h13"
            stroke={INK}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <path d="M40 58 Q50 64 60 58" stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        </>
      );
    case 'smile':
    default:
      return (
        <>
          <ellipse cx="39" cy="40" rx="5.5" ry="7" fill={INK} />
          <ellipse cx="61" cy="40" rx="5.5" ry="7" fill={INK} />
          <circle cx="37.5" cy="37" r="1.8" fill="white" opacity={0.9} />
          <circle cx="59.5" cy="37" r="1.8" fill="white" opacity={0.9} />
          <path d="M36 50 Q50 66 64 50 Q50 58 36 50 Z" fill={MOUTH} />
        </>
      );
  }
}

function Hat({ hat }: { hat: HatId }) {
  switch (hat) {
    case 'cap':
      return (
        <>
          <path d="M22 20 a28 18 0 0 1 56 0 z" fill="#3b3b3b" />
          <ellipse cx="75" cy="20" rx="15" ry="5" fill="#3b3b3b" />
        </>
      );
    case 'beanie':
      return (
        <>
          <path d="M20 22 a28 20 0 0 1 56 0 z" fill="#6d28d9" />
          <rect x="18" y="18" width="64" height="7" rx="3.5" fill="#5b21b6" />
          <circle cx="50" cy="5" r="5.5" fill="#f472b6" />
        </>
      );
    case 'tophat':
      return (
        <>
          <rect x="32" y="0" width="36" height="17" rx="2" fill="#111827" />
          <rect x="32" y="11" width="36" height="6" fill="#dc2626" />
          <ellipse cx="50" cy="17" rx="26" ry="5" fill="#111827" />
        </>
      );
    case 'crown':
      return (
        <path
          d="M22 20 L30 6 L40 16 L50 2 L60 16 L70 6 L78 20 Z"
          fill="#f5c518"
          stroke="#b8860b"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      );
    case 'bandana':
      return (
        <>
          <path d="M20 20 a28 18 0 0 1 56 0 z" fill="#dc2626" />
          <path d="M76 14 l11 6 -11 4z" fill="#dc2626" />
          <circle cx="32" cy="10" r="2.2" fill="white" />
          <circle cx="44" cy="5" r="2.2" fill="white" />
          <circle cx="58" cy="5" r="2.2" fill="white" />
        </>
      );
    case 'helmet':
      return (
        <>
          <path d="M22 24 a28 22 0 0 1 56 0 z" fill="#1d4ed8" />
          <ellipse cx="39" cy="9" rx="9" ry="4.5" fill="#60a5fa" opacity={0.7} />
        </>
      );
    case 'catears':
      return (
        <>
          <path d="M22 18 L29 2 L43 16 Z" fill="#78350f" />
          <path d="M57 16 L71 2 L78 18 Z" fill="#78350f" />
          <path d="M27 14 L30 5 L38 13 Z" fill="#f472b6" />
          <path d="M62 13 L70 5 L73 14 Z" fill="#f472b6" />
        </>
      );
    case 'beret':
      return (
        <>
          <ellipse cx="50" cy="14" rx="30" ry="11" fill="#1f2937" transform="rotate(-8 50 14)" />
          <circle cx="76" cy="6" r="3.2" fill="#1f2937" />
        </>
      );
    case 'flower':
      return (
        <>
          {[28, 44, 56, 72].map((cx, i) => (
            <circle key={cx} cx={cx} cy={i % 2 === 0 ? 17 : 11} r="5.5" fill={i % 2 === 0 ? '#f472b6' : '#facc15'} />
          ))}
        </>
      );
    case 'none':
    default:
      return null;
  }
}

export default function Avatar({
  preset,
  size = 48,
  className = '',
}: {
  preset: AvatarPreset;
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const headGradId = `head-${uid}`;
  const bodyGradId = `body-${uid}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Avatar ${preset.face} ${preset.hat}`}
    >
      <defs>
        <radialGradient id={headGradId} cx="36%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#fff6ea" />
          <stop offset="45%" stopColor={SKIN} />
          <stop offset="100%" stopColor={shade(SKIN, -0.2)} />
        </radialGradient>
        <linearGradient id={bodyGradId} x1="25%" y1="0%" x2="75%" y2="100%">
          <stop offset="0%" stopColor={shade(preset.clothing, 0.35)} />
          <stop offset="55%" stopColor={preset.clothing} />
          <stop offset="100%" stopColor={shade(preset.clothing, -0.25)} />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="50" cy="97" rx="22" ry="3" fill="rgba(0,0,0,0.25)" />

      {/* hooray hands */}
      <ellipse cx="16" cy="74" rx="10" ry="12" fill={`url(#${bodyGradId})`} transform="rotate(-24 16 74)" />
      <ellipse cx="84" cy="74" rx="10" ry="12" fill={`url(#${bodyGradId})`} transform="rotate(24 84 74)" />

      {/* body */}
      <rect x="26" y="62" width="48" height="34" rx="17" fill={`url(#${bodyGradId})`} />

      {/* head (drawn after the body so the neck seam blends into one smooth silhouette) */}
      <circle cx="50" cy="38" r="28" fill={`url(#${headGradId})`} />
      {/* glossy highlight */}
      <ellipse cx="38" cy="21" rx="11" ry="6.5" fill="white" opacity={0.5} transform="rotate(-18 38 21)" />

      <Face face={preset.face} />
      <Hat hat={preset.hat} />
    </svg>
  );
}
