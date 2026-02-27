import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { type Language } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, TrendingUp, ArrowUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Fund as FundType } from "@shared/schema";

export default function FundPage() {
  // Check for language parameter in URL, otherwise default to 'en'
  const urlParams = new URLSearchParams(window.location.search);
  const urlLanguage = urlParams.get('lang') as Language;
  const [language, setLanguage] = useState<Language>(urlLanguage === 'jp' ? 'jp' : 'en');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'vintage'>('alphabetical');

  useEffect(() => {
    document.title = "Investment Funds | Felicity Global Capital";
  }, []);

  // Fetch funds data
  const { data: allFunds = [], isLoading } = useQuery({
    queryKey: ['/api/funds'],
  });

  // Filter only visible funds for public display
  const visibleFunds = (allFunds as FundType[]).filter((fund: FundType) => fund.isVisible !== false);

  // Sort funds based on selected sorting method
  const funds = [...visibleFunds].sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.name.localeCompare(b.name);
    } else {
      // Sort by vintage (newest first, treating 'TBD' or null as oldest)
      const vintageA = a.vintage ? parseInt(a.vintage) : 0;
      const vintageB = b.vintage ? parseInt(b.vintage) : 0;
      return vintageB - vintageA;
    }
  });

  const t = {
    title: language === 'jp' ? "投資ファンド" : "Investment Funds",
    subtitle: language === 'jp' ? "Felicity Global Capitalのプライベートエクイティ投資ファンド" : "Felicity Global Capital's Private Equity Investment Funds",
    description: language === 'jp' ? "アジア太平洋地域をフォーカスした当社の専門的な投資ファンドをご覧ください。各ファンドは、高成長企業への投資機会を通じて、持続的な価値創造を追求しています。" : "Explore our specialized investment funds focused on the Asia-Pacific region. Each fund pursues sustainable value creation through investment opportunities in high-growth companies.",
    noFunds: language === 'jp' ? "現在、表示できるファンドはありません。" : "No funds are currently available for display.",
    vintage: language === 'jp' ? "ビンテージ" : "Vintage",
    sortBy: language === 'jp' ? "並べ替え" : "Sort by",
    sortAlphabetical: language === 'jp' ? "名前順（A-Z）" : "Alphabetical (A-Z)",
    sortVintage: language === 'jp' ? "ビンテージ（新しい順）" : "Vintage (Newest First)",
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
                <PieChart className="w-8 h-8 text-white" />
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

          {/* Sorting Controls */}
          {!isLoading && (funds as FundType[]).length > 0 && (
            <div className="flex justify-end mb-8">
              <div className="flex items-center gap-3">
                <ArrowUpDown className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 font-medium">{t.sortBy}:</span>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'alphabetical' | 'vintage')}>
                  <SelectTrigger className="w-[200px] bg-white" data-testid="select-sort-funds">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alphabetical" data-testid="option-sort-alphabetical">
                      {t.sortAlphabetical}
                    </SelectItem>
                    <SelectItem value="vintage" data-testid="option-sort-vintage">
                      {t.sortVintage}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Funds Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading funds...</p>
            </div>
          ) : (funds as FundType[]).length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  id: "static-1",
                  name: language === 'jp' ? "フェリシティ・アジア成長ファンド" : "Felicity Asia Growth Fund",
                  type: "Private Equity",
                  focus: language === 'jp' ? "アジア太平洋全域の成長投資" : "Growth Investments across Asia-Pacific",
                  status: language === 'jp' ? "運用中" : "Active",
                  description: language === 'jp'
                    ? "テクノロジー、ヘルスケア、消費者セクターを中心に、アジア太平洋地域の高成長企業への投資機会を追求する多様化されたプライベートエクイティファンドです。"
                    : "A diversified private equity fund targeting high-growth companies across technology, healthcare, and consumer sectors in Asia-Pacific markets.",
                },
                {
                  id: "static-2",
                  name: language === 'jp' ? "大和ACA APACグロースファンドII" : "Daiwa ACA APAC Growth Fund II",
                  type: "Private Equity",
                  focus: language === 'jp' ? "日本・東南アジアのバイアウト" : "Japan & Southeast Asia Buyouts",
                  status: language === 'jp' ? "運用中" : "Active",
                  description: language === 'jp'
                    ? "日本および東南アジアの主要市場における事業承継および成長バイアウト取引を専門とするバイアウトファンドです。"
                    : "A buyout-focused fund specializing in business succession and growth buyout transactions in Japan and across key Southeast Asian markets.",
                },
              ].map((fund) => (
                <Card key={fund.id} className="h-full bg-white/80 backdrop-blur-sm border-blue-100 hover:bg-white/90 transition-all duration-300 hover:shadow-lg" data-testid={`card-fund-${fund.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">{fund.status}</span>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-1">{fund.name}</CardTitle>
                    <CardDescription className="text-sm text-blue-600 font-medium">{fund.focus}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">{fund.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium">{fund.type}</span>
                      <Link href="/contact">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                          {language === 'jp' ? 'お問い合わせ →' : 'Enquire →'}
                        </button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {(funds as FundType[]).map((fund) => (
                <Link key={fund.id} href={`/fund/${fund.id}`}>
                  <Card 
                    className="h-full bg-white/80 backdrop-blur-sm border-blue-100 hover:bg-white/90 transition-all duration-300 hover:shadow-lg cursor-pointer"
                    data-testid={`card-fund-${fund.id}`}
                  >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2" data-testid={`text-fund-name-${fund.id}`}>
                      {fund.name}
                    </CardTitle>
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
                          {t.vintage}: {fund.vintage || 'TBD'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  </Card>
                </Link>
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