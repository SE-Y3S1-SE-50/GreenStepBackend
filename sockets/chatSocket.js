// sockets/chatSocket.js
import Message from "../models/Message.js";

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ New client connected");

    socket.on("sendMessage", async (data) => {
      console.log("📩 Received from client:", data);

      const newMessage = new Message({
        user: data.user,
        message: data.message,
      });
      await newMessage.save();

      // Broadcast to all connected clients
      io.emit("receiveMessage", newMessage);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected");
    });
  });
};

