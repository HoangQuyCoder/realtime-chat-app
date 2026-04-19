import { useState, useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext.jsx';
import styles from './MessageInput.module.css';

export default function MessageInput() {
  const { sendMessage, emitTyping } = useChat();
  const [text, setText] = useState('');
  const typingRef = useRef(false);
  const typingTimeout = useRef(null);

  const handleTyping = useCallback((val) => {
    if (val && !typingRef.current) {
      typingRef.current = true;
      emitTyping(true);
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      typingRef.current = false;
      emitTyping(false);
    }, 2000);
  }, [emitTyping]);

  const handleChange = (e) => {
    setText(e.target.value);
    handleTyping(e.target.value);
  };

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
    clearTimeout(typingTimeout.current);
    typingRef.current = false;
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.inputRow}>
        <textarea
          className={styles.input}
          value={text}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
          rows={1}
        />
        <button className={styles.sendBtn} onClick={submit} disabled={!text.trim()} title="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
