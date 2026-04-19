import User from '../models/User.js';
import { getOnlineUsers } from '../socket/handlers.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('username avatar isOnline lastSeen')
      .sort({ isOnline: -1, username: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOnlineUsersList = async (req, res) => {
  try {
    const onlineIds = await getOnlineUsers();
    const users = await User.find({ _id: { $in: onlineIds } })
      .select('username avatar isOnline');
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
