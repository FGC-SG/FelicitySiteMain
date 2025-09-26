import { useState } from "react";
import { useParams, Link } from "wouter";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { type Language } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowLeft, TrendingUp, Building, Calendar, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Fund as FundType } from "@shared/schema";

export default function FundDetailPage() {
  const { id } = useParams();
  // Check for language parameter in URL, otherwise default to 'en'
  const urlParams = new URLSearchParams(window.location.search);
  const urlLanguage = urlParams.get('lang') as Language;
  const [language, setLanguage] = useState<Language>(urlLanguage === 'jp' ? 'jp' : 'en');

  // Fetch specific fund data
  const { data: fund, isLoading, error } = useQuery({
    queryKey: ['/api/funds', id],
    queryFn: async () => {
      const response = await fetch(`/api/funds/${id}`);
      if (!response.ok) {
        throw new Error('Fund not found');
      }
      return response.json();
    },
    enabled: !!id,
  });

  const t = {
    backToFunds: language === 'jp' ? "ファンド一覧に戻る" : "Back to Funds",
    fundDetails: language === 'jp' ? "ファンド詳細" : "Fund Details",
    overview: language === 'jp' ? "概要" : "Overview",
    description: language === 'jp' ? "説明" : "Description",
    vintage: language === 'jp' ? "ビンテージ" : "Vintage",
    status: language === 'jp' ? "ステータス" : "Status",
    felicityCompany: language === 'jp' ? "Felicity関連会社" : "Felicity Company",
    notFound: language === 'jp' ? "ファンドが見つかりません" : "Fund not found",
    notFoundDesc: language === 'jp' ? "指定されたファンドは存在しないか、アクセス権限がありません。" : "The specified fund does not exist or you do not have access to it.",
    loading: language === 'jp' ? "読み込み中..." : "Loading...",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation language={language} onLanguageChange={setLanguage} />
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t.loading}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation language={language} onLanguageChange={setLanguage} />
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">{t.notFound}</h3>
              <p className="text-gray-600 mb-8">{t.notFoundDesc}</p>
              <Link href="/fund">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t.backToFunds}
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation language={language} onLanguageChange={setLanguage} />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link href="/fund">
              <Button variant="outline" className="mb-4" data-testid="button-back-to-funds">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.backToFunds}
              </Button>
            </Link>
          </div>

          {/* Fund Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" data-testid="text-fund-name-header">
              {fund.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'jp' && fund.descriptionJa 
                ? fund.descriptionJa 
                : fund.description}
            </p>
          </div>

          {/* Fund Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Overview Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  {t.overview}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t.vintage}:</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200" data-testid="text-fund-vintage">
                    {fund.vintage || 'TBD'}
                  </Badge>
                </div>
                
                {fund.status && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.status}:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200" data-testid="text-fund-status">
                      {fund.status}
                    </Badge>
                  </div>
                )}

                {fund.felicityCompany && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.felicityCompany}:</span>
                    <span className="font-medium" data-testid="text-fund-company">
                      {fund.felicityCompany}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2 text-blue-600" />
                  {t.description}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed" data-testid="text-fund-description-detail">
                  {language === 'jp' && fund.descriptionJa 
                    ? fund.descriptionJa 
                    : fund.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Investment Philosophy Section (if available) */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                {language === 'jp' 
                  ? "投資理念" 
                  : "Investment Philosophy"}
              </h2>
              <p className="text-lg leading-relaxed opacity-90">
                {language === 'jp'
                  ? "私たちは、アジア太平洋地域の優秀な経営者と共に、持続的な成長と価値創造を実現します。"
                  : "We partner with outstanding management teams across the Asia-Pacific region to achieve sustainable growth and value creation."}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}