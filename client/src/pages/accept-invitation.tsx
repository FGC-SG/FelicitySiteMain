import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Language } from "@/lib/i18n";
import { CheckCircle, Mail, User, Shield, AlertCircle, Eye, EyeOff } from "lucide-react";

interface InvitationData {
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export default function AcceptInvitationPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [token, setToken] = useState<string>("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();

  // Extract token from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('token');
    if (inviteToken) {
      setToken(inviteToken);
    }
  }, [location]);

  // Fetch invitation details
  const { data: invitation, isLoading: invitationLoading, error: invitationError } = useQuery({
    queryKey: [`/api/invitations/${token}`],
    enabled: !!token,
  });

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      return await apiRequest("POST", `/api/invitations/${data.token}/accept`, {
        password: data.password
      });
    },
    onSuccess: () => {
      toast({
        title: language === "en" ? "Success!" : "成功！",
        description: language === "en" 
          ? "Account created successfully. You are now logged in." 
          : "アカウントが正常に作成されました。ログインしています。",
      });
      // Redirect to home page
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: error.message || (language === "en" 
          ? "Failed to accept invitation. Please try again." 
          : "招待の受け入れに失敗しました。再試行してください。"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: language === "en" ? "Password is required" : "パスワードが必要です",
        variant: "destructive",
      });
      return;
    }

    if (password !== passwordConfirm) {
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: language === "en" ? "Passwords do not match" : "パスワードが一致しません",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: language === "en" 
          ? "Password must be at least 6 characters long" 
          : "パスワードは6文字以上である必要があります",
        variant: "destructive",
      });
      return;
    }

    acceptInvitationMutation.mutate({ token, password });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation language={language} setLanguage={setLanguage} />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <CardTitle>
                  {language === "en" ? "Invalid Invitation" : "無効な招待"}
                </CardTitle>
              </div>
              <CardDescription>
                {language === "en" 
                  ? "The invitation link is invalid or missing required information."
                  : "招待リンクが無効であるか、必要な情報が不足しています。"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = "/"}
                className="w-full"
              >
                {language === "en" ? "Go to Home" : "ホームへ戻る"}
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer language={language} />
      </div>
    );
  }

  if (invitationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation language={language} setLanguage={setLanguage} />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                {language === "en" ? "Loading invitation..." : "招待情報を読み込み中..."}
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer language={language} />
      </div>
    );
  }

  if (invitationError || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation language={language} setLanguage={setLanguage} />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <CardTitle>
                  {language === "en" ? "Invitation Error" : "招待エラー"}
                </CardTitle>
              </div>
              <CardDescription>
                {language === "en" 
                  ? "This invitation is invalid, expired, or has already been used."
                  : "この招待は無効、期限切れ、またはすでに使用済みです。"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = "/"}
                className="w-full"
              >
                {language === "en" ? "Go to Home" : "ホームへ戻る"}
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation language={language} setLanguage={setLanguage} />
      <main className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <CardTitle>
                {language === "en" ? "Join Felicity Global Capital" : "フェリシティグローバルキャピタルに参加"}
              </CardTitle>
            </div>
            <CardDescription>
              {language === "en" 
                ? "Complete your account setup to get started."
                : "アカウントのセットアップを完了してください。"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Mail className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{invitation.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === "en" ? "Email Address" : "メールアドレス"}
                  </p>
                </div>
              </div>
              
              {(invitation.firstName || invitation.lastName) && (
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <User className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {invitation.firstName} {invitation.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "en" ? "Full Name" : "氏名"}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Shield className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium capitalize">{invitation.role}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === "en" ? "Role" : "役割"}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  {language === "en" ? "Create Password" : "パスワードを作成"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={language === "en" ? "Enter your password" : "パスワードを入力"}
                    required
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">
                  {language === "en" ? "Confirm Password" : "パスワード確認"}
                </Label>
                <div className="relative">
                  <Input
                    id="passwordConfirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder={language === "en" ? "Confirm your password" : "パスワードを再入力"}
                    required
                    data-testid="input-password-confirm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    data-testid="button-toggle-password-confirm"
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={acceptInvitationMutation.isPending}
                data-testid="button-create-account"
              >
                {acceptInvitationMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{language === "en" ? "Creating Account..." : "アカウント作成中..."}</span>
                  </div>
                ) : (
                  language === "en" ? "Create Account & Login" : "アカウント作成＆ログイン"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              {language === "en" 
                ? "By creating an account, you agree to our terms of service and privacy policy."
                : "アカウントを作成することで、利用規約とプライバシーポリシーに同意したものとみなされます。"
              }
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer language={language} />
    </div>
  );
}