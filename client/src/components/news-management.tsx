import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddNewsForm } from "@/components/forms/add-news-form";
import { EditNewsForm } from "@/components/forms/edit-news-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { type Language } from "@/lib/i18n";
import { type NewsArticle } from "@shared/schema";
import { Plus, Calendar, User, Globe, Trash2, Edit, FileText, Download, Upload, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface NewsManagementProps {
  language: Language;
  onClose?: () => void;
  currentUser?: any;
  handleExportNews?: () => void;
  handleExportTemplate?: () => void;
  handleBulkUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NewsManagement({ language, onClose, currentUser, handleExportNews, handleExportTemplate, handleBulkUpload }: NewsManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if current user is superadmin
  const isSuperadmin = currentUser?.role === "Superadmin" || 
                       currentUser?.role === "superadmin" || 
                       currentUser?.role === "admin";

  // Fetch ALL news articles including scheduled (management-only endpoint)
  const { data: newsArticles, isLoading } = useQuery({
    queryKey: ["/api/news/admin"],
    queryFn: async () => {
      const res = await fetch("/api/news/admin", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
  });

  const isScheduled = (article: NewsArticle) =>
    !!article.publishedAt && new Date(article.publishedAt) > new Date();

  // Format date+time in Singapore time (UTC+8)
  const formatSGTDateTime = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleString(language === "en" ? "en-SG" : "ja-JP", {
      timeZone: "Asia/Singapore",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " SGT";
  };

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/news/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news/admin"] });
      toast({
        title: language === "en" ? "Success" : "成功",
        description: language === "en" 
          ? "News article deleted successfully" 
          : "ニュース記事が正常に削除されました",
      });
    },
    onError: (error: any) => {
      let errorMessage = language === "en" ? "Failed to delete news article" : "ニュース記事の削除に失敗しました";
      
      if (error.message?.includes("403")) {
        errorMessage = language === "en" 
          ? "Access denied. Only superusers can delete articles." 
          : "アクセスが拒否されました。スーパーユーザーのみが記事を削除できます。";
      } else if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<NewsArticle> }) => {
      return apiRequest("PUT", `/api/news/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news/admin"] });
      setEditingArticle(null);
      toast({
        title: language === "en" ? "Success" : "成功",
        description: language === "en" 
          ? "News article updated successfully" 
          : "ニュース記事が正常に更新されました",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: language === "en" 
          ? "Failed to update news article" 
          : "ニュース記事の更新に失敗しました",
        variant: "destructive",
      });
    },
  });

  // Visibility toggle mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async (data: { id: string; isVisible: boolean }) => {
      return apiRequest("PUT", `/api/news/${data.id}`, { isVisible: data.isVisible });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news/admin"] });
      toast({
        title: language === "en" ? "Success" : "成功",
        description: language === "en" 
          ? "Visibility updated" 
          : "表示設定が更新されました",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: language === "en" 
          ? "Failed to update visibility" 
          : "表示設定の更新に失敗しました",
        variant: "destructive",
      });
    },
  });

  const handleDeleteNews = (id: string, title: string) => {
    if (window.confirm(
      language === "en" 
        ? `Are you sure you want to delete "${title}"? This action cannot be undone.`
        : `「${title}」を削除してもよろしいですか？この操作は元に戻せません。`
    )) {
      deleteNewsMutation.mutate(id);
    }
  };

  const handleToggleVisibility = (id: string, currentVisibility: boolean) => {
    toggleVisibilityMutation.mutate({ id, isVisible: !currentVisibility });
  };

  const formatDate = (date: string | Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(language === "en" ? "en-US" : "ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, { en: string; jp: string }> = {
      "NEWS AT PORTFOLIO": { en: "News at Portfolio", jp: "ポートフォリオニュース" },
      "NEWS-AT-PORTFOLIO": { en: "News at Portfolio", jp: "ポートフォリオニュース" },
      "CORPORATE": { en: "Corporate", jp: "企業ニュース" },
      "INVESTMENTS": { en: "Investments", jp: "投資" },
      "FUND-FORMATION": { en: "Fund Formation", jp: "ファンド組成" },
      "GENERAL": { en: "General", jp: "一般" },
      "ANNOUNCEMENT": { en: "Announcement", jp: "お知らせ" },
      "company": { en: "Company News", jp: "会社ニュース" },
      "investment": { en: "Investment Updates", jp: "投資アップデート" },
      "market": { en: "Market Analysis", jp: "市場分析" },
      "announcement": { en: "Announcements", jp: "お知らせ" },
    };

    const categoryKey = category?.toUpperCase().replace(/ /g, "-") || "GENERAL";
    const mapped = categoryMap[category] || categoryMap[categoryKey];
    
    return mapped ? (language === "en" ? mapped.en : mapped.jp) : category;
  };

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {language === "en" ? "Add News Article" : "ニュース記事を追加"}
          </h3>
          <Button
            variant="outline"
            onClick={() => setShowAddForm(false)}
            data-testid="button-back-to-list"
          >
            {language === "en" ? "← Back to List" : "← リストに戻る"}
          </Button>
        </div>
        <AddNewsForm
          language={language}
          onSuccess={() => {
            setShowAddForm(false);
            toast({
              title: language === "en" ? "Success" : "成功",
              description: language === "en" 
                ? "News article has been added successfully." 
                : "ニュース記事が正常に追加されました。",
            });
          }}
          onCancel={() => setShowAddForm(false)}
        />
      </div>
    );
  }

  if (editingArticle) {
    return (
      <div className="space-y-6">
        <EditNewsForm
          article={editingArticle}
          language={language}
          onSave={(data) => {
            const updatedData = {
              ...data,
              publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date()
            };
            updateNewsMutation.mutate({ 
              id: editingArticle.id, 
              updates: updatedData 
            });
          }}
          onCancel={() => setEditingArticle(null)}
          isLoading={updateNewsMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-2">
            {language === "en" ? "News Management" : "ニュース管理"}
          </h3>
          <p className="text-muted-foreground">
            {language === "en" 
              ? "Manage news articles and announcements" 
              : "ニュース記事とお知らせを管理"}
          </p>
        </div>
        <div className="flex gap-2">
          {handleExportTemplate && (
            <Button 
              onClick={handleExportTemplate}
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-50 gap-2"
              data-testid="button-export-template-news"
            >
              <Download className="h-4 w-4" />
              {language === "en" ? "Export Template" : "テンプレートエクスポート"}
            </Button>
          )}
          {handleExportNews && (
            <Button 
              onClick={handleExportNews}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 gap-2"
              data-testid="button-export-news"
            >
              <Download className="h-4 w-4" />
              {language === "en" ? "Export Excel" : "Excelエクスポート"}
            </Button>
          )}
          {handleBulkUpload && (
            <Button 
              onClick={() => document.getElementById('bulk-upload-news')?.click()}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 gap-2"
              data-testid="button-bulk-upload-news"
            >
              <Upload className="h-4 w-4" />
              {language === "en" ? "Bulk Upload" : "一括アップロード"}
            </Button>
          )}
          <Button 
            onClick={() => setShowAddForm(true)}
            className="gap-2"
            data-testid="button-add-news"
          >
            <Plus className="h-4 w-4" />
            {language === "en" ? "Add Article" : "記事を追加"}
          </Button>
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-close-news-management"
            >
              {language === "en" ? "Close" : "閉じる"}
            </Button>
          )}
        </div>
      </div>
      {handleBulkUpload && (
        <input
          id="bulk-upload-news"
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={handleBulkUpload}
        />
      )}

      {/* Articles List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-lg">{language === "en" ? "Loading articles..." : "記事を読み込み中..."}</div>
        </div>
      ) : (
        <div className="space-y-4">
          {(newsArticles as NewsArticle[])?.map((article) => (
            <Card key={article.id} className="overflow-hidden" data-testid={`card-news-${article.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" data-testid={`badge-category-${article.id}`}>
                        {formatCategoryDisplay(article.category || '')}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={
                          (article as any).felicityCompany === "felicity-japan" 
                            ? "bg-red-50 text-red-700 border-red-200" 
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }
                        data-testid={`badge-felicity-company-${article.id}`}
                      >
                        {(article as any).felicityCompany === "felicity-japan" 
                          ? (language === "en" ? "Felicity Japan" : "フェリシティ・ジャパン")
                          : (language === "en" ? "Felicity Singapore" : "フェリシティ・シンガポール")
                        }
                      </Badge>
                      
                      {/* Visibility Control */}
                      <div className="flex items-center gap-2 ml-2">
                        <Checkbox
                          checked={article.isVisible !== false}
                          onCheckedChange={() => handleToggleVisibility(article.id, article.isVisible !== false)}
                          data-testid={`checkbox-visibility-${article.id}`}
                          className="h-3 w-3"
                        />
                        {article.isVisible !== false ? (
                          <Eye className="h-3 w-3 text-blue-600" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {language === "en" ? "Show on News" : "ニュース表示"}
                        </span>
                        <Badge 
                          variant={article.isVisible !== false ? "default" : "secondary"}
                          className={article.isVisible !== false 
                            ? "bg-blue-100 text-blue-800 text-xs" 
                            : "bg-gray-100 text-gray-600 text-xs"}
                        >
                          {article.isVisible !== false 
                            ? (language === "en" ? "Visible" : "表示中") 
                            : (language === "en" ? "Hidden" : "非表示")}
                        </Badge>
                      </div>
                      
                      {isScheduled(article) && (
                        <Badge
                          className="bg-amber-100 text-amber-800 border border-amber-300 text-xs"
                          data-testid={`badge-scheduled-${article.id}`}
                        >
                          🕐 {language === "en" ? "Scheduled" : "予約済み"}
                        </Badge>
                      )}
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Calendar className="h-3 w-3" />
                        <span data-testid={`text-announcement-date-${article.id}`}>
                          {isScheduled(article)
                            ? (language === "en" ? "Publishes: " : "公開日時: ")
                            : (language === "en" ? "Announced: " : "発表日: ")}
                          {article.publishedAt
                            ? formatSGTDateTime(article.publishedAt)
                            : formatDate(article.createdAt || new Date())}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2" data-testid={`text-news-title-${article.id}`}>
                      {article.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1" data-testid={`text-news-date-${article.id}`}>
                      <Calendar className="h-4 w-4" />
                      {article.publishedAt ? formatSGTDateTime(article.publishedAt) : 'N/A'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingArticle(article)}
                      className="gap-1"
                      data-testid={`button-edit-news-${article.id}`}
                    >
                      <Edit className="h-3 w-3" />
                      {language === "en" ? "Edit" : "編集"}
                    </Button>
                    {isSuperadmin && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteNews(article.id, article.title)}
                        disabled={deleteNewsMutation.isPending}
                        className="gap-1"
                        data-testid={`button-delete-news-${article.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                        {language === "en" ? "Delete" : "削除"}
                      </Button>
                    )}
                  </div>
                </div>
                {article.content && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-news-content-${article.id}`}>
                      {article.content}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!newsArticles || (newsArticles as NewsArticle[]).length === 0) && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {language === "en" ? "No articles yet" : "まだ記事がありません"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {language === "en" 
              ? "Get started by creating your first news article" 
              : "最初のニュース記事を作成して始めましょう"}
          </p>
          <Button onClick={() => setShowAddForm(true)} data-testid="button-add-first-news">
            {language === "en" ? "Create First Article" : "最初の記事を作成"}
          </Button>
        </div>
      )}
    </div>
  );
}