import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_URL } from '@/constants/Config';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, role, user } = useAuth();
  const userId = user?.id;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Connect to the backend server
    const backendUrl = API_URL.replace('/api', '');
    const newSocket = io(backendUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO Connected:', newSocket.id);
      setIsConnected(true);
      // Optional: authenticate socket or join user-specific room
      if (userId) {
        newSocket.emit('join_user_room', userId);
      }
      if (role) {
        newSocket.emit('join_role_room', role);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO Disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isLoggedIn, userId, role]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
