import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck, ShieldAlert, ShieldQuestion, Play, User, ExternalLink } from 'lucide-react';
import styles from './YouTubeAnalysisCard.module.css';

const YouTubeAnalysisCard = ({ youtubeAnalysis }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { verdict, reasons, videoMetadata } = youtubeAnalysis;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Get status styling based on verdict
  const getStatus = () => {
    switch (verdict?.toLowerCase()) {
      case 'unsafe':
        return {
          icon: ShieldAlert,
          label: 'Not Recommended',
          colorClass: styles.danger,
          emoji: '🚫',
          description: 'This video may contain inappropriate content'
        };
      case 'caution':
        return {
          icon: ShieldQuestion,
          label: 'Watch with Caution',
          colorClass: styles.warning,
          emoji: '⚠️',
          description: 'Some content may need parental guidance'
        };
      default:
        return {
          icon: ShieldCheck,
          label: 'Looks Safe!',
          colorClass: styles.safe,
          emoji: '✅',
          description: 'This video appears appropriate'
        };
    }
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  // Build YouTube thumbnail URL
  const thumbnailUrl = videoMetadata?.videoId 
    ? `https://img.youtube.com/vi/${videoMetadata.videoId}/mqdefault.jpg`
    : null;

  // Build YouTube watch URL
  const watchUrl = videoMetadata?.videoId
    ? `https://www.youtube.com/watch?v=${videoMetadata.videoId}`
    : null;

  return (
    <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
      {/* Video Preview Section */}
      {thumbnailUrl && (
        <div className={styles.videoPreview}>
          <div className={styles.thumbnailWrapper}>
            <img 
              src={thumbnailUrl} 
              alt={videoMetadata?.title || 'Video thumbnail'} 
              className={styles.thumbnail}
            />
            <div className={styles.playOverlay}>
              <Play size={32} fill="white" />
            </div>
          </div>
          
          <div className={styles.videoInfo}>
            <h3 className={styles.videoTitle}>
              {videoMetadata?.title || 'Unknown Video'}
            </h3>
            {videoMetadata?.channelTitle && (
              <div className={styles.channelInfo}>
                <User size={14} />
                <span>{videoMetadata.channelTitle}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verdict Badge */}
      <div className={`${styles.verdictSection} ${status.colorClass}`}>
        <div className={styles.verdictBadge}>
          <StatusIcon size={28} />
          <div className={styles.verdictText}>
            <span className={styles.verdictLabel}>{status.emoji} {status.label}</span>
            <span className={styles.verdictDesc}>{status.description}</span>
          </div>
        </div>
      </div>

      {/* Reasons List */}
      {reasons && reasons.length > 0 && (
        <div className={styles.reasonsSection}>
          <h4 className={styles.reasonsTitle}>🔍 Analysis Details:</h4>
          <ul className={styles.reasonsList}>
            {reasons.map((reason, index) => (
              <li 
                key={index} 
                className={styles.reasonItem}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className={styles.reasonBullet}>•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Watch Button */}
      {watchUrl && verdict?.toLowerCase() !== 'unsafe' && (
        <a 
          href={watchUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.watchButton}
        >
          <ExternalLink size={16} />
          <span>Open on YouTube</span>
        </a>
      )}

      {/* Warning for unsafe videos */}
      {verdict?.toLowerCase() === 'unsafe' && (
        <div className={styles.warningBanner}>
          <ShieldAlert size={18} />
          <span>We recommend not watching this video. Talk to a trusted adult if you have questions!</span>
        </div>
      )}
    </div>
  );
};

YouTubeAnalysisCard.propTypes = {
  youtubeAnalysis: PropTypes.shape({
    verdict: PropTypes.string.isRequired,
    reasons: PropTypes.arrayOf(PropTypes.string),
    videoMetadata: PropTypes.shape({
      videoId: PropTypes.string,
      title: PropTypes.string,
      channelTitle: PropTypes.string,
      description: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string)
    })
  }).isRequired
};

export default YouTubeAnalysisCard;
