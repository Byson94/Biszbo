import React from "react";
import styles from "./home.module.css";
import logo from "../../assets/Biszbo-transparent.png";

function Navigation({
  session,
  onLoginClick,
  onSignupClick,
  onChatClick,
  onLogoutClick,
}) {
  return (
    <nav className={styles.nav}>
      {" "}
      <img src={logo} alt="Biszbo" style={{ width: "50px", height: "auto" }} />
      <h2>Biszbo</h2>
      <div className={styles.pContainer}>
        {" "}
        {!session ? (
          <>
            <p onClick={onLoginClick}>Login</p>
          </>
        ) : (
          <>
            <p onClick={onChatClick}>Chat</p>
            <p onClick={onLogoutClick}>Logout</p>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
