import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRoom } from '../state/useRoom';
import { useRoomSounds } from '../state/useRoomSounds';
import { socket } from '../socket';
import { SERVER_URL } from '../config';
import { playLock, playSubmit } from '../sounds';
import { computeStats } from '../stats';
import PlayerBubble from '../components/PlayerBubble';
import Timer from '../components/Timer';
import RevealBoard from '../components/RevealBoard';
import Scoreboard from '../components/Scoreboard';
import StatsPanel from '../components/StatsPanel';

export default function HostGamePage() {
  const { code = '' } = useParams();
  const { room, error, myPlayerId } = useRoom(code);
  const [categories, setCategories] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customEmoji, setCustomEmoji] = useState('');

  useRoomSounds(room);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  if (error) return <Centered>{error}</Centered>;
  if (!room) return <Centered>Connexion à la partie…</Centered>;

  const toggleCategory = (cat: string) => {
    const current = room.settings.categories;
    const next = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat];
    socket.emit('room:updateSettings', { code, settings: { categories: next } });
  };

  const hostHasAnswered = !myPlayerId || room.answeredPlayerIds.includes(myPlayerId);

  function submitHostAnswer() {
    if (!answer.trim()) return;
    playSubmit();
    socket.emit('round:submit', { code, answer });
    setAnswer('');
  }

  function addCustomPrompt() {
    if (!customTitle.trim()) return;
    socket.emit('room:addCustomPrompt', { code, category: 'Perso', title: customTitle, emoji: customEmoji || undefined });
    setCustomTitle('');
    setCustomEmoji('');
  }

  return (
    <div className="min-h-screen flex flex-col items-center gap-6 px-4 py-8">
      <header className="flex items-center gap-3">
        <h1 className="text-2xl font-black">🧠 NekoZ MindMatch</h1>
        {room.status === 'lobby' && (
          <span className="rounded-xl bg-white/10 px-4 py-1 font-black tracking-[0.3em] text-2xl">{room.code}</span>
        )}
      </header>

      {room.status === 'lobby' && (
        <div className="w-full max-w-2xl flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-4">
            {room.players.map((p) => (
              <PlayerBubble key={p.id} player={p} size="lg" />
            ))}
          </div>

          <div className="w-full rounded-2xl bg-white/10 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <label className="flex-1">
                Manches
                <input
                  type="number"
                  min={3}
                  max={30}
                  value={room.settings.totalRounds}
                  onChange={(e) =>
                    socket.emit('room:updateSettings', {
                      code,
                      settings: { totalRounds: Number(e.target.value) },
                    })
                  }
                  className="w-full mt-1 rounded-lg px-3 py-2 text-black"
                />
              </label>
              <label className="flex-1">
                Timer (s)
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={room.settings.timerSeconds}
                  onChange={(e) =>
                    socket.emit('room:updateSettings', {
                      code,
                      settings: { timerSeconds: Number(e.target.value) },
                    })
                  }
                  className="w-full mt-1 rounded-lg px-3 py-2 text-black"
                />
              </label>
            </div>

            <div>
              <p className="text-sm text-white/70 mb-2">Catégories (aucune = toutes)</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                      room.settings.categories.includes(cat)
                        ? 'bg-pink-500'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-white/70 mb-2">Tes propres prompts (toujours inclus)</p>
              <div className="flex gap-2 mb-2">
                <input
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  placeholder="🎯"
                  maxLength={4}
                  className="w-14 rounded-lg px-2 py-2 text-black text-center"
                />
                <input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomPrompt()}
                  placeholder="Ex: Le prof de sport du lycée"
                  maxLength={60}
                  className="flex-1 rounded-lg px-3 py-2 text-black"
                />
                <button
                  onClick={addCustomPrompt}
                  disabled={!customTitle.trim()}
                  className="rounded-lg px-4 font-bold bg-pink-500 hover:bg-pink-400 disabled:opacity-30 transition"
                >
                  Ajouter
                </button>
              </div>
              {room.settings.customPrompts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {room.settings.customPrompts.map((prompt) => (
                    <span
                      key={prompt.id}
                      className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm"
                    >
                      {prompt.emoji} {prompt.title}
                      <button
                        onClick={() => socket.emit('room:removeCustomPrompt', { code, promptId: prompt.id })}
                        className="ml-1 text-white/50 hover:text-white"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            disabled={room.players.length < 3}
            onClick={() => socket.emit('room:start', { code })}
            className="rounded-xl px-8 py-4 font-black text-xl bg-pink-500 hover:bg-pink-400 disabled:opacity-30 transition"
          >
            {room.players.length < 3 ? `Il faut 3 joueurs (${room.players.length}/3)` : 'Démarrer la partie'}
          </button>
        </div>
      )}

      {room.status === 'round_active' && room.currentPrompt && (
        <div className="flex flex-col items-center gap-8 flex-1 justify-center">
          {room.isChaosRound && (
            <div className="rounded-2xl bg-orange-500 text-white font-black px-6 py-3 text-center animate-pop-in">
              ⚡ MANCHE CHAOS — Sois DIFFÉRENT des autres cette fois !
            </div>
          )}
          <Timer deadline={room.roundDeadline} />
          <div className="text-center">
            <p className="text-sm uppercase tracking-widest text-white/50">{room.currentPrompt.category}</p>
            {room.currentPrompt.emoji && <p className="text-6xl mt-2">{room.currentPrompt.emoji}</p>}
            <h2 className="text-5xl font-black mt-2">{room.currentPrompt.title}</h2>
            {room.currentPrompt.subtitle && (
              <p className="text-xl text-white/60 mt-1">{room.currentPrompt.subtitle}</p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {room.players.map((p) => (
              <PlayerBubble key={p.id} player={p} size="lg" hasAnswered={room.answeredPlayerIds.includes(p.id)} />
            ))}
          </div>
          <p className="text-white/60">
            {room.answeredPlayerIds.length}/{room.players.filter((p) => p.connected).length} ont répondu
          </p>

          {myPlayerId && (
            <div className="flex flex-col items-center gap-2">
              {hostHasAnswered ? (
                <p className="font-black">✅ Ta réponse est envoyée</p>
              ) : (
                <>
                  <input
                    autoFocus
                    autoComplete="off"
                    value={answer}
                    maxLength={40}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitHostAnswer()}
                    placeholder="Ton mot…"
                    className="w-full max-w-xs rounded-xl px-4 py-3 text-black text-center text-xl font-bold outline-none"
                  />
                  <button
                    onClick={submitHostAnswer}
                    disabled={!answer.trim()}
                    className="rounded-xl px-8 py-3 font-black bg-pink-500 hover:bg-pink-400 disabled:opacity-30 transition"
                  >
                    Valider
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {room.status === 'round_reveal' && room.lastReveal && (
        <div className="flex flex-col items-center gap-6 flex-1">
          <p className="text-white/60">
            Manche {room.currentRoundIndex + 1}/{room.settings.totalRounds} —{' '}
            <span className="font-bold text-white">{room.currentPrompt?.title}</span>
          </p>
          <RevealBoard
            reveal={room.lastReveal}
            players={room.players}
            roundKey={room.currentRoundIndex}
            isHost
            onMerge={(keys) => socket.emit('round:mergeGroups', { code, normalizedKeys: keys })}
            onInvalidate={(key) => socket.emit('round:invalidateGroup', { code, normalized: key })}
            onLock={() => {
              playLock();
              socket.emit('round:lockReveal', { code });
            }}
          />
          {room.lastReveal.locked && (
            <>
              <Scoreboard players={room.players} />
              <button
                onClick={() => socket.emit('round:next', { code })}
                className="rounded-xl px-8 py-4 font-black text-xl bg-pink-500 hover:bg-pink-400 transition"
              >
                {room.currentRoundIndex + 1 >= room.settings.totalRounds ? 'Voir le podium' : 'Manche suivante'}
              </button>
            </>
          )}
        </div>
      )}

      {room.status === 'ended' && (
        <div className="flex flex-col items-center gap-6 flex-1 justify-center">
          <h2 className="text-4xl font-black">🏆 Podium final</h2>
          <Scoreboard players={room.players} final />
          <StatsPanel stats={computeStats(room.players, room.history)} />
          <a href="/" className="rounded-xl px-6 py-3 font-bold bg-white/10 hover:bg-white/20 transition">
            Nouvelle partie
          </a>
        </div>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center text-center px-4">{children}</div>;
}
