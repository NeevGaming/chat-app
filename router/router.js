const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middlewares/auth");

// Register route
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const newUser = new User({ email, password: password });
    await newUser.save();
    return res.json({
      email : email , 
      token : true
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if(user.password === password) {
      return res.json({
        email : email , 
        token : true
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Protected route example
router.get("/protected", auth, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

router.get("/contacts/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const contacts = await Contact.findOne({ email: email });
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).send("Server Error");
  }
});

router.post("/contacts/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const user = await Contact.findOne({ email: email });
    if (user) {
      user.contacts.push(req.body);
      await user.save();
    } else {
      const newContact = new Contact({
        email: email,
        contacts: [{ name : req.body.name , email : req.body.email , messages: [] }],
      });
      await newContact.save();
    }
    res.send("Contact added");
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).send("Server Error");
  }
});

router.patch("/contacts/:email", async (req, res) => {
  const email = req.params.email;
  const { contactEmail, messages } = req.body;
  try {
    const user = await Contact.findOne({ email: email });
    const user2 = await Contact.findOne({ email: contactEmail });

    if (!user2) {
      const newContact = new Contact({
        email: contactEmail,
        contacts: [
          {
            name: "Unknown",
            email: email,
            messages: [
              {
                sender: "Unknown",
                text: messages[messages.length - 1].text,
                time: messages[messages.length - 1].time,
              },
            ],
          },
        ],
      });
      console.log(email + "  -> " + newContact.email + " -> " + contactEmail);
      await newContact.save();
    } else {
      const contact = user2.contacts.find((c) => c.email === email);
      if (contact) {
        contact.messages.push({
          sender: contact.name,
          text: messages[messages.length - 1].text,
          time: messages[messages.length - 1].time,
        });
      } else {
        user2.contacts.push({
          name: "Unknown",
          email: email,
          messages: [
            {
              sender: "Unkown",
              text: messages[messages.length - 1].text,
              time: messages[messages.length - 1].time,
            },
          ],
        });
      }
      await user2.save();
    }

    if (user) {
      const contact = user.contacts.find((c) => c.email === contactEmail);
      if (contact) {
        contact.messages = messages;
        await user.save();
        return res.status(200).send("Messages updated");
      } else {
        return res.status(404).send("Contact not found");
      }
    } else {
      return res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error updating messages:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
