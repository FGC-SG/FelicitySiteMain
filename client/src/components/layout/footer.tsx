import { useTranslation, type Language } from "@/lib/i18n";
import { useLocation } from "wouter";


interface FooterProps {
  language: Language;
}

export function Footer({ language }: FooterProps) {
  const t = useTranslation(language);
  const [, navigate] = useLocation();

  const handleNavClick = (path: string) => {
    if (path.startsWith('#')) {
      // Handle anchor links for same-page scrolling
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Handle route navigation
      navigate(path);
    }
  };

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="felicity-primary text-2xl font-bold mb-4">FELICITY</div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t.footer.description}
            </p>
            
          </div>

          <div>
            <h4 className="font-semibold felicity-primary mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNavClick("/about")}
                  className="text-muted-foreground hover:felicity-primary transition-colors"
                  data-testid="footer-link-about"
                >
                  {t.nav.about}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/news")}
                  className="text-muted-foreground hover:felicity-primary transition-colors"
                  data-testid="footer-link-news"
                >
                  {t.nav.news}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/portfolio")}
                  className="text-muted-foreground hover:felicity-primary transition-colors"
                  data-testid="footer-link-portfolio"
                >
                  Portfolio
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/contact")}
                  className="text-muted-foreground hover:felicity-primary transition-colors"
                  data-testid="footer-link-contact"
                >
                  {t.nav.contact}
                </button>
              </li>
              <li>
                <button
                  onClick={() => window.location.href = '/privacy-policy'}
                  className="text-muted-foreground hover:felicity-primary transition-colors text-left"
                  data-testid="footer-link-privacy"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold felicity-primary mb-4">{t.footer.contact}</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p data-testid="text-singapore-phone">Singapore: +65-6890-0730</p>
              <p data-testid="text-tokyo-phone">Tokyo: +81-3-5375-1025</p>
              <p data-testid="text-email">info@fgcsg.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p data-testid="text-copyright">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
