import { useEffect, useState } from "react";
import styles from "./ProfilePage.module.css";

// ==============================
// DATA MODE SWITCH (hackathon)
// ==============================
// true  -> mocked responses (UI phase)
// false -> real backend via fetch (/api/user/profile)
const USE_FAKE_API = true;

// ---- Mocked "server" responses ----
const fakeGetProfile = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "Maya",
        dateOfBirth: "2001-06-15",
        profilePictureUrl:
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop",
      });
    }, 450);
  });

const fakeUpdateProfile = (profile) =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log("[MOCK PUT] /api/user/profile payload:", profile);
      resolve({ success: true });
    }, 600);
  });

// ---- Real API (for later) ----
async function apiGetProfile() {
  const res = await fetch("/api/user/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

async function apiUpdateProfile(profile) {
  const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json(); // expected { success: true }
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  const [originalProfile, setOriginalProfile] = useState(null); // for Cancel
  const [isEditing, setIsEditing] = useState(false);

  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setStatus({ type: "", message: "" });

      try {
        const data = USE_FAKE_API ? await fakeGetProfile() : await apiGetProfile();
        if (!mounted) return;

        const normalized = {
          name: data?.name ?? "",
          dateOfBirth: data?.dateOfBirth ?? "",
          profilePictureUrl: data?.profilePictureUrl ?? "",
        };

        setName(normalized.name);
        setDateOfBirth(normalized.dateOfBirth);
        setProfilePictureUrl(normalized.profilePictureUrl);
        setOriginalProfile(normalized);

        setIsEditing(false); // default view mode
      } catch {
        if (!mounted) return;
        setStatus({
          type: "error",
          message: "Couldn’t load profile. Please refresh.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const onEdit = () => {
    setStatus({ type: "", message: "" });
    setIsEditing(true);
  };

  const onCancel = () => {
    setStatus({ type: "", message: "" });
    if (originalProfile) {
      setName(originalProfile.name);
      setDateOfBirth(originalProfile.dateOfBirth);
      setProfilePictureUrl(originalProfile.profilePictureUrl);
    }
    setIsEditing(false);
  };

  const onSave = async () => {
    setSaving(true);
    setStatus({ type: "", message: "" });

    const payload = {
      name: name.trim(),
      dateOfBirth,
      profilePictureUrl: profilePictureUrl.trim(),
    };

    try {
      const res = USE_FAKE_API
        ? await fakeUpdateProfile(payload)
        : await apiUpdateProfile(payload);

      if (res?.success) {
        setStatus({ type: "success", message: "Saved ✅" });
        setOriginalProfile(payload); // update snapshot for future Cancel
        setIsEditing(false); // back to view mode
      } else {
        setStatus({ type: "error", message: "Save failed. Try again." });
      }
    } catch {
      setStatus({ type: "error", message: "Save failed. Try again." });
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = loading || saving;

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
            <span className={styles.modeBadge}>
              {USE_FAKE_API ? "MOCK DATA" : "REAL API"}
            </span>

            {!isEditing ? (
              <button
                className={styles.editBtn}
                onClick={onEdit}
                disabled={isDisabled || !originalProfile}
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
              {profilePictureUrl ? (
                <img
                  className={styles.avatarImg}
                  src={profilePictureUrl}
                  alt="Profile"
                  onError={() => setProfilePictureUrl("")}
                />
              ) : (
                <div className={styles.avatarFallback}>No Image</div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Profile picture</label>

              {/* View mode: do NOT show the URL */}
              {isEditing && (
                <>
                  <input
                    className={styles.input}
                    type="url"
                    placeholder="https://..."
                    value={profilePictureUrl}
                    onChange={(e) => setProfilePictureUrl(e.target.value)}
                    disabled={isDisabled}
                  />
                </>
              )}
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>

              {!isEditing ? (
                <div className={styles.readOnlyValue}>{name || "—"}</div>
              ) : (
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isDisabled}
                />
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Date of birth</label>

              {!isEditing ? (
                <div className={styles.readOnlyValue}>{dateOfBirth || "—"}</div>
              ) : (
                <input
                  className={styles.input}
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
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
                disabled={isDisabled || !name.trim()}
                title={!name.trim() ? "Name is required" : ""}
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
