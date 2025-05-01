import styles from "./home.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "./Nav";
import Button from "./Button";
import { getSession, logout } from "../../supabase";

function HomePage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const data = await getSession();
      sessionStorage.setItem(
        "BISZBO_USERID",
        JSON.stringify(data.session.user.id)
      );

      if (data.session) {
        setSession(true);
      } else {
        setSession(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignupClick = () => {
    navigate("/signup");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogoutClick = async () => {
    const data = logout();
    if ((data.success = true)) {
      setSession(false);
    }
  };

  const handleChatClick = () => {
    navigate("/chat");
  };

  return (
    <>
      <Navigation
        session={session}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onChatClick={handleChatClick}
        onLogoutClick={handleLogoutClick}
      />
      <h1 className={styles.heading}>Biszbo</h1>
      <p className={styles.message}>
        A small chat app build for educational purposes.
      </p>
      <Button
        text="Get Started"
        className={styles.getStarted}
        onClick={handleSignupClick}
      />
    </>
  );
}

export default HomePage;
