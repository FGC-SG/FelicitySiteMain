import { type Language } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface InsightsPreviewProps {
  language: Language;
}

interface NewsArticle {
  id: number;
  title: string;
  titleJa?: string;
  content: string;
  contentJa?: string;
  category: string;
  publishedAt: string;
  isVisible?: boolean;
}

export function InsightsPreview({ language }: InsightsPreviewProps) {
  const { data: newsArticles, isLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
    queryFn: async () => {
      const response = await fetch("/api/news", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch news");
      return await response.json();
    },
  });

  const visibleArticles = newsArticles
    ?.filter(article => article.isVisible !== false)
    ?.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    ?.slice(0, 3) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      language === "en" ? "en-US" : "ja-JP",
      { year: "numeric", month: "short", day: "numeric" }
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      "NEWS AT PORTFOLIO": language === "en" ? "Portfolio" : "ポートフォリオ",
      "CORPORATE": language === "en" ? "Corporate" : "コーポレート",
      "INVESTMENTS": language === "en" ? "Investments" : "投資",
      "FUND-FORMATION": language === "en" ? "Fund" : "ファンド",
      "GENERAL": language === "en" ? "General" : "一般",
      "ANNOUNCEMENT": language === "en" ? "Announcement" : "お知らせ",
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30" id="insights">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
            <div className="animate-pulse h-4 bg-muted rounded w-64 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (visibleArticles.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/30" id="insights">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-insights-title">
              {language === 'jp' ? '最新ニュース' : 'Latest News & Insights'}
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-insights-subtitle">
              {language === 'jp' 
                ? '会社からの最新情報とお知らせ' 
                : 'Stay updated with our latest announcements'}
            </p>
          </div>
          <Link href="/news">
            <Button variant="outline" className="gap-2 hidden md:flex" data-testid="button-view-all-news">
              {language === 'jp' ? 'すべて見る' : 'View All'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleArticles.map((article) => {
            const displayTitle = language === 'jp' && article.titleJa ? article.titleJa : article.title;
            return (
              <Link key={article.id} href="/news">
                <Card 
                  className="group hover:shadow-lg transition-all cursor-pointer h-full"
                  data-testid={`insights-card-${article.id}`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryLabel(article.category)}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(article.publishedAt)}
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {displayTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3">
                      {language === 'jp' && article.contentJa 
                        ? article.contentJa.substring(0, 150) + '...'
                        : article.content?.substring(0, 150) + '...'}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/news">
            <Button variant="outline" className="gap-2" data-testid="button-view-all-news-mobile">
              {language === 'jp' ? 'すべてのニュースを見る' : 'View All News'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
