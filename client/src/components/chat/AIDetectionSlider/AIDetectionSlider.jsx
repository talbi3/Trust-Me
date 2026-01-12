import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck, ShieldAlert, ShieldQuestion, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import styles from './AIDetectionSlider.module.css';

const AIDetectionSlider = ({ safetyAnalysis }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const { aiGeneratedProbability, confidence, summary, issuesFound } = safetyAnalysis;

  // Animate the slider on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(aiGeneratedProbability);
    }, 100);
    return () => clearTimeout(timer);
  }, [aiGeneratedProbability]);

  // Determine status based on AI probability
  const getStatus = () => {
    if (aiGeneratedProbability > 70) {
      return {
        icon: ShieldAlert,
        label: 'Likely AI Generated',
        colorClass: styles.danger,
        emoji: '⚠️'
      };
    } else if (aiGeneratedProbability > 40) {
      return {
        icon: ShieldQuestion,
        label: 'Uncertain',
        colorClass: styles.warning,
        emoji: '🤔'
      };
    }
    return {
      icon: ShieldCheck,
      label: 'Likely Authentic',
      colorClass: styles.safe,
      emoji: '✅'
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  // Confidence badge color
  const getConfidenceBadge = () => {
    switch (confidence) {
      case 'high':
        return { class: styles.confidenceHigh, icon: CheckCircle2 };
      case 'medium':
        return { class: styles.confidenceMedium, icon: HelpCircle };
      default:
        return { class: styles.confidenceLow, icon: AlertTriangle };
    }
  };

  const confidenceBadge = getConfidenceBadge();
  const ConfidenceIcon = confidenceBadge.icon;

  return (
    <div className={styles.container}>
      {/* Header with status */}
      <div className={styles.header}>
        <div className={`${styles.statusBadge} ${status.colorClass}`}>
          <StatusIcon size={18} />
          <span>{status.label}</span>
        </div>
        <div className={`${styles.confidenceBadge} ${confidenceBadge.class}`}>
          <ConfidenceIcon size={14} />
          <span>{confidence} confidence</span>
        </div>
      </div>

      {/* Main Slider */}
      <div className={styles.sliderContainer}>
        <div className={styles.sliderLabels}>
          <span className={styles.labelHuman}>👤 Human</span>
          <span className={styles.labelAI}>🤖 AI</span>
        </div>
        
        <div className={styles.sliderTrack}>
          <div 
            className={`${styles.sliderFill} ${status.colorClass}`}
            style={{ width: `${animatedValue}%` }}
          />
          <div 
            className={styles.sliderThumb}
            style={{ left: `${animatedValue}%` }}
          >
            <span className={styles.thumbValue}>{aiGeneratedProbability}%</span>
          </div>
        </div>

        <div className={styles.sliderScale}>
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Probability Cards */}
      <div className={styles.probCards}>
        <div className={`${styles.probCard} ${styles.humanCard}`}>
          <div className={styles.probValue}>{100 - aiGeneratedProbability}%</div>
          <div className={styles.probLabel}>Human/Real</div>
        </div>
        <div className={`${styles.probCard} ${styles.aiCard} ${status.colorClass}`}>
          <div className={styles.probValue}>{aiGeneratedProbability}%</div>
          <div className={styles.probLabel}>AI Generated</div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className={styles.summary}>
          <p>📝 {summary}</p>
        </div>
      )}

      {/* Issues Found */}
      {issuesFound && issuesFound.length > 0 && (
        <div className={styles.issuesSection}>
          <h4 className={styles.issuesTitle}>🔍 Issues Detected:</h4>
          <ul className={styles.issuesList}>
            {issuesFound.map((issue, index) => (
              <li key={index} className={`${styles.issueItem} ${styles[`severity${issue.severity}`]}`}>
                <span className={styles.issueType}>{issue.type}</span>
                <span className={styles.issueDesc}>{issue.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

AIDetectionSlider.propTypes = {
  safetyAnalysis: PropTypes.shape({
    aiGeneratedProbability: PropTypes.number.isRequired,
    humanGeneratedProbability: PropTypes.number,
    confidence: PropTypes.string.isRequired,
    summary: PropTypes.string,
    issuesFound: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      description: PropTypes.string,
      severity: PropTypes.string
    }))
  }).isRequired
};

export default AIDetectionSlider;
