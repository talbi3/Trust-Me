import { useRef } from "react";
import styles from "./AvatarEditor.module.css";
import PropTypes from "prop-types";
const AvatarEditor = ({ src, isEditing, onFileSelect }) => {
  const fileInputRef = useRef(null);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div className={styles.avatarWrap}>
      {src ? (
        <img className={styles.avatarImg} src={src} alt="Profile" />
      ) : (
        <div className={styles.avatarFallback}>No Image</div>
      )}

      {isEditing && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className={styles.editIconBtn}
            onClick={handleIconClick}
            title="Change profile picture"
          >
            ✎
          </button>
        </>
      )}
    </div>
  );
};

AvatarEditor.propTypes = {
  src: PropTypes.string,
  isEditing: PropTypes.bool,
  onFileSelect: PropTypes.func,
};

export default AvatarEditor;