import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { InvestmentFocus } from "@/components/sections/investment-focus";
import { News } from "@/components/sections/news";
import { CompanyProfiles } from "@/components/sections/company-profiles";
import { Contact } from "@/components/sections/contact";
import { type Language } from "@/lib/i18n";

export default function Landing() {
  const [language, setLanguage] = useState<Language>('en');

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-bg');
      
      parallaxElements.forEach(element => {
        const speed = 0.5;
        (element as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation language={language} onLanguageChange={setLanguage} />
      <Hero language={language} />
      <About language={language} />
      <InvestmentFocus language={language} />
      <News language={language} />
      <CompanyProfiles language={language} />
      <Contact language={language} />
      <Footer language={language} />
    </div>
  );
}
