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
import { Plus, Calendar, User, Globe, Trash2, Edit, FileText } from "lucide-react";

interface NewsManagementProps {
  language: Language;
  onClose?: () => void;
  currentUser?: any;
}

export function NewsManagement({ language, onClose, currentUser }: NewsManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if current user is superadmin
  const isSuperadmin = currentUser?.role === "Superadmin" || currentUser?.role === "superadmin";

  // Fetch news articles
  const { data: newsArticles, isLoading } = useQuery({
    queryKey: ["/api/news"],
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/news/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
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

  const handleDeleteNews = (id: string, title: string) => {
    if (window.confirm(
      language === "en" 
        ? `Are you sure you want to delete "${title}"? This action cannot be undone.`
        : `「${title}」を削除してもよろしいですか？この操作は元に戻せません。`
    )) {
      deleteNewsMutation.mutate(id);
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(language === "en" ? "en-US" : "ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
                      <Badge variant="outline" data-testid={`badge-language-${article.id}`}>
                        <Globe className="h-3 w-3 mr-1" />
                        {article.language === "en" ? "English" : "日本語"}
                      </Badge>
                      <Badge variant="secondary" data-testid={`badge-category-${article.id}`}>
                        {article.category}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Calendar className="h-3 w-3" />
                        <span data-testid={`text-announcement-date-${article.id}`}>
                          {language === "en" ? "Announced: " : "発表日: "}
                          {formatDate(article.publishedAt || article.createdAt || new Date())}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2" data-testid={`text-news-title-${article.id}`}>
                      {article.title}
                    </CardTitle>
                    {article.description && (
                      <CardDescription className="line-clamp-2 mt-1" data-testid={`text-news-description-${article.id}`}>
                        {article.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1" data-testid={`text-news-date-${article.id}`}>
                      <Calendar className="h-4 w-4" />
                      {formatDate(article.publishedAt || article.createdAt!)}
                    </div>
                    {article.authorId && (
                      <div className="flex items-center gap-1" data-testid={`text-news-author-${article.id}`}>
                        <User className="h-4 w-4" />
                        {language === "en" ? "Author ID" : "作成者ID"}: {article.authorId.slice(0, 8)}...
                      </div>
                    )}
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