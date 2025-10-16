import { useState } from "react";
import { useTranslation, type Language } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Newspaper, Calendar, Eye, ArrowRight, X, FileText, Share2, Copy, Check } from "lucide-react";
import { shortenUrl, copyToClipboard } from "@/lib/urlShortener";
import { useToast } from "@/hooks/use-toast";

interface NewsProps {
  language: Language;
}

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  titleJa?: string;
  contentJa?: string;
  attachmentUrl?: string;
  language: string;
  category: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export function News({ language }: NewsProps) {
  const t = useTranslation(language);
  const { toast } = useToast();
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shortUrl, setShortUrl] = useState<string>("");
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Helper function to check if attachmentUrl is a valid URL
  const isValidUrl = (urlString: string | null | undefined): boolean => {
    if (!urlString) return false;
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleReadMore = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    setShortUrl(""); // Reset short URL when opening new article
    setIsCopied(false);
  };

  const handleGenerateShortUrl = async () => {
    if (!selectedArticle || !selectedArticle.attachmentUrl) return;
    
    setIsGeneratingUrl(true);
    
    // Generate short URL from SharePoint file URL
    const result = await shortenUrl(selectedArticle.attachmentUrl);
    
    if (result.success) {
      setShortUrl(result.shortUrl);
      toast({
        title: language === "en" ? "Short URL Created" : "短縮URLを作成しました",
        description: language === "en" ? "You can now copy and share this link" : "このリンクをコピーして共有できます"
      });
    } else {
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: result.error || (language === "en" ? "Failed to create short URL" : "短縮URLの作成に失敗しました"),
        variant: "destructive"
      });
    }
    
    setIsGeneratingUrl(false);
  };

  const handleCopyUrl = async () => {
    if (!shortUrl) return;
    
    const success = await copyToClipboard(shortUrl);
    
    if (success) {
      setIsCopied(true);
      toast({
        title: language === "en" ? "Copied!" : "コピーしました！",
        description: language === "en" ? "Short URL copied to clipboard" : "短縮URLをクリップボードにコピーしました"
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: language === "en" ? "Failed to copy to clipboard" : "クリップボードへのコピーに失敗しました",
        variant: "destructive"
      });
    }
  };

  const { data: newsArticles, isLoading, error } = useQuery({
    queryKey: ["/api/news"],
    queryFn: async () => {
      const response = await fetch("/api/news", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch news articles");
      }
      return await response.json();
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
                // First, filter by visibility (only show visible articles)
                if ((article as any).isVisible === false) {
                  return false;
                }
                
                // Then filter by language content availability
                if (language === "jp") {
                  // Show articles that have Japanese content or can fallback to English
                  return article.titleJa || article.title;
                } else {
                  // For English: show all articles (they all have English content)
                  return true;
                }
              })
              .map((article: NewsArticle) => {
                // Use appropriate language content based on availability
                const displayTitle = language === "jp" && article.titleJa ? article.titleJa : article.title;
                const displayContent = language === "jp" && article.contentJa ? article.contentJa : article.content;
                const displayDescription = displayContent.substring(0, 150) + (displayContent.length > 150 ? '...' : '');
                
                return (
                <Card key={article.id} className="hover:shadow-lg transition-shadow" data-testid={`news-card-${article.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <Badge className={getCategoryColor(article.category)} data-testid={`news-category-${article.id}`}>
                          {getCategoryLabel(article.category)}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={
                            (article as any).felicityCompany === "felicity-japan" 
                              ? "bg-red-50 text-red-700 border-red-200" 
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }
                          data-testid={`news-felicity-company-${article.id}`}
                        >
                          {(article as any).felicityCompany === "felicity-japan" 
                            ? (language === "jp" ? "フェリシティ・ジャパン" : "Felicity Japan")
                            : (language === "jp" ? "フェリシティ・シンガポール" : "Felicity Singapore")
                          }
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span data-testid={`news-date-${article.id}`}>
                          {formatDate(article.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <CardTitle className="line-clamp-2" data-testid={`news-title-${article.id}`}>
                      {displayTitle}
                    </CardTitle>
                    
                    <CardDescription className="line-clamp-3" data-testid={`news-description-${article.id}`}>
                      {displayDescription}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-end items-center pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          data-testid={`button-read-more-${article.id}`}
                          onClick={() => handleReadMore(article)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {language === "en" ? "Read More" : "続きを読む"}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
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

      {/* Article Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (() => {
            // Use appropriate language content for the modal
            const modalTitle = language === "jp" && selectedArticle.titleJa ? selectedArticle.titleJa : selectedArticle.title;
            const modalContent = language === "jp" && selectedArticle.contentJa ? selectedArticle.contentJa : selectedArticle.content;

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold mb-2 pr-8">
                    {modalTitle}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mb-4">
                    {language === "en" ? "Full article content" : "完全な記事内容"}
                  </DialogDescription>
                  <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogClose>
                </DialogHeader>
                
                <div className="space-y-6 mt-6">
                  {/* Article Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(selectedArticle.createdAt).toLocaleDateString()}</span>
                    </div>
                    {selectedArticle.category && (
                      <Badge variant="secondary">{getCategoryLabel(selectedArticle.category)}</Badge>
                    )}
                  </div>

                  {/* Article Content */}
                  <div className="prose prose-lg max-w-none">
                    <div 
                      className="leading-relaxed"
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {modalContent}
                    </div>
                  </div>

                  {/* SharePoint Embedded File */}
                  {selectedArticle.attachmentUrl && isValidUrl(selectedArticle.attachmentUrl) && (
                    <div className="mt-6 border-t pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          {language === "en" ? "Attached Document" : "添付ドキュメント"}
                        </h4>
                        <div className="flex items-center gap-2">
                          {!shortUrl ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleGenerateShortUrl}
                              disabled={isGeneratingUrl}
                              data-testid="button-generate-sharepoint-short-url"
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              {isGeneratingUrl 
                                ? (language === "en" ? "Generating..." : "生成中...") 
                                : (language === "en" ? "Share Link" : "共有リンク")
                              }
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                              <span className="text-xs font-mono text-primary">{shortUrl}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={handleCopyUrl}
                                data-testid="button-copy-sharepoint-short-url"
                              >
                                {isCopied ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* SharePoint Embedded Viewer - Hides actual URL */}
                      <div className="w-full rounded-lg overflow-hidden border bg-muted/50">
                        <iframe
                          src={selectedArticle.attachmentUrl}
                          className="w-full h-[500px]"
                          frameBorder="0"
                          title={language === "en" ? "Document Viewer" : "ドキュメントビューアー"}
                          data-testid="iframe-sharepoint-viewer"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {language === "en" 
                          ? "Document viewer - your SharePoint URL is not exposed to visitors" 
                          : "ドキュメントビューアー - SharePoint URLは訪問者に公開されません"}
                      </p>
                    </div>
                  )}

                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </section>
  );
}