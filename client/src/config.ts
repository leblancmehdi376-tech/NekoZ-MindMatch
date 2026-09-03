/**
 * Base URL of the Socket.IO/HTTP server. Empty string = same origin, which is what makes local
 * dev work (Vite's dev proxy forwards /socket.io and /api to localhost:4000). In production
 * (e.g. client deployed on Vercel, server on Render), set VITE_SERVER_URL at build time to the
 * server's public URL.
 */
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';
