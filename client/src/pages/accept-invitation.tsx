import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, AlertTriangle } from "lucide-react";

interface InvitationDetails {
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export default function AcceptInvitationPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  
  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  // Fetch invitation details
  const { 
    data: invitation, 
    isLoading, 
    error 
  } = useQuery<InvitationDetails>({
    queryKey: ["/api/invitations", token],
    enabled: !!token,
    retry: false,
  });

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      return await apiRequest("POST", `/api/invitations/${token}/accept`, { password });
    },
    onSuccess: () => {
      setAccountCreated(true);
      toast({
        title: "Account Created",
        description: "Your account has been created successfully. You can now log in.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleAcceptInvitation = () => {
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

    acceptInvitationMutation.mutate({ token: token!, password });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              No invitation token found in the URL.
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
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid or Expired Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid, expired, or has already been used.
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

  if (accountCreated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle>Account Created Successfully</CardTitle>
            <CardDescription>
              Your account has been created and you can now log in to the system.
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
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            Complete your account setup for Felicity Global Capital
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              value={invitation.email} 
              disabled 
              className="bg-muted"
            />
          </div>
          
          {invitation.firstName && (
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={`${invitation.firstName} ${invitation.lastName || ''}`.trim()} 
                disabled 
                className="bg-muted"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Role</Label>
            <Input 
              value={invitation.role} 
              disabled 
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a secure password"
              data-testid="input-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              data-testid="input-confirm-password"
            />
          </div>

          <Button 
            onClick={handleAcceptInvitation}
            disabled={acceptInvitationMutation.isPending || !password || !confirmPassword}
            className="w-full"
            data-testid="button-accept-invitation"
          >
            {acceptInvitationMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}