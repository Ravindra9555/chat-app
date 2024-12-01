

import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const ChatRoom = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const [userName, setUserName] = useState(new URLSearchParams(location.search).get("name"));
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (userName) {
            // Join the chat room
            socket.emit("join-room", { roomId, userName });

            // Fetch chat history when joining
            socket.on("chat-history", (chatHistory) => {
                setMessages(chatHistory);
            });

            // Listen for new messages
            socket.on("receive-message", ({ userName, message }) => {
                setMessages((prev) => [...prev, { userName, message }]);
            });

            // Notify when a user joins
            socket.on("user-joined", ({ userName }) => {
                setMessages((prev) => [...prev, { userName: "System", message: `${userName} joined the room.` }]);
            });

            // Clean up listeners on unmount
            return () => {
                socket.off("chat-history");
                socket.off("receive-message");
                socket.off("user-joined");
            };
        }
    }, [roomId, userName]);

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit("send-message", { roomId, userName, message });
            setMessage(""); // Clear the input field
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Chat Room: {roomId}
            </Typography>
            <Paper sx={{ p: 2, mb: 2, height: 400, overflowY: "auto" }}>
                {messages.map((msg, idx) => (
                    <Typography key={idx} variant="body1">
                        <strong>{msg.userName}:</strong> {msg.message}
                    </Typography>
                ))}
            </Paper>
            <TextField
                label="Type a message"
                variant="outlined"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={sendMessage} fullWidth>
                Send
            </Button>
        </Box>
    );
};

export default ChatRoom;
