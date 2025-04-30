import React, { useEffect, useState } from "react";
import styles from "./chat.module.css";
import {
  getSession,
  addToContact,
  getAllContacts,
  removeFromContact,
} from "../../supabase";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [users, setUsers] = useState([]);
  const [ourUid, setOurUid] = useState(null);

  function lexicographicSort(strings) {
    if (!ourUid || !currentUser) return;
    for (const str of strings) {
      if (typeof str !== "string" || !/^[a-fA-F0-9-]+$/.test(str)) {
        throw new TypeError("Invalid input on lexicographic sorting");
      }
    }
    const lowercased = strings.map((str) => str.toLowerCase());
    return [...lowercased].sort().join("_");
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !ourUid) return;

    const response = await fetch(
      "https://biszbo-backend.onrender.com/addMessage",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage,
          UID: ourUid,
          contentID: lexicographicSort([currentUser, ourUid]),
        }),
      }
    );

    const result = await response.json();

    console.log(result);

    if (result.message) {
      setMessages((prev) => [...prev, newMessage]);
      setNewMessage("");
    } else {
      alert("Failed to send message");
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      let uid;
      const saved = sessionStorage.getItem("BISZBO_USERID");
      if (saved) {
        uid = JSON.parse(saved);
      } else {
        const data = await getSession();
        uid = data.session.user.id;
        sessionStorage.setItem("BISZBO_USERID", JSON.stringify(uid));
      }
      setOurUid(uid);
      const contacts = await getAllContacts(uid);
      setUsers(contacts.contacts);
    };

    loadSession();
  }, []);

  const handleAddUser = async () => {
    const UID = prompt("Enter the UID of the user you want to add:");
    if (!UID) return;

    const data = await addToContact(ourUid, UID);
    if (data) {
      setUsers((prev) => [...prev, UID]);
      console.log("User added successfully");
    } else {
      alert("User not found or failed to add.");
    }
  };

  const handleUserClick = async (user) => {
    setCurrentUser(user);
    const data = await fetch(
      "https://biszbo-backend.onrender.com/getAllMessages",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentID: lexicographicSort([user, ourUid]),
        }),
      }
    );

    const messageData = await data.json();
    const messageList = messageData.messages.map((m) => m.message);
    setMessages(messageList);
  };

  useEffect(() => {
    if (!ourUid || !currentUser) return;

    const interval = setInterval(async () => {
      try {
        const data = await fetch(
          "https://biszbo-backend.onrender.com/getAllMessages",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contentID: lexicographicSort([currentUser, ourUid]),
            }),
          }
        );

        const messageData = await data.json();
        const messageList = messageData.messages.map((m) => m.message);
        setMessages(messageList);

        const contacts = await getAllContacts(ourUid);
        setUsers(contacts.contacts);
      } catch (err) {
        console.error("Interval error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [ourUid, currentUser]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.sidebar}>
        <div className={styles.userList}>
          <h3>Users</h3>
          <ul>
            {users.map((user, i) => (
              <li key={i} onClick={() => handleUserClick(user)}>
                {user}
              </li>
            ))}
          </ul>
        </div>
        <button className={styles.addUserButton} onClick={handleAddUser}>
          Add User
        </button>
      </div>
      <div className={styles.chatWindow}>
        <div className={styles.topBar}>{currentUser}</div>
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} className={styles.message}>
              <span className={styles.userName}>User</span>: {msg}
            </div>
          ))}
        </div>
        <div className={styles.inputSection}>
          <input
            type="text"
            className={styles.messageInput}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button className={styles.sendButton} onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
