import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./signup.module.css";
import {
  register,
  login,
  setUIDandUsername,
  usernameTaken,
} from "../../supabase";

function SignUp() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkUsername = async () => {
    if (!username) return;

    setChecking(true);
    try {
      const taken = await usernameTaken(username);
      setUsernameAvailable(!taken);
    } catch (err) {
      setError("Error checking username");
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    if (usernameAvailable === false) {
      setError("Username already taken");
      return;
    }

    e.preventDefault();

    setError("");

    const data = await register(email, password);

    if (data) {
      console.log("Sign-up successful!");

      alert("We sent you an email, please confirm your email and login.");

      setUIDandUsername(data.user.id, username);

      navigate("/login");
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
          <label className={styles.Label}>Username:</label>
          <input
            className={styles.textinput}
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setUsernameAvailable(null);
            }}
            onBlur={checkUsername}
            required
          />
          {checking && <p className={styles.checking}>Checking username...</p>}
          {usernameAvailable === false && (
            <p style={{ color: "red" }}>Username is already taken</p>
          )}
          {usernameAvailable === true && (
            <p style={{ color: "green" }}>Username is available</p>
          )}
        </div>
        <div className={styles.parent}>
          <label className={styles.Label}>Email:</label>
          <input
            className={styles.textinput}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.parent}>
          <label className={styles.Label}>Password:</label>
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
