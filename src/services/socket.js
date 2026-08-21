import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to ERP Socket.IO server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('⚡ Disconnected from ERP Socket.IO server');
    });
  }
  return socket;
}

export function subscribeToErpUpdates(callback) {
  const s = getSocket();
  const handler = (payload) => {
    console.log('⚡ Real-time ERP event received:', payload);
    if (callback) callback(payload);
  };

  s.on('erp:update', handler);
  s.on('dashboard:refresh', handler);

  return () => {
    s.off('erp:update', handler);
    s.off('dashboard:refresh', handler);
  };
}
