import React from 'react';
import Hero from '../components/Home/Hero';
import StatsSection from '../components/Home/StatsSection';
import IdeaSection from '../components/Home/IdeaSection';
import TracksSection from '../components/Home/TracksSection';
import AiExperienceShowcase from '../components/Home/AiExperienceShowcase';
import AiConAssisten from '../components/Home/AiConAssisten';
import Liveinteligenc from '../components/Home/Liveinteligenc';
import KnowledgeSection from '../components/Home/KnowledgeSection';
import SpeakersSection from '../components/Home/SpeakersSection';


export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <Hero />

      {/* Conference Key Stats & Highlights */}
      <StatsSection />

      {/* The Idea Section */}
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

    
     
    </main>
  );
}
