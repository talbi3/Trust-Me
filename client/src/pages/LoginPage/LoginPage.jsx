import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { GoogleLogin } from "@react-oauth/google";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const { loginWithGoogle } = useContext(UserContext);
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setError("Google login failed: missing token");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await loginWithGoogle(idToken);

    if (result.success) {
  if (result.needsOnboarding) navigate("/onboarding");
  else navigate("/chat");
} else {
  setError(result.message || "Google login failed");
}


    setIsSubmitting(false);
  };

  const handleGoogleError = () => {
    setError("Google login failed");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Welcome Back</h1>

        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

        {error && <div className={styles.errorMessage}>{error}</div>}

        {isSubmitting && <p style={{ marginTop: 12 }}>Signing in...</p>}
      </div>
    </div>
  );
}
