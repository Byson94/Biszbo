import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import LoginPage from "./pages/login/Login";
import SignupPage from "./pages/signup/Signup";
import ChatPage from "./pages/chat/Chat";

function App() {
  return (
    <BrowserRouter basename={process.env.REACT_APP_BASE_PATH || "/"}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
