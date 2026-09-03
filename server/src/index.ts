import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@nekozmindmatch/shared';
import { CATEGORIES } from './data/prompts.js';
import { registerSocketHandlers } from './socketHandlers.js';

const PORT = Number(process.env.PORT) || 4000;

// Comma-separated list of allowed client origins in production (e.g. "https://nekoz-mindmatch.vercel.app").
// Left unset (falls back to "*"), any origin can connect — fine for local/dev, tighten it once the
// client is deployed by setting CORS_ORIGIN on the server host.
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean);
const corsOptions = { origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : '*' };

const app = express();
app.use(cors(corsOptions));
app.get('/api/categories', (_req, res) => res.json(CATEGORIES));

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: corsOptions,
});

io.on('connection', (socket) => registerSocketHandlers(io, socket));

httpServer.listen(PORT, '0.0.0.0', () => {
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter((iface): iface is NonNullable<typeof iface> => !!iface && iface.family === 'IPv4' && !iface.internal)
    .map((iface) => iface.address);

  console.log(`\n🧠 NekoZ MindMatch server running on port ${PORT}`);
  console.log(`   Local:   http://localhost:${PORT}`);
  for (const address of addresses) console.log(`   Network: http://${address}:${PORT}`);
  console.log('');
});
