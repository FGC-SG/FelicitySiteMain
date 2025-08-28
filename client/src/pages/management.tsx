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
import { AddUserForm } from "@/components/forms/add-user-form";
import { Users, FileText, TrendingUp, Settings } from "lucide-react";

export default function ManagementPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [showAddNews, setShowAddNews] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

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
      title: "Team Management",
      description: "Manage team members and organizational structure",
      icon: Users,
      color: "bg-blue-500",
      stats: "5 Members"
    },
    {
      title: "Content Management",
      description: "Update website content and news articles",
      icon: FileText,
      color: "bg-green-500",
      stats: "12 Articles"
    },
    {
      title: "Analytics & Reports",
      description: "View performance metrics and investment data",
      icon: TrendingUp,
      color: "bg-purple-500",
      stats: "Real-time"
    },
    {
      title: "System Settings",
      description: "Configure system preferences and security",
      icon: Settings,
      color: "bg-orange-500",
      stats: "Updated"
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

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {managementSections.map((section, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-management-${index}`}>
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

            {/* Quick Actions */}
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-bold felicity-primary mb-6" data-testid="text-quick-actions-title">
                Quick Actions
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Button 
                  className="h-auto p-6 flex-col space-y-2" 
                  onClick={() => setShowAddNews(true)}
                  data-testid="button-add-news"
                >
                  <FileText className="h-6 w-6" />
                  <span>Add News Article</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-6 flex-col space-y-2" 
                  onClick={() => setShowAddUser(true)}
                  data-testid="button-add-user"
                >
                  <Users className="h-6 w-6" />
                  <span>Add User</span>
                </Button>
                <Button variant="outline" className="h-auto p-6 flex-col space-y-2" data-testid="button-view-reports">
                  <TrendingUp className="h-6 w-6" />
                  <span>View Reports</span>
                </Button>
              </div>
            </div>

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

        {/* Add News Form Modal */}
        {showAddNews && (
          <section className="py-20 bg-muted/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AddNewsForm
                language={language}
                onSuccess={() => {
                  setShowAddNews(false);
                  toast({
                    title: "Success",
                    description: "News article has been added successfully.",
                  });
                }}
                onCancel={() => setShowAddNews(false)}
              />
            </div>
          </section>
        )}

        {/* Add User Form Modal */}
        {showAddUser && (
          <section className="py-20 bg-muted/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AddUserForm
                language={language}
                onSuccess={() => {
                  setShowAddUser(false);
                  toast({
                    title: "Success",
                    description: "User has been created successfully.",
                  });
                }}
                onCancel={() => setShowAddUser(false)}
              />
            </div>
          </section>
        )}
      </main>
      <Footer language={language} />
    </div>
  );
}