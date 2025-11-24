import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const App = () => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState(1); // 1 = ID, 2 = Name, 3 = Chat
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("receive", (data) => {
      setChat((prev) => [...prev, data]);
    });
  }, []);

  const handleIdSubmit = () => {
    if (id.trim()) {
      setStep(2);
    }
  };

  const handleNameSubmit = () => {
    if (name.trim()) {
      socket.emit("joinUser", { id, name });
      setStep(3);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMsg", { id, name, message });
      setMessage("");
    }
  };

  // ===================== UI STEPS ======================

  if (step === 1) {
    return (
      <div style={styles.joinBox}>
        <h2>Enter Your ID</h2>
        <input
          style={styles.input}
          placeholder="Your ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button style={styles.button} onClick={handleIdSubmit}>
          Next
        </button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={styles.joinBox}>
        <h2>Enter Your Name</h2>
        <input
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button style={styles.button} onClick={handleNameSubmit}>
          Join Chat
        </button>
      </div>
    );
  }

  // ===================== CHAT BOX ======================

  return (
    <div style={styles.chatContainer}>
      <h3>
        ID: {id} | Name: {name}
      </h3>

      <div style={styles.chatBox}>
        {chat.map((c, i) => (
          <div key={i} style={c.id === id ? styles.myMsg : styles.otherMsg}>
            <b>[{c.id}] {c.name}:</b> {c.message}
          </div>
        ))}
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

// ======================= STYLES ========================

const styles = {
  joinBox: {
    marginTop: "130px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    fontFamily: "Arial",
  },
  input: {
    padding: "8px",
    width: "250px",
    borderRadius: "6px",
    border: "1px solid gray",
  },
  button: {
    padding: "8px 16px",
    background: "#0078ff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  chatContainer: {
    width: "500px",
    margin: "30px auto",
    fontFamily: "Arial",
  },
  chatBox: {
    height: "400px",
    border: "1px solid #ccc",
    padding: "10px",
    overflowY: "auto",
    borderRadius: "6px",
    marginBottom: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  myMsg: {
    alignSelf: "flex-end",
    background: "#DCF8C6",
    padding: "8px",
    borderRadius: "6px",
    maxWidth: "70%",
  },
  otherMsg: {
    alignSelf: "flex-start",
    background: "#f1f1f1",
    padding: "8px",
    borderRadius: "6px",
    maxWidth: "70%",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
  },
};

export default App;
