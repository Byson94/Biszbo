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
    for (const str of strings) {
      if (typeof str !== "string" || !/^[a-fA-F0-9-]+$/.test(str)) {
        throw new TypeError("Invalid input on lexicographic sorting");
      }
    }

    const lowercased = strings.map((str) => str.toLowerCase());
    const sortedStrings = [...lowercased].sort().join("_");
    return sortedStrings;
  }

  const handleSendMessage = async () => {
    if (currentUser !== "") {
      const data = await fetch(
        "https://biszbo-backend.onrender.com/addMessage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: newMessage,
            UID: ourUid,
            contentID: lexicographicSort([currentUser, ourUid]),
          }),
        }
      );

      console.log(await data.json());

      if (newMessage.trim()) {
        setMessages([...messages, newMessage]);
        setNewMessage("");
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      let uid;
      const savedUID = sessionStorage.getItem("BISZBO_USERID");
      if (savedUID) {
        uid = JSON.parse(savedUID);
        setOurUid(uid);
      } else {
        const data = await getSession();
        uid = data.session.user.id;
        sessionStorage.setItem("BISZBO_USERID", JSON.stringify(uid));
        setOurUid(uid);
      }

      const contacts = await getAllContacts(uid);
      setUsers(contacts.contacts);
    };

    loadData();
  }, []);

  const handleAddUser = async () => {
    const UID = prompt(
      "Paste in the user ID of the person whom you want to talk to."
    );

    setUsers((prevUsers) => [...prevUsers, UID]);

    const data = await addToContact(ourUid, UID);
    if (data) {
      console.log("Registration successful");
    } else {
      setUsers((prevUsers) => prevUsers.filter((user) => user !== UID));
      alert("User not found");
    }
  };

  const handleUserClick = async (user) => {
    setCurrentUser(user);
    setMessages([]);

    const data = await fetch(
      "https://biszbo-backend.onrender.com/getAllMessages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentID: lexicographicSort([user, ourUid]),
        }),
      }
    );

    const messageData = await data.json();
    const messagesInData = messageData.messages.map(
      (element) => element.message
    );
    //sessionStorage.setItem(lexicographicSort([user, ourUid]), JSON.stringify(messagesInData));
    setMessages(messagesInData);
  };

  // check for messages and contacts
  setInterval(async () => {
    //checkmessage
    const data = await fetch(
      "https://biszbo-backend.onrender.com/getAllMessages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentID: lexicographicSort([currentUser, ourUid]),
        }),
      }
    );

    const messageData = await data.json();
    const messagesInData = messageData.messages.map(
      (element) => element.message
    );
    //sessionStorage.setItem(
    //  lexicographicSort([user, ourUid]),
    //  JSON.stringify(messagesInData)
    //);
    setMessages(messagesInData);

    // contact
    const contacts = await getAllContacts(ourUid);
    setUsers(contacts.contacts);
  }, 5000);

  return (
    <div className={styles.chatContainer}>
      {" "}
      <div className={styles.sidebar}>
        {" "}
        <div className={styles.userList}>
          {" "}
          <h3>Users</h3>
          <ul>
            {" "}
            {users.map((user, index) => (
              <li key={index} onClick={() => handleUserClick(user)}>
                {user}
              </li>
            ))}
          </ul>{" "}
          {/* users will come here */}
        </div>
        <button className={styles.addUserButton} onClick={handleAddUser}>
          {" "}
          Add User
        </button>
      </div>
      <div className={styles.chatWindow}>
        {" "}
        <div className={styles.topBar}>{currentUser}</div>
        <div className={styles.messages}>
          {" "}
          {messages.map((msg, index) => (
            <div key={index} className={styles.message}>
              {" "}
              <span className={styles.userName}>User</span>: {msg}
            </div>
          ))}
        </div>
        <div className={styles.inputSection}>
          {" "}
          <input
            type="text"
            className={styles.messageInput}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button className={styles.sendButton} onClick={handleSendMessage}>
            {" "}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
