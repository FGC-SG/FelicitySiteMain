import { Globe, Handshake } from "lucide-react";
import { useTranslation, type Language } from "@/lib/i18n";

interface InvestmentFocusProps {
  language: Language;
}

export function InvestmentFocus({ language }: InvestmentFocusProps) {
  const t = useTranslation(language);

  return (
    <section id="investment" className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold felicity-primary mb-4" data-testid="text-investment-title">
            {t.investment.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-investment-subtitle">
            {t.investment.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-xl p-8 shadow-lg border border-border" data-testid="card-asian-investment">
            <div className="felicity-bg w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <Globe className="text-white h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold felicity-primary mb-4" data-testid="text-asian-title">
              {t.investment.asian.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-asian-description">
              {t.investment.asian.description}
            </p>
          </div>

          <div className="bg-card rounded-xl p-8 shadow-lg border border-border" data-testid="card-succession-investment">
            <div className="felicity-bg w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <Handshake className="text-white h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold felicity-primary mb-4" data-testid="text-succession-title">
              {t.investment.succession.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-succession-description">
              {t.investment.succession.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
