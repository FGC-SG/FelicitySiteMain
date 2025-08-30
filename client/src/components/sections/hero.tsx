import { Button } from "@/components/ui/button";
import { useTranslation, type Language } from "@/lib/i18n";

interface HeroProps {
  language: Language;
}

export function Hero({ language }: HeroProps) {
  const t = useTranslation(language);

  const handleLearnMore = () => {
    window.location.href = "/about";
  };

  const handleInvestmentApproach = () => {
    const element = document.querySelector("#investment");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Singapore Raffles Place and Marina Bay skyline with zoom-in animation */}
      <div 
        className="hero-background absolute inset-0 animate-zoom-in"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1525625293386-3f8f99389edd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
          backgroundPosition: "30% 48%",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover"
        }}
      ></div>
      <div className="hero-overlay absolute inset-0"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="block" data-testid="text-hero-title">{t.hero.title}</span>
            <span className="block text-4xl md:text-5xl font-light mt-2" data-testid="text-hero-subtitle">
              {t.hero.subtitle}
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-90" data-testid="text-hero-description">
            {t.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleLearnMore}
              className="border-2 border-white text-white bg-black/20 backdrop-blur-sm px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors shadow-lg"
              size="lg"
              data-testid="button-learn-more"
            >
              {t.hero.learnMore}
            </Button>
            <Button
              onClick={handleInvestmentApproach}
              className="border-2 border-white text-white bg-black/20 backdrop-blur-sm px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors shadow-lg"
              size="lg"
              data-testid="button-investment-approach"
            >
              {t.hero.investmentApproach}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
