import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Home/Navbar';
import Footer from './components/Home/Footer';
import FloatingChatbot from './components/Home/FloatingChatbot';
import ScrollToTop from './components/Common/ScrollToTop';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import './components/Global.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Automatic scroll-to-top on route change */}
        <ScrollToTop />

        {/* KaizenCon Navbar with Routing */}
        <Navbar />

        {/* Dynamic Route View */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          {/* Fallback route back to home */}
          <Route path="*" element={<HomePage />} />
        </Routes>

        {/* Conference Footer */}
        <Footer />

        {/* Persistent Floating AI Chatbot Icon (Visible on all pages) */}
        <FloatingChatbot />
      </div>
    </BrowserRouter>
  );
}

export default App;
