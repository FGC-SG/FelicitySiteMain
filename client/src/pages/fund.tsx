import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { type Language } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Fund as FundType } from "@shared/schema";

export default function FundPage() {
  // Check for language parameter in URL, otherwise default to 'en'
  const urlParams = new URLSearchParams(window.location.search);
  const urlLanguage = urlParams.get('lang') as Language;
  const [language, setLanguage] = useState<Language>(urlLanguage === 'jp' ? 'jp' : 'en');

  // Fetch funds data
  const { data: funds = [], isLoading } = useQuery({
    queryKey: ['/api/funds'],
  });

  const t = {
    title: language === 'jp' ? "投資ファンド" : "Investment Funds",
    subtitle: language === 'jp' ? "Felicity Global Capitalのプライベートエクイティ投資ファンド" : "Felicity Global Capital's Private Equity Investment Funds",
    description: language === 'jp' ? "アジア太平洋地域をフォーカスした当社の専門的な投資ファンドをご覧ください。各ファンドは、高成長企業への投資機会を通じて、持続的な価値創造を追求しています。" : "Explore our specialized investment funds focused on the Asia-Pacific region. Each fund pursues sustainable value creation through investment opportunities in high-growth companies.",
    noFunds: language === 'jp' ? "現在、表示できるファンドはありません。" : "No funds are currently available for display.",
    fundCode: language === 'jp' ? "ファンドコード" : "Fund Code",
    established: language === 'jp' ? "設立" : "Established",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation language={language} onLanguageChange={setLanguage} />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {t.subtitle}
            </p>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto border border-blue-100">
              <p className="text-gray-700 leading-relaxed">
                {t.description}
              </p>
            </div>
          </div>

          {/* Funds Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading funds...</p>
            </div>
          ) : (funds as FundType[]).length === 0 ? (
            <div className="text-center py-16">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">{t.noFunds}</h3>
              <p className="text-gray-600">
                {language === 'jp' 
                  ? "ファンド情報は近日公開予定です。" 
                  : "Fund information will be available soon."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {(funds as FundType[]).map((fund) => (
                <Card 
                  key={fund.id} 
                  className="h-full bg-white/80 backdrop-blur-sm border-blue-100 hover:bg-white/90 transition-all duration-300 hover:shadow-lg"
                  data-testid={`card-fund-${fund.id}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2" data-testid={`text-fund-name-${fund.id}`}>
                      {fund.displayName}
                    </CardTitle>
                    
                    <CardDescription className="text-sm text-blue-600 font-medium" data-testid={`text-fund-code-${fund.id}`}>
                      {t.fundCode}: {fund.name}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <p className="text-gray-700 text-sm leading-relaxed" data-testid={`text-fund-description-${fund.id}`}>
                        {language === 'jp' && fund.descriptionJa 
                          ? fund.descriptionJa 
                          : fund.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {t.established}: {fund.createdAt ? new Date(fund.createdAt).getFullYear() : 'TBD'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Investment Philosophy Section */}
          {(funds as FundType[]).length > 0 && (
            <div className="mt-20">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-3xl font-bold mb-6">
                    {language === 'jp' 
                      ? "投資理念" 
                      : "Investment Philosophy"}
                  </h2>
                  <p className="text-xl leading-relaxed opacity-90">
                    {language === 'jp'
                      ? "私たちは、アジア太平洋地域の優秀な経営者と共に、持続的な成長と価値創造を実現します。"
                      : "We partner with outstanding management teams across the Asia-Pacific region to achieve sustainable growth and value creation."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}