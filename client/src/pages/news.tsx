import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { AdminRoute } from "@/components/auth/admin-route";
import { News as NewsSection } from "@/components/sections/news";
import { type Language } from "@/lib/i18n";

export default function NewsPage() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <AdminRoute allowPublicAccess={false}>
      <div className="min-h-screen bg-background font-sans">
        <Navigation language={language} onLanguageChange={setLanguage} />
        <main className="pt-16">
          <div className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 text-center text-sm">
            📝 Admin Preview: This News section is currently visible only to administrators
          </div>
          <NewsSection language={language} />
        </main>
        <Footer language={language} />
      </div>
    </AdminRoute>
  );
}