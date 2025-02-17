import { useState, useEffect , useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io();

const Home = ({ email }) => {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currEmail, setCurrEmail] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);


  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`/contacts/${email}`);
        setContacts(
          response.data.contacts.map((elem) => {
            return {
              ...elem,
              active: false,
            };
          })
        );
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();

    socket.emit("register", email);

    socket.on("update", async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      await sleep(100);
      fetchContacts();
    });

    return () => {
      socket.off("update");
    };
  }, [email]);

  useEffect(() => {
    const activeContact = contacts.find((contact) => contact.email === currEmail);
    if (activeContact) {
      setMessages(activeContact.messages);
    }
  }, [currEmail, contacts]);

  useEffect(()=>{
    handleButtonClick(currEmail);
  } , [contacts]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() !== "") {
      const message = {
        sender: "You",
        text: newMessage,
        time: new Date().toLocaleTimeString(),
      };
      const newArr = [...messages, message];
      setMessages(newArr);
      setContacts((prevContacts) =>
        prevContacts.map((contact) => {
          if (contact.email === currEmail) {
            contact.messages = newArr;
          }
          return contact;
        })
      );
      axios.patch(`/contacts/${email}`, {
        contactEmail: currEmail,
        messages: newArr,
      });
      socket.emit("update", currEmail);
      setNewMessage("");
    }
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleButtonClick = (email)=>{
    setCurrEmail(email);
    setContacts(
      contacts.map((contact) =>{
        if(contact.email === email) {
          contact.active = true;
        } else {
          contact.active = false;
        }
        return contact;
      })
    );
  }

  return (
    <div className="home">
      <div className="contacts">
          {contacts.map((contact, index) => (
              <div
                className={`contact ${contact.active ? "active" : ""}`}
                onClick={() => handleButtonClick(contact.email)}
                key={index}
              >
                <div className="contact-info">
                  <span className="contact-name">{contact.name}</span>
                </div>
                <div className="contact-last-message">
                  <span className="last-message">{contact.last}</span>
                  <span className="last-time">{contact.lastTime}</span>
                </div>
              </div>
            ))}
        <Link to="addcontact">
          <button className="add-contact">Add Contact</button>
        </Link>
      </div>

      <div className="chatPanel">
        <div className="messages">
          {messages.map((message, index) => (
            <div
              className={`message ${message.sender === "You" ? "sent" : "received"}`}
              key={index}
            >
              <div className="message-sender">{message.sender}</div>
              <div className="message-text">{message.text}</div>
              <div className="message-time">{message.time}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="message-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Home;