import { Newspaper } from "lucide-react";
import { useTranslation, type Language } from "@/lib/i18n";

interface NewsProps {
  language: Language;
}

export function News({ language }: NewsProps) {
  const t = useTranslation(language);

  return (
    <section id="news" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold felicity-primary" data-testid="text-news-title">
            {t.news.title}
          </h2>
          <div className="news-badge text-white px-4 py-2 rounded-full text-sm font-semibold">
            <Newspaper className="inline mr-2 h-4 w-4" />
            News
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          <div className="p-8">
            <div className="flex items-center mb-4">
              <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full" data-testid="text-news-date">
                July 31, 2025
              </span>
              <span className="ml-3 text-sm felicity-primary font-semibold" data-testid="text-news-category">
                Corporate Restructuring
              </span>
            </div>
            <h3 className="text-2xl font-bold felicity-primary mb-4" data-testid="text-news-headline">
              {t.news.restructuring.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6" data-testid="text-news-description">
              {t.news.restructuring.description}
            </p>

            <div className="border-t border-border pt-6">
              <h4 className="text-lg font-semibold felicity-primary mb-4" data-testid="text-key-changes">
                {t.news.restructuring.keyChanges}
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div data-testid="card-singapore-changes">
                  <h5 className="font-semibold mb-2">{t.news.restructuring.singapore}</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Name change to Felicity Global Capital Pte. Ltd.</li>
                    <li>• New Group Representative: Tomohiro Fujita</li>
                    <li>• Continued partnership with Daiwa Securities Group</li>
                  </ul>
                </div>
                <div data-testid="card-japan-changes">
                  <h5 className="font-semibold mb-2">{t.news.restructuring.japan}</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Establishment of Felicity Capital Co., Ltd.</li>
                    <li>• Focus on business succession funds</li>
                    <li>• Independent operational framework</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
