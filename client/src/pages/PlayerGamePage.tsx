import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRoom } from '../state/useRoom';
import { useRoomSounds } from '../state/useRoomSounds';
import { readSession, socket, storeSession } from '../socket';
import { playSubmit } from '../sounds';
import { computeStats } from '../stats';
import { AVATARS } from '../avatars';
import Avatar from '../components/Avatar';
import PlayerBubble from '../components/PlayerBubble';
import Timer from '../components/Timer';
import RevealBoard from '../components/RevealBoard';
import Scoreboard from '../components/Scoreboard';
import StatsPanel from '../components/StatsPanel';

export default function PlayerGamePage() {
  const { code = '' } = useParams();
  const { room, error, myPlayerId } = useRoom(code);
  const [answer, setAnswer] = useState('');
  const [, bump] = useState(0);

  useRoomSounds(room);

  const session = readSession();
  const hasSessionForThisRoom = session?.code === code;

  if (error) return <Centered>{error}</Centered>;
  if (!hasSessionForThisRoom) return <JoinForm code={code} onJoined={() => bump((n) => n + 1)} />;
  if (!room || !myPlayerId) return <Centered>Connexion à la partie…</Centered>;

  const me = room.players.find((p) => p.id === myPlayerId);
  const hasAnswered = room.answeredPlayerIds.includes(myPlayerId);

  function submit() {
    if (!answer.trim()) return;
    playSubmit();
    socket.emit('round:submit', { code, answer });
    setAnswer('');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 py-8 text-center">
      {room.status === 'lobby' && (
        <>
          <p className="text-white/60">Code de la partie</p>
          <p className="text-4xl font-black tracking-[0.3em]">{room.code}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {room.players.map((p) => (
              <PlayerBubble key={p.id} player={p} />
            ))}
          </div>
          <p className="text-white/60">En attente que l'hôte démarre la partie…</p>
        </>
      )}

      {room.status === 'round_active' && (
        <>
          {room.isChaosRound && (
            <div className="rounded-2xl bg-orange-500 text-white font-black px-6 py-3 text-center animate-pop-in">
              ⚡ MANCHE CHAOS — Sois DIFFÉRENT des autres !
            </div>
          )}
          <Timer deadline={room.roundDeadline} />
          {hasAnswered ? (
            <p className="text-2xl font-black">✅ Envoyé, en attente des autres…</p>
          ) : (
            <>
              <div>
                <p className="text-sm uppercase tracking-widest text-white/50">{room.currentPrompt?.category}</p>
                {room.currentPrompt?.emoji && <p className="text-6xl mt-1">{room.currentPrompt.emoji}</p>}
                <h2 className="text-3xl font-black mt-1">{room.currentPrompt?.title}</h2>
                {room.currentPrompt?.subtitle && (
                  <p className="text-white/60 mt-1">{room.currentPrompt.subtitle}</p>
                )}
              </div>
              <input
                autoFocus
                value={answer}
                maxLength={40}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Ton mot…"
                className="w-full max-w-xs rounded-xl px-4 py-3 text-black text-center text-xl font-bold outline-none"
              />
              <button
                onClick={submit}
                disabled={!answer.trim()}
                className="rounded-xl px-8 py-3 font-black bg-pink-500 hover:bg-pink-400 disabled:opacity-30 transition"
              >
                Valider
              </button>
            </>
          )}
        </>
      )}

      {room.status === 'round_reveal' && room.lastReveal && (
        <RevealBoard
          reveal={room.lastReveal}
          players={room.players}
          roundKey={room.currentRoundIndex}
          isHost={false}
          onMerge={() => {}}
          onInvalidate={() => {}}
          onLock={() => {}}
        />
      )}

      {room.status === 'ended' && (
        <>
          <h2 className="text-3xl font-black">🏆 Partie terminée</h2>
          <Scoreboard players={room.players} final />
          {me && <p className="text-white/60">Tu termines avec {me.score} points.</p>}
          <StatsPanel stats={computeStats(room.players, room.history)} />
        </>
      )}
    </div>
  );
}

/**
 * Shown when this tab has no session for this room code — e.g. someone opens a /play/:code
 * link directly (shared by a friend, or a fresh tab that doesn't inherit sessionStorage) without
 * ever going through the home page. Lets them join right here instead of getting stuck.
 */
function JoinForm({ code, onJoined }: { code: string; onJoined: () => void }) {
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState(AVATARS[0].id);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function join() {
    if (!name.trim()) return setErr('Choisis un pseudo.');
    setPending(true);
    socket.emit('room:join', { code, playerName: name, avatarId }, (result) => {
      setPending(false);
      if (!result.ok) return setErr(result.error);
      storeSession(result.code, result.playerId);
      onJoined();
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-8 text-center">
      <h1 className="text-2xl font-black">Rejoindre la partie {code}</h1>
      <input
        className="w-full max-w-xs rounded-xl px-4 py-3 text-black text-center font-bold outline-none"
        placeholder="Ton pseudo"
        maxLength={20}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="grid grid-cols-5 gap-2 justify-items-center max-w-xs">
        {AVATARS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setAvatarId(preset.id)}
            className={`rounded-xl p-1 border-2 transition ${
              preset.id === avatarId ? 'border-pink-400 bg-white/20 scale-110' : 'border-transparent hover:bg-white/10'
            }`}
          >
            <Avatar preset={preset} size={36} />
          </button>
        ))}
      </div>
      <button
        disabled={pending}
        onClick={join}
        className="rounded-xl px-8 py-3 font-black bg-pink-500 hover:bg-pink-400 disabled:opacity-50 transition"
      >
        Rejoindre
      </button>
      {err && <p className="text-red-300 text-sm font-medium">{err}</p>}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center text-center px-4">{children}</div>;
}
