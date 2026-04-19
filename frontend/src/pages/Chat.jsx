import { useChat } from '../context/ChatContext.jsx';
import Sidebar from '../components/Sidebar.jsx';
import MessageList from '../components/MessageList.jsx';
import MessageInput from '../components/MessageInput.jsx';
import styles from './Chat.module.css';

export default function ChatPage() {
  const { activeRoom, messages, typing, onlineUsers } = useChat();
  const roomMessages = activeRoom ? (messages[activeRoom._id] || []) : [];
  const roomTyping = activeRoom ? (typing[activeRoom._id] || {}) : {};

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        {activeRoom ? (
          <>
            {/* Room header */}
            <div className={styles.header}>
              <div>
                <h2 className={styles.roomName}># {activeRoom.name}</h2>
                {activeRoom.description && (
                  <p className={styles.roomDesc}>{activeRoom.description}</p>
                )}
              </div>
              <div className={styles.meta}>
                <span className={styles.onlinePill}>
                  <span className={styles.greenDot} />
                  {onlineUsers.size} online
                </span>
              </div>
            </div>

            {/* Messages */}
            <MessageList messages={roomMessages} typing={roomTyping} />

            {/* Input */}
            <MessageInput />
          </>
        ) : (
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>💬</div>
            <h2>Welcome to ChatApp</h2>
            <p>Select a room from the sidebar to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
}
