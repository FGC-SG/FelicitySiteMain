import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddNewsForm } from "@/components/forms/add-news-form";
import { NewsManagement } from "@/components/news-management";
import { Users, FileText, UserPlus, Building2, PieChart, Upload, Database } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type User } from "@shared/schema";

export default function ManagementPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [showAddNews, setShowAddNews] = useState(false);
  const [showNewsList, setShowNewsList] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        title: language === "jp" ? "エクスポート成功" : "Export Successful",
        description: language === "jp" ? "ニュース記事がExcelファイルにエクスポートされました。" : "News articles have been exported to Excel file.",
      });
    } catch (error) {
      console.error('Error exporting news:', error);
      toast({
        title: language === "jp" ? "エクスポート失敗" : "Export Failed",
        description: language === "jp" ? "ニュース記事のエクスポートに失敗しました。再度お試しください。" : "Failed to export news articles. Please try again.",
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
        title: language === "jp" ? "テンプレートエクスポート成功" : "Template Export Successful",
        description: language === "jp" ? "ニューステンプレートがExcelファイルにエクスポートされました。" : "News template has been exported to Excel file.",
      });
    } catch (error) {
      console.error('Error exporting template:', error);
      toast({
        title: language === "jp" ? "テンプレートエクスポート失敗" : "Template Export Failed",
        description: language === "jp" ? "ニューステンプレートのエクスポートに失敗しました。再度お試しください。" : "Failed to export news template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDatabaseBackup = async () => {
    try {
      const response = await fetch('/api/export/database-backup', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to export database backup');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `felicity-database-backup-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: language === "jp" ? "バックアップ成功" : "Backup Successful",
        description: language === "jp" ? "データベースバックアップがダウンロードされました。" : "Database backup has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error exporting database backup:', error);
      toast({
        title: language === "jp" ? "バックアップ失敗" : "Backup Failed",
        description: language === "jp" ? "データベースバックアップに失敗しました。" : "Failed to create database backup.",
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
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
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

  // Fetch users count
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: isAuthenticated,
  });

  // Fetch news articles count
  const { data: newsArticles } = useQuery({
    queryKey: ["/api/news"],
    enabled: isAuthenticated,
  });

  // Fetch portfolio companies count
  const { data: portfolios } = useQuery({
    queryKey: ["/api/portfolios"],
    enabled: isAuthenticated,
  });

  const { data: funds } = useQuery({
    queryKey: ["/api/funds"],
    enabled: isAuthenticated,
  });

  // Fetch fund disclosures count
  const { data: fundDisclosures } = useQuery({
    queryKey: ["/api/fund-disclosures"],
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Access Required",
        description: "Please log in to access the management area.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const baseSections = [
    {
      title: "User Management",
      description: "Manage team members and organizational structure",
      icon: Users,
      color: "bg-blue-500",
      stats: `${(users as User[])?.length || 0} Users`,
      action: () => window.location.href = "/user-management"
    },
    {
      title: "Member Management",
      description: "Manage public member profiles with photos and bios",
      icon: UserPlus,
      color: "bg-purple-500",
      stats: "Team Profiles",
      action: () => window.location.href = "/member-management"
    },
    {
      title: "News Management",
      description: "Update website content and news articles",
      icon: FileText,
      color: "bg-green-500",
      stats: `${(newsArticles as any[])?.length || 0} Articles`,
      action: () => setShowNewsList(true)
    },
    {
      title: "Portfolio Management",
      description: "Manage investment portfolio companies and details",
      icon: Building2,
      color: "bg-orange-500",
      stats: `${(portfolios as any[])?.length || 0} Companies`,
      action: () => window.location.href = `/portfolio-management?lang=${language}`
    },
    {
      title: "Fund Management",
      description: "Manage Felicity Global Capital investment funds",
      icon: PieChart,
      color: "bg-purple-500",
      stats: `${(funds as any[])?.length || 0} Funds`,
      action: () => window.location.href = `/fund-management?lang=${language}`
    },
    {
      title: (
        <div>
          <div>Fund Disclosure Management</div>
          <div className="text-sm text-muted-foreground font-normal mt-1">金商法63条開示書類</div>
        </div>
      ),
      description: "Upload and manage fund disclosure documents and publications",
      icon: Upload,
      color: "bg-blue-600",
      stats: `${(fundDisclosures as any[])?.length || 0} Disclosures`,
      action: () => window.location.href = `/fund-disclosure-management?lang=${language}`
    }
  ];

  // Add database backup section for superadmin users only
  const managementSections = (user as any)?.role === 'superadmin' 
    ? [
        ...baseSections,
        {
          title: language === "jp" ? "データベースバックアップ" : "Database Backup",
          description: language === "jp" 
            ? "すべてのデータベーステーブルをExcelファイルにエクスポート（MS Access互換）" 
            : "Export all database tables to Excel file (MS Access compatible)",
          icon: Database,
          color: "bg-red-500",
          stats: language === "jp" ? "完全バックアップ" : "Full Backup",
          action: handleDatabaseBackup
        }
      ]
    : baseSections;

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation language={language} onLanguageChange={setLanguage} />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4" data-testid="text-management-title">
                Management Portal
              </h1>
              <p className="text-xl opacity-90 mb-6" data-testid="text-welcome-message">
                Welcome back, {(user as any)?.firstName || (user as any)?.email}
              </p>
              <Badge variant="secondary" className="text-primary" data-testid="badge-user-status">
                Authenticated Member
              </Badge>
            </div>
          </div>
        </section>

        {/* Management Dashboard */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold felicity-primary mb-4" data-testid="text-dashboard-title">
                Dashboard Overview
              </h2>
              <p className="text-xl text-muted-foreground" data-testid="text-dashboard-subtitle">
                Manage your organization's digital presence and operations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {managementSections.map((section, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={section.action}
                  data-testid={`card-management-${index}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${section.color}`}>
                        <section.icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="outline" data-testid={`badge-stats-${index}`}>
                        {section.stats}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-2" data-testid={`text-section-title-${index}`}>
                      {section.title}
                    </CardTitle>
                    <CardDescription data-testid={`text-section-description-${index}`}>
                      {section.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions - Removed, functionality integrated into cards above */}

            {/* User Info Section */}
            <div className="mt-12 bg-muted/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold felicity-primary mb-4" data-testid="text-session-info">
                Session Information
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Email:</span> 
                  <span className="ml-2 text-muted-foreground" data-testid="text-user-email">
                    {(user as any)?.email}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Member ID:</span> 
                  <span className="ml-2 text-muted-foreground" data-testid="text-user-id">
                    {(user as any)?.id}
                  </span>
                </div>
                {(user as any)?.firstName && (
                  <div>
                    <span className="font-medium">Name:</span> 
                    <span className="ml-2 text-muted-foreground" data-testid="text-user-name">
                      {(user as any).firstName} {(user as any)?.lastName}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* News Management Modal */}
        {showNewsList && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" data-testid="modal-news-management">
            <div className="bg-background rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto">
              <NewsManagement
                language={language}
                onClose={() => setShowNewsList(false)}
                currentUser={user}
                handleExportNews={handleExportNews}
                handleExportTemplate={handleExportTemplate}
                handleBulkUpload={handleBulkUpload}
              />
            </div>
          </div>
        )}

        {/* Add News Form Modal */}
        {showAddNews && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {language === "en" ? "Add News Article" : "ニュース記事を追加"}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddNews(false)}
                    data-testid="button-close-news-form"
                  >
                    {language === "en" ? "Close" : "閉じる"}
                  </Button>
                </div>
                <AddNewsForm
                  language={language}
                  onSuccess={() => {
                    setShowAddNews(false);
                    toast({
                      title: language === "en" ? "Success" : "成功",
                      description: language === "en" 
                        ? "News article has been added successfully." 
                        : "ニュース記事が正常に追加されました。",
                    });
                  }}
                  onCancel={() => setShowAddNews(false)}
                />
              </div>
            </div>
          </div>
        )}


      </main>
      <Footer language={language} />
    </div>
  );
}