import { useTranslation, type Language } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, Calendar, User, Eye, ArrowRight } from "lucide-react";

interface NewsProps {
  language: Language;
}

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  language: string;
  category: string;
  tags?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export function News({ language }: NewsProps) {
  const t = useTranslation(language);

  const { data: newsArticles, isLoading, error } = useQuery({
    queryKey: ["/api/news-with-translations"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/news-with-translations", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Translation service unavailable, falling back to original articles");
        }
        return await response.json();
      } catch (error) {
        // Fallback to regular news if translation fails
        console.log("Using fallback news endpoint due to translation service issue");
        const fallbackResponse = await fetch("/api/news", {
          credentials: "include",
        });
        if (!fallbackResponse.ok) {
          throw new Error("Failed to fetch news articles");
        }
        return await fallbackResponse.json();
      }
    },
  });

  const getCategoryLabel = (category: string) => {
    const labels = {
      company: language === "en" ? "Company News" : "会社ニュース",
      investment: language === "en" ? "Investment Updates" : "投資アップデート",
      market: language === "en" ? "Market Analysis" : "市場分析",
      announcement: language === "en" ? "Announcements" : "お知らせ",
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "company": return "bg-blue-100 text-blue-800";
      case "investment": return "bg-green-100 text-green-800";
      case "market": return "bg-purple-100 text-purple-800";
      case "announcement": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      language === "en" ? "en-US" : "ja-JP",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

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

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600" data-testid="text-news-error">
                {language === "en" ? "Error loading news" : "ニュースの読み込みエラー"}
              </CardTitle>
              <CardDescription>
                {language === "en" 
                  ? "Unable to fetch news articles. Please try again later."
                  : "ニュース記事を取得できません。後でもう一度お試しください。"
                }
              </CardDescription>
            </CardHeader>
          </Card>
        ) : newsArticles && newsArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {newsArticles
              .filter((article: NewsArticle) => {
                // Show articles that match the current language
                // For Japanese: prefer AI-translated versions, fallback to English if no translation
                if (language === "jp") {
                  return article.language === "ja";
                } else {
                  // For English: show English articles only
                  return article.language === "en";
                }
              })
              .map((article: NewsArticle) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow" data-testid={`news-card-${article.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getCategoryColor(article.category)} data-testid={`news-category-${article.id}`}>
                        {getCategoryLabel(article.category)}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span data-testid={`news-date-${article.id}`}>
                          {formatDate(article.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <CardTitle className="line-clamp-2" data-testid={`news-title-${article.id}`}>
                      {article.title}
                    </CardTitle>
                    
                    <CardDescription className="line-clamp-3" data-testid={`news-description-${article.id}`}>
                      {article.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {article.tags && (
                        <div className="flex flex-wrap gap-1">
                          {article.tags.split(',').map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1" />
                          <span data-testid={`news-author-${article.id}`}>
                            {language === "en" ? "Author" : "著者"}: {article.authorId.slice(0, 8)}
                          </span>
                        </div>
                        
                        <Button variant="ghost" size="sm" data-testid={`button-read-more-${article.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          {language === "en" ? "Read More" : "続きを読む"}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2" data-testid="text-no-news">
                {language === "en" ? "No news articles available" : "利用可能なニュース記事がありません"}
              </h3>
              <p className="text-muted-foreground">
                {language === "en" 
                  ? "Check back later for the latest updates from Felicity Global Capital"
                  : "フェリシティグローバルキャピタルからの最新情報は後でご確認ください"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}