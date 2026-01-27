import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { ProofPoints } from "@/components/sections/proof-points";
import { WhatWeDo } from "@/components/sections/what-we-do";
import { ManagementMessage } from "@/components/sections/management-message";
import { Differentiators } from "@/components/sections/differentiators";
import { InvestmentFocus } from "@/components/sections/investment-focus";
import { InsightsPreview } from "@/components/sections/insights-preview";
import { TrustModule } from "@/components/sections/trust-module";
import { CTABand } from "@/components/sections/cta-band";
import { OurExpertise } from "@/components/sections/our-expertise";
import { TrustedPartners } from "@/components/sections/trusted-partners";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Key, User, LogIn } from "lucide-react";

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [tempCode, setTempCode] = useState("");
  const [showTempLogin, setShowTempLogin] = useState(false);

  // No longer needed since access gate handles this
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     setShowTempLogin(true);
  //   }
  // }, [isAuthenticated, isLoading]);

  const tempLoginMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/auth/temp-login", { code });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Access Granted",
        description: "Welcome to Felicity Global Capital admin portal",
        variant: "default",
      });
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Access Denied",
        description: "Invalid access code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTempLogin = () => {
    if (tempCode.trim()) {
      tempLoginMutation.mutate(tempCode.trim());
    }
  };





  // The access gate now handles visitor access, so normal home page logic
  if (false) { // Disabled since AccessGate handles this now
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navigation language={language} onLanguageChange={setLanguage} />
        
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Welcome to Felicity Global Capital
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional investment management and corporate finance solutions across Asia-Pacific markets
            </p>
          </div>

          {/* Temporary Access Section */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-felicity-primary/10 rounded-full w-fit">
                  <Key className="h-6 w-6 text-felicity-primary" />
                </div>
                <CardTitle className="text-xl">Visitor Access</CardTitle>
                <CardDescription>
                  Enter a temporary access code to explore our platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tempCode">Access Code</Label>
                  <Input
                    id="tempCode"
                    type="text"
                    placeholder="Enter access code"
                    value={tempCode}
                    onChange={(e) => setTempCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTempLogin()}
                    data-testid="input-temp-code"
                  />
                </div>
                <Button 
                  onClick={handleTempLogin}
                  disabled={!tempCode.trim() || tempLoginMutation.isPending}
                  className="w-full"
                  data-testid="button-temp-login"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {tempLoginMutation.isPending ? "Accessing..." : "Access Platform"}
                </Button>
                
                {/* Access codes hint */}
                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  <p>Access Code: <code className="bg-muted px-1 py-0.5 rounded">fgc2025</code></p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Information */}
          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Investment Management</h3>
              <p className="text-sm text-muted-foreground">
                Strategic investment solutions across diverse Asian markets
              </p>
            </div>
            <div>
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Corporate Finance</h3>
              <p className="text-sm text-muted-foreground">
                Professional advisory services for business growth
              </p>
            </div>
            <div>
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Portfolio Management</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive portfolio analysis and optimization
              </p>
            </div>
          </div>
        </div>
        
        <Footer language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation language={language} onLanguageChange={setLanguage} />
      
      {user && (
        <div className="bg-felicity-primary text-white py-2 px-4 text-center text-sm">
          {language === 'jp' 
            ? `おかえりなさい、${String((user as any)?.firstName || (user as any)?.email)}様！フェリシティ・グローバル・キャピタルにログイン中です。`
            : `Welcome back, ${String((user as any)?.firstName || (user as any)?.email)}! You are logged in to Felicity Global Capital.`
          }
        </div>
      )}
      
      <Hero language={language} />
      <ProofPoints language={language} />
      <WhatWeDo language={language} />
      <OurExpertise language={language} />
      <Differentiators language={language} />
      <ManagementMessage language={language} />
      <InvestmentFocus language={language} />
      <TrustedPartners language={language} />
      <InsightsPreview language={language} />
      <TrustModule language={language} />
      <CTABand language={language} />
      <Footer language={language} />
    </div>
  );
}
