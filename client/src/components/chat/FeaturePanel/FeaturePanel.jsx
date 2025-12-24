import PropTypes from "prop-types";
import styles from "./FeaturePanel.module.css";

function getFeaturesForCategory(categoryId) {
  const FEATURES_BY_CATEGORY = {
    Pictures: [
      { key: "A", label: "FEATURE A", message: "APPLY FEATURE A" },
      { key: "B", label: "FEATURE B", message: "APPLY FEATURE B" },
    ],
    bullying: [
      { key: "C", label: "FEATURE C", message: "APPLY FEATURE C" },
      { key: "B", label: "FEATURE B", message: "APPLY FEATURE B" },
    ],
    Focus: [
      { key: "D", label: "FEATURE D", message: "APPLY FEATURE D" },
      { key: "C", label: "FEATURE C", message: "APPLY FEATURE C" },
    ],
  };

  return FEATURES_BY_CATEGORY[categoryId] || [];
}

export default function FeaturePanel({ categoryId, onApplyFeature, disabled }) {
  const features = getFeaturesForCategory(categoryId);

  if (features.length === 0) return null;

  return (
    <aside className={styles.panel}>
      <div className={styles.title}>Features</div>

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
