import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation, type Language } from "@/lib/i18n";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Globe, MapPin, Search, Plus } from "lucide-react";
import type { Portfolio } from "@shared/schema";

function PortfolioPage() {
  // Check for language parameter in URL, otherwise default to 'en'
  const urlParams = new URLSearchParams(window.location.search);
  const urlLanguage = urlParams.get('lang') as Language;
  const [language, setLanguage] = useState<Language>(urlLanguage === 'jp' ? 'jp' : 'en');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const { user, isAuthenticated } = useAuth();
  const t = useTranslation(language);

  // Helper function to get logo container class based on display mode
  const getLogoContainerClass = (logoDisplayMode?: string): string => {
    switch (logoDisplayMode) {
      case 'dark':
        return 'logo-dark-mode border border-gray-700';
      case 'light':
        return 'bg-white dark:bg-white border border-gray-200';
      case 'auto':
      default:
        return 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    }
  };

  const { data: portfolios, isLoading } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
    retry: false,
  });

  // Get unique investment types and countries for filters
  const investmentTypes = Array.from(new Set(portfolios?.map(p => p.investmentType) || []));
  const countries = Array.from(new Set(portfolios?.map(p => p.country) || []));

  // Filter portfolios based on search and filters, then sort alphabetically by company name
  const filteredPortfolios = (portfolios?.filter(portfolio => {
    // First, check if portfolio is visible (only show visible portfolios on public page)
    if ((portfolio as any).isVisible === false) {
      return false;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = portfolio.companyName.toLowerCase().includes(searchLower) ||
                         portfolio.industry.toLowerCase().includes(searchLower) ||
                         (portfolio.companyNameJa && portfolio.companyNameJa.includes(searchTerm)) ||
                         (portfolio.description && portfolio.description.toLowerCase().includes(searchLower)) ||
                         (portfolio.descriptionJa && portfolio.descriptionJa.includes(searchTerm));
    const matchesType = filterType === "all" || portfolio.investmentType === filterType;
    const matchesCountry = filterCountry === "all" || portfolio.country === filterCountry;
    const matchesCompany = filterCompany === "all" || portfolio.felicityCompany === filterCompany;
    
    return matchesSearch && matchesType && matchesCountry && matchesCompany;
  }) || []).sort((a, b) => a.companyName.localeCompare(b.companyName));

  const getInvestmentTypeColor = (type: string) => {
    switch (type) {
      case "buyout":
      case "growthequity":
        return "portfolio-equity-badge";
      case "secondary":
        return "portfolio-secondary-badge";
      default:
        return "border-muted-foreground text-muted-foreground bg-muted";
    }
  };

  const getInvestmentTypeLabel = (type: string) => {
    if (language === 'jp') {
      switch (type) {
        case "buyout":
          return "バイアウト";
        case "growthequity":
          return "グロース・エクイティ";
        case "secondary":
          return "セカンダリー";
        default:
          return type;
      }
    } else {
      switch (type) {
        case "buyout":
          return "Buyout";
        case "growthequity":
          return "Growth Equity";
        case "secondary":
          return "Secondary";
        default:
          return type;
      }
    }
  };

  // Country options for consistent formatting across the application
  const countryOptions = [
    { value: "singapore", label: "Singapore" },
    { value: "malaysia", label: "Malaysia" },
    { value: "japan", label: "Japan" },
    { value: "indonesia", label: "Indonesia" },
    { value: "thailand", label: "Thailand" },
    { value: "philippines", label: "Philippines" },
    { value: "vietnam", label: "Vietnam" },
    { value: "hongkong", label: "Hong Kong" },
    { value: "taiwan", label: "Taiwan" },
    { value: "southkorea", label: "South Korea" },
    { value: "china", label: "China" },
    { value: "india", label: "India" },
    { value: "israel", label: "Israel" },
    { value: "australia", label: "Australia" },
    { value: "newzealand", label: "New Zealand" },
    { value: "unitedstates", label: "United States" },
    { value: "unitedkingdom", label: "United Kingdom" },
    { value: "other", label: "Other" },
  ];

  const formatCountryName = (countryValue: string) => {
    const country = countryOptions.find(c => c.value === countryValue);
    return country ? country.label : countryValue.charAt(0).toUpperCase() + countryValue.slice(1);
  };

  const formatFelicityCompany = (companyValue: string | null | undefined) => {
    switch (companyValue) {
      case "felicity-singapore": return "Felicity Singapore";
      case "felicity-japan": return "Felicity Japan";
      default: return "Felicity Singapore"; // Default fallback
    }
  };

  const formatFundName = (fundName: string) => {
    switch (fundName) {
      case "felicity-fund-i":
        return "Felicity Fund I";
      case "felicity-fund-ii":
        return "Felicity Fund II";
      case "felicity-fund-iii":
        return "Felicity Fund III";
      case "felicity-growth-fund":
        return "Felicity Growth Fund";
      case "felicity-secondary-fund":
        return "Felicity Secondary Fund";
      case "felicity-opportunity-fund":
        return "Felicity Opportunity Fund";
      default:
        return fundName;
    }
  };

  const getSectorFromIndustry = (industry: string): string => {
    // Map industries to GICS sectors
    const industryToSector: Record<string, string> = {
      'Technology': 'Information Technology',
      'Information Technologies': 'Information Technology',
      'Information Technology': 'Information Technology',
      'Software': 'Information Technology',
      'Internet': 'Information Technology',
      'Healthcare': 'Health Care',
      'Health Care': 'Health Care',
      'Medical': 'Health Care',
      'Pharmaceuticals': 'Health Care',
      'Biotechnology': 'Health Care',
      'Financial Services': 'Financials',
      'Financials': 'Financials',
      'Banking': 'Financials',
      'Insurance': 'Financials',
      'Real Estate': 'Real Estate',
      'Energy': 'Energy',
      'Renewable Energy': 'Energy',
      'Oil & Gas': 'Energy',
      'Materials': 'Materials',
      'Chemicals': 'Materials',
      'Construction': 'Materials',
      'Consumer Discretionary': 'Consumer Discretionary',
      'Consumer Goods': 'Consumer Discretionary',
      'Retail': 'Consumer Discretionary',
      'Automotive': 'Consumer Discretionary',
      'Consumer Staples': 'Consumer Staples',
      'Food & Beverages': 'Consumer Staples',
      'Food': 'Consumer Staples',
      'Beverages': 'Consumer Staples',
      'Industrials': 'Industrials',
      'Manufacturing': 'Industrials',
      'Transportation': 'Industrials',
      'Utilities': 'Utilities',
      'Telecommunications': 'Communication Services',
      'Media': 'Communication Services',
    };
    
    return industryToSector[industry] || 'Others';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminRoute allowPublicAccess={true}>
      <div className="min-h-screen bg-background">
        <Navigation
          language={language}
          onLanguageChange={setLanguage}
        />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-portfolio-title">
            Portfolio Companies
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8" data-testid="text-portfolio-subtitle">
            Our investment portfolio across various sectors and regions
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold">{portfolios?.length || 0}</div>
              <div className="text-blue-200">Portfolio Companies</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold">{countries.length}</div>
              <div className="text-blue-200">Countries</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold">{investmentTypes.length}</div>
              <div className="text-blue-200">Investment Types</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-portfolio-search"
              />
            </div>
            
            {/* Investment Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]" data-testid="select-investment-type">
                <SelectValue placeholder="Investment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {investmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getInvestmentTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Felicity Company Filter */}
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-[200px]" data-testid="select-felicity-company">
                <SelectValue placeholder="Felicity Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                <SelectItem value="felicity-singapore">Felicity Singapore</SelectItem>
                <SelectItem value="felicity-japan">Felicity Japan</SelectItem>
              </SelectContent>
            </Select>

            {/* Country Filter */}
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-[200px]" data-testid="select-country">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {formatCountryName(country)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPortfolios.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPortfolios.map((portfolio) => (
                <Card key={portfolio.id} className="hover:shadow-lg transition-shadow" data-testid={`card-portfolio-${portfolio.id}`}>
                  <CardHeader>
                    {/* Company Logo */}
                    {portfolio.logoUrl && portfolio.logoUrl.trim() !== "" && (
                      <div className={`mb-3 flex justify-center p-4 rounded-lg ${getLogoContainerClass((portfolio as any).logoDisplayMode)}`}>
                        <img 
                          src={portfolio.logoUrl} 
                          alt={`${portfolio.companyName} logo`}
                          className="h-20 w-auto object-contain max-w-full"
                          data-testid={`img-logo-${portfolio.id}`}
                        />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg" data-testid={`text-company-name-${portfolio.id}`}>
                        {language === 'jp' && portfolio.companyNameJa 
                          ? portfolio.companyNameJa 
                          : portfolio.companyName}
                      </CardTitle>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={getInvestmentTypeColor(portfolio.investmentType)} data-testid={`badge-investment-type-${portfolio.id}`}>
                          {getInvestmentTypeLabel(portfolio.investmentType)}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={
                            (portfolio as any).status === "exit"
                              ? "border-red-500 text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300 dark:border-red-400"
                              : "border-orange-500 text-orange-700 bg-orange-50 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-400"
                          }
                          data-testid={`badge-status-${portfolio.id}`}
                        >
                          {(portfolio as any).status === "exit" 
                            ? (language === "jp" ? "売却済み" : "Exit")
                            : (language === "jp" ? "継続中" : "Ongoing")
                          }
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2 mb-2">
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          <span data-testid={`text-industry-${portfolio.id}`}>{portfolio.industry}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span data-testid={`text-country-${portfolio.id}`}>
                            {formatCountryName(portfolio.country)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium" data-testid={`text-sector-${portfolio.id}`}>
                        {language === 'jp' ? 'セクター:' : 'Sector:'} {getSectorFromIndustry(portfolio.industry)}
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 font-medium" data-testid={`text-felicity-company-${portfolio.id}`}>
                      {formatFelicityCompany(portfolio.felicityCompany)}
                    </div>
                    {portfolio.fundName && (
                      <div className="text-xs text-green-600 font-medium mt-1" data-testid={`text-fund-name-${portfolio.id}`}>
                        {language === 'jp' ? 'ファンド: ' : 'Fund: '}{formatFundName(portfolio.fundName)}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {/* Company Description */}
                    {(portfolio.description || portfolio.descriptionJa) && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">
                          {language === 'jp' ? '会社説明' : 'Company Description'}
                        </p>
                        <p className="text-sm text-gray-600" data-testid={`text-description-${portfolio.id}`}>
                          {language === 'jp' && portfolio.descriptionJa 
                            ? portfolio.descriptionJa 
                            : portfolio.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Investment Year */}
                    {portfolio.investmentYear && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 font-medium mb-1">
                          {language === 'jp' ? '投資年' : 'Investment Year'}
                        </p>
                        <p className="text-sm text-gray-600" data-testid={`text-investment-year-${portfolio.id}`}>
                          {portfolio.investmentYear}
                        </p>
                      </div>
                    )}

                    {/* Website */}
                    {portfolio.website && (
                      <div className="flex items-center text-sm text-blue-600 mb-3">
                        <Globe className="h-4 w-4 mr-1" />
                        <a
                          href={portfolio.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                          data-testid={`link-website-${portfolio.id}`}
                        >
                          {language === 'jp' ? 'ウェブサイトを訪問' : 'Visit Website'}
                        </a>
                      </div>
                    )}

                    {/* Database Timestamps */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                        {portfolio.createdAt && (
                          <div data-testid={`text-created-at-${portfolio.id}`}>
                            <span className="font-medium">
                              {language === 'jp' ? '作成日:' : 'Created:'}
                            </span>
                            <br />
                            {new Date(portfolio.createdAt).toLocaleDateString(
                              language === 'jp' ? 'ja-JP' : 'en-US'
                            )}
                          </div>
                        )}
                        {portfolio.updatedAt && (
                          <div data-testid={`text-updated-at-${portfolio.id}`}>
                            <span className="font-medium">
                              {language === 'jp' ? '更新日:' : 'Updated:'}
                            </span>
                            <br />
                            {new Date(portfolio.updatedAt).toLocaleDateString(
                              language === 'jp' ? 'ja-JP' : 'en-US'
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Admin Controls */}
      {isAuthenticated && (user as any)?.role === "admin" && (
        <div className="fixed bottom-6 right-6">
          <Button 
            size="lg" 
            className="rounded-full shadow-lg" 
            data-testid="button-add-portfolio"
            onClick={() => window.location.href = `/portfolio-management?lang=${language}`}
          >
            <Plus className="h-5 w-5 mr-2" />
            {language === 'jp' ? 'ポートフォリオを追加' : 'Add Portfolio'}
          </Button>
        </div>
      )}
      
        <Footer language={language} />
      </div>
    </AdminRoute>
  );
}

export default PortfolioPage;