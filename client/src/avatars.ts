export const FACE_IDS = [
  'smile',
  'happy',
  'wink',
  'cool',
  'surprised',
  'heart',
  'star',
  'sleepy',
  'angry',
  'cat',
] as const;
export type FaceId = (typeof FACE_IDS)[number];

export const HAT_IDS = [
  'none',
  'cap',
  'beanie',
  'tophat',
  'crown',
  'bandana',
  'helmet',
  'catears',
  'beret',
  'flower',
] as const;
export type HatId = (typeof HAT_IDS)[number];

export const CLOTHING_COLORS = [
  '#f97316', // orange
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#22d3ee', // cyan
  '#84cc16', // lime
  '#ef4444', // red
  '#eab308', // yellow
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#f472b6', // rose
];

export interface AvatarPreset {
  id: string;
  face: FaceId;
  hat: HatId;
  clothing: string;
}

/** ~20 hand-picked combos of the same base "bonhomme" — only face/hat/clothing vary. */
export const AVATARS: AvatarPreset[] = [
  { id: 'a01', face: 'smile', hat: 'none', clothing: CLOTHING_COLORS[0] },
  { id: 'a02', face: 'cool', hat: 'cap', clothing: CLOTHING_COLORS[1] },
  { id: 'a03', face: 'happy', hat: 'beanie', clothing: CLOTHING_COLORS[2] },
  { id: 'a04', face: 'wink', hat: 'none', clothing: CLOTHING_COLORS[3] },
  { id: 'a05', face: 'star', hat: 'crown', clothing: CLOTHING_COLORS[4] },
  { id: 'a06', face: 'angry', hat: 'helmet', clothing: CLOTHING_COLORS[5] },
  { id: 'a07', face: 'cat', hat: 'catears', clothing: CLOTHING_COLORS[6] },
  { id: 'a08', face: 'surprised', hat: 'tophat', clothing: CLOTHING_COLORS[7] },
  { id: 'a09', face: 'heart', hat: 'flower', clothing: CLOTHING_COLORS[8] },
  { id: 'a10', face: 'sleepy', hat: 'beret', clothing: CLOTHING_COLORS[9] },
  { id: 'a11', face: 'smile', hat: 'bandana', clothing: CLOTHING_COLORS[5] },
  { id: 'a12', face: 'cool', hat: 'beanie', clothing: CLOTHING_COLORS[6] },
  { id: 'a13', face: 'happy', hat: 'cap', clothing: CLOTHING_COLORS[7] },
  { id: 'a14', face: 'wink', hat: 'tophat', clothing: CLOTHING_COLORS[8] },
  { id: 'a15', face: 'star', hat: 'none', clothing: CLOTHING_COLORS[9] },
  { id: 'a16', face: 'angry', hat: 'crown', clothing: CLOTHING_COLORS[0] },
  { id: 'a17', face: 'cat', hat: 'flower', clothing: CLOTHING_COLORS[1] },
  { id: 'a18', face: 'surprised', hat: 'helmet', clothing: CLOTHING_COLORS[2] },
  { id: 'a19', face: 'heart', hat: 'beret', clothing: CLOTHING_COLORS[3] },
  { id: 'a20', face: 'sleepy', hat: 'catears', clothing: CLOTHING_COLORS[4] },
];

const byId = new Map(AVATARS.map((a) => [a.id, a]));

export function getAvatar(avatarId: string | undefined): AvatarPreset {
  return (avatarId && byId.get(avatarId)) || AVATARS[0];
}
