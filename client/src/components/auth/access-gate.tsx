import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Lock, Key } from "lucide-react";
import logoPath from "@assets/logo_color_1756362140059.jpg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const accessCodeSchema = z.object({
  code: z.string().min(1, "Access code is required"),
});

type AccessCodeForm = z.infer<typeof accessCodeSchema>;

interface AccessGateProps {
  onAccessGranted: () => void;
}

export function AccessGate({ onAccessGranted }: AccessGateProps) {
  const { toast } = useToast();
  
  const form = useForm<AccessCodeForm>({
    resolver: zodResolver(accessCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const accessMutation = useMutation({
    mutationFn: async (data: AccessCodeForm) => {
      const response = await apiRequest("POST", "/api/auth/verify-access", { code: data.code });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        toast({
          title: "Access Granted",
          description: "Welcome to Felicity Global Capital",
          variant: "default",
        });
        onAccessGranted();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Access Denied",
        description: "Invalid access code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: AccessCodeForm) => {
    accessMutation.mutate(data);
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-sm font-medium">
                        Access Code
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter access code"
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400"
                            data-testid="input-access-code"
                            autoComplete="off"
                            autoFocus
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit"
                  disabled={accessMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                  data-testid="button-access-submit"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {accessMutation.isPending ? "Verifying..." : "Enter"}
                </Button>
              </form>
            </Form>
            
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