import { type Language } from "@/lib/i18n";

interface TrustedPartnersProps {
  language: Language;
}

export function TrustedPartners({ language }: TrustedPartnersProps) {
  const content = {
    en: {
      title: "Trusted Partners",
      subtitle: "Working with leading institutions across Asia-Pacific"
    },
    jp: {
      title: "信頼されるパートナー",
      subtitle: "アジア太平洋地域の主要機関と協働"
    }
  };

  const c = content[language];

  return (
    <section className="py-16 bg-background" data-testid="section-partners">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 felicity-primary" data-testid="text-partners-title">
            {c.title}
          </h2>
          <p className="text-muted-foreground" data-testid="text-partners-subtitle">
            {c.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className="w-24 h-24 md:w-28 md:h-28 bg-secondary/50 rounded-lg flex items-center justify-center border border-border hover:bg-secondary transition-colors"
              data-testid={`partner-logo-${index}`}
            >
              <div className="text-muted-foreground/40 text-xs text-center px-2">
                {language === 'jp' ? 'ロゴ' : 'Logo'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
