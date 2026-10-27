import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Home/Navbar';
import Footer from './components/Home/Footer';
import FloatingChatbot from './components/Home/FloatingChatbot';
import ScrollToTop from './components/Common/ScrollToTop';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import SpeakersPage from './pages/SpeakersPage';
import KnowledgePage from './pages/KnowledgePage';
import AboutPage from './pages/AboutPage';
import AiExperiencePage from './pages/AiExperiencePage';
import ProgrammePage from './pages/ProgrammePage';
import QaPage from './pages/QaPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
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
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/programme" element={<ProgrammePage />} />
          <Route path="/program" element={<ProgrammePage />} />
          <Route path="/speakers" element={<SpeakersPage />} />
          <Route path="/speaker" element={<SpeakersPage />} />
          <Route path="/ai-experience" element={<AiExperiencePage />} />
          <Route path="/ai" element={<AiExperiencePage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/knowledge-base" element={<KnowledgePage />} />
          <Route path="/qa" element={<QaPage />} />
          <Route path="/q-a" element={<QaPage />} />
          <Route path="/qna" element={<QaPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
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
