import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Send, Mic, MicOff, Image, Smile, X } from 'lucide-react';
import styles from './ChatInput.module.css';

const EMOJIS = ['😊', '😂', '❤️', '👍', '🎉', '😢', '😡', '🤔', '👏', '🙏', '💪', '✨', '🔥', '💯', '🎯', '👋'];

const ChatInput = ({ 
  inputValue, 
  setInputValue, 
  onSendMessage, 
  isLoading, 
  imagePreview, 
  setImagePreview,
  isListening,
  onToggleListening
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleEmojiSelect = (emoji) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={styles.container}>
      {/* Image Preview Area */}
      {imagePreview && (
        <div className={styles.previewContainer}>
          <img src={imagePreview} alt="Preview" className={styles.previewImage} />
          <button onClick={removeImagePreview} className={styles.closePreviewBtn}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className={styles.emojiPicker}>
          {EMOJIS.map((emoji, idx) => (
            <button key={idx} onClick={() => handleEmojiSelect(emoji)} className={styles.emojiBtn}>
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className={styles.inputRow}>
        <div className={styles.actions}>
          <button 
            className={styles.iconBtn} 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isLoading}
          >
            <Image size={20} />
          </button>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            onChange={handleImageSelect} 
            style={{ display: 'none' }} 
          />
          
          <button 
            className={`${styles.iconBtn} ${isListening ? styles.listening : ''}`} 
            onClick={onToggleListening} 
            disabled={isLoading}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <button 
            className={styles.iconBtn} 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            disabled={isLoading}
          >
            <Smile size={20} />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          className={styles.textarea}
          rows={1}
        />

        <button 
          onClick={onSendMessage} 
          disabled={(!inputValue.trim() && !imagePreview) || isLoading}
          className={styles.sendBtn}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

ChatInput.propTypes = {
  inputValue: PropTypes.string.isRequired,
  setInputValue: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  imagePreview: PropTypes.string,
  setImagePreview: PropTypes.func,
  isListening: PropTypes.bool,
  onToggleListening: PropTypes.func
};

export default ChatInput;