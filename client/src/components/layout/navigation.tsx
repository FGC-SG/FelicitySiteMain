import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { LoginModal } from "@/components/auth/login-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutToggle } from "@/components/layout-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation, type Language } from "@/lib/i18n";
import { Grip, User } from "lucide-react";
import logoPath from "@assets/logo_color_1756362140059.jpg";
import { hasAdminPrivileges } from "@/lib/roles";

interface NavigationProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function Navigation({ language, onLanguageChange }: NavigationProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const t = useTranslation(language);

  // Check if user has admin privileges (admin or superadmin)
  const isAdmin = isAuthenticated && hasAdminPrivileges(user as any);

  const navItems = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/news", label: t.nav.news },
    { href: "/portfolio", label: t.nav.portfolio },
    { href: "/fund", label: t.nav.fund },
    { href: "/contact", label: t.nav.contact },
  ];

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="glass-effect border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <img 
                  src={logoPath}
                  alt="Felicity Global Capital"
                  className="h-8 w-auto"
                  data-testid="img-logo"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:flex-1 md:justify-center">
            <div className="flex items-center space-x-1 flex-nowrap">
              {navItems.map((item: any) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded-md whitespace-nowrap ${
                    location === item.href
                      ? "felicity-primary bg-primary/5"
                      : "text-muted-foreground hover:felicity-primary hover:bg-primary/5"
                  }`}
                  data-testid={`nav-${item.href === '/' ? 'home' : item.href.slice(1)}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop: Language & Auth */}
          <div className="hidden md:flex items-center space-x-2">
            <LayoutToggle />
            <ThemeToggle />
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={onLanguageChange}
            />
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <Link href="/management">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                        data-testid="button-management"
                      >
                        <User className="h-4 w-4" />
                        <span>Admin Login</span>
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      className="felicity-bg text-white hover:opacity-90 shadow-md"
                      size="sm"
                      data-testid="button-logout"
                    >
                      {t.nav.logout}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowLoginModal(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                    data-testid="button-admin-login"
                  >
                    <User className="h-4 w-4" />
                    <span>Admin Login</span>
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile: 9-dots menu button */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Grip className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Navigation Items */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`block px-3 py-2 text-base font-medium w-full text-left transition-colors ${
                    location === item.href
                      ? "felicity-primary"
                      : "text-muted-foreground hover:felicity-primary"
                  }`}
                  data-testid={`mobile-nav-${item.href === '/' ? 'home' : item.href.slice(1)}`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Divider */}
              <div className="border-t border-border my-2"></div>
              
              {/* Layout Toggle */}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-base font-medium text-muted-foreground">Layout</span>
                <LayoutToggle />
              </div>
              
              {/* Theme Toggle */}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-base font-medium text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              
              {/* Language Switcher */}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-base font-medium text-muted-foreground">Language</span>
                <LanguageSwitcher
                  currentLanguage={language}
                  onLanguageChange={onLanguageChange}
                />
              </div>
              
              {/* Admin Login/Logout */}
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <div className="space-y-1 px-3 py-2">
                      <Link href="/management">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center justify-center space-x-1"
                          data-testid="mobile-button-management"
                          onClick={handleNavClick}
                        >
                          <User className="h-4 w-4" />
                          <span>Admin Login</span>
                        </Button>
                      </Link>
                      <Button
                        onClick={() => {
                          handleLogout();
                          handleNavClick();
                        }}
                        className="w-full felicity-bg text-white hover:opacity-90 shadow-md"
                        size="sm"
                        data-testid="mobile-button-logout"
                      >
                        {t.nav.logout}
                      </Button>
                    </div>
                  ) : (
                    <div className="px-3 py-2">
                      <Button
                        onClick={() => {
                          setShowLoginModal(true);
                          handleNavClick();
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center space-x-1"
                        data-testid="mobile-button-admin-login"
                      >
                        <User className="h-4 w-4" />
                        <span>Admin Login</span>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => window.location.href = "/management"}
        language={language}
      />
    </nav>
  );
}
