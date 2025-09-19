import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { AdminRoute } from "@/components/auth/admin-route";
import { News as NewsSection } from "@/components/sections/news";
import { type Language } from "@/lib/i18n";

export default function NewsPage() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <AdminRoute allowPublicAccess={true}>
      <div className="min-h-screen bg-background font-sans">
        <Navigation language={language} onLanguageChange={setLanguage} />
        <main className="pt-16">
          <NewsSection language={language} />
        </main>
        <Footer language={language} />
      </div>
    </AdminRoute>
  );
}