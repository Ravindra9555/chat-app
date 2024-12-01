
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import ChatRoom from "./ChatRoom";

function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat/:roomId" element={<ChatRoom />} />
        </Routes>
    </Router>
);
}

export default App
