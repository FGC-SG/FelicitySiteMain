import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { About as AboutSection } from "@/components/sections/about";
import { Members } from "@/components/sections/members";
import { type Language } from "@/lib/i18n";

export default function AboutPage() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation language={language} onLanguageChange={setLanguage} />
      <main className="pt-16">
        <AboutSection language={language} />
        <Members language={language} />
      </main>
      <Footer language={language} />
    </div>
  );
}