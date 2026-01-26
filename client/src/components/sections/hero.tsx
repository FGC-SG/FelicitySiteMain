import { Button } from "@/components/ui/button";
import { useTranslation, type Language } from "@/lib/i18n";
import { getSiteContent } from "@/content/site";
import { ArrowRight, Mail, Newspaper } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import singaporeSkylineUrl from "@assets/generated_images/Singapore_skyline_from_ocean_dea87d8f.png";

interface NewsArticle {
  id: number;
  title: string;
  titleJa?: string;
  isVisible?: boolean;
  publishedAt: string;
}

interface HeroProps {
  language: Language;
}

export function Hero({ language }: HeroProps) {
  const t = useTranslation(language);
  const content = getSiteContent(language);

  const { data: newsArticles } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
    queryFn: async () => {
      const response = await fetch("/api/news", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch news");
      return await response.json();
    },
  });

  const latestNews = newsArticles
    ?.filter(article => article.isVisible !== false)
    ?.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    ?.slice(0, 3) || [];

  const handleScrollToWhatWeDo = () => {
    const element = document.querySelector("#what-we-do");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div 
        className="hero-background absolute inset-0 animate-zoom-in"
        style={{
          backgroundImage: `url(${singaporeSkylineUrl})`,
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover"
        }}
      ></div>
      <div className="hero-overlay absolute inset-0"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="block" data-testid="text-hero-title">
              {language === 'jp' ? (
                <>
                  フェリシティ
                  <br />
                  グローバルキャピタル
                </>
              ) : (
                "Felicity Global Capital"
              )}
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light mb-4 opacity-95" data-testid="text-hero-headline">
            {content.positioning.hero.headline}
          </h2>
          <p className="text-lg md:text-xl mb-4 leading-relaxed opacity-90 max-w-3xl mx-auto" data-testid="text-hero-subheadline">
            {content.positioning.hero.subheadline}
          </p>
          <p className="text-base md:text-lg mb-8 leading-relaxed opacity-80 max-w-2xl mx-auto" data-testid="text-hero-description">
            {content.positioning.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button
              onClick={handleScrollToWhatWeDo}
              className="bg-white text-primary hover:bg-white/90 px-8 py-3 rounded-lg font-semibold shadow-lg gap-2"
              size="lg"
              data-testid="button-hero-primary"
            >
              {content.positioning.hero.ctaPrimary}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Link href="/contact">
              <Button
                className="border-2 border-white text-white bg-white/10 backdrop-blur-sm px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors shadow-lg gap-2"
                size="lg"
                data-testid="button-hero-secondary"
              >
                <Mail className="h-5 w-5" />
                {content.positioning.hero.ctaSecondary}
              </Button>
            </Link>
          </div>
          
          {/* Latest News Section */}
          {latestNews.length > 0 && (
            <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto" data-testid="hero-latest-news">
              <div className="flex items-center gap-2 mb-3 justify-center">
                <Newspaper className="h-4 w-4 text-white/80" />
                <span className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                  {language === 'jp' ? '最新ニュース' : 'Latest News'}
                </span>
              </div>
              <div className="space-y-2">
                {latestNews.map((article) => {
                  const displayTitle = language === 'jp' && article.titleJa ? article.titleJa : article.title;
                  return (
                    <Link key={article.id} href="/news">
                      <div className="text-sm text-white/90 hover:text-white transition-colors cursor-pointer flex items-start gap-2 text-left">
                        <span className="text-white/60">•</span>
                        <span className="line-clamp-1 hover:underline">{displayTitle}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t border-white/20">
            <Button
              onClick={() => window.open('https://felicitycapital.jp/', '_blank')}
              variant="link"
              className="text-white/80 hover:text-white underline-offset-4"
              data-testid="button-felicity-japan"
            >
              {language === 'jp' ? 'フェリシティキャピタル株式会社（日本）はこちら →' : 'Visit Felicity Capital Inc. (Japan) →'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
