import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Sparkles,User } from 'lucide-react';
import styles from './MessageList.module.css';
import TextToSpeech from '../../common/TextToSpeech/TextToSpeech.jsx'; // Make sure this path is correct

// Function to convert URLs in text to clickable links
const linkifyText = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#4A90E2', textDecoration: 'underline' }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

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
          <User size={20} strokeWidth={2.5} />
          </div>

          {/* Bubble */}
          <div className={styles.contentWrapper}>
            <div className={`${styles.bubble} ${message.type === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}>
              
              {/* Image Display */}
              {message.image && (
                <img src={message.image} alt="Uploaded" className={styles.uploadedImage} />
              )}
              
              {/* Text Content + Speaker Button */}
              {message.content && (
                <>
                  <p className={styles.text}>{linkifyText(message.content)}</p>

                  {/* ✅ INSERTED HERE: Speaker Button */}
                  <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'flex-end', opacity: 0.7 }}>
                    <TextToSpeech text={message.content} />
                  </div>
                </>
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