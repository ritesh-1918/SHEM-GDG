import React from 'react';
import Header from './Header';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Advantages from './Advantages';
import FeatureGraphs from './FeatureGraphs';
import Team from './Team';
import FAQ from './FAQ';
import Footer from './Footer';
import RevealOnScroll from './RevealOnScroll';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />

      <main>
        <Hero />

        <RevealOnScroll width="100%">
          <Advantages />
        </RevealOnScroll>

        <RevealOnScroll width="100%">
          <HowItWorks />
        </RevealOnScroll>

        <RevealOnScroll width="100%">
          <FeatureGraphs />
        </RevealOnScroll>

        <RevealOnScroll width="100%">
          <Team />
        </RevealOnScroll>

        <RevealOnScroll width="100%">
          <FAQ />
        </RevealOnScroll>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;