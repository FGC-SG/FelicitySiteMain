import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Key, CheckCircle, AlertTriangle } from "lucide-react";

interface ResetDetails {
  email: string;
  firstName?: string;
  lastName?: string;
}

export default function ResetPasswordPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordReset, setPasswordReset] = useState(false);
  
  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  // Fetch reset details
  const { 
    data: resetData, 
    isLoading, 
    error 
  } = useQuery<ResetDetails>({
    queryKey: ["/api/password-reset", token],
    enabled: !!token,
    retry: false,
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      return await apiRequest("POST", `/api/password-reset/${token}/reset`, { password });
    },
    onSuccess: () => {
      setPasswordReset(true);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully. You can now log in with your new password.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  const handleResetPassword = () => {
    if (!password) {
      toast({
        title: "Error",
        description: "Please enter a password",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate({ token: token!, password });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              No reset token found in the URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation("/")}
              className="w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reset details...</p>
        </div>
      </div>
    );
  }

  if (error || !resetData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid or Expired Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation("/")}
              className="w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (passwordReset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle>Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been updated successfully. You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation("/")}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Key className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password for Felicity Global Capital
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              value={resetData.email} 
              disabled 
              className="bg-muted"
            />
          </div>
          
          {resetData.firstName && (
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={`${resetData.firstName} ${resetData.lastName || ''}`.trim()} 
                disabled 
                className="bg-muted"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              data-testid="input-new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              data-testid="input-confirm-new-password"
            />
          </div>

          <Button 
            onClick={handleResetPassword}
            disabled={resetPasswordMutation.isPending || !password || !confirmPassword}
            className="w-full"
            data-testid="button-reset-password"
          >
            {resetPasswordMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}