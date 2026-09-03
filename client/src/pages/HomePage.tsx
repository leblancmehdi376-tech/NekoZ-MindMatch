import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket, storeSession } from '../socket';
import { AVATARS } from '../avatars';
import Avatar from '../components/Avatar';

export default function HomePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'menu' | 'join'>('menu');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [avatarId, setAvatarId] = useState(AVATARS[0].id);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function createRoom() {
    if (!name.trim()) return setError('Choisis un pseudo.');
    setPending(true);
    socket.emit('room:create', { playerName: name, avatarId }, (result) => {
      setPending(false);
      if (!result.ok) return setError(result.error);
      storeSession(result.code, result.playerId);
      navigate(`/host/${result.code}`);
    });
  }

  function joinRoom() {
    if (!name.trim()) return setError('Choisis un pseudo.');
    if (!code.trim()) return setError('Entre le code de la partie.');
    setPending(true);
    socket.emit('room:join', { code: code.trim().toUpperCase(), playerName: name, avatarId }, (result) => {
      setPending(false);
      if (!result.ok) return setError(result.error);
      storeSession(result.code, result.playerId);
      navigate(`/play/${result.code}`);
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-8 text-center">
      <div>
        <h1 className="text-5xl font-black tracking-tight drop-shadow-lg">
          🧠 NekoZ <span className="text-pink-400">MindMatch</span>
        </h1>
        <p className="mt-2 text-white/70">Pensez comme les autres. Un seul mot suffit.</p>
      </div>

      <div className="w-full max-w-sm rounded-3xl bg-white/10 backdrop-blur p-6 flex flex-col gap-4 shadow-2xl">
        <input
          className="rounded-xl px-4 py-3 bg-white/90 text-black placeholder-black/40 font-medium outline-none"
          placeholder="Ton pseudo"
          maxLength={20}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div>
          <p className="text-sm text-white/60 mb-2">Choisis ton avatar</p>
          <div className="grid grid-cols-5 gap-2 justify-items-center">
            {AVATARS.map((preset) => (
              <button
                key={preset.id}
                aria-label={`Choisir l'avatar ${preset.id}`}
                onClick={() => setAvatarId(preset.id)}
                className={`rounded-xl p-1 border-2 transition ${
                  preset.id === avatarId ? 'border-pink-400 bg-white/20 scale-110' : 'border-transparent hover:bg-white/10'
                }`}
              >
                <Avatar preset={preset} size={40} />
              </button>
            ))}
          </div>
        </div>

        {mode === 'menu' ? (
          <>
            <button
              disabled={pending}
              onClick={createRoom}
              className="rounded-xl py-3 font-bold bg-pink-500 hover:bg-pink-400 transition disabled:opacity-50"
            >
              Créer une partie
            </button>
            <button
              onClick={() => setMode('join')}
              className="rounded-xl py-3 font-bold bg-white/10 hover:bg-white/20 transition"
            >
              Rejoindre une partie
            </button>
          </>
        ) : (
          <>
            <input
              className="rounded-xl px-4 py-3 bg-white/90 text-black placeholder-black/40 font-medium outline-none tracking-widest text-center uppercase"
              placeholder="CODE"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <button
              disabled={pending}
              onClick={joinRoom}
              className="rounded-xl py-3 font-bold bg-pink-500 hover:bg-pink-400 transition disabled:opacity-50"
            >
              Rejoindre
            </button>
            <button onClick={() => setMode('menu')} className="text-sm text-white/60 hover:text-white">
              ← Retour
            </button>
          </>
        )}

        {error && <p className="text-red-300 text-sm font-medium">{error}</p>}
      </div>
    </div>
  );
}
