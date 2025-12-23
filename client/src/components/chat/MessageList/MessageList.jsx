import  { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Sparkles } from 'lucide-react';
import styles from './MessageList.module.css';

const MessageList = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className={styles.container}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`${styles.row} ${message.type === 'user' ? styles.rowUser : styles.rowAssistant}`}
        >
          {/* Avatar */}
          <div className={`${styles.avatar} ${message.type === 'user' ? styles.avatarUser : styles.avatarAssistant}`}>
            {message.type === 'user' ? 'You' : <Sparkles size={16} />}
          </div>

          {/* Bubble */}
          <div className={styles.contentWrapper}>
            <div className={`${styles.bubble} ${message.type === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}>
              {message.image && (
                <img src={message.image} alt="Uploaded" className={styles.uploadedImage} />
              )}
              {message.content && (
                <p className={styles.text}>{message.content}</p>
              )}
            </div>
            <span className={styles.timestamp}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className={`${styles.row} ${styles.rowAssistant}`}>
          <div className={`${styles.avatar} ${styles.avatarAssistant}`}>
            <Sparkles size={16} />
          </div>
          <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>
            <div className={styles.typingIndicator}>
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool
};

export default MessageList;