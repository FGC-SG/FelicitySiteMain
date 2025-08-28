import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Contact as ContactSection } from "@/components/sections/contact";
import { CompanyProfiles } from "@/components/sections/company-profiles";
import { type Language } from "@/lib/i18n";

export default function ContactPage() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation language={language} onLanguageChange={setLanguage} />
      <main className="pt-16">
        <CompanyProfiles language={language} />
        <ContactSection language={language} />
      </main>
      <Footer language={language} />
    </div>
  );
}