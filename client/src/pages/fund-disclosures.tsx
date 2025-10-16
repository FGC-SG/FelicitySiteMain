import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { type Language } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Search, Calendar, Download, Building2, Eye, Share2, Copy, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { type FundDisclosure } from "@shared/schema";
import { shortenUrl, copyToClipboard } from "@/lib/urlShortener";

export default function FundDisclosuresPage() {
  // Japan Only page - force Japanese language
  const [language, setLanguage] = useState<Language>('jp');
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // State for short URLs - Map<disclosureId, shortUrl>
  const [shortUrls, setShortUrls] = useState<Map<string, string>>(new Map());
  const [generatingUrls, setGeneratingUrls] = useState<Set<string>>(new Set());
  const [copiedUrls, setCopiedUrls] = useState<Set<string>>(new Set());

  // Fetch fund disclosures data
  const { data: disclosures, isLoading } = useQuery<FundDisclosure[]>({
    queryKey: ['/api/fund-disclosures']
  });

  // Filter visible disclosures and apply search
  const filteredDisclosures = disclosures?.filter(disclosure => 
    disclosure.isVisible && 
    (searchTerm === "" || 
     (disclosure.descriptionJa && disclosure.descriptionJa.toLowerCase().includes(searchTerm.toLowerCase())) ||
     disclosure.disclosureType.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString(language === 'jp' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDisclosureType = (type: string) => {
    switch (type) {
      case "business-report":
        return language === 'jp' ? '事業報告書' : 'Business Report';
      case "semi-annual-report":
        return language === 'jp' ? '半期運用報告書' : 'Semi-annual Report';
      case "general":
        return language === 'jp' ? '一般開示資料' : 'General Disclosure';
      default:
        return language === 'jp' ? '一般開示資料' : 'General Disclosure';
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

  const handleView = (pdfUrl: string) => {
    if (!pdfUrl || pdfUrl.trim() === '') {
      toast({
        title: language === 'jp' ? 'PDFが利用できません' : 'No PDF Available',
        description: language === 'jp' ? 'この開示資料にはPDFファイルが添付されていません。' : 'This disclosure does not have a PDF file attached.',
        variant: "destructive",
      });
      return;
    }
    window.open(pdfUrl, '_blank');
  };

  const handleGenerateShortUrl = async (disclosureId: string, pdfUrl: string) => {
    if (!pdfUrl || pdfUrl.trim() === '') {
      toast({
        title: language === 'jp' ? 'PDFが利用できません' : 'No PDF Available',
        description: language === 'jp' ? 'この開示資料にはPDFファイルが添付されていません。' : 'This disclosure does not have a PDF file attached.',
        variant: "destructive",
      });
      return;
    }

    setGeneratingUrls(prev => new Set(prev).add(disclosureId));
    
    const result = await shortenUrl(pdfUrl);
    
    if (result.success) {
      setShortUrls(prev => new Map(prev).set(disclosureId, result.shortUrl));
      toast({
        title: language === 'jp' ? '短縮URLを作成しました' : 'Short URL Created',
        description: language === 'jp' ? 'このリンクをコピーして共有できます' : 'You can now copy and share this link'
      });
    } else {
      toast({
        title: language === 'jp' ? 'エラー' : 'Error',
        description: result.error || (language === 'jp' ? '短縮URLの作成に失敗しました' : 'Failed to create short URL'),
        variant: "destructive"
      });
    }
    
    setGeneratingUrls(prev => {
      const newSet = new Set(prev);
      newSet.delete(disclosureId);
      return newSet;
    });
  };

  const handleCopyShortUrl = async (disclosureId: string, shortUrl: string) => {
    const success = await copyToClipboard(shortUrl);
    
    if (success) {
      setCopiedUrls(prev => new Set(prev).add(disclosureId));
      toast({
        title: language === 'jp' ? 'コピーしました！' : 'Copied!',
        description: language === 'jp' ? '短縮URLをクリップボードにコピーしました' : 'Short URL copied to clipboard'
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(disclosureId);
          return newSet;
        });
      }, 2000);
    } else {
      toast({
        title: language === 'jp' ? 'エラー' : 'Error',
        description: language === 'jp' ? 'クリップボードへのコピーに失敗しました' : 'Failed to copy to clipboard',
        variant: "destructive"
      });
    }
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
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-fund-disclosures-title">
            {language === 'jp' ? 'ファンド開示資料（日本）' : 'Fund Disclosures (Japan)'}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8" data-testid="text-fund-disclosures-subtitle">
            金融商品取引法第63条に関わる開示
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold">{filteredDisclosures.length}</div>
              <div className="text-blue-200">
                {language === 'jp' ? '開示資料' : 'Disclosure Documents'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclosure Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900" data-testid="text-disclosure-categories-title">
            {language === 'jp' ? '開示資料カテゴリ' : 'Disclosure Categories'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Business Report Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500" data-testid="card-business-report-category">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {disclosures?.filter(d => d.disclosureType === 'business-report' && d.isVisible).length || 0}
                  </Badge>
                </div>
                <CardTitle className="text-xl">
                  {language === 'jp' ? '事業報告書' : 'Business Reports'}
                </CardTitle>
                <CardDescription>
                  {language === 'jp' 
                    ? '全てのファンドに関する年次開示情報'
                    : 'Annual disclosure information for all funds'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-green-200 hover:bg-green-50"
                  onClick={() => window.location.href = `/business-report`}
                  data-testid="button-view-business-reports"
                >
                  {language === 'jp' ? '事業報告書を見る' : 'View Business Reports'}
                </Button>
              </CardContent>
            </Card>

            {/* Semi-annual Report Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500" data-testid="card-semi-annual-category">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {disclosures?.filter(d => d.disclosureType === 'semi-annual-report' && d.isVisible).length || 0}
                  </Badge>
                </div>
                <CardTitle className="text-xl">
                  {language === 'jp' ? '半期運用報告書' : 'Semi-annual Reports'}
                </CardTitle>
                <CardDescription>
                  {language === 'jp' 
                    ? '一般投資家向け開示'
                    : 'Semi-annual disclosure of funds'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-purple-200 hover:bg-purple-50"
                  onClick={() => window.location.href = `/semi-annual-report`}
                  data-testid="button-view-semi-annual-reports"
                >
                  {language === 'jp' ? '半期報告書を見る' : 'View Semi-annual Reports'}
                </Button>
              </CardContent>
            </Card>
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
                        {(disclosure as any).fundName || formatDisclosureType(disclosure.disclosureType)}
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
                        <span data-testid={`text-disclosure-type-${disclosure.id}`}>
                          {formatDisclosureType(disclosure.disclosureType)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Description */}
                    {disclosure.descriptionJa && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600" data-testid={`text-description-${disclosure.id}`}>
                          {disclosure.descriptionJa}
                        </p>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleView(disclosure.pdfUrl)}
                          variant="outline"
                          className="flex-1"
                          data-testid={`button-view-${disclosure.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {disclosure.pdfUrl && disclosure.pdfUrl.trim() !== '' 
                            ? (language === 'jp' ? '表示' : 'View')
                            : (language === 'jp' ? 'PDF無し' : 'No PDF')
                          }
                        </Button>
                        <Button 
                          onClick={() => {
                            if (!disclosure.pdfUrl || disclosure.pdfUrl.trim() === '') {
                              toast({
                                title: language === 'jp' ? 'PDFが利用できません' : 'No PDF Available',
                                description: language === 'jp' ? 'この開示資料にはPDFファイルが添付されていません。' : 'This disclosure does not have a PDF file attached.',
                                variant: "destructive",
                              });
                              return;
                            }
                            handleDownload(disclosure.pdfUrl, formatDisclosureType(disclosure.disclosureType));
                          }}
                          className="flex-1"
                          data-testid={`button-download-${disclosure.id}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {language === 'jp' ? 'ダウンロード' : 'Download'}
                        </Button>
                      </div>
                      
                      {/* Short URL Section */}
                      {!shortUrls.get(disclosure.id) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleGenerateShortUrl(disclosure.id, disclosure.pdfUrl)}
                          disabled={generatingUrls.has(disclosure.id)}
                          data-testid={`button-generate-short-url-${disclosure.id}`}
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          {generatingUrls.has(disclosure.id)
                            ? (language === 'jp' ? '生成中...' : 'Generating...')
                            : (language === 'jp' ? '共有用URL作成' : 'Create Share URL')
                          }
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md">
                          <span className="text-xs font-mono text-primary flex-1 truncate">
                            {shortUrls.get(disclosure.id)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={() => handleCopyShortUrl(disclosure.id, shortUrls.get(disclosure.id)!)}
                            data-testid={`button-copy-short-url-${disclosure.id}`}
                          >
                            {copiedUrls.has(disclosure.id) ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
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