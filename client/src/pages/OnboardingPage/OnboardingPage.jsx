import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./OnboardingPage.module.css";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!dateOfBirth || !pronouns) {
      setError("Please fill in date of birth and pronouns.");
      return;
    }

    try {
      setIsSubmitting(true);

      await api.put("/api/user/profile", { dateOfBirth });
      await api.put("/api/user/metadata", { pronouns });

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
