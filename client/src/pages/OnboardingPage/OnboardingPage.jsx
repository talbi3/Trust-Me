import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
// import styles from "./OnboardingPage.module.css";

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
    <div style={{ padding: 24 }}>
      <h1>Complete your profile</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
        <div style={{ marginTop: 12 }}>
          <label>Date of birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>How should we address you?</label>
          <select
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
          >
            <option value="">Select</option>
            <option value="he/him">He / Him</option>
            <option value="she/her">She / Her</option>
            <option value="they/them">They / Them</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        {error && <div style={{ marginTop: 12, color: "crimson" }}>{error}</div>}

        <button type="submit" disabled={isSubmitting} style={{ marginTop: 16, padding: 10, width: "100%" }}>
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
