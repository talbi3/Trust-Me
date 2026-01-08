import styles from "./ProfilePage.module.css";
import { useProfilePage } from "../../hooks/useProfile.js"; 

import Button from "../../components/common/Button/Button.jsx";         
import EditableField from "../../components/EditableField/EditableField.jsx"; 
import AvatarEditor from "../../components/AvatarEditor/AvatarEditor.jsx";   

export default function ProfilePage() {
  const {
    saving,
    isEditing,
    status,
    form,
    safeProfile,
    safeMetadata,
    isDisabled,
    setForm,
    handleEdit,
    handleCancel,
    handleFileChange,
    handleSave
  } = useProfilePage();

  const displayedPic = isEditing ? form.profilePictureUrl : safeProfile.profilePictureUrl;

  return (
      <div className={styles.page}>
        <div className={styles.container}>

          <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Profile</h1>
            <p className={styles.subtitle}>
              {isEditing ? "Edit your personal details" : "View your personal details"}
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTopActions}>
            {!isEditing ? (
              <Button 
                variant="secondary" 
                onClick={handleEdit} 
                disabled={isDisabled}
              >
                Edit
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleCancel} 
                disabled={isDisabled}
              >
                Cancel
              </Button>
            )}
          </div>
          
          <div className={styles.avatarSection}>
            <AvatarEditor 
              src={displayedPic}
              isEditing={isEditing}
              onFileSelect={handleFileChange}  
            />
          </div>

          <div className={styles.grid}>
            <EditableField
              label="Name"
              value={isEditing ? form.name : (safeProfile.name || "—")}
              isEditing={isEditing}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            />

            <EditableField
              label="Date of birth"
              type="date"
              value={isEditing ? form.dateOfBirth : (safeMetadata.dateOfBirth || "—")}
              isEditing={isEditing}
              onChange={(e) => setForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            />

            <EditableField
              label="Email"
              value={safeProfile.email || "—"} 
              isEditing={false} 
              onChange={() => {}} 
            />
          </div>

          <div className={styles.actions}>
            {isEditing && (
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isDisabled || !form.name.trim()}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            )}

            {status.message && (
              <div className={`${styles.status} ${status.type === "success" ? styles.success : styles.error}`}>
                {status.message}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}