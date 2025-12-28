import PropTypes from "prop-types";
import styles from "./FeaturePanel.module.css";
// 1. Import the single source of truth we created earlier
import { FEATURES_BY_CATEGORY } from "../../../constants/chatFeatures"; 

export default function FeaturePanel({ categoryId, onApplyFeature, disabled }) {
  // 2. Use the imported data instead of hardcoding it here
  // We use categoryId directly. If categoryId is "Bullying", it looks for "Bullying" in the file.
  const features = categoryId ? FEATURES_BY_CATEGORY[categoryId] : [];

  // If no features found (or no category selected), don't show anything
  if (!features || features.length === 0) return null;

  return (
    <aside className={styles.panel}>
      <div className={styles.title}>Suggested Ideas</div>

      <div className={styles.list}>
        {features.map((f) => (
          <button
            key={f.key}
            type="button"
            className={styles.featureBtn}
            onClick={() => onApplyFeature(f.message)}
            disabled={disabled}
          >
            {f.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

FeaturePanel.propTypes = {
  categoryId: PropTypes.string,
  onApplyFeature: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};