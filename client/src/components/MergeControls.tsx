import { useState } from 'react';
import type { RevealGroup } from '@nekozmindmatch/shared';

export default function MergeControls({
  groups,
  onMerge,
  onInvalidate,
}: {
  groups: RevealGroup[];
  onMerge: (normalizedKeys: string[]) => void;
  onInvalidate: (normalized: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(key: string) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function merge() {
    if (selected.length < 2) return;
    onMerge(selected);
    setSelected([]);
  }

  if (groups.length < 2) return null;

  return (
    <div className="w-full max-w-2xl rounded-2xl bg-black/30 p-4 flex flex-col gap-3">
      <p className="text-sm text-white/70">
        Réponses proches malgré une faute ? Coche-les puis fusionne-les manuellement.
      </p>
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <label
            key={group.normalized}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer border-2 transition ${
              selected.includes(group.normalized) ? 'border-pink-400 bg-pink-500/20' : 'border-white/10 bg-white/5'
            } ${group.suggestedMergeWith.length > 0 ? 'ring-1 ring-yellow-300/60' : ''}`}
          >
            <input
              type="checkbox"
              checked={selected.includes(group.normalized)}
              onChange={() => toggle(group.normalized)}
              className="accent-pink-500"
            />
            <span className="font-semibold">{group.displayText}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onInvalidate(group.normalized);
              }}
              className={`text-xs px-2 py-0.5 rounded-full ${
                group.invalidated ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {group.invalidated ? 'Invalidée' : 'Invalider'}
            </button>
          </label>
        ))}
      </div>
      <button
        disabled={selected.length < 2}
        onClick={merge}
        className="self-start rounded-xl px-4 py-2 font-bold bg-pink-500 hover:bg-pink-400 disabled:opacity-30 disabled:hover:bg-pink-500 transition"
      >
        Fusionner la sélection ({selected.length})
      </button>
    </div>
  );
}
