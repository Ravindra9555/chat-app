// // server.js
// import express from "express";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import cors from "cors";
// import shortid from "shortid";

// const app = express();
// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"],
//     },
// });

// app.use(cors());
// app.use(express.json());

// // API to generate a chat room link
// app.post("/api/create-room", (req, res) => {
//     const roomId = shortid.generate();
//     res.status(201).json({ roomId, url: `http://localhost:5173/chat/${roomId}` });
// });

// // Handle Socket.IO connections
// io.on("connection", (socket) => {
//     console.log("A user connected:", socket.id);

//     // Handle user joining a room
//     socket.on("join-room", ({ roomId, userName }) => {
//         if (!roomId || !userName) {
//             console.error("Missing roomId or userName");
//             return;
//         }

//         socket.join(roomId);
//         console.log(`${userName} joined room ${roomId}`);
//         socket.to(roomId).emit("user-joined", { userName }); // Notify others in the room
//     });

//     // Handle chat messages
//     socket.on("send-message", ({ roomId, userName, message }) => {
//         if (!roomId || !userName || !message) {
//             console.error("Invalid message payload");
//             return;
//         }

//         io.to(roomId).emit("receive-message", { userName, message });
//     });

//     // Handle disconnect
//     socket.on("disconnect", () => {
//         console.log("A user disconnected:", socket.id);
//     });
// });

// const PORT = 5000;
// httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import shortid from "shortid";

// Initialize app and server
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/chatApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Chat Schema and Model
const chatSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    userName: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);

// API to generate a chat room link
app.post("/api/create-room", (req, res) => {
    const roomId = shortid.generate();
    res.status(201).json({ roomId, url: `http://localhost:5173/chat/${roomId}` });
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle user joining a room
    socket.on("join-room", async ({ roomId, userName }) => {
        if (!roomId || !userName) {
            console.error("Missing roomId or userName");
            return;
        }

        socket.join(roomId);
        console.log(`${userName} joined room ${roomId}`);
        socket.to(roomId).emit("user-joined", { userName }); // Notify others in the room

        // Fetch chat history for the room
        try {
            const chatHistory = await Chat.find({ roomId }).sort({ timestamp: 1 });
            socket.emit("chat-history", chatHistory); // Send chat history to the user
        } catch (err) {
            console.error("Error fetching chat history:", err.message);
        }
    });

    // Handle chat messages
    socket.on("send-message", async ({ roomId, userName, message }) => {
        if (!roomId || !userName || !message) {
            console.error("Invalid message payload");
            return;
        }

        // Save message to database
        const chatMessage = new Chat({ roomId, userName, message });
        try {
            await chatMessage.save();
            io.to(roomId).emit("receive-message", { userName, message });
        } catch (err) {
            console.error("Error saving message:", err.message);
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

// Start the server
const PORT = 5000;
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
