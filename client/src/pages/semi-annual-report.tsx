import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { type Language } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Calendar, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type FundDisclosure } from "@shared/schema";

export default function SemiAnnualReportPage() {
  // Japan Only page - force Japanese language
  const [language, setLanguage] = useState<Language>('jp');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch fund disclosures data filtered for semi-annual reports
  const { data: disclosures, isLoading } = useQuery<FundDisclosure[]>({
    queryKey: ['/api/fund-disclosures']
  });

  // Filter for semi-annual report disclosures and apply search and year filter
  const filteredDisclosures = disclosures?.filter(disclosure => {
    const disclosureYear = new Date(disclosure.publishedAt).getFullYear();
    return disclosure.disclosureType === 'semi-annual-report' &&
      disclosure.isVisible && 
      disclosureYear === selectedYear &&
      (searchTerm === "" || 
       disclosure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (disclosure.titleJa && disclosure.titleJa.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (disclosure.description && disclosure.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (disclosure.descriptionJa && disclosure.descriptionJa.toLowerCase().includes(searchTerm.toLowerCase())))
  }) || [];

  // Get available years from disclosures
  const availableYears = Array.from(new Set(
    disclosures?.filter(d => d.disclosureType === 'semi-annual-report' && d.isVisible)
      .map(d => new Date(d.publishedAt).getFullYear()) || []
  )).sort((a, b) => b - a); // Sort descending (latest first)

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString(language === 'jp' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        onLanguageChange={() => {}} // Disable language change for Japan Only page
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-semi-annual-report-title">
            {language === 'jp' ? '半期運用報告書' : 'Semi-annual Management Reports'}
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8" data-testid="text-semi-annual-report-subtitle">
            金融商品取引法第63条に関わる開示
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold">{filteredDisclosures.length}</div>
              <div className="text-purple-200">
                {language === 'jp' ? '半期運用報告書' : 'Semi-annual Reports'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="mb-4">
                <div className="text-purple-200 mb-2">
                  年度選択
                </div>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-full bg-white/20 border-purple-300 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}年
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              placeholder={language === 'jp' ? '半期運用報告書を検索...' : 'Search semi-annual reports...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-semi-annual-report-search"
            />
          </div>
        </div>
      </section>

      {/* Semi-annual Reports Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredDisclosures.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'jp' ? '半期運用報告書が見つかりません' : 'No semi-annual reports found'}
              </h3>
              <p className="text-gray-500">
                {language === 'jp' 
                  ? '検索条件を調整するか、後でもう一度お試しください。'
                  : 'Try adjusting your search criteria or check back later.'
                }
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDisclosures.map((disclosure) => (
                <Card key={disclosure.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500" data-testid={`card-semi-annual-report-${disclosure.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg leading-6" data-testid={`text-report-title-${disclosure.id}`}>
                        {language === 'jp' && disclosure.titleJa 
                          ? disclosure.titleJa 
                          : disclosure.title}
                      </CardTitle>
                      <FileText className="h-6 w-6 text-purple-600 flex-shrink-0" />
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span data-testid={`text-published-date-${disclosure.id}`}>
                          {formatDate(disclosure.publishedAt)}
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
                      className="w-full bg-purple-600 hover:bg-purple-700"
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

      {/* Back to Fund Disclosures */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = `/fund-disclosures`}
            data-testid="button-back-to-fund-disclosures"
          >
            {language === 'jp' ? 'ファンド開示資料に戻る' : 'Back to Fund Disclosures'}
          </Button>
        </div>
      </section>

      <Footer language={language} />
    </div>
  );
}