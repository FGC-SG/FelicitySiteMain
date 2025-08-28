import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { InvestmentFocus } from "@/components/sections/investment-focus";
import { type Language } from "@/lib/i18n";

export default function Landing() {
  const [language, setLanguage] = useState<Language>('en');



  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation language={language} onLanguageChange={setLanguage} />
      <Hero language={language} />
      <InvestmentFocus language={language} />
      <Footer language={language} />
    </div>
  );
}
