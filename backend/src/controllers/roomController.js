import Room from '../models/Room.js';
import Message from '../models/Message.js';

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate('createdBy', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = await Room.findOne({ name });
    if (existing) return res.status(409).json({ message: 'Room name already taken' });

    const room = await Room.create({
      name, description,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    await room.populate('createdBy', 'username avatar');
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { before, limit = 30 } = req.query;

    const query = { roomId };
    if (before) query._id = { $lt: before };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('sender', 'username avatar');

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
