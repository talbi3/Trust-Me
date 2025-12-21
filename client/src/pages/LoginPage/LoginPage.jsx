import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import styles from "./LoginPage.module.css"; 

export default function LoginPage() {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleLoginRequest(email);
  };

  const handleLoginRequest = async (emailToLogin) => {
    if (!emailToLogin) return;

    setIsSubmitting(true);
    setError("");

    const result = await login(emailToLogin);

    if (result.success) {
      navigate("/profile"); 
    } else {
      setError(result.message); 
    }
    
    setIsSubmitting(false);
  };

  const handleAdminQuickLogin = () => {
    handleLoginRequest("1@1.com"); 
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Welcome Back</h1>
        <p>Enter your email to sign in</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className={styles.input}
          />
          
          {error && <div className={styles.errorMessage}>{error}</div>}

          <button 
            type="submit" 
            disabled={isSubmitting || !email}
            className={styles.button}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className={styles.divider}>or</div>
        
        <button 
            type="button"
            onClick={handleAdminQuickLogin}
            className={styles.adminButton}
            disabled={isSubmitting}
        >
            🕵️‍♀️ Quick Admin Login (Dev Only)
        </button>

      </div>
    </div>
  );
}