import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Language } from "@/lib/i18n";
import { Eye, EyeOff, User, Lock, Key } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: Language;
}

export function LoginModal({ isOpen, onClose, onSuccess, language }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [tempCode, setTempCode] = useState("");
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
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

  const tempLoginMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/auth/temp-login", { code });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: language === "en" ? "Production Access Granted" : "本番アクセス許可",
        description: language === "en" 
          ? "Temporary admin access activated" 
          : "一時管理者アクセスが有効化されました",
      });
      setTempCode("");
      onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: language === "en" ? "Invalid Code" : "無効なコード",
        description: language === "en" 
          ? "Please check your access code" 
          : "アクセスコードを確認してください",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const handleTempLogin = () => {
    if (tempCode.trim()) {
      tempLoginMutation.mutate(tempCode.trim());
    }
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
    orDivider: language === "en" ? "OR" : "または",
    tempTitle: language === "en" ? "Production Quick Access" : "本番クイックアクセス",
    tempSubtitle: language === "en" ? "Use temporary access code for deployment" : "デプロイ用の一時アクセスコードを使用",
    tempCodeLabel: language === "en" ? "Access Code" : "アクセスコード",
    tempCodePlaceholder: language === "en" ? "Enter access code" : "アクセスコードを入力",
    tempLogin: language === "en" ? "Quick Access" : "クイックアクセス",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="login-description">
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

                <div className="flex space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
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
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t.orDivider}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <h4 className="text-sm font-medium">{t.tempTitle}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{t.tempSubtitle}</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="temp-code" className="flex items-center gap-2 text-sm">
                      <Key className="h-4 w-4" />
                      {t.tempCodeLabel}
                    </Label>
                    <Input
                      id="temp-code"
                      type="text"
                      placeholder={t.tempCodePlaceholder}
                      value={tempCode}
                      onChange={(e) => setTempCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTempLogin();
                        }
                      }}
                      data-testid="input-temp-code"
                      className="mt-1"
                    />
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleTempLogin}
                    disabled={!tempCode.trim() || tempLoginMutation.isPending}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    data-testid="button-temp-login"
                  >
                    {tempLoginMutation.isPending ? "..." : t.tempLogin}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}