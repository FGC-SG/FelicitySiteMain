import { useState } from "react";
import { useTranslation, type Language } from "@/lib/i18n";
import { useLocation, Link } from "wouter";
import { LoginModal } from "@/components/auth/login-modal";

interface FooterProps {
  language: Language;
}

export function Footer({ language }: FooterProps) {
  const t = useTranslation(language);
  const [, navigate] = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleNavClick = (path: string) => {
    if (path.startsWith('#')) {
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(path);
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
      address: "9 Temasek Blvd 29-04 Suntec Tower Four Singapore 038986",
      allRightsReserved: "All rights reserved.",
      adminLogin: "Admin Login"
    },
    jp: {
      companyDescription: "フェリシティ・グローバル・キャピタルは、シンガポールを拠点とする投資運用会社であり、アジア太平洋市場における越境プライベートエクイティおよびコーポレートファイナンスソリューションを専門としています。",
      quickLinks: "クイックリンク",
      legal: "法的情報",
      contact: "お問い合わせ",
      privacyPolicy: "プライバシーポリシー",
      termsOfUse: "利用規約",
      address: "9 Temasek Blvd 29-04 Suntec Tower Four Singapore 038986",
      allRightsReserved: "All rights reserved.",
      adminLogin: "管理者ログイン"
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
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
              data-testid="footer-admin-login"
            >
              {c.adminLogin}
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => window.location.href = "/management"}
        language={language}
      />
    </footer>
  );
}
