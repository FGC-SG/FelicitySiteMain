import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
  allowPublicAccess?: boolean; // Flag to enable public access later
}

export function AdminRoute({ children, allowPublicAccess = false }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Check if user is superadmin
  const isAdmin = isAuthenticated && user && (
    (user as any)?.role === "superadmin" ||
    (user as any)?.email === "onuma@fgcsg.com" ||
    (user as any)?.email === "test@fgcsg.com"
  );

  useEffect(() => {
    if (!isLoading && !allowPublicAccess && !isAdmin) {
      toast({
        title: "Access Restricted",
        description: "This section is currently available only to administrators.",
        variant: "destructive",
      });
      // Redirect to home after a brief delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, [isLoading, isAdmin, allowPublicAccess, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If public access is enabled, show the content
  if (allowPublicAccess) {
    return <>{children}</>;
  }

  // If admin access is required and user is admin, show the content
  if (isAdmin) {
    return <>{children}</>;
  }

  // If not admin and public access is disabled, show access denied
  return (
    <div className="min-h-screen bg-background font-sans flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-4xl font-bold text-foreground mb-4">Access Restricted</h1>
        <p className="text-muted-foreground mb-6">
          This section is currently available only to administrators. Please log in with admin credentials to access this content.
        </p>
        <div className="text-sm text-muted-foreground">
          Redirecting to home page...
        </div>
      </div>
    </div>
  );
}