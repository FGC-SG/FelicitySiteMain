import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddNewsForm } from "@/components/forms/add-news-form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Calendar, User, Tag, Plus, Eye, Download, Upload } from "lucide-react";
import { Link } from "wouter";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  language: string;
  category: string;
  tags?: string;
  authorId: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function NewsManagementPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const handleExportNews = async () => {
    try {
      const response = await fetch('/api/news/export', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to export news data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `felicity-news-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: "News articles have been exported to Excel file.",
      });
    } catch (error) {
      console.error('Error exporting news:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export news articles. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportTemplate = async () => {
    try {
      const response = await fetch('/api/news/export-template', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to export template');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `felicity-news-template-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: language === 'jp' ? "テンプレートエクスポート成功" : "Template Export Successful",
        description: language === 'jp' ? "ニューステンプレートがExcelファイルにエクスポートされました。" : "News template has been exported to Excel file.",
      });
    } catch (error) {
      console.error('Error exporting template:', error);
      toast({
        title: language === 'jp' ? "テンプレートエクスポート失敗" : "Template Export Failed",
        description: language === 'jp' ? "ニューステンプレートのエクスポートに失敗しました。再度お試しください。" : "Failed to export news template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: language === "jp" ? "ファイル形式エラー" : "Invalid File Type",
        description: language === "jp" ? "Excel (.xlsx, .xls) またはCSV (.csv) ファイルを選択してください。" : "Please select an Excel (.xlsx, .xls) or CSV (.csv) file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/news/import', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error messages from server
        toast({
          title: language === "jp" ? "インポート失敗" : "Import Failed",
          description: result.message || (language === "jp" ? "ニュースデータのインポートに失敗しました。" : "Failed to import news data."),
          variant: "destructive",
        });
        return;
      }
      
      // Handle successful import with possible errors
      const hasErrors = result.errors && result.errors.length > 0;
      const successMessage = language === "jp" ? 
        `${result.imported}件のニュース記事をインポートしました。` : 
        `Successfully imported ${result.imported} news articles.`;
      
      const errorMessage = hasErrors ? 
        (language === "jp" ? 
          `${result.errors.length}件のエラーがありました。` : 
          `${result.errors.length} errors occurred.`) : '';

      toast({
        title: language === "jp" ? "インポート完了" : "Import Complete",
        description: `${successMessage} ${errorMessage}`,
        variant: hasErrors ? "destructive" : "default",
      });

      // Show detailed errors if present
      if (hasErrors && result.errors.length <= 5) {
        // Show first 5 errors
        result.errors.forEach((error: string, index: number) => {
          setTimeout(() => {
            toast({
              title: language === "jp" ? `エラー ${index + 1}` : `Error ${index + 1}`,
              description: error,
              variant: "destructive",
            });
          }, 1000 * (index + 1));
        });
      } else if (hasErrors) {
        toast({
          title: language === "jp" ? "詳細エラー" : "Additional Errors",
          description: language === "jp" ? 
            `合計${result.errors.length}件のエラーがありました。詳細についてはコンソールをご確認ください。` :
            `Total of ${result.errors.length} errors occurred. Check console for details.`,
          variant: "destructive",
        });
        console.error('Import errors:', result.errors);
      }

      // Refresh the news list
      refetch();
    } catch (error) {
      console.error('Error importing news:', error);
      toast({
        title: language === "jp" ? "インポート失敗" : "Import Failed",
        description: language === "jp" ? "ネットワークエラーまたはサーバーエラーが発生しました。" : "Network or server error occurred.",
        variant: "destructive",
      });
    }

    // Reset the input
    event.target.value = '';
  };

  const { data: newsArticles, isLoading, error, refetch } = useQuery({
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
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation language={language} onLanguageChange={setLanguage} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 mb-6">
              <Link href="/management">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="button-back-to-management">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === "en" ? "Back to Management" : "管理画面に戻る"}
                </Button>
              </Link>
            </div>
            
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-news-management-title">
                {language === "en" ? "News Management" : "ニュース管理"}
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto" data-testid="text-news-management-subtitle">
                {language === "en" 
                  ? "Create, manage, and publish news articles for Felicity Global Capital"
                  : "フェリシティグローバルキャピタルのニュース記事を作成、管理、公開します"
                }
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Action Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground" data-testid="text-articles-list-title">
                  {language === "en" ? "Published Articles" : "公開済み記事"}
                </h2>
                <p className="text-muted-foreground mt-2" data-testid="text-articles-list-description">
                  {language === "en" 
                    ? "Manage your published news articles and create new content"
                    : "公開済みのニュース記事を管理し、新しいコンテンツを作成します"
                  }
                </p>
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  onClick={handleExportTemplate}
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                  data-testid="button-export-template-news"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {language === "en" ? "Export Template" : "テンプレートエクスポート"}
                </Button>
                <Button 
                  onClick={handleExportNews}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                  data-testid="button-export-news"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {language === "en" ? "Export Excel" : "Excelエクスポート"}
                </Button>
                <Button 
                  onClick={() => document.getElementById('bulk-upload-news')?.click()}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  data-testid="button-bulk-upload-news"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {language === "en" ? "Bulk Upload" : "一括アップロード"}
                </Button>
                <input
                  id="bulk-upload-news"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: 'none' }}
                  onChange={handleBulkUpload}
                />
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-create-article"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {language === "en" ? "Create Article" : "記事を作成"}
                </Button>
              </div>
            </div>

            {/* News Articles List */}
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
                  <CardTitle className="text-red-600" data-testid="text-articles-error">
                    {language === "en" ? "Error loading articles" : "記事の読み込みエラー"}
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
                {newsArticles.map((article: NewsArticle) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow" data-testid={`article-card-${article.id}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getCategoryColor(article.category)} data-testid={`article-category-${article.id}`}>
                          {getCategoryLabel(article.category)}
                        </Badge>
                        <Badge variant="outline" data-testid={`article-language-${article.id}`}>
                          {article.language.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <CardTitle className="line-clamp-2" data-testid={`article-title-${article.id}`}>
                        {article.title}
                      </CardTitle>
                      
                      <CardDescription className="line-clamp-3" data-testid={`article-description-${article.id}`}>
                        {article.content.substring(0, 150)}{article.content.length > 150 ? '...' : ''}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span data-testid={`article-date-${article.id}`}>
                            {formatDate(article.publishedAt || article.createdAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span data-testid={`article-author-${article.id}`}>
                            {language === "en" ? "Author ID" : "著者ID"}: {article.authorId}
                          </span>
                        </div>
                        
                        {article.tags && (
                          <div className="flex items-center space-x-1">
                            <Tag className="h-4 w-4" />
                            <span className="line-clamp-1" data-testid={`article-tags-${article.id}`}>
                              {article.tags}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm" data-testid={`button-view-article-${article.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          {language === "en" ? "View" : "表示"}
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-edit-article-${article.id}`}>
                          {language === "en" ? "Edit" : "編集"}
                        </Button>
                        {article.attachmentUrl && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(article.attachmentUrl, '_blank')}
                            data-testid={`button-attachment-${article.id}`}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            {language === "en" ? "Attachment" : "添付"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2" data-testid="text-no-articles">
                    {language === "en" ? "No articles published yet" : "まだ記事が公開されていません"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {language === "en" 
                      ? "Create your first news article to get started"
                      : "最初のニュース記事を作成して開始してください"
                    }
                  </p>
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    data-testid="button-create-first-article"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {language === "en" ? "Create First Article" : "最初の記事を作成"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Add News Form Modal */}
        {showAddForm && (
          <section className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <AddNewsForm
                  language={language}
                  onSuccess={() => {
                    setShowAddForm(false);
                    refetch(); // Refresh the articles list
                    toast({
                      title: "Success",
                      description: "News article has been published successfully.",
                    });
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer language={language} />
    </div>
  );
}