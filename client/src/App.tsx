import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LayoutProvider } from "@/components/layout-provider";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import About from "@/pages/about";
import News from "@/pages/news";
import Contact from "@/pages/contact";
import Portfolio from "@/pages/portfolio";
import Fund from "@/pages/fund";
import FundDetail from "@/pages/fund-detail";
import Management from "@/pages/management";
import NewsManagement from "@/pages/news-management";
import UserManagement from "@/pages/user-management";
import MemberManagement from "@/pages/member-management";
import PortfolioManagement from "@/pages/portfolio-management";
import FundManagement from "@/pages/fund-management";
import FundDisclosures from "@/pages/fund-disclosures";
import FundDisclosureManagement from "@/pages/fund-disclosure-management";
import BusinessReport from "@/pages/business-report";
import SemiAnnualReport from "@/pages/semi-annual-report";
import AddUserStandalone from "@/pages/add-user-standalone";
import AcceptInvitation from "@/pages/accept-invitation";
import ResetPassword from "@/pages/reset-password";
import ResetAdmin from "@/pages/reset-admin";
import PrivacyPolicy from "@/pages/privacy-policy";
import Terms from "@/pages/terms";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/news" component={News} />
      <Route path="/contact" component={Contact} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/fund" component={Fund} />
      <Route path="/fund/:id" component={FundDetail} />
      <Route path="/fund-disclosures" component={FundDisclosures} />
      <Route path="/business-report" component={BusinessReport} />
      <Route path="/semi-annual-report" component={SemiAnnualReport} />
      <Route path="/management" component={Management} />
      <Route path="/news-management" component={NewsManagement} />
      <Route path="/user-management" component={UserManagement} />
      <Route path="/member-management" component={MemberManagement} />
      <Route path="/portfolio-management" component={PortfolioManagement} />
      <Route path="/fund-management" component={FundManagement} />
      <Route path="/fund-disclosure-management" component={FundDisclosureManagement} />
      <Route path="/add-user" component={AddUserStandalone} />
      <Route path="/accept-invitation" component={AcceptInvitation} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/reset-admin" component={ResetAdmin} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="felicity-ui-theme">
        <LayoutProvider defaultLayout="desktop" storageKey="felicity-ui-layout">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LayoutProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
