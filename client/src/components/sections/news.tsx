import { useState } from "react";
import { useTranslation, type Language } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Newspaper, Calendar, Eye, ArrowRight, X, FileText, Share2, Copy, Check, Paperclip, Download, ExternalLink } from "lucide-react";
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
  attachmentUrlJa?: string;
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

  const isValidUrl = (urlString: string | null | undefined): boolean => {
    if (!urlString) return false;
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const isPdfFile = (urlString: string | null | undefined): boolean => {
    if (!urlString) return false;
    return urlString.endsWith('.pdf') || urlString.startsWith('/news-attachments/');
  };

  const getActiveAttachmentUrl = (article: NewsArticle): string | undefined => {
    if (language === "jp") {
      return article.attachmentUrlJa || article.attachmentUrl || undefined;
    }
    return article.attachmentUrl || article.attachmentUrlJa || undefined;
  };

  const articleHasAttachment = (article: NewsArticle): boolean => {
    return !!(article.attachmentUrl || article.attachmentUrlJa);
  };

  const handleReadMore = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    setShortUrl("");
    setIsCopied(false);
  };

  const handleGenerateShortUrl = async () => {
    if (!selectedArticle) return;
    const url = getActiveAttachmentUrl(selectedArticle);
    if (!url) return;

    setIsGeneratingUrl(true);
    const result = await shortenUrl(url);

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
      const response = await fetch("/api/news", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch news articles");
      return await response.json();
    },
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      "NEWS AT PORTFOLIO": language === "en" ? "News at Portfolio" : "ポートフォリオニュース",
      "CORPORATE": language === "en" ? "Corporate" : "コーポレート",
      "INVESTMENTS": language === "en" ? "Investments" : "投資",
      "FUND-FORMATION": language === "en" ? "Fund Formation" : "ファンド組成",
      "GENERAL": language === "en" ? "General" : "一般",
      "ANNOUNCEMENT": language === "en" ? "Announcement" : "お知らせ",
      company: language === "en" ? "Company News" : "会社ニュース",
      investment: language === "en" ? "Investment Updates" : "投資アップデート",
      market: language === "en" ? "Market Analysis" : "市場分析",
      announcement: language === "en" ? "Announcements" : "お知らせ",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "NEWS AT PORTFOLIO": return "bg-indigo-100 text-indigo-800";
      case "CORPORATE": return "bg-blue-100 text-blue-800";
      case "INVESTMENTS": return "bg-green-100 text-green-800";
      case "FUND-FORMATION": return "bg-purple-100 text-purple-800";
      case "GENERAL": return "bg-gray-100 text-gray-800";
      case "ANNOUNCEMENT": return "bg-orange-100 text-orange-800";
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
      { year: "numeric", month: "long", day: "numeric" }
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
                  : "ニュース記事を取得できません。後でもう一度お試しください。"}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : newsArticles && newsArticles.length > 0 ? (
          <div className="space-y-2">
            {newsArticles
              .filter((article: NewsArticle) => {
                if ((article as any).isVisible === false) return false;
                // JP mode: only show articles that have a Japanese title
                if (language === "jp") return !!article.titleJa;
                return true;
              })
              .sort((a: NewsArticle, b: NewsArticle) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
              .map((article: NewsArticle) => {
                const displayTitle = language === "jp" && article.titleJa ? article.titleJa : article.title;
                const hasAttachment = articleHasAttachment(article);

                return (
                  <div
                    key={article.id}
                    className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer border-b last:border-b-0"
                    onClick={() => handleReadMore(article)}
                    data-testid={`news-row-${article.id}`}
                  >
                    <div className="flex-shrink-0 w-28 text-sm text-muted-foreground" data-testid={`news-date-${article.id}`}>
                      {formatDate(article.createdAt)}
                    </div>
                    <div className="flex-shrink-0">
                      <Badge className={getCategoryColor(article.category)} data-testid={`news-category-${article.id}`}>
                        {getCategoryLabel(article.category)}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-foreground hover:text-primary transition-colors line-clamp-1" data-testid={`news-title-${article.id}`}>
                        {displayTitle}
                      </span>
                      {hasAttachment && (
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" title={language === "en" ? "Has attachment" : "添付ファイルあり"} />
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="space-y-2" data-testid="text-no-news">
            {[
              {
                id: "sn1",
                date: language === "en" ? "January 2026" : "2026年1月",
                tag: language === "en" ? "Market Insights" : "市場インサイト",
                tagColor: "bg-blue-100 text-blue-700",
                title: language === "en"
                  ? "Felicity Global Capital Expands Asia-Pacific Investment Mandate"
                  : "フェリシティ・グローバル・キャピタル、アジア太平洋投資範囲を拡大",
              },
              {
                id: "sn2",
                date: language === "en" ? "November 2025" : "2025年11月",
                tag: language === "en" ? "Portfolio News" : "ポートフォリオニュース",
                tagColor: "bg-green-100 text-green-700",
                title: language === "en"
                  ? "Portfolio Company Achieves Significant Growth Milestone"
                  : "ポートフォリオ企業が重要な成長マイルストーンを達成",
              },
              {
                id: "sn3",
                date: language === "en" ? "September 2025" : "2025年9月",
                tag: language === "en" ? "Company Update" : "会社アップデート",
                tagColor: "bg-orange-100 text-orange-700",
                title: language === "en"
                  ? "Felicity Global Capital Strengthens Singapore-Japan Investment Bridge"
                  : "フェリシティ・グローバル・キャピタル、シンガポール-日本投資架け橋を強化",
              },
            ].map((article) => (
              <div key={article.id} className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors border-b last:border-b-0">
                <div className="flex-shrink-0 w-28 text-sm text-muted-foreground pt-0.5">{article.date}</div>
                <div className="flex-shrink-0 pt-0.5">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${article.tagColor}`}>{article.tag}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground mb-1 line-clamp-1">{article.title}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Article Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (() => {
            const modalTitle = language === "jp" && selectedArticle.titleJa ? selectedArticle.titleJa : selectedArticle.title;
            const modalContent = language === "jp" && selectedArticle.contentJa ? selectedArticle.contentJa : selectedArticle.content;
            const activeAttachmentUrl = getActiveAttachmentUrl(selectedArticle);

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold mb-2 pr-8">
                    {modalTitle}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mb-4">
                    {language === "en" ? "Full article content" : "完全な記事内容"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  {/* Article Meta — with download button if attachment exists */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(selectedArticle.createdAt).toLocaleDateString()}</span>
                      </div>
                      {selectedArticle.category && (
                        <Badge variant="secondary">{getCategoryLabel(selectedArticle.category)}</Badge>
                      )}
                    </div>
                    {/* Download button — always visible at top when attachment exists */}
                    {activeAttachmentUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0 gap-1.5"
                        onClick={() => {
                          if (isPdfFile(activeAttachmentUrl)) {
                            const link = document.createElement('a');
                            link.href = `/public-objects${activeAttachmentUrl}`;
                            link.download = activeAttachmentUrl.split('/').pop() || 'document.pdf';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          } else {
                            window.open(activeAttachmentUrl, '_blank');
                          }
                        }}
                        data-testid="button-download-top"
                      >
                        <Download className="h-4 w-4" />
                        {language === "en" ? "Download File" : "ファイルをダウンロード"}
                      </Button>
                    )}
                  </div>

                  {/* Article Content */}
                  <div className="prose prose-lg max-w-none">
                    <div className="leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                      {modalContent}
                    </div>
                  </div>

                  {/* Attached File */}
                  {activeAttachmentUrl && (
                    <div className="mt-6 border-t pt-6">
                      {isPdfFile(activeAttachmentUrl) ? (
                        // PDF File
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            {language === "en" ? "Attached PDF Document" : "添付PDFドキュメント"}
                          </h4>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = `/public-objects${activeAttachmentUrl}`;
                                link.download = activeAttachmentUrl.split('/').pop() || 'document.pdf';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              data-testid="button-download-pdf"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              {language === "en" ? "Download PDF" : "PDFダウンロード"}
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => window.open(`/public-objects${activeAttachmentUrl}`, '_blank')}
                              data-testid="button-open-pdf"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {language === "en" ? "View PDF" : "PDFを表示"}
                            </Button>
                          </div>
                        </div>
                      ) : isValidUrl(activeAttachmentUrl) ? (
                        // Embed URL (SharePoint, etc.)
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-muted-foreground">
                              {language === "en" ? "Attached Document" : "添付ドキュメント"}
                            </h4>
                            <div className="flex items-center gap-2">
                              {/* Download / open button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(activeAttachmentUrl, '_blank')}
                                data-testid="button-download-attachment"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                {language === "en" ? "Download" : "ダウンロード"}
                              </Button>

                              {/* Share Link button */}
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
                                    : (language === "en" ? "Share Link" : "共有リンク")}
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

                          <div className="w-full rounded-lg overflow-hidden border bg-muted/50">
                            <iframe
                              src={activeAttachmentUrl}
                              className="w-full h-[500px]"
                              frameBorder="0"
                              title={language === "en" ? "Document Viewer" : "ドキュメントビューアー"}
                              data-testid="iframe-sharepoint-viewer"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {language === "en"
                              ? "Document viewer — your SharePoint URL is not exposed to visitors"
                              : "ドキュメントビューアー — SharePoint URLは訪問者に公開されません"}
                          </p>
                        </>
                      ) : null}
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
