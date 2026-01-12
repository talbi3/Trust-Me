import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Sparkles, User, Pencil, Trash2, X, Check } from 'lucide-react';
import styles from './MessageList.module.css';
import TextToSpeech from '../../common/TextToSpeech/TextToSpeech.jsx';
import AIDetectionSlider from '../AIDetectionSlider/AIDetectionSlider.jsx';
import YouTubeAnalysisCard from '../YouTubeAnalysisCard/YouTubeAnalysisCard.jsx';

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

const MessageList = ({ messages, isLoading, onDelete, onEdit }) => {
  const messagesEndRef = useRef(null);
  
  // --- Local State for Editing ---
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!editingId) {
      scrollToBottom();
    }
  }, [messages, isLoading, editingId]);

  // --- Handlers ---
  const handleStartEdit = (message) => {
    setEditingId(message.id || message._id);
    setEditContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = (id) => {
    if (editContent.trim()) {
      onEdit(id, editContent); 
    }
    setEditingId(null);
  };

  return (
    <div className={styles.container}>
      {messages.map((message) => {
        // Check if the message belongs to the user
        const isUser = message.type === 'user';
        const isEditing = editingId === (message.id || message._id);

        return (
          <div
            key={message.id || message._id}
            className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant}`}
          >
            {/* Avatar */}
            <div className={`${styles.avatar} ${isUser ? styles.avatarUser : styles.avatarAssistant}`}>
              {!isUser && <Sparkles size={16} />}
              {isUser && <User size={20} strokeWidth={2.5} />}
            </div>

            {/* Content Wrapper */}
            <div className={styles.contentWrapper}>
              
              <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant} ${message.isAnalysisResult && message.safetyAnalysis ? styles.bubbleAnalysis : ''} ${message.isYoutubeAnalysis && message.youtubeAnalysis ? styles.bubbleYoutube : ''}`}>
                
              {/* Image Display */}
              {message.imageUrl && !isEditing && (
                <img src={message.imageUrl} alt="Uploaded" className={styles.uploadedImage} />
              )}

                {/* --- EDIT MODE --- */}
                {isEditing ? (
                  <div className={styles.editContainer}>
                    <textarea 
                      className={styles.editInput}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                      // Dynamic height
                      rows={Math.max(2, Math.ceil(editContent.length / 40))} 
                    />
                    <div className={styles.editActions}>
                      <button onClick={() => handleSaveEdit(message.id || message._id)} className={styles.actionBtnSave}>
                        <Check size={14} />
                      </button>
                      <button onClick={handleCancelEdit} className={styles.actionBtnCancel}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* --- VIEW MODE --- */
                  <>
                    {/* AI Detection Slider for Pictures analysis results */}
                    {message.isAnalysisResult && message.safetyAnalysis && (
                      <AIDetectionSlider safetyAnalysis={message.safetyAnalysis} />
                    )}
                    
                    {/* YouTube Analysis Card for YouTube analysis results */}
                    {message.isYoutubeAnalysis && message.youtubeAnalysis && (
                      <YouTubeAnalysisCard youtubeAnalysis={message.youtubeAnalysis} />
                    )}
                    
                    {/* Regular text content (hidden if we have special UI cards) */}
                    {!(message.isAnalysisResult && message.safetyAnalysis) && 
                     !(message.isYoutubeAnalysis && message.youtubeAnalysis) && (
                      <p className={styles.text}>
                        {/* Using linkifyText helper here */}
                        {linkifyText(message.content)}
                        {message.isEdited && <span className={styles.editedLabel}> (edited)</span>}
                      </p>
                    )}
                    
                    {/* Footer: TTS + Actions */}
                    <div className={styles.bubbleFooter}>
                       {/* Everyone can hear TTS */}
                       <TextToSpeech text={message.content} />

                       {/* Action Buttons - Only for the User! */}
                       {isUser && (
                         <div className={styles.messageActions}>
                            <button 
                              className={styles.iconButton} 
                              onClick={() => handleStartEdit(message)}
                              title="Edit"
                            >
                              <Pencil size={12} />
                            </button>
                            
                            <button 
                              className={styles.iconButton} 
                              onClick={() => onDelete(message.id || message._id)}
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                         </div>
                       )}
                    </div>
                  </>
                )}
              </div>

              {/* Timestamp */}
              <span className={styles.timestamp}>
                {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        );
      })}

      {/* Loading Indicator */}
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
  isLoading: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired    
};

export default MessageList;