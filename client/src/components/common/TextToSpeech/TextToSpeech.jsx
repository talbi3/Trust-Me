import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Volume2, Square } from 'lucide-react';
import styles from './TextToSpeech.module.css';

const TextToSpeech = ({ text, className = '' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  // 1. Load available voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    
    // Chrome loads voices asynchronously, so we listen for the event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup: cancel speech if component unmounts
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // 2. The Speak Function
  const speak = useCallback(() => {
    if (!text) return;

    // If already speaking, stop it (toggle behavior)
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel any previous sounds
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // 3. Voice Selection Logic (Child Friendly / English preference)
    const childFriendlyVoice = voices.find(v => 
      (v.name.includes('Female') || 
       v.name.includes('Samantha') || 
       v.name.includes('Google US English')) &&
       v.lang.startsWith('en')
    );

    if (childFriendlyVoice) {
      utterance.voice = childFriendlyVoice;
    }

    // 4. Configuration
    utterance.rate = 0.9;  // Slightly slower
    utterance.pitch = 1.1; // Slightly higher
    utterance.volume = 1;

    // 5. Event Handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [text, isSpeaking, voices]);

  return (
    <button 
      className={`${styles.button} ${isSpeaking ? styles.active : ''} ${className}`}
      onClick={speak}
      title={isSpeaking ? "Stop reading" : "Read aloud"}
      type="button"
    >
      {isSpeaking ? <Square size={18} fill="currentColor" /> : <Volume2 size={20} />}
    </button>
  );
};

TextToSpeech.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string
};

export default TextToSpeech;