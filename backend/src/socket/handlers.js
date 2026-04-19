import Message from '../models/Message.js';
import User from '../models/User.js';
import { redis } from '../config/redis.js';

const ONLINE_KEY = 'online_users';
const PRESENCE_TTL = 35;

export const registerSocketHandlers = (io) => {
  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`🔌 ${user.username} connected [${socket.id}]`);

    // Mark user online
    await redis.sadd(ONLINE_KEY, user._id.toString());
    await redis.setex(`presence:${user._id}`, PRESENCE_TTL, socket.id);
    await User.findByIdAndUpdate(user._id, { isOnline: true });
    io.emit('user_online', { userId: user._id, username: user.username });

    // ── JOIN ROOM ──────────────────────────────────────────
    socket.on('join_room', async ({ roomId }) => {
      socket.join(roomId);
      socket.currentRoom = roomId;

      // Notify others
      socket.to(roomId).emit('user_joined_room', {
        userId: user._id, username: user.username, roomId,
      });

      // Send last 30 messages as history
      const messages = await Message.find({ roomId })
        .sort({ createdAt: -1 }).limit(30)
        .populate('sender', 'username avatar');
      socket.emit('message_history', messages.reverse());
    });

    // ── LEAVE ROOM ─────────────────────────────────────────
    socket.on('leave_room', ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user_left_room', {
        userId: user._id, username: user.username, roomId,
      });
    });

    // ── SEND MESSAGE ───────────────────────────────────────
    socket.on('send_message', async ({ roomId, content }) => {
      if (!content?.trim() || !roomId) return;

      try {
        const message = await Message.create({
          roomId, content: content.trim(), sender: user._id,
        });
        await message.populate('sender', 'username avatar');

        // Broadcast to entire room (Redis adapter handles multi-instance fan-out)
        io.to(roomId).emit('new_message', {
          _id: message._id,
          roomId,
          content: message.content,
          sender: message.sender,
          createdAt: message.createdAt,
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── TYPING INDICATORS ──────────────────────────────────
    socket.on('typing_start', ({ roomId }) => {
      socket.to(roomId).emit('user_typing', { userId: user._id, username: user.username, roomId });
    });

    socket.on('typing_stop', ({ roomId }) => {
      socket.to(roomId).emit('user_stop_typing', { userId: user._id, roomId });
    });

    // ── HEARTBEAT (keeps presence alive) ──────────────────
    socket.on('heartbeat', async () => {
      await redis.setex(`presence:${user._id}`, PRESENCE_TTL, socket.id);
    });

    // ── DISCONNECT ─────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔌 ${user.username} disconnected`);
      await redis.srem(ONLINE_KEY, user._id.toString());
      await redis.del(`presence:${user._id}`);
      await User.findByIdAndUpdate(user._id, { isOnline: false, lastSeen: new Date() });
      io.emit('user_offline', { userId: user._id, username: user.username });
    });
  });
};

// Helper: get all online user IDs
export const getOnlineUsers = async () => {
  return redis.smembers(ONLINE_KEY);
};
