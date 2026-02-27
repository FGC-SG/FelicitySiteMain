import { useState, useEffect } from "react";
import { type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface CookieConsentProps {
  language: Language;
}

export function CookieConsent({ language }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("fgc_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("fgc_cookie_consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  const text = language === "jp"
    ? "当ウェブサイトはCookieを使用して、お客様のブラウジング体験を向上させています。引き続きご利用いただくことで、Cookieの使用に同意されたものとみなします。"
    : "We use cookies to improve your experience on our website. By continuing to browse, you agree to our use of cookies.";

  const acceptLabel = language === "jp" ? "同意する" : "Accept";
  const learnMoreLabel = language === "jp" ? "詳細を見る" : "Learn More";

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 cookie-consent-banner"
      data-testid="cookie-consent-banner"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-700 leading-relaxed flex-1" data-testid="cookie-consent-text">
          {text}
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href="/privacy-policy"
            className="text-sm font-medium text-blue-900 hover:underline"
            data-testid="cookie-learn-more"
          >
            {learnMoreLabel}
          </a>
          <Button
            onClick={accept}
            className="px-6 text-sm"
            style={{ backgroundColor: "#1a237e", color: "#fff" }}
            data-testid="cookie-accept-button"
          >
            {acceptLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
