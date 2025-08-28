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
import { Users, FileText, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";

export default function ManagementPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [showAddNews, setShowAddNews] = useState(false);
  const [showNewsList, setShowNewsList] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Access Required",
        description: "Please log in to access the management area.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
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

  const managementSections = [
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
      title: "Content Management",
      description: "Update website content and news articles",
      icon: FileText,
      color: "bg-green-500",
      stats: `${(newsArticles as any[])?.length || 0} Articles`,
      action: () => setShowNewsList(true)
    }
  ];

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

            <div className="grid md:grid-cols-2 gap-8 mb-12">
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