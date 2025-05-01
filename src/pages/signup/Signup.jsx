import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./signup.module.css";
import { register } from "../../supabase";

function SignUp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const data = await register(email, password);

    if (data) {
      alert("Sign-up successful!");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className={styles.pageCenter}>
      <h1 className={styles.signupTitle}>Sign Up to Biszbo</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.parent}>
          <label className={styles.EmailLabel}>Email:</label>
          <input
            className={styles.textinput}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.parent}>
          <label className={styles.PasswordLabel}>Password:</label>
          <input
            className={styles.textinput}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div className={styles.buttonWrapper}>
          <button type="submit" className={styles.submit}>
            Sign Up
          </button>
          <p>
            Already have an account?{" "}
            <a className={styles.loginLink} onClick={handleLogin}>
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default SignUp;
