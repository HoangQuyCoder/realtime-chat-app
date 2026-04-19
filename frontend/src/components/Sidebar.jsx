import { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { rooms, activeRoom, onlineUsers, fetchRooms, joinRoom, createRoom } = useChat();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  const [tab, setTab] = useState('rooms'); // 'rooms' | 'people'
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  useEffect(() => {
    if (tab !== 'people') return;
    api.get('/users').then(({ data }) => setUsers(data));
  }, [tab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRoom.name.trim()) return;
    setCreating(true);
    setError('');
    try {
      const room = await createRoom(newRoom.name.trim(), newRoom.description.trim());
      setShowCreate(false);
      setNewRoom({ name: '', description: '' });
      joinRoom(room);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.logo}>💬 ChatApp</span>
        <button className={styles.logoutBtn} onClick={logout} title="Logout">⏻</button>
      </div>

      {/* User info */}
      <div className={styles.userInfo}>
        <div className={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
        <div>
          <p className={styles.userName}>{user?.username}</p>
          <p className={styles.userEmail}>{user?.email}</p>
        </div>
        <span className={styles.onlineDot} />
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'rooms' ? styles.active : ''}`} onClick={() => setTab('rooms')}>
          Rooms <span className={styles.count}>{rooms.length}</span>
        </button>
        <button className={`${styles.tab} ${tab === 'people' ? styles.active : ''}`} onClick={() => setTab('people')}>
          People <span className={styles.count}>{onlineUsers.size}</span>
        </button>
      </div>

      {/* Content */}
      <div className={styles.list}>
        {tab === 'rooms' ? (
          <>
            {rooms.map((room) => (
              <button
                key={room._id}
                className={`${styles.roomItem} ${activeRoom?._id === room._id ? styles.roomActive : ''}`}
                onClick={() => joinRoom(room)}
              >
                <span className={styles.roomHash}>#</span>
                <div className={styles.roomInfo}>
                  <span className={styles.roomName}>{room.name}</span>
                  {room.description && <span className={styles.roomDesc}>{room.description}</span>}
                </div>
              </button>
            ))}
            {rooms.length === 0 && <p className={styles.empty}>No rooms yet. Create one!</p>}
          </>
        ) : (
          users.map((u) => (
            <div key={u._id} className={styles.userItem}>
              <div className={styles.userAvatar}>
                {u.username[0].toUpperCase()}
                {onlineUsers.has(u._id) && <span className={styles.onlineBadge} />}
              </div>
              <div>
                <p className={styles.userName}>{u.username}</p>
                <p className={styles.userStatus}>
                  {onlineUsers.has(u._id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create room */}
      {tab === 'rooms' && (
        <div className={styles.footer}>
          {showCreate ? (
            <form onSubmit={handleCreate} className={styles.createForm}>
              <input
                value={newRoom.name}
                onChange={(e) => setNewRoom((f) => ({ ...f, name: e.target.value }))}
                placeholder="Room name"
                maxLength={50}
                autoFocus
              />
              <input
                value={newRoom.description}
                onChange={(e) => setNewRoom((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
                maxLength={200}
              />
              {error && <p className={styles.createError}>{error}</p>}
              <div className={styles.createBtns}>
                <button type="button" onClick={() => { setShowCreate(false); setError(''); }} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.createBtn} disabled={creating}>
                  {creating ? '...' : 'Create'}
                </button>
              </div>
            </form>
          ) : (
            <button className={styles.newRoomBtn} onClick={() => setShowCreate(true)}>
              + New Room
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
