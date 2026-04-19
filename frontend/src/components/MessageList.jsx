import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './MessageList.module.css';

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const formatDate = (date) =>
  new Date(date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' });

export default function MessageList({ messages = [], typing = {} }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const date = new Date(msg.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  const typingUsers = Object.values(typing);

  return (
    <div className={styles.list}>
      {messages.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>💬</span>
          <p>No messages yet. Say something!</p>
        </div>
      )}

      {Object.entries(grouped).map(([date, msgs]) => (
        <div key={date}>
          <div className={styles.dateDivider}>
            <span>{formatDate(new Date(date))}</span>
          </div>
          {msgs.map((msg, i) => {
            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
            const prevMsg = msgs[i - 1];
            const sameSender = prevMsg?.sender?._id === msg.sender?._id;
            const closeInTime = prevMsg && (new Date(msg.createdAt) - new Date(prevMsg.createdAt)) < 60000;
            const compact = sameSender && closeInTime;

            return (
              <div key={msg._id} className={`${styles.msgRow} ${isMe ? styles.mine : ''} ${compact ? styles.compact : ''}`}>
                {!isMe && !compact && (
                  <div className={styles.avatar}>{msg.sender?.username?.[0]?.toUpperCase() || '?'}</div>
                )}
                {!isMe && compact && <div className={styles.avatarSpacer} />}

                <div className={styles.bubble}>
                  {!isMe && !compact && (
                    <span className={styles.senderName}>{msg.sender?.username}</span>
                  )}
                  <p className={styles.text}>{msg.content}</p>
                  <span className={styles.time}>{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className={`${styles.msgRow} ${styles.typingRow}`}>
          <div className={styles.avatar}>{typingUsers[0][0]?.toUpperCase()}</div>
          <div className={styles.typingBubble}>
            <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
          </div>
          <span className={styles.typingLabel}>
            {typingUsers.slice(0, 2).join(', ')} {typingUsers.length > 2 ? `+${typingUsers.length - 2}` : ''} typing...
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
