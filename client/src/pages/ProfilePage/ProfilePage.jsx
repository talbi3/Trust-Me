import { useContext, useEffect, useState } from "react";
import styles from "./ProfilePage.module.css";
import { ProfileContext } from "../../context/ProfileContext";

export default function ProfilePage() {
  const { profile, loading, getProfile, updateProfile } =
    useContext(ProfileContext);

  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // local form state (edit mode only)
  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    profilePictureUrl: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!profile) getProfile();
  }, [profile, getProfile]);

  const isDisabled = loading || saving;

  const viewName = profile?.name ?? "";
  const viewDob = profile?.dateOfBirth ?? "";
  const viewPic = profile?.profilePictureUrl ?? "";

  const onEdit = () => {
    setStatus({ type: "", message: "" });
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

  // ✅ NEW: upload image to backend, then set profilePictureUrl to returned URL
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus({ type: "", message: "" });
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("image", file); // must match upload.single("image") in backend

      const res = await fetch("/api/uploads/profile-picture", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json(); // expected: { url: "/uploads/..." }

      const fullUrl = data.url.startsWith("http")
  ? data.url
  : `http://localhost:5000${data.url}`;

setForm((prev) => ({
  ...prev,
  profilePictureUrl: fullUrl,
}));


      setStatus({ type: "success", message: "Image uploaded ✅" });
    } catch {
      setStatus({ type: "error", message: "Image upload failed. Try again." });
    } finally {
      setSaving(false);
      // allow selecting the same file again if needed
      e.target.value = "";
    }
  };

  const onSave = async () => {
    setSaving(true);
    setStatus({ type: "", message: "" });

    const payload = {
      name: form.name.trim(),
      dateOfBirth: form.dateOfBirth,
      profilePictureUrl: form.profilePictureUrl,
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
              {isEditing
                ? "Edit your personal details"
                : "View your personal details"}
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
              <button
                className={styles.cancelBtn}
                onClick={onCancel}
                disabled={isDisabled}
              >
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
                />
              ) : (
                <div className={styles.avatarFallback}>No Image</div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Profile picture</label>

              {/* EDIT MODE: upload file */}
              {isEditing && (
                <input
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  disabled={isDisabled}
                  onChange={onFileChange}   // ✅ NEW
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
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
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
                    setForm((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }))
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
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}

            {status.message && (
              <div
                className={`${styles.status} ${
                  status.type === "success"
                    ? styles.success
                    : styles.error
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
