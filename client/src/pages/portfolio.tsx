import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation, type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Globe, MapPin, Search, Plus } from "lucide-react";
import type { Portfolio } from "@shared/schema";

function PortfolioPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const { user, isAuthenticated } = useAuth();
  const t = useTranslation(language);

  const { data: portfolios, isLoading } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
    retry: false,
  });

  // Get unique investment types and countries for filters
  const investmentTypes = Array.from(new Set(portfolios?.map(p => p.investmentType) || []));
  const countries = Array.from(new Set(portfolios?.map(p => p.country) || []));

  // Filter portfolios based on search and filters
  const filteredPortfolios = portfolios?.filter(portfolio => {
    const matchesSearch = portfolio.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portfolio.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || portfolio.investmentType === filterType;
    const matchesCountry = filterCountry === "all" || portfolio.country === filterCountry;
    const matchesCompany = filterCompany === "all" || portfolio.felicityCompany === filterCompany;
    
    return matchesSearch && matchesType && matchesCountry && matchesCompany;
  }) || [];

  const getInvestmentTypeColor = (type: string) => {
    switch (type) {
      case "buyout":
        return "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-400";
      case "growthequity":
        return "border-green-500 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300 dark:border-green-400";
      case "secondary":
        return "border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-400";
      default:
        return "border-gray-500 text-gray-700 bg-gray-50 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-400";
    }
  };

  const getInvestmentTypeLabel = (type: string) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === "en" ? "jp" : "en")}
          data-testid="button-language-toggle"
        >
          {language === "en" ? "日本語" : "English"}
        </Button>
      </div>

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
                    {country.charAt(0).toUpperCase() + country.slice(1)}
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
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg" data-testid={`text-company-name-${portfolio.id}`}>
                        {portfolio.companyName}
                      </CardTitle>
                      <Badge variant="outline" className={getInvestmentTypeColor(portfolio.investmentType)} data-testid={`badge-investment-type-${portfolio.id}`}>
                        {getInvestmentTypeLabel(portfolio.investmentType)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
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
                    <div className="text-xs text-blue-600 font-medium" data-testid={`text-felicity-company-${portfolio.id}`}>
                      {formatFelicityCompany(portfolio.felicityCompany)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {portfolio.businessDescription && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 font-medium mb-1">Business Focus</p>
                        <p className="text-sm text-gray-600" data-testid={`text-business-description-${portfolio.id}`}>
                          {portfolio.businessDescription}
                        </p>
                      </div>
                    )}
                    {portfolio.description && (
                      <p className="text-sm text-gray-600 mb-4" data-testid={`text-description-${portfolio.id}`}>
                        {portfolio.description}
                      </p>
                    )}
                    {portfolio.website && (
                      <div className="flex items-center text-sm text-blue-600">
                        <Globe className="h-4 w-4 mr-1" />
                        <a
                          href={portfolio.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                          data-testid={`link-website-${portfolio.id}`}
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    {portfolio.succession && (
                      <Badge variant="outline" className="mt-2" data-testid={`badge-succession-${portfolio.id}`}>
                        Business Succession
                      </Badge>
                    )}
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
          <Button size="lg" className="rounded-full shadow-lg" data-testid="button-add-portfolio">
            <Plus className="h-5 w-5 mr-2" />
            Add Portfolio
          </Button>
        </div>
      )}
    </div>
  );
}

export default PortfolioPage;