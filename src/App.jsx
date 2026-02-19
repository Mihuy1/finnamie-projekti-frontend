import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import HostRegister from "./Pages/HostRegister";
import HostLogin from "./Pages/HostLogin";
import Discover from "./Pages/Discover";
import Booking from "./Pages/Booking";
import { Profile } from "./Pages/Profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/host/register" element={<HostRegister />} />
      <Route path="/booking/:id" element={<Booking />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/host/login" element={<HostLogin />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
