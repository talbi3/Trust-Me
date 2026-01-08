import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MetadataContext } from "../../context/MetadataContext";
import styles from "./OnboardingPage.module.css";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { metadata, getMetadata, updateMetadata } = useContext(MetadataContext);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nickName, setNickName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!metadata) {
      getMetadata();
    }
  }, [metadata, getMetadata]);

  useEffect(() => {
    if (!metadata) return;

    const hasAllRequired =
      Boolean(metadata.dateOfBirth) &&
      Boolean(metadata.nickName) &&
      Boolean(metadata.pronouns);

    if (hasAllRequired) {
      navigate("/chat", { replace: true });
      return;
    }

    // Prefill what we have
    if (metadata.dateOfBirth && !dateOfBirth) setDateOfBirth(metadata.dateOfBirth);
    if (metadata.nickName && !nickName) setNickName(metadata.nickName);
    if (metadata.pronouns && !pronouns) setPronouns(metadata.pronouns);
  }, [metadata, navigate, dateOfBirth, nickName, pronouns]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!dateOfBirth || !nickName || !pronouns) {
      setError("Please fill in date of birth, nickname and pronouns.");
      return;
    }

    try {
      setIsSubmitting(true);

      const ok = await updateMetadata({ dateOfBirth, nickName, pronouns });
      if (!ok) {
        throw new Error("Failed to update metadata");
      }

      navigate("/chat");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(err.response?.data?.error || "Failed to save onboarding details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className={styles.container}>
    <div className={styles.card}>
      <h1 className={styles.title}>Complete your profile</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <div className={styles.label}>Date of birth</div>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className={styles.input}
          />
        </div>

        <div>
          <div className={styles.label}>Nickname</div>
          <input
            type="text"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            className={styles.input}
          />
        </div>

        <div>
          <div className={styles.label}>How should we address you?</div>
          <select
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            className={styles.input}
          >
            <option value="">Select</option>
            <option value="he/him">He / Him</option>
            <option value="she/her">She / Her</option>
            <option value="they/them">They / Them</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  </div>
);
}
