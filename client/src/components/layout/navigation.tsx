import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { LoginModal } from "@/components/auth/login-modal";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation, type Language } from "@/lib/i18n";
import { Menu, X, User } from "lucide-react";
import logoPath from "@assets/logo_color_1756362140059.jpg";

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

  // Check if user is admin
  const isAdmin = isAuthenticated && user && (
    (user as any)?.role === "admin" || 
    (user as any)?.role === "superadmin" ||
    (user as any)?.email === "onuma@fgcsg.com" ||
    (user as any)?.email === "test@fgcsg.com"
  );

  const navItems = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/news", label: t.nav.news },
    { href: "/portfolio", label: "Portfolio" },
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
    <nav className="glass-effect border-b border-border sticky top-0 z-40">
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
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item: any) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    location === item.href
                      ? "felicity-primary"
                      : "text-muted-foreground hover:felicity-primary"
                  }`}
                  data-testid={`nav-${item.href === '/' ? 'home' : item.href.slice(1)}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Language & Auth */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={onLanguageChange}
            />
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
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
                      className="felicity-bg text-primary-foreground hover:opacity-90"
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:felicity-primary w-full text-left"
                  data-testid={`mobile-nav-${item.href === '/' ? 'home' : item.href.slice(1)}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => window.location.reload()}
        language={language}
      />
    </nav>
  );
}
