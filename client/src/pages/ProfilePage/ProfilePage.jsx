import { useContext, useEffect, useState } from "react";
import styles from "./ProfilePage.module.css";
import { ProfileContext } from "../../context/ProfileContext";

export default function ProfilePage() {
  const { profile, loading, getProfile, updateProfile } = useContext(ProfileContext);

  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // local form state ONLY for edit mode
  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    profilePictureUrl: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });

  // ensure profile is loaded (Provider loads too, but this covers refresh / edge cases)
  useEffect(() => {
    if (!profile) getProfile();
  }, [profile, getProfile]);

  const isDisabled = loading || saving;

  const viewName = profile?.name ?? "";
  const viewDob = profile?.dateOfBirth ?? "";
  const viewPic = profile?.profilePictureUrl ?? "";

  const onEdit = () => {
    setStatus({ type: "", message: "" });

    // initialize the form from the current profile (NO useEffect)
    setForm({
      name: viewName,
      dateOfBirth: viewDob,
      profilePictureUrl: viewPic,
    });

    setIsEditing(true);
  };

  const onCancel = () => {
    setStatus({ type: "", message: "" });
    setIsEditing(false);
  };

  const onSave = async () => {
    setSaving(true);
    setStatus({ type: "", message: "" });

    const payload = {
      name: form.name.trim(),
      dateOfBirth: form.dateOfBirth,
      profilePictureUrl: form.profilePictureUrl.trim(),
    };

    const ok = await updateProfile(payload);

    if (ok) {
      setStatus({ type: "success", message: "Saved ✅" });
      setIsEditing(false);
    } else {
      setStatus({ type: "error", message: "Save failed. Try again." });
    }

    setSaving(false);
  };

  const displayedPic = isEditing ? form.profilePictureUrl : viewPic;

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

          <div className={styles.headerActions}>
            <span className={styles.modeBadge}>API</span>

            {!isEditing ? (
              <button
                className={styles.editBtn}
                onClick={onEdit}
                disabled={isDisabled || !profile}
              >
                Edit
              </button>
            ) : (
              <button className={styles.cancelBtn} onClick={onCancel} disabled={isDisabled}>
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrap}>
              {displayedPic ? (
                <img
                  className={styles.avatarImg}
                  src={displayedPic}
                  alt="Profile"
                  onError={() =>
                    setForm((prev) => ({ ...prev, profilePictureUrl: "" }))
                  }
                />
              ) : (
                <div className={styles.avatarFallback}>No Image</div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Profile picture</label>

              {/* View mode: do NOT show URL */}
              {isEditing && (
                <input
                  className={styles.input}
                  type="url"
                  placeholder="https://..."
                  value={form.profilePictureUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, profilePictureUrl: e.target.value }))
                  }
                  disabled={isDisabled}
                />
              )}
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>

              {!isEditing ? (
                <div className={styles.readOnlyValue}>{viewName || "—"}</div>
              ) : (
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={isDisabled}
                />
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Date of birth</label>

              {!isEditing ? (
                <div className={styles.readOnlyValue}>{viewDob || "—"}</div>
              ) : (
                <input
                  className={styles.input}
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                  }
                  disabled={isDisabled}
                />
              )}
            </div>
          </div>

          <div className={styles.actions}>
            {isEditing && (
              <button
                className={styles.saveBtn}
                onClick={onSave}
                disabled={isDisabled || !form.name.trim()}
                title={!form.name.trim() ? "Name is required" : ""}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}

            {status.message && (
              <div
                className={`${styles.status} ${
                  status.type === "success"
                    ? styles.success
                    : status.type === "error"
                    ? styles.error
                    : ""
                }`}
              >
                {status.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
