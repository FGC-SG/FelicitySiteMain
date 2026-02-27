import { useState } from "react";
import { useTranslation, type Language } from "@/lib/i18n";
import { useLocation, Link } from "wouter";
import { LoginModal } from "@/components/auth/login-modal";
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";

interface FooterProps {
  language: Language;
}

export function Footer({ language }: FooterProps) {
  const t = useTranslation(language);
  const [, navigate] = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleNavClick = (path: string) => {
    if (path.startsWith('#')) {
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const content = {
    en: {
      companyDescription: "Felicity Global Capital is a Singapore-based investment management firm specializing in cross-border private equity and corporate finance solutions across Asia-Pacific markets.",
      quickLinks: "Quick Links",
      legal: "Legal",
      contact: "Contact Us",
      privacyPolicy: "Privacy Policy",
      termsOfUse: "Terms of Use",
      address: "6 Temasek Blvd #29-04 Suntec Tower Four Singapore 038986",
      allRightsReserved: "All rights reserved.",
      followUs: "Follow Us"
    },
    jp: {
      companyDescription: "フェリシティ・グローバル・キャピタルは、シンガポールを拠点とする投資運用会社であり、アジア太平洋市場における越境プライベートエクイティおよびコーポレートファイナンスソリューションを専門としています。",
      quickLinks: "クイックリンク",
      legal: "法的情報",
      contact: "お問い合わせ",
      privacyPolicy: "プライバシーポリシー",
      termsOfUse: "利用規約",
      address: "6 Temasek Blvd #29-04 Suntec Tower Four Singapore 038986",
      allRightsReserved: "All rights reserved.",
      followUs: "フォローする"
    }
  };

  const c = content[language];

  return (
    <footer className="bg-slate-900 text-white py-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="text-2xl font-bold mb-4 text-felicity-gold">FELICITY</div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6" data-testid="footer-description">
              {c.companyDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{c.quickLinks}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => handleNavClick("/about")}
                  className="text-slate-400 hover:text-felicity-gold transition-colors"
                  data-testid="footer-link-about"
                >
                  {t.nav.about}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/portfolio")}
                  className="text-slate-400 hover:text-felicity-gold transition-colors"
                  data-testid="footer-link-portfolio"
                >
                  {t.nav.portfolio}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/news")}
                  className="text-slate-400 hover:text-felicity-gold transition-colors"
                  data-testid="footer-link-news"
                >
                  {t.nav.news}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/contact")}
                  className="text-slate-400 hover:text-felicity-gold transition-colors"
                  data-testid="footer-link-contact"
                >
                  {t.nav.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">{c.legal}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => handleNavClick("/privacy-policy")}
                  className="text-slate-400 hover:text-felicity-gold transition-colors"
                  data-testid="footer-link-privacy"
                >
                  {c.privacyPolicy}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/terms")}
                  className="text-slate-400 hover:text-felicity-gold transition-colors"
                  data-testid="footer-link-terms"
                >
                  {c.termsOfUse}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-semibold text-white mb-4">{c.contact}</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <p data-testid="footer-address">{c.address}</p>
              <p data-testid="footer-singapore-phone">Singapore: +65-6890-0730</p>
              <p data-testid="footer-tokyo-phone">Tokyo: +81-3-5375-1025</p>
              <p data-testid="footer-email">info@fgcsg.com</p>
            </div>
            <div className="mt-5">
              <p className="text-sm text-slate-400 mb-3">{c.followUs}</p>
              <a
                href="https://www.linkedin.com/company/felicity-global-capital"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-felicity-gold transition-colors"
                aria-label="LinkedIn"
                data-testid="footer-linkedin"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-sm">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* MAS Regulatory Notice */}
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="text-center mb-6">
            <p className="text-slate-400 text-xs leading-relaxed max-w-4xl mx-auto" data-testid="footer-mas-notice">
              {language === 'jp' 
                ? 'Felicity Global Capital Pte. Ltd.はシンガポール金融管理局（MAS）により資本市場サービスライセンス（ファンドマネジメント）を付与された事業者であり、免除ファイナンシャルアドバイザーとして登録されています。'
                : 'Felicity Global Capital Pte. Ltd. is a Capital Markets Services Licensee (Fund Management) and an Exempt Financial Adviser regulated by the Monetary Authority of Singapore (MAS).'
              }
            </p>
            <p className="text-slate-500 text-xs mt-2" data-testid="footer-uen">
              UEN: 200819439G
            </p>
          </div>
          
          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-800 pt-6">
            <p className="text-slate-500 text-sm" data-testid="footer-copyright">
              &copy; {new Date().getFullYear()} Felicity Global Capital Pte. Ltd. {c.allRightsReserved}
            </p>
            {isAuthenticated ? (
              <Link href="/management">
                <button
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-xs transition-colors"
                  data-testid="footer-admin-portal"
                >
                  <User className="h-3 w-3" />
                  {language === 'jp' ? '管理ポータル' : 'Admin Portal'}
                </button>
              </Link>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
                data-testid="footer-admin-login"
              >
                {language === 'jp' ? '管理者ログイン' : 'Admin Login'}
              </button>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => window.location.href = "/management"}
        language={language}
      />
    </footer>
  );
}
