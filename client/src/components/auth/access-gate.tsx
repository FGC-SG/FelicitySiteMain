import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Lock, Key } from "lucide-react";
import logoPath from "@assets/logo_color_1756362140059.jpg";

interface AccessGateProps {
  onAccessGranted: () => void;
}

export function AccessGate({ onAccessGranted }: AccessGateProps) {
  const [accessCode, setAccessCode] = useState("");
  const { toast } = useToast();

  const accessMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/auth/temp-login", { code });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Access Granted",
        description: "Welcome to Felicity Global Capital",
        variant: "default",
      });
      onAccessGranted();
    },
    onError: (error: any) => {
      toast({
        title: "Access Denied",
        description: "Invalid access code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.trim()) {
      accessMutation.mutate(accessCode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative">
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Company Name */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 p-4 bg-white rounded-2xl shadow-xl w-fit">
            <img 
              src={logoPath}
              alt="Felicity Global Capital"
              className="h-12 w-auto mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Felicity Global Capital
          </h1>
          <p className="text-blue-200 text-sm">
            Professional Investment Management
          </p>
        </div>

        {/* Access Gate Card */}
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-blue-500/20 rounded-full w-fit">
              <Shield className="h-8 w-8 text-blue-300" />
            </div>
            <CardTitle className="text-xl text-white">
              Access Required
            </CardTitle>
            <CardDescription className="text-blue-200">
              Please enter your access code to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-white text-sm font-medium">
                  Access Code
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="accessCode"
                    type="text"
                    placeholder="Enter access code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400"
                    data-testid="input-access-code"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
              </div>
              
              <Button 
                type="submit"
                disabled={!accessCode.trim() || accessMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                data-testid="button-access-submit"
              >
                <Key className="h-4 w-4 mr-2" />
                {accessMutation.isPending ? "Verifying..." : "Enter"}
              </Button>
            </form>
            
            {/* Hint for access code */}

          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-blue-300">
            © 2024 Felicity Global Capital Pte. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}