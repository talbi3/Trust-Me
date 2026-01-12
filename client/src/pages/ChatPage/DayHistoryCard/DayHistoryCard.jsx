import PropTypes from "prop-types";
import { Trash2 } from "lucide-react"; 
import styles from "./DayHistoryCard.module.css";

export default function DayHistoryCard({
  title,
  onClick,
  onDelete,
}) {
  return (
    <div 
      className={styles.card} 
      onClick={onClick} 
      // Add pointer cursor to indicate it is clickable
      style={{ cursor: "pointer" }}
    >
      <div className={styles.header}>
        <div className={styles.dayTitle}>
          {/* Display the Title (Date/Topic) */}
          <span className={styles.day}>{title}</span>
        </div>

        <button 
            className={styles.deleteBtn} 
            onClick={(e) => {
                // Prevent the card click (navigation) when clicking delete
                e.stopPropagation(); 
                onDelete();
            }} 
            type="button"
            title="Delete Chat"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

DayHistoryCard.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};