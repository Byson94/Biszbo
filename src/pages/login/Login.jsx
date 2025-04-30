import React, { useState } from "react";
import { login } from "../../supabase";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    const data = await login(email, password);

    if (data) {
      alert("Login successful!");
    }
  };

  return (
    <div>
      <h1>Login to Biszbo</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
