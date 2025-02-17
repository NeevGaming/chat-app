require("dotenv").config();
const dev = process.env.NODE_ENV !== "production";
const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const router = require("./router/router");
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "client", "dist")));
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/chat-app", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

connectDB();

if (dev) {
  const webpackDev = require("./dev");
  app.use(webpackDev.comp).use(webpackDev.hot);
}

const emailSocketMap = new Map();

io.on("connection", (socket) => {
  console.log("Connection Success");

  socket.on("register", (email) => {
    emailSocketMap.set(email, socket.id);
    console.log(`User registered: ${email}`);
  });

  socket.on("update", (email) => {
    const socketId = emailSocketMap.get(email);
    if (socketId) {
      io.to(socketId).emit("update");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");

    for (let [email, socketId] of emailSocketMap.entries()) {
      if (socketId === socket.id) {
        emailSocketMap.delete(email);
        break;
      }
    }
  });
});

app.use("/", router);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// server.listen(3000, function () {
//   console.log("Server started on :3000");
// });

module.exports = server;
