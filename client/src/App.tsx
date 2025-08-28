import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import About from "@/pages/about";
import News from "@/pages/news";
import Contact from "@/pages/contact";
import Management from "@/pages/management";
import NewsManagement from "@/pages/news-management";
import UserManagement from "@/pages/user-management";
import MemberManagement from "@/pages/member-management";
import AddUserStandalone from "@/pages/add-user-standalone";
import AcceptInvitation from "@/pages/accept-invitation";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={isLoading || !isAuthenticated ? Landing : Home} />
      <Route path="/about" component={About} />
      <Route path="/news" component={News} />
      <Route path="/contact" component={Contact} />
      <Route path="/management" component={Management} />
      <Route path="/news-management" component={NewsManagement} />
      <Route path="/user-management" component={UserManagement} />
      <Route path="/member-management" component={MemberManagement} />
      <Route path="/add-user" component={AddUserStandalone} />
      <Route path="/accept-invitation" component={AcceptInvitation} />
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
