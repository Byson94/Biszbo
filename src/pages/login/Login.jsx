import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../supabase";
import styles from "./login.module.css";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    const data = await login(email, password);

    if (data) {
      console.log("Login successful!");
      navigate("/chat");
    }
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleForgotpassword = () => {
    navigate();
  };

  return (
    <div className={styles.pageCenter}>
      <h1 className={styles.loginTitle}>Welcome Back</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.parent}>
          <label className={styles.EmailLabel}>Email Address:</label>
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
        <div className={styles.extraTextWrapper}>
          <a className={styles.forgotPassword} onClick={handleForgotpassword}>
            Forgot password?
          </a>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div className={styles.buttonWrapper}>
          <button type="submit" className={styles.submit}>
            Login
          </button>

          <p>
            Dont have an account?{" "}
            <a className={styles.signupLink} onClick={handleSignup}>
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
