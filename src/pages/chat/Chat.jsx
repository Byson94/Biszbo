import React, { useEffect, useState } from "react";
import styles from "./chat.module.css";
import {
  getSession,
  addToContact,
  getAllContacts,
  removeFromContact,
  getUIDfromUsername,
  getUsernamefromUID,
} from "../../supabase";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [users, setUsers] = useState([]);
  const [ourUid, setOurUid] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserUID, setNewUserUID] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [usernameMap, setUsernameMap] = useState({});

  function lexicographicSort(strings) {
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
      setMessages((prev) =>
        Array.isArray(prev)
          ? [...prev, { UID: ourUid, message: newMessage }]
          : [{ UID: ourUid, message: newMessage }]
      );

      setNewMessage("");
    } else {
      alert("Failed to send message");
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      const sessionData = await getSession();
      const verifiedUID = sessionData.session?.user?.id;

      if (!verifiedUID) {
        return;
      }

      setOurUid(verifiedUID);
      sessionStorage.setItem("BISZBO_USERID", JSON.stringify(verifiedUID));

      const contacts = await getAllContacts(verifiedUID);
      const usernames = await Promise.all(
        contacts.contacts.map(async (contactUID) => {
          const username = await getUsernamefromUID(contactUID);
          return { uid: contactUID, username };
        })
      );

      setUsers(usernames);
    };

    const clearCache = () => {
      setOurUid(null);
      setMessages([]);
      setUsers([]);
      setUsernameMap({});
    };

    clearCache();
    loadSession();
  }, []);

  const handleAddUser = async () => {
    if (!newUsername.trim()) return;

    try {
      const uidFromUN = await getUIDfromUsername(newUsername);

      const res = await fetch(
        "https://biszbo-backend.onrender.com/contacts/add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userA: ourUid, userB: uidFromUN }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add contact");

      if (data) {
        setUsers((prev) => [
          ...prev,
          { uid: uidFromUN, username: newUsername },
        ]);
        console.log("User added successfully");
      } else {
        alert("User not found or failed to add.");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("An error occurred while adding the user.");
    } finally {
      setIsModalOpen(false);
      setNewUsername("");
    }
  };

  const handleUserClick = async (uid) => {
    setCurrentUser(uid);
    setMessages([]);

    if (!uid || !ourUid) return;
    const data = await fetch(
      "https://biszbo-backend.onrender.com/getAllMessages",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentID: lexicographicSort([uid, ourUid]),
        }),
      }
    );

    const messageData = await data.json();
    console.log(messageData);
    if (messageData.success) {
      const messageList = messageData.messages;
      setMessages(messageList);

      const missingUIDs = messageList
        .map((msg) => msg.UID)
        .filter((uid) => !(uid in usernameMap));

      const newUsernames = await Promise.all(
        missingUIDs.map(async (uid) => {
          const username = await getUsernamefromUID(uid);
          return { uid, username };
        })
      );

      const updatedMap = { ...usernameMap };
      newUsernames.forEach(({ uid, username }) => {
        updatedMap[uid] = username;
      });
      setUsernameMap(updatedMap);
    }
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
        const messageList = messageData.messages;
        setMessages(messageList);

        const contacts = await getAllContacts(ourUid);
        const usernames = await Promise.all(
          contacts.contacts.map(async (contactUID) => {
            const username = await getUsernamefromUID(contactUID);
            return { uid: contactUID, username };
          })
        );
        setUsers(usernames);
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
            {Array.isArray(users) && users.length > 0 ? (
              users.map((user, i) => (
                <li key={i} onClick={() => handleUserClick(user.uid)}>
                  {user.username}
                </li>
              ))
            ) : (
              <p>No users yet</p>
            )}
          </ul>
        </div>
        <button
          className={styles.addUserButton}
          onClick={() => setIsModalOpen(true)}
        >
          Add User
        </button>
      </div>
      <div className={styles.chatWindow}>
        <div className={styles.topBar}>
          {users.find((u) => u.uid === currentUser)?.username || ""}
        </div>
        <div className={styles.messages}>
          {Array.isArray(messages) && messages.length > 0 ? (
            messages.map((msg, i) => (
              <div key={i} className={styles.message}>
                <span className={styles.userName}>
                  {usernameMap[msg.UID] || msg.UID}
                </span>
                : {msg.message}
              </div>
            ))
          ) : (
            <p></p>
          )}
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

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Enter Username</h3>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="User Username"
            />
            <button onClick={handleAddUser}>Add</button>
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
