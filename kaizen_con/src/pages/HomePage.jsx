import React from 'react';
import Hero from '../components/Home/Hero';
import WelcomeMessage from '../components/Home/WelcomeMessage';
import StatsSection from '../components/Home/StatsSection';
import IdeaSection from '../components/Home/IdeaSection';
import TracksSection from '../components/Home/TracksSection';
// import AiExperienceShowcase from '../components/Home/AiExperienceShowcase';
import AiConAssisten from '../components/Home/AiConAssisten';
import Liveinteligenc from '../components/Home/Liveinteligenc';
import SpeakersSection from '../components/Home/SpeakersSection';
import AppDownloadSection from '../components/Home/AppDownloadSection';


export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <Hero />

      {/* Welcome Message Section */}
      <WelcomeMessage />

      {/* Conference Key Stats & Highlights */}
      <StatsSection />

      {/* The Idea Section */}
      <IdeaSection />

      {/* Scientific Themes & Tracks */}
      <TracksSection /> 

      {/* Live AI Layer Experience */}
      {/* <AiExperienceShowcase /> */}

      {/* AI Conference Assistant */}
      <AiConAssisten />

      {/* Live Intelligence: The room, made intelligent */}
      <Liveinteligenc />

      {/* Leading Global Faculty */}
      <SpeakersSection />

      {/* Download Our App Section */}
      <AppDownloadSection />

    </main>
  );
}
