import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Language } from "@/lib/i18n";
import { Eye, EyeOff, User, Lock, Mail, ArrowLeft, CheckCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginForm = z.infer<typeof loginSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: Language;
}

export function LoginModal({ isOpen, onClose, onSuccess, language }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'login' | 'forgot' | 'success'>('login');
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const forgotForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: language === "en" ? "Success" : "成功",
        description: language === "en" 
          ? "Successfully logged in" 
          : "ログインに成功しました",
      });
      form.reset();
      onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: language === "en" ? "Login Failed" : "ログイン失敗",
        description: language === "en" 
          ? "Invalid email or password" 
          : "メールアドレスまたはパスワードが正しくありません",
        variant: "destructive",
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      const response = await apiRequest("POST", "/api/forgot-password", data);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to process request");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setView('success');
      } else {
        toast({
          title: language === "en" ? "Error" : "エラー",
          description: data.message || (language === "en" 
            ? "Failed to process password reset request" 
            : "パスワードリセット要求の処理に失敗しました"),
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: language === "en" 
          ? "Failed to process password reset request" 
          : "パスワードリセット要求の処理に失敗しました",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const handleForgotPasswordSubmit = (data: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate(data);
  };

  const handleBackToLogin = () => {
    setView('login');
    forgotForm.reset();
  };

  const handleClose = () => {
    setView('login');
    form.reset();
    forgotForm.reset();
    onClose();
  };

  const t = {
    title: language === "en" ? "Admin Login" : "管理者ログイン",
    subtitle: language === "en" ? "Sign in to access the management portal" : "管理ポータルにアクセスするためにサインイン",
    email: language === "en" ? "Email Address" : "メールアドレス",
    password: language === "en" ? "Password" : "パスワード",
    login: language === "en" ? "Login" : "ログイン",
    cancel: language === "en" ? "Cancel" : "キャンセル",
    emailPlaceholder: language === "en" ? "Enter your email" : "メールアドレスを入力",
    passwordPlaceholder: language === "en" ? "Enter your password" : "パスワードを入力",
    forgotPassword: language === "en" ? "Forgot Password?" : "パスワードをお忘れですか？",
    forgotPasswordTitle: language === "en" ? "Reset Password" : "パスワードリセット",
    forgotPasswordSubtitle: language === "en" ? "Enter your email address and we'll send you a reset link" : "メールアドレスを入力してください。リセットリンクをお送りします。",
    sendResetLink: language === "en" ? "Send Reset Link" : "リセットリンクを送信",
    backToLogin: language === "en" ? "Back to Login" : "ログインに戻る",
    successTitle: language === "en" ? "Check Your Email" : "メールを確認してください",
    successMessage: language === "en" 
      ? "If an account with that email exists, you will receive a password reset link shortly." 
      : "そのメールアドレスでアカウントが存在する場合、パスワードリセットリンクがまもなく届きます。",
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="login-description">
        {view === 'login' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold">
                {t.title}
              </DialogTitle>
            </DialogHeader>
            
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-4">
                <CardDescription id="login-description">
                  {t.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {t.email}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={t.emailPlaceholder}
                              {...field}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            {t.password}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={t.passwordPlaceholder}
                                {...field}
                                data-testid="input-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                data-testid="button-toggle-password"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-muted-foreground hover:text-primary"
                        onClick={() => setView('forgot')}
                        data-testid="button-forgot-password"
                      >
                        {t.forgotPassword}
                      </Button>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                        data-testid="button-cancel"
                      >
                        {t.cancel}
                      </Button>
                      <Button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="flex-1 felicity-bg text-primary-foreground hover:opacity-90"
                        data-testid="button-submit"
                      >
                        {loginMutation.isPending ? "..." : t.login}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </>
        )}

        {view === 'forgot' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold">
                {t.forgotPasswordTitle}
              </DialogTitle>
            </DialogHeader>
            
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-4">
                <CardDescription id="login-description">
                  {t.forgotPasswordSubtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...forgotForm}>
                  <form onSubmit={forgotForm.handleSubmit(handleForgotPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={forgotForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {t.email}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={t.emailPlaceholder}
                              {...field}
                              data-testid="input-forgot-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToLogin}
                        className="flex-1"
                        data-testid="button-back-to-login"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t.backToLogin}
                      </Button>
                      <Button
                        type="submit"
                        disabled={forgotPasswordMutation.isPending}
                        className="flex-1 felicity-bg text-primary-foreground hover:opacity-90"
                        data-testid="button-send-reset"
                      >
                        {forgotPasswordMutation.isPending ? "..." : t.sendResetLink}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </>
        )}

        {view === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold">
                {t.successTitle}
              </DialogTitle>
            </DialogHeader>
            
            <Card className="border-0 shadow-none">
              <CardContent className="text-center pt-6">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <p className="text-muted-foreground mb-6">
                  {t.successMessage}
                </p>
                <Button
                  onClick={handleBackToLogin}
                  className="w-full felicity-bg text-primary-foreground hover:opacity-90"
                  data-testid="button-back-to-login-success"
                >
                  {t.backToLogin}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}