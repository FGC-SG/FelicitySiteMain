import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { type Language } from "@/lib/i18n";

export default function NotFound() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 pt-16">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2 items-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'jp' ? 'ページが見つかりません' : '404 Page Not Found'}
              </h1>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              {language === 'jp' 
                ? 'お探しのページは存在しないか、移動された可能性があります。'
                : 'The page you are looking for might have been removed, renamed, or is temporarily unavailable.'
              }
            </p>

            <div className="mt-6 flex justify-center">
              <Button 
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2"
                data-testid="button-go-home"
              >
                <Home className="h-4 w-4" />
                <span>{language === 'jp' ? 'ホームに戻る' : 'Go to Home'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer language={language} />
    </div>
  );
}
