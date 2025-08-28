import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { InvestmentFocus } from "@/components/sections/investment-focus";
import { News } from "@/components/sections/news";
import { CompanyProfiles } from "@/components/sections/company-profiles";
import { Contact } from "@/components/sections/contact";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { type Language } from "@/lib/i18n";

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

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

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation language={language} onLanguageChange={setLanguage} />
      
      {/* Welcome message for authenticated users */}
      {user && (
        <div className="bg-felicity-primary text-white py-2 px-4 text-center text-sm">
          Welcome back, {(user as any).firstName || (user as any).email}! You are logged in to Felicity Global Capital.
        </div>
      )}
      
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
