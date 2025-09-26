import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { type Language } from "@/lib/i18n";
import { AddUserForm } from "@/components/forms/add-user-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddUserStandalonePage() {
  const [language, setLanguage] = useState<Language>('en');
  const { user: currentUser, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Access Required",
        description: "Please log in to add users.",
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

  // Check if current user is superadmin
  const isSuperadmin = (currentUser as any)?.role === "superadmin" || 
                       (currentUser as any)?.email === "onuma@fgcsg.com";

  if (!isSuperadmin) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              {language === "en" ? "Access Denied" : "アクセス拒否"}
            </CardTitle>
            <CardDescription className="text-center">
              {language === "en" 
                ? "You need superadmin privileges to add users."
                : "ユーザーを追加するにはスーパー管理者権限が必要です。"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.close()}>
              {language === "en" ? "Close Window" : "ウィンドウを閉じる"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "User has been created successfully.",
    });
    
    // Close the window and refresh the parent window
    setTimeout(() => {
      if (window.opener) {
        window.opener.location.reload();
        window.close();
      } else {
        // If not opened in new window, redirect to user management
        window.location.href = "/user-management";
      }
    }, 1500);
  };

  const handleCancel = () => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = "/user-management";
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation language={language} onLanguageChange={setLanguage} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white">
              <div className="flex items-center justify-center mb-4">
                <UserPlus className="h-12 w-12 mr-4" />
                <h1 className="text-4xl font-bold" data-testid="text-add-user-title">
                  {language === "en" ? "Add New User" : "新しいユーザーを追加"}
                </h1>
              </div>
              <p className="text-xl opacity-90 mb-6" data-testid="text-add-user-subtitle">
                {language === "en" 
                  ? "Create a new team member account with role and permissions"
                  : "役割と権限を持つ新しいチームメンバーアカウントを作成"
                }
              </p>
              
              <Button 
                variant="secondary" 
                onClick={handleCancel}
                className="text-primary"
                data-testid="button-back-to-management"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === "en" ? "Back to User Management" : "ユーザー管理に戻る"}
              </Button>
            </div>
          </div>
        </section>

        {/* Add User Form Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <AddUserForm
              language={language}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </section>
      </main>
      
      <Footer language={language} />
    </div>
  );
}