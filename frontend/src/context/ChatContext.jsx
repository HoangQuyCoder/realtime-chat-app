import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '../services/socket.js';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState({}); // { roomId: Message[] }
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typing, setTyping] = useState({}); // { roomId: { userId: username } }
  const typingTimers = useRef({});

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    const { data } = await api.get('/rooms');
    setRooms(data);
  }, []);

  // Load message history for a room
  const loadHistory = useCallback(async (roomId) => {
    if (messages[roomId]) return; // already loaded
    const { data } = await api.get(`/rooms/${roomId}/messages`);
    setMessages((prev) => ({ ...prev, [roomId]: data }));
  }, [messages]);

  // Join a room
  const joinRoom = useCallback(async (room) => {
    const socket = getSocket();
    if (!socket) return;
    if (activeRoom?._id === room._id) return;

    setActiveRoom(room);
    await loadHistory(room._id);
    socket.emit('join_room', { roomId: room._id });
  }, [activeRoom, loadHistory]);

  // Send message
  const sendMessage = useCallback((content) => {
    const socket = getSocket();
    if (!socket || !activeRoom) return;
    socket.emit('send_message', { roomId: activeRoom._id, content });
    socket.emit('typing_stop', { roomId: activeRoom._id });
  }, [activeRoom]);

  // Create room
  const createRoom = useCallback(async (name, description) => {
    const { data } = await api.post('/rooms', { name, description });
    setRooms((prev) => [data, ...prev]);
    return data;
  }, []);

  // Typing indicator
  const emitTyping = useCallback((isTyping) => {
    const socket = getSocket();
    if (!socket || !activeRoom) return;
    socket.emit(isTyping ? 'typing_start' : 'typing_stop', { roomId: activeRoom._id });
  }, [activeRoom]);

  // Wire up socket events
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    const onNewMessage = (msg) => {
      setMessages((prev) => ({
        ...prev,
        [msg.roomId]: [...(prev[msg.roomId] || []), msg],
      }));
    };

    const onHistory = (msgs) => {
      if (!msgs.length) return;
      const roomId = msgs[0].roomId;
      setMessages((prev) => ({ ...prev, [roomId]: msgs }));
    };

    const onUserOnline = ({ userId }) => setOnlineUsers((s) => new Set([...s, userId]));
    const onUserOffline = ({ userId }) => setOnlineUsers((s) => { const n = new Set(s); n.delete(userId); return n; });

    const onTyping = ({ userId, username, roomId }) => {
      setTyping((prev) => ({ ...prev, [roomId]: { ...(prev[roomId] || {}), [userId]: username } }));
      clearTimeout(typingTimers.current[userId]);
      typingTimers.current[userId] = setTimeout(() => {
        setTyping((prev) => {
          const r = { ...(prev[roomId] || {}) };
          delete r[userId];
          return { ...prev, [roomId]: r };
        });
      }, 3000);
    };

    const onStopTyping = ({ userId, roomId }) => {
      setTyping((prev) => {
        const r = { ...(prev[roomId] || {}) };
        delete r[userId];
        return { ...prev, [roomId]: r };
      });
    };

    socket.on('new_message', onNewMessage);
    socket.on('message_history', onHistory);
    socket.on('user_online', onUserOnline);
    socket.on('user_offline', onUserOffline);
    socket.on('user_typing', onTyping);
    socket.on('user_stop_typing', onStopTyping);

    // Heartbeat every 30s
    const heartbeat = setInterval(() => socket.emit('heartbeat'), 30000);

    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('message_history', onHistory);
      socket.off('user_online', onUserOnline);
      socket.off('user_offline', onUserOffline);
      socket.off('user_typing', onTyping);
      socket.off('user_stop_typing', onStopTyping);
      clearInterval(heartbeat);
    };
  }, [user]);

  return (
    <ChatContext.Provider value={{
      rooms, activeRoom, messages, onlineUsers, typing,
      fetchRooms, joinRoom, sendMessage, createRoom, emitTyping,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
