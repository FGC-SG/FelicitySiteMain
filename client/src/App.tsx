import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { AccessGate } from "@/components/auth/access-gate";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import About from "@/pages/about";
import News from "@/pages/news";
import Contact from "@/pages/contact";
import Portfolio from "@/pages/portfolio";
import Management from "@/pages/management";
import NewsManagement from "@/pages/news-management";
import UserManagement from "@/pages/user-management";
import MemberManagement from "@/pages/member-management";
import PortfolioManagement from "@/pages/portfolio-management";
import AddUserStandalone from "@/pages/add-user-standalone";
import AcceptInvitation from "@/pages/accept-invitation";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";

function Router() {
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Check if user already has valid session on app load
  useEffect(() => {
    const checkExistingAccess = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          setHasAccess(true);
        }
      } catch (error) {
        console.log("No existing session found");
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkExistingAccess();
  }, []);

  const handleAccessGranted = () => {
    setHasAccess(true);
  };

  // Show loading state while checking access
  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show access gate if no access granted
  if (!hasAccess) {
    return <AccessGate onAccessGranted={handleAccessGranted} />;
  }

  // Show main application once access is granted
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/news" component={News} />
      <Route path="/contact" component={Contact} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/management" component={Management} />
      <Route path="/news-management" component={NewsManagement} />
      <Route path="/user-management" component={UserManagement} />
      <Route path="/member-management" component={MemberManagement} />
      <Route path="/portfolio-management" component={PortfolioManagement} />
      <Route path="/add-user" component={AddUserStandalone} />
      <Route path="/accept-invitation" component={AcceptInvitation} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
