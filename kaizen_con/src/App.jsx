import React from 'react';
import Navbar from './components/Home/Navbar';
import Hero from './components/Home/Hero';
import IdeaSection from './components/Home/IdeaSection';
import StatsSection from './components/Home/StatsSection';
import TracksSection from './components/Home/TracksSection';
import AiExperienceShowcase from './components/Home/AiExperienceShowcase';
import AiConAssisten from './components/Home/AiConAssisten';
import Liveinteligenc from './components/Home/Liveinteligenc';
import KnowledgeSection from './components/Home/KnowledgeSection';
import SpeakersSection from './components/Home/SpeakersSection';
import VenueSection from './components/Home/VenueSection';
import Footer from './components/Home/Footer';
import FloatingChatbot from './components/Home/FloatingChatbot';
import './components/Global.css';

function App() {
  return (
    <div className="app-container">
      {/* KaizenCon Navbar */}
      <Navbar />

      {/* Main Home Page Sections */}
      <main>
        {/* Hero Section matching screenshot layout & #55355e button */}
        <Hero />
         {/* Conference Key Stats & Highlights */}
  <StatsSection />
        {/* The Idea Section matching user screenshot */}
        <IdeaSection />

        

        {/* Scientific Themes & Tracks */}
        <TracksSection />

        {/* Live AI Layer Experience */}
        <AiExperienceShowcase />

        {/* AI Conference Assistant */}
        <AiConAssisten />

        {/* Live Intelligence: The room, made intelligent */}
        <Liveinteligenc />

        {/* Conference Knowledge - Search the entire conference */}
        <KnowledgeSection />

        {/* Leading Global Faculty */}
        <SpeakersSection />

        {/* Venue & Registration Banner */}
        <VenueSection />
      </main>

      {/* Conference Footer */}
      <Footer />

      {/* Persistent Floating AI Chatbot Icon (Visible on all pages) */}
      <FloatingChatbot />
    </div>
  );
}

export default App;
