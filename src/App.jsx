import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import HostRegister from "./Pages/HostRegister";
import HostLogin from "./Pages/HostLogin";
import Discover from "./Pages/Discover";
import Booking from "./Pages/Booking";
import { Profile } from "./Pages/Profile";
import {Admin } from "./Pages/Admin";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/host/register" element={<HostRegister />} />
      <Route path="/booking/:id" element={<Booking />} />
      <Route path="/admin" element={<Admin />} />

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={["guest", "host", "admin"]} />}
        >
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/discover" element={<Discover />} />

        <Route path="/modal-test" element={<ReviewModal />} />

        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route path="/host/register" element={<HostRegister />} />
        <Route path="/booking/:id" element={<Booking />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/host/login" element={<HostLogin />} />
      </Route>
      <Route path="/book-activity" element={<BookActivity />} />
      <Route path="/reserve-activity" element={<Reservation />} />
      <Route path="reservation-confirmed" element={<ReservationConfirmed />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
