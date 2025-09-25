import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { type Language } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Search, Calendar, Download, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type FundDisclosure } from "@shared/schema";

export default function FundDisclosuresPage() {
  // Check for language parameter in URL, otherwise default to 'en'
  const urlParams = new URLSearchParams(window.location.search);
  const urlLanguage = urlParams.get('lang') as Language;
  const [language, setLanguage] = useState<Language>(urlLanguage === 'jp' ? 'jp' : 'en');
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch fund disclosures data
  const { data: disclosures, isLoading } = useQuery<FundDisclosure[]>({
    queryKey: ['/api/fund-disclosures']
  });

  // Filter visible disclosures and apply search
  const filteredDisclosures = disclosures?.filter(disclosure => 
    disclosure.isVisible && 
    (searchTerm === "" || 
     disclosure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (disclosure.titleJa && disclosure.titleJa.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (disclosure.description && disclosure.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (disclosure.descriptionJa && disclosure.descriptionJa.toLowerCase().includes(searchTerm.toLowerCase())))
  ) || [];

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString(language === 'jp' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFelicityCompany = (company: string) => {
    switch (company) {
      case "felicity-singapore":
        return language === 'jp' ? 'フェリシティ・シンガポール' : 'Felicity Singapore';
      case "felicity-japan":
        return language === 'jp' ? 'フェリシティ・ジャパン' : 'Felicity Japan';
      default:
        return language === 'jp' ? 'フェリシティ・シンガポール' : 'Felicity Singapore';
    }
  };

  const handleDownload = (pdfUrl: string, title: string) => {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-fund-disclosures-title">
            {language === 'jp' ? 'ファンド開示資料' : 'Fund Disclosures'}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8" data-testid="text-fund-disclosures-subtitle">
            {language === 'jp' 
              ? 'ファンドに関する重要な開示情報と文書をご確認いただけます'
              : 'Access important fund disclosure information and documents'
            }
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold">{filteredDisclosures.length}</div>
              <div className="text-blue-200">
                {language === 'jp' ? '開示資料' : 'Disclosure Documents'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold">
                {new Set(disclosures?.map(d => d.felicityCompany)).size || 0}
              </div>
              <div className="text-blue-200">
                {language === 'jp' ? 'フェリシティ会社' : 'Felicity Companies'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={language === 'jp' ? '開示資料を検索...' : 'Search disclosures...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-disclosure-search"
            />
          </div>
        </div>
      </section>

      {/* Disclosures Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredDisclosures.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'jp' ? '開示資料が見つかりません' : 'No disclosures found'}
              </h3>
              <p className="text-gray-500">
                {language === 'jp' 
                  ? '検索条件を調整してください。'
                  : 'Try adjusting your search criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDisclosures.map((disclosure) => (
                <Card key={disclosure.id} className="hover:shadow-lg transition-shadow" data-testid={`card-disclosure-${disclosure.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg leading-6" data-testid={`text-disclosure-title-${disclosure.id}`}>
                        {language === 'jp' && disclosure.titleJa 
                          ? disclosure.titleJa 
                          : disclosure.title}
                      </CardTitle>
                      <FileText className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span data-testid={`text-published-date-${disclosure.id}`}>
                          {formatDate(disclosure.publishedAt)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        <span data-testid={`text-felicity-company-${disclosure.id}`}>
                          {formatFelicityCompany(disclosure.felicityCompany)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Description */}
                    {(disclosure.description || disclosure.descriptionJa) && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600" data-testid={`text-description-${disclosure.id}`}>
                          {language === 'jp' && disclosure.descriptionJa 
                            ? disclosure.descriptionJa 
                            : disclosure.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Download Button */}
                    <Button 
                      onClick={() => handleDownload(disclosure.pdfUrl, disclosure.title)}
                      className="w-full"
                      data-testid={`button-download-${disclosure.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {language === 'jp' ? 'PDFをダウンロード' : 'Download PDF'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer language={language} />
    </div>
  );
}