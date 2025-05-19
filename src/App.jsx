// App.jsx
// Entry point for route definitions and layout logic

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TicketBooking from './pages/TicketBooking';
import VenueBooking from './pages/VenueBooking';
import LiveBooking from './pages/LiveBooking';
import VenueLiveBooking from './pages/VenueLiveBooking';
import Payment from './pages/Payment';
import BookingConfirmation from './pages/BookingConfirmation';
import About from './pages/About';
import Metrics from './pages/Metrics';
import MiniSidebar from './components/MiniSidebar';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import MyBookings from './pages/MyBookings';
import NotificationsPopup from './pages/NotificationsPopup';
import ManagerDashboard from './pages/ManagerDashboard';
import ChatPage from './pages/ChatPage';

const AppLayout = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="page-wrapper">
      <Navbar />
      {!isAuthPage && <MiniSidebar />}
      <NotificationsPopup />

      <main className="main-content">
        <Routes>
          <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
          <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
          <Route path="/ticket-booking" element={token ? <TicketBooking /> : <Navigate to="/login" />} />
          <Route path="/venue-booking" element={token ? <VenueBooking /> : <Navigate to="/login" />} />
          <Route path="/live-booking" element={token ? <LiveBooking /> : <Navigate to="/login" />} />
          <Route path="/VenueLiveBooking" element={token ? <VenueLiveBooking /> : <Navigate to="/login" />} />
          <Route path="/payment" element={token ? <Payment /> : <Navigate to="/login" />} />
          <Route path="/booking-confirmation" element={token ? <BookingConfirmation /> : <Navigate to="/login" />} />
          <Route path="/about" element={token ? <About /> : <Navigate to="/login" />} />
          <Route path="/support" element={token ? <ChatPage /> : <Navigate to="/login" />} />
          <Route path="/metrics" element={<ProtectedRoute requiredRole="staff"><Metrics /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/manager" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} Galala Innovation Park | All rights reserved.</p>
        <p>Powered by Edaretna Management System</p>
      </footer>
    </div>
  );
};

const App = () => (
  <Router>
    <AppLayout />
  </Router>
);

export default App;
