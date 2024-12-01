import React, { useState } from "react";
import { Button, TextField, Typography, Box } from "@mui/material";
import axios from "axios";

const Home = () => {
    const [userName, setUserName] = useState("");
    const [chatLink, setChatLink] = useState("");

    const createRoom = async () => {
        if (!userName.trim()) {
            alert("Please enter your name.");
            return;
        }
        const response = await axios.post("http://localhost:5000/api/create-room");
        setChatLink(`${response.data.url}?name=${encodeURIComponent(userName)}`);
    };

    return (
        <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
                Create a Chat Room
            </Typography>
            <TextField
                label="Enter Your Name"
                variant="outlined"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={createRoom} fullWidth>
                Generate Chat Link
            </Button>
            {chatLink && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Share this link: <a href={chatLink}>{chatLink}</a>
                </Typography>
            )}
        </Box>
    );
};

export default Home;
