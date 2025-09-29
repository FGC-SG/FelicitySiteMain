import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Building2, Plus, Pencil, Trash2, Search, Filter, Download, Upload, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Portfolio, type Fund } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { gicsData } from '../data/gics-data';

const portfolioFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyNameJa: z.string().optional().or(z.literal("")),
  felicityCompany: z.enum(["felicity-singapore", "felicity-japan"]),
  fundName: z.string().optional().or(z.literal("")),
  industry: z.string().min(1, "Industry is required"),
  investmentType: z.enum(["buyout", "growthequity", "secondary"]),
  country: z.string().min(1, "Country is required"),
  investmentYear: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "Investment year must be in MM/YYYY format").optional().or(z.literal("")),
  status: z.enum(["ongoing", "exit"]).default("ongoing"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().min(10, "Description must be at least 10 characters"),
  descriptionJa: z.string().optional().or(z.literal("")),
});

type PortfolioFormData = z.infer<typeof portfolioFormSchema>;

export default function PortfolioManagementPage() {
  // Check for language parameter in URL, otherwise default to 'en'
  const urlParams = new URLSearchParams(window.location.search);
  const urlLanguage = urlParams.get('lang') as Language;
  const [language, setLanguage] = useState<Language>(urlLanguage === 'jp' ? 'jp' : 'en');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [gicsSearchTerm, setGicsSearchTerm] = useState<string>("");
  const [showGicsSearch, setShowGicsSearch] = useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete all portfolios mutation
  const deleteAllPortfoliosMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/portfolios');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios'] });
      toast({
        title: language === "en" ? "Success" : "成功",
        description: language === "en" ? "All portfolios have been deleted successfully" : "すべてのポートフォリオが正常に削除されました",
      });
    },
    onError: (error) => {
      console.error('Error deleting all portfolios:', error);
      toast({
        variant: "destructive",
        title: language === "en" ? "Error" : "エラー",
        description: language === "en" ? "Failed to delete all portfolios" : "すべてのポートフォリオの削除に失敗しました",
      });
    },
  });

  const handleDeleteAllPortfolios = () => {
    deleteAllPortfoliosMutation.mutate();
  };

  const handleExportPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolios/export', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to export portfolio data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `felicity-portfolio-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: language === 'jp' ? "エクスポート成功" : "Export Successful",
        description: language === 'jp' ? "ポートフォリオデータがExcelファイルにエクスポートされました。" : "Portfolio data has been exported to Excel file.",
      });
    } catch (error) {
      console.error('Error exporting portfolio:', error);
      toast({
        title: language === 'jp' ? "エクスポート失敗" : "Export Failed",
        description: language === 'jp' ? "ポートフォリオデータのエクスポートに失敗しました。再度お試しください。" : "Failed to export portfolio data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportTemplate = async () => {
    try {
      const response = await fetch('/api/portfolios/export-template', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to export template');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `felicity-portfolio-template-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: language === 'jp' ? "テンプレートエクスポート成功" : "Template Export Successful",
        description: language === 'jp' ? "ポートフォリオテンプレートがExcelファイルにエクスポートされました。" : "Portfolio template has been exported to Excel file.",
      });
    } catch (error) {
      console.error('Error exporting template:', error);
      toast({
        title: language === 'jp' ? "テンプレートエクスポート失敗" : "Template Export Failed",
        description: language === 'jp' ? "ポートフォリオテンプレートのエクスポートに失敗しました。再度お試しください。" : "Failed to export portfolio template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: language === 'jp' ? "ファイル形式エラー" : "Invalid File Type",
        description: language === 'jp' ? "Excel (.xlsx, .xls) またはCSV (.csv) ファイルを選択してください。" : "Please select an Excel (.xlsx, .xls) or CSV (.csv) file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/portfolios/import', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error messages from server
        toast({
          title: language === 'jp' ? "インポート失敗" : "Import Failed",
          description: result.message || (language === 'jp' ? "ポートフォリオデータのインポートに失敗しました。" : "Failed to import portfolio data."),
          variant: "destructive",
        });
        return;
      }
      
      // Handle successful import with possible errors
      const hasErrors = result.errors && result.errors.length > 0;
      const successMessage = language === 'jp' ? 
        `${result.imported}件のポートフォリオ企業をインポートしました。` : 
        `Successfully imported ${result.imported} portfolio companies.`;
      
      const errorMessage = hasErrors ? 
        (language === 'jp' ? 
          `${result.errors.length}件のエラーがありました。` : 
          `${result.errors.length} errors occurred.`) : '';

      toast({
        title: language === 'jp' ? "インポート完了" : "Import Complete",
        description: `${successMessage} ${errorMessage}`,
        variant: hasErrors ? "destructive" : "default",
      });

      // Show detailed errors if present
      if (hasErrors && result.errors.length <= 5) {
        // Show first 5 errors
        result.errors.forEach((error: string, index: number) => {
          setTimeout(() => {
            toast({
              title: language === 'jp' ? `エラー ${index + 1}` : `Error ${index + 1}`,
              description: error,
              variant: "destructive",
            });
          }, 1000 * (index + 1));
        });
      } else if (hasErrors) {
        toast({
          title: language === 'jp' ? "詳細エラー" : "Additional Errors",
          description: language === 'jp' ? 
            `合計${result.errors.length}件のエラーがありました。詳細についてはコンソールをご確認ください。` :
            `Total of ${result.errors.length} errors occurred. Check console for details.`,
          variant: "destructive",
        });
        console.error('Import errors:', result.errors);
      }

      // Refresh the portfolio list
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios'] });
    } catch (error) {
      console.error('Error importing portfolio:', error);
      toast({
        title: language === 'jp' ? "インポート失敗" : "Import Failed",
        description: language === 'jp' ? "ネットワークエラーまたはサーバーエラーが発生しました。" : "Network or server error occurred.",
        variant: "destructive",
      });
    }

    // Reset the input
    event.target.value = '';
  };

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      companyName: "",
      companyNameJa: "",
      felicityCompany: "felicity-singapore",
      fundName: "",
      industry: "",
      investmentType: "growthequity",
      country: "",
      investmentYear: "",
      status: "ongoing",
      website: "",
      description: "",
      descriptionJa: "",
    },
  });

  // Fetch portfolio companies
  const { data: portfolios, isLoading: portfoliosLoading } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
    enabled: isAuthenticated,
  });

  // Fetch funds for fund name selection
  const { data: funds = [] } = useQuery<Fund[]>({
    queryKey: ["/api/funds"],
    enabled: isAuthenticated,
  });

  // Add portfolio mutation
  const addPortfolioMutation = useMutation({
    mutationFn: async (data: PortfolioFormData) => {
      const response = await apiRequest("POST", "/api/portfolios", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      toast({
        title: "Success",
        description: "Portfolio company added successfully!",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add portfolio company",
        variant: "destructive",
      });
    },
  });

  // Update portfolio mutation
  const updatePortfolioMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PortfolioFormData }) => {
      const response = await apiRequest("PUT", `/api/portfolios/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      toast({
        title: "Success",
        description: "Portfolio company updated successfully!",
      });
      setEditingPortfolio(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update portfolio company",
        variant: "destructive",
      });
    },
  });

  // Delete portfolio mutation
  const deletePortfolioMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/portfolios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      toast({
        title: "Success",
        description: "Portfolio company deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete portfolio company",
        variant: "destructive",
      });
    },
  });

  // Toggle portfolio visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      apiRequest('PUT', `/api/portfolios/${id}`, { isVisible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios'] });
      toast({
        title: language === 'en' ? "Visibility updated" : "表示設定が更新されました",
        description: language === 'en' ? "Portfolio visibility has been successfully updated." : "ポートフォリオの表示設定が正常に更新されました。",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'en' ? "Error" : "エラー",
        description: error.message || (language === 'en' ? "Failed to update visibility." : "表示設定の更新に失敗しました。"),
        variant: "destructive",
      });
    },
  });

  const handleToggleVisibility = (id: string, currentVisibility: boolean) => {
    toggleVisibilityMutation.mutate({ id, isVisible: !currentVisibility });
  };

  // Filter and sort portfolios
  const filteredPortfolios = portfolios?.filter(portfolio => {
    const matchesSearch = portfolio.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portfolio.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || portfolio.investmentType === filterType;
    const matchesCountry = filterCountry === "all" || portfolio.country === filterCountry;
    const matchesCompany = filterCompany === "all" || portfolio.felicityCompany === filterCompany;
    
    return matchesSearch && matchesType && matchesCountry && matchesCompany;
  })?.sort((a, b) => {
    // Sort by fund name (handle cases where fundName might be null/undefined)
    const fundA = (a.fundName || '').toLowerCase();
    const fundB = (b.fundName || '').toLowerCase();
    return fundA.localeCompare(fundB);
  });

  // Get unique values for filters - only valid investment types
  const validInvestmentTypes = ["buyout", "growthequity", "secondary"];
  const investmentTypes = validInvestmentTypes.filter(type => 
    portfolios?.some(p => p.investmentType === type) || false
  );
  const countries = Array.from(new Set(portfolios?.map(p => p.country) || []));

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Access Required",
        description: "Please log in to access portfolio management.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleEdit = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    form.reset({
      companyName: portfolio.companyName,
      companyNameJa: portfolio.companyNameJa ?? "",
      felicityCompany: (portfolio.felicityCompany ?? "felicity-singapore") as "felicity-singapore" | "felicity-japan",
      fundName: portfolio.fundName ?? "",
      industry: portfolio.industry,
      investmentType: portfolio.investmentType as "buyout" | "growthequity" | "secondary",
      country: portfolio.country,
      investmentYear: portfolio.investmentYear ?? "",
      status: (portfolio as any).status ?? "ongoing",
      website: portfolio.website ?? "",
      description: portfolio.description ?? "",
      descriptionJa: portfolio.descriptionJa ?? "",
    });
    // Initialize GICS selections based on the existing industry
    initializeGicsFromIndustry(portfolio.industry);
  };

  // Reset GICS selections when creating new portfolio
  const handleCreateNew = () => {
    setIsAddDialogOpen(true);
    setEditingPortfolio(null);
    form.reset({
      companyName: "",
      companyNameJa: "",
      felicityCompany: "felicity-singapore",
      fundName: "",
      industry: "",
      investmentType: "growthequity",
      country: "",
      investmentYear: "",
      website: "",

      description: "",
      descriptionJa: "",
    });
    setSelectedSector("");
    setSelectedIndustryGroup("");
    setSelectedIndustry("");
    setSelectedSubIndustry("");
  };

  const handleSubmit = (data: PortfolioFormData) => {
    if (editingPortfolio) {
      updatePortfolioMutation.mutate({ id: editingPortfolio.id, data });
    } else {
      addPortfolioMutation.mutate(data);
    }
  };

  // Standardized country list based on portfolio companies and major Asian markets
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

  const formatInvestmentType = (type: string) => {
    if (language === 'jp') {
      switch (type) {
        case "buyout": return "バイアウト";
        case "growthequity": return "グロース・エクイティ";
        case "secondary": return "セカンダリー";
        default: return type;
      }
    } else {
      switch (type) {
        case "buyout": return "Buyout";
        case "growthequity": return "Growth Equity";
        case "secondary": return "Secondary";
        default: return type;
      }
    }
  };

  // GICS Search functionality
  const searchGicsData = (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];
    
    const term = searchTerm.toLowerCase();
    const results: Array<{
      type: string;
      path: string;
      value: string;
      sector: string;
      industryGroup?: string;
      industry?: string;
      subIndustry?: string;
    }> = [];

    // Search through all GICS data
    Object.entries(gicsData).forEach(([sectorKey, sector]) => {
      // Check sector name
      if (sector.label.toLowerCase().includes(term)) {
        results.push({
          type: 'sector',
          path: sector.label,
          value: sector.label,
          sector: sectorKey
        });
      }

      // Check industry groups
      Object.entries(sector.industryGroups).forEach(([groupKey, group]) => {
        if (group.label.toLowerCase().includes(term)) {
          results.push({
            type: 'industryGroup',
            path: `${sector.label} → ${group.label}`,
            value: group.label,
            sector: sectorKey,
            industryGroup: groupKey
          });
        }

        // Check industries
        Object.entries(group.industries).forEach(([industryKey, industry]) => {
          if (industry.label.toLowerCase().includes(term)) {
            results.push({
              type: 'industry',
              path: `${sector.label} → ${group.label} → ${industry.label}`,
              value: industry.label,
              sector: sectorKey,
              industryGroup: groupKey,
              industry: industryKey
            });
          }

          // Check sub-industries
          industry.subIndustries.forEach((subIndustry) => {
            if (subIndustry.label.toLowerCase().includes(term)) {
              results.push({
                type: 'subIndustry',
                path: `${sector.label} → ${group.label} → ${industry.label} → ${subIndustry.label}`,
                value: subIndustry.label,
                sector: sectorKey,
                industryGroup: groupKey,
                industry: industryKey,
                subIndustry: subIndustry.value
              });
            }
          });
        });
      });
    });

    return results.slice(0, 20); // Limit results
  };

  const handleGicsSelection = (result: any) => {
    // Set the GICS selections based on the selected result
    setSelectedSector(result.sector || "");
    setSelectedIndustryGroup(result.industryGroup || "");
    setSelectedIndustry(result.industry || "");
    setSelectedSubIndustry(result.subIndustry || "");
    
    // Set the industry field in the form
    form.setValue('industry', result.value);
    
    // Close the search
    setGicsSearchTerm("");
    setShowGicsSearch(false);
  };

  // Legacy GICS data (now unused but kept for reference)
  const legacyGicsData: Record<string, any> = {
    "energy": {
      label: "Energy",
      industryGroups: {
        "energy-equipment-services": {
          label: "Energy Equipment & Services",
          industries: {
            "energy-equipment-services": {
              label: "Energy Equipment & Services",
              subIndustries: [
                { value: "oil-gas-drilling", label: "Oil & Gas Drilling" },
                { value: "oil-gas-equipment", label: "Oil & Gas Equipment & Services" }
              ]
            }
          }
        },
        "oil-gas-consumable-fuels": {
          label: "Oil, Gas & Consumable Fuels",
          industries: {
            "oil-gas-consumable-fuels": {
              label: "Oil, Gas & Consumable Fuels",
              subIndustries: [
                { value: "integrated-oil-gas", label: "Integrated Oil & Gas" },
                { value: "oil-gas-exploration-production", label: "Oil & Gas Exploration & Production" },
                { value: "oil-gas-refining-marketing", label: "Oil & Gas Refining & Marketing" },
                { value: "oil-gas-storage-transportation", label: "Oil & Gas Storage & Transportation" },
                { value: "coal-consumable-fuels", label: "Coal & Consumable Fuels" }
              ]
            }
          }
        }
      }
    },
    "materials": {
      label: "Materials",
      industryGroups: {
        "chemicals": {
          label: "Chemicals",
          industries: {
            "chemicals": {
              label: "Chemicals",
              subIndustries: [
                { value: "commodity-chemicals", label: "Commodity Chemicals" },
                { value: "diversified-chemicals", label: "Diversified Chemicals" },
                { value: "fertilizers-agricultural-chemicals", label: "Fertilizers & Agricultural Chemicals" },
                { value: "industrial-gases", label: "Industrial Gases" },
                { value: "specialty-chemicals", label: "Specialty Chemicals" }
              ]
            }
          }
        },
        "construction-materials": {
          label: "Construction Materials",
          industries: {
            "construction-materials": {
              label: "Construction Materials",
              subIndustries: [
                { value: "construction-materials", label: "Construction Materials" }
              ]
            }
          }
        },
        "containers-packaging": {
          label: "Containers & Packaging",
          industries: {
            "containers-packaging": {
              label: "Containers & Packaging",
              subIndustries: [
                { value: "metal-glass-containers", label: "Metal & Glass Containers" },
                { value: "paper-packaging", label: "Paper Packaging" }
              ]
            }
          }
        },
        "metals-mining": {
          label: "Metals & Mining",
          industries: {
            "metals-mining": {
              label: "Metals & Mining",
              subIndustries: [
                { value: "aluminum", label: "Aluminum" },
                { value: "diversified-metals-mining", label: "Diversified Metals & Mining" },
                { value: "copper", label: "Copper" },
                { value: "gold", label: "Gold" },
                { value: "precious-metals-minerals", label: "Precious Metals & Minerals" },
                { value: "silver", label: "Silver" },
                { value: "steel", label: "Steel" }
              ]
            }
          }
        },
        "paper-forest-products": {
          label: "Paper & Forest Products",
          industries: {
            "forest-products": {
              label: "Forest Products",
              subIndustries: [
                { value: "forest-products", label: "Forest Products" }
              ]
            },
            "paper-products": {
              label: "Paper Products",
              subIndustries: [
                { value: "paper-products", label: "Paper Products" }
              ]
            }
          }
        }
      }
    },
    "industrials": {
      label: "Industrials",
      industryGroups: {
        "aerospace-defense": {
          label: "Aerospace & Defense",
          industries: {
            "aerospace-defense": {
              label: "Aerospace & Defense",
              subIndustries: [
                { value: "aerospace-defense", label: "Aerospace & Defense" }
              ]
            }
          }
        },
        "building-products": {
          label: "Building Products",
          industries: {
            "building-products": {
              label: "Building Products",
              subIndustries: [
                { value: "building-products", label: "Building Products" }
              ]
            }
          }
        },
        "construction-engineering": {
          label: "Construction & Engineering",
          industries: {
            "construction-engineering": {
              label: "Construction & Engineering",
              subIndustries: [
                { value: "construction-engineering", label: "Construction & Engineering" }
              ]
            }
          }
        },
        "electrical-equipment": {
          label: "Electrical Equipment",
          industries: {
            "electrical-equipment": {
              label: "Electrical Equipment",
              subIndustries: [
                { value: "electrical-components-equipment", label: "Electrical Components & Equipment" },
                { value: "heavy-electrical-equipment", label: "Heavy Electrical Equipment" }
              ]
            }
          }
        },
        "industrial-conglomerates": {
          label: "Industrial Conglomerates",
          industries: {
            "industrial-conglomerates": {
              label: "Industrial Conglomerates",
              subIndustries: [
                { value: "industrial-conglomerates", label: "Industrial Conglomerates" }
              ]
            }
          }
        },
        "machinery": {
          label: "Machinery",
          industries: {
            "machinery": {
              label: "Machinery",
              subIndustries: [
                { value: "construction-farm-machinery-heavy-trucks", label: "Construction & Farm Machinery & Heavy Trucks" },
                { value: "industrial-machinery", label: "Industrial Machinery" }
              ]
            }
          }
        },
        "road-rail": {
          label: "Road & Rail",
          industries: {
            "road-rail": {
              label: "Road & Rail",
              subIndustries: [
                { value: "railroads", label: "Railroads" },
                { value: "trucking", label: "Trucking" }
              ]
            }
          }
        },
        "transportation-infrastructure": {
          label: "Transportation Infrastructure",
          industries: {
            "airport-services": {
              label: "Airport Services",
              subIndustries: [
                { value: "airport-services", label: "Airport Services" }
              ]
            },
            "highways-railtracks": {
              label: "Highways & Railtracks",
              subIndustries: [
                { value: "highways-railtracks", label: "Highways & Railtracks" }
              ]
            },
            "marine-ports-services": {
              label: "Marine Ports & Services",
              subIndustries: [
                { value: "marine-ports-services", label: "Marine Ports & Services" }
              ]
            }
          }
        }
      }
    },
    "consumer-discretionary": {
      label: "Consumer Discretionary",
      industryGroups: {
        "automobiles-components": {
          label: "Automobiles & Components",
          industries: {
            "auto-components": {
              label: "Auto Components",
              subIndustries: [
                { value: "auto-parts-equipment", label: "Auto Parts & Equipment" },
                { value: "tires-rubber", label: "Tires & Rubber" }
              ]
            },
            "automobiles": {
              label: "Automobiles",
              subIndustries: [
                { value: "automobile-manufacturers", label: "Automobile Manufacturers" },
                { value: "motorcycle-manufacturers", label: "Motorcycle Manufacturers" }
              ]
            }
          }
        },
        "consumer-durables-apparel": {
          label: "Consumer Durables & Apparel",
          industries: {
            "household-durables": {
              label: "Household Durables",
              subIndustries: [
                { value: "consumer-electronics", label: "Consumer Electronics" },
                { value: "home-furnishings", label: "Home Furnishings" },
                { value: "homebuilding", label: "Homebuilding" },
                { value: "household-appliances", label: "Household Appliances" },
                { value: "housewares-specialties", label: "Housewares & Specialties" }
              ]
            },
            "leisure-products": {
              label: "Leisure Products",
              subIndustries: [
                { value: "leisure-products", label: "Leisure Products" }
              ]
            },
            "textiles-apparel-luxury-goods": {
              label: "Textiles, Apparel & Luxury Goods",
              subIndustries: [
                { value: "apparel-accessories-luxury-goods", label: "Apparel, Accessories & Luxury Goods" },
                { value: "footwear", label: "Footwear" },
                { value: "textiles", label: "Textiles" }
              ]
            }
          }
        },
        "consumer-services": {
          label: "Consumer Services",
          industries: {
            "diversified-consumer-services": {
              label: "Diversified Consumer Services",
              subIndustries: [
                { value: "education-services", label: "Education Services" },
                { value: "specialized-consumer-services", label: "Specialized Consumer Services" }
              ]
            },
            "hotels-restaurants-leisure": {
              label: "Hotels, Restaurants & Leisure",
              subIndustries: [
                { value: "casinos-gaming", label: "Casinos & Gaming" },
                { value: "hotels-resorts-cruise-lines", label: "Hotels, Resorts & Cruise Lines" },
                { value: "leisure-facilities", label: "Leisure Facilities" },
                { value: "restaurants", label: "Restaurants" }
              ]
            }
          }
        },
        "media-entertainment": {
          label: "Media & Entertainment",
          industries: {
            "media-entertainment": {
              label: "Media & Entertainment",
              subIndustries: [
                { value: "advertising", label: "Advertising" },
                { value: "broadcasting", label: "Broadcasting" },
                { value: "cable-satellite", label: "Cable & Satellite" },
                { value: "publishing", label: "Publishing" },
                { value: "movies-entertainment", label: "Movies & Entertainment" }
              ]
            }
          }
        },
        "retailing": {
          label: "Retailing",
          industries: {
            "distributors": {
              label: "Distributors",
              subIndustries: [
                { value: "distributors", label: "Distributors" }
              ]
            },
            "internet-direct-marketing-retail": {
              label: "Internet & Direct Marketing Retail",
              subIndustries: [
                { value: "internet-direct-marketing-retail", label: "Internet & Direct Marketing Retail" }
              ]
            },
            "multiline-retail": {
              label: "Multiline Retail",
              subIndustries: [
                { value: "department-stores", label: "Department Stores" },
                { value: "general-merchandise-stores", label: "General Merchandise Stores" }
              ]
            },
            "specialty-retail": {
              label: "Specialty Retail",
              subIndustries: [
                { value: "apparel-retail", label: "Apparel Retail" },
                { value: "automotive-retail", label: "Automotive Retail" },
                { value: "computer-electronics-retail", label: "Computer & Electronics Retail" },
                { value: "home-improvement-retail", label: "Home Improvement Retail" },
                { value: "other-specialty-retail", label: "Other Specialty Retail" }
              ]
            }
          }
        }
      }
    },
    "consumer-staples": {
      label: "Consumer Staples",
      industryGroups: {
        "food-staples-retailing": {
          label: "Food & Staples Retailing",
          industries: {
            "food-staples-retailing": {
              label: "Food & Staples Retailing",
              subIndustries: [
                { value: "drug-retail", label: "Drug Retail" },
                { value: "food-distributors", label: "Food Distributors" },
                { value: "food-retail", label: "Food Retail" },
                { value: "hypermarkets-super-centers", label: "Hypermarkets & Super Centers" }
              ]
            }
          }
        },
        "food-beverage-tobacco": {
          label: "Food, Beverage & Tobacco",
          industries: {
            "beverages": {
              label: "Beverages",
              subIndustries: [
                { value: "brewers", label: "Brewers" },
                { value: "distillers-vintners", label: "Distillers & Vintners" },
                { value: "soft-drinks", label: "Soft Drinks" }
              ]
            },
            "food-products": {
              label: "Food Products",
              subIndustries: [
                { value: "agricultural-products", label: "Agricultural Products" },
                { value: "packaged-foods-meats", label: "Packaged Foods & Meats" }
              ]
            },
            "tobacco": {
              label: "Tobacco",
              subIndustries: [
                { value: "tobacco", label: "Tobacco" }
              ]
            }
          }
        },
        "household-personal-products": {
          label: "Household & Personal Products",
          industries: {
            "household-products": {
              label: "Household Products",
              subIndustries: [
                { value: "household-products", label: "Household Products" }
              ]
            },
            "personal-products": {
              label: "Personal Products",
              subIndustries: [
                { value: "personal-products", label: "Personal Products" }
              ]
            }
          }
        }
      }
    },
    "health-care": {
      label: "Health Care",
      industryGroups: {
        "health-care-equipment-services": {
          label: "Health Care Equipment & Services",
          industries: {
            "health-care-equipment-supplies": {
              label: "Health Care Equipment & Supplies",
              subIndustries: [
                { value: "health-care-equipment", label: "Health Care Equipment" },
                { value: "health-care-supplies", label: "Health Care Supplies" }
              ]
            },
            "health-care-providers-services": {
              label: "Health Care Providers & Services",
              subIndustries: [
                { value: "health-care-distributors", label: "Health Care Distributors" },
                { value: "health-care-facilities", label: "Health Care Facilities" },
                { value: "managed-health-care", label: "Managed Health Care" },
                { value: "health-care-services", label: "Health Care Services" }
              ]
            },
            "health-care-technology": {
              label: "Health Care Technology",
              subIndustries: [
                { value: "health-care-technology", label: "Health Care Technology" }
              ]
            }
          }
        },
        "pharmaceuticals-biotechnology-life-sciences": {
          label: "Pharmaceuticals, Biotechnology & Life Sciences",
          industries: {
            "biotechnology": {
              label: "Biotechnology",
              subIndustries: [
                { value: "biotechnology", label: "Biotechnology" }
              ]
            },
            "pharmaceuticals": {
              label: "Pharmaceuticals",
              subIndustries: [
                { value: "pharmaceuticals", label: "Pharmaceuticals" }
              ]
            },
            "life-sciences-tools-services": {
              label: "Life Sciences Tools & Services",
              subIndustries: [
                { value: "life-sciences-tools-services", label: "Life Sciences Tools & Services" }
              ]
            }
          }
        }
      }
    },
    "financials": {
      label: "Financials",
      industryGroups: {
        "banks": {
          label: "Banks",
          industries: {
            "banks": {
              label: "Banks",
              subIndustries: [
                { value: "diversified-banks", label: "Diversified Banks" },
                { value: "regional-banks", label: "Regional Banks" },
                { value: "thrifts-mortgage-finance", label: "Thrifts & Mortgage Finance" }
              ]
            }
          }
        },
        "diversified-financials": {
          label: "Diversified Financials",
          industries: {
            "diversified-financial-services": {
              label: "Diversified Financial Services",
              subIndustries: [
                { value: "diversified-financial-services", label: "Diversified Financial Services" },
                { value: "multi-sector-holdings", label: "Multi-Sector Holdings" },
                { value: "specialized-finance", label: "Specialized Finance" }
              ]
            },
            "consumer-finance": {
              label: "Consumer Finance",
              subIndustries: [
                { value: "consumer-finance", label: "Consumer Finance" }
              ]
            },
            "capital-markets": {
              label: "Capital Markets",
              subIndustries: [
                { value: "asset-management-custody-banks", label: "Asset Management & Custody Banks" },
                { value: "investment-banking-brokerage", label: "Investment Banking & Brokerage" },
                { value: "diversified-capital-markets", label: "Diversified Capital Markets" },
                { value: "financial-exchanges-data", label: "Financial Exchanges & Data" }
              ]
            },
            "mortgage-reits": {
              label: "Mortgage REITs",
              subIndustries: [
                { value: "mortgage-reits", label: "Mortgage REITs" }
              ]
            }
          }
        },
        "insurance": {
          label: "Insurance",
          industries: {
            "insurance": {
              label: "Insurance",
              subIndustries: [
                { value: "insurance-brokers", label: "Insurance Brokers" },
                { value: "life-health-insurance", label: "Life & Health Insurance" },
                { value: "multi-line-insurance", label: "Multi-line Insurance" },
                { value: "property-casualty-insurance", label: "Property & Casualty Insurance" },
                { value: "reinsurance", label: "Reinsurance" }
              ]
            }
          }
        }
      }
    },
    "information-technology": {
      label: "Information Technology",
      industryGroups: {
        "software-services": {
          label: "Software & Services",
          industries: {
            "internet-software-services": {
              label: "Internet Software & Services",
              subIndustries: [
                { value: "internet-software-services", label: "Internet Software & Services" }
              ]
            },
            "it-services": {
              label: "IT Services",
              subIndustries: [
                { value: "data-processing-outsourced-services", label: "Data Processing & Outsourced Services" },
                { value: "it-consulting-services", label: "IT Consulting & Services" }
              ]
            },
            "software": {
              label: "Software",
              subIndustries: [
                { value: "application-software", label: "Application Software" },
                { value: "systems-software", label: "Systems Software" }
              ]
            }
          }
        },
        "technology-hardware-equipment": {
          label: "Technology Hardware & Equipment",
          industries: {
            "communications-equipment": {
              label: "Communications Equipment",
              subIndustries: [
                { value: "communications-equipment", label: "Communications Equipment" }
              ]
            },
            "computers-peripherals": {
              label: "Computers & Peripherals",
              subIndustries: [
                { value: "computer-hardware", label: "Computer Hardware" },
                { value: "computer-storage-peripherals", label: "Computer Storage & Peripherals" }
              ]
            },
            "electronic-equipment-instruments": {
              label: "Electronic Equipment, Instruments & Components",
              subIndustries: [
                { value: "electronic-equipment-instruments", label: "Electronic Equipment & Instruments" },
                { value: "electronic-components", label: "Electronic Components" },
                { value: "electronic-manufacturing-services", label: "Electronic Manufacturing Services" },
                { value: "technology-distributors", label: "Technology Distributors" }
              ]
            }
          }
        },
        "semiconductors-equipment": {
          label: "Semiconductors & Semiconductor Equipment",
          industries: {
            "semiconductors-equipment": {
              label: "Semiconductors & Semiconductor Equipment",
              subIndustries: [
                { value: "semiconductor-equipment", label: "Semiconductor Equipment" },
                { value: "semiconductors", label: "Semiconductors" }
              ]
            }
          }
        }
      }
    },
    "communication-services": {
      label: "Communication Services",
      industryGroups: {
        "telecommunication-services": {
          label: "Telecommunication Services",
          industries: {
            "diversified-telecommunication-services": {
              label: "Diversified Telecommunication Services",
              subIndustries: [
                { value: "alternative-carriers", label: "Alternative Carriers" },
                { value: "integrated-telecommunication-services", label: "Integrated Telecommunication Services" }
              ]
            },
            "wireless-telecommunication-services": {
              label: "Wireless Telecommunication Services",
              subIndustries: [
                { value: "wireless-telecommunication-services", label: "Wireless Telecommunication Services" }
              ]
            }
          }
        }
      }
    },
    "utilities": {
      label: "Utilities",
      industryGroups: {
        "utilities": {
          label: "Utilities",
          industries: {
            "electric-utilities": {
              label: "Electric Utilities",
              subIndustries: [
                { value: "electric-utilities", label: "Electric Utilities" }
              ]
            },
            "gas-utilities": {
              label: "Gas Utilities",
              subIndustries: [
                { value: "gas-utilities", label: "Gas Utilities" }
              ]
            },
            "multi-utilities": {
              label: "Multi-Utilities",
              subIndustries: [
                { value: "multi-utilities", label: "Multi-Utilities" }
              ]
            },
            "water-utilities": {
              label: "Water Utilities",
              subIndustries: [
                { value: "water-utilities", label: "Water Utilities" }
              ]
            },
            "independent-power-renewable-electricity": {
              label: "Independent Power and Renewable Electricity Producers",
              subIndustries: [
                { value: "independent-power-producers", label: "Independent Power Producers & Energy Traders" },
                { value: "renewable-electricity", label: "Renewable Electricity" }
              ]
            }
          }
        }
      }
    },
    "real-estate": {
      label: "Real Estate",
      industryGroups: {
        "equity-reits": {
          label: "Equity Real Estate Investment Trusts (REITs)",
          industries: {
            "diversified-reits": {
              label: "Diversified REITs",
              subIndustries: [
                { value: "diversified-reits", label: "Diversified REITs" }
              ]
            },
            "industrial-reits": {
              label: "Industrial REITs",
              subIndustries: [
                { value: "industrial-reits", label: "Industrial REITs" }
              ]
            },
            "hotel-resort-reits": {
              label: "Hotel & Resort REITs",
              subIndustries: [
                { value: "hotel-resort-reits", label: "Hotel & Resort REITs" }
              ]
            },
            "office-reits": {
              label: "Office REITs",
              subIndustries: [
                { value: "office-reits", label: "Office REITs" }
              ]
            },
            "health-care-reits": {
              label: "Health Care REITs",
              subIndustries: [
                { value: "health-care-reits", label: "Health Care REITs" }
              ]
            },
            "residential-reits": {
              label: "Residential REITs",
              subIndustries: [
                { value: "residential-reits", label: "Residential REITs" }
              ]
            },
            "retail-reits": {
              label: "Retail REITs",
              subIndustries: [
                { value: "retail-reits", label: "Retail REITs" }
              ]
            },
            "specialized-reits": {
              label: "Specialized REITs",
              subIndustries: [
                { value: "specialized-reits", label: "Specialized REITs" }
              ]
            }
          }
        },
        "real-estate-management-development": {
          label: "Real Estate Management & Development",
          industries: {
            "real-estate-operating-companies": {
              label: "Real Estate Operating Companies",
              subIndustries: [
                { value: "diversified-real-estate-activities", label: "Diversified Real Estate Activities" },
                { value: "real-estate-development", label: "Real Estate Development" },
                { value: "real-estate-services", label: "Real Estate Services" }
              ]
            }
          }
        }
      }
    }
  };

  // State for GICS selection
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedIndustryGroup, setSelectedIndustryGroup] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string>("");

  // Reset downstream selections when higher level changes
  const handleSectorChange = (sectorValue: string) => {
    setSelectedSector(sectorValue);
    setSelectedIndustryGroup("");
    setSelectedIndustry("");
    setSelectedSubIndustry("");
    form.setValue("industry", "");
  };

  const handleIndustryGroupChange = (groupValue: string) => {
    setSelectedIndustryGroup(groupValue);
    setSelectedIndustry("");
    setSelectedSubIndustry("");
    form.setValue("industry", "");
  };

  const handleIndustryChange = (industryValue: string) => {
    setSelectedIndustry(industryValue);
    setSelectedSubIndustry("");
    form.setValue("industry", "");
  };

  const handleSubIndustryChange = (subIndustryValue: string) => {
    setSelectedSubIndustry(subIndustryValue);
    const selectedSubIndustryData = getSelectedSubIndustryData(subIndustryValue);
    if (selectedSubIndustryData) {
      form.setValue("industry", selectedSubIndustryData.label);
    }
  };

  const getSelectedSubIndustryData = (subIndustryValue: string) => {
    for (const sector of Object.values(gicsData)) {
      for (const industryGroup of Object.values(sector.industryGroups) as any[]) {
        for (const industry of Object.values(industryGroup.industries) as any[]) {
          const found = industry.subIndustries?.find((sub: { value: string; label: string }) => sub.value === subIndustryValue);
          if (found) return found;
        }
      }
    }
    return null;
  };

  // Initialize GICS selections when editing
  const initializeGicsFromIndustry = (industryLabel: string) => {
    for (const [sectorKey, sector] of Object.entries(gicsData)) {
      for (const [groupKey, industryGroup] of Object.entries(sector.industryGroups) as [string, any][]) {
        for (const [industryKey, industry] of Object.entries(industryGroup.industries) as [string, any][]) {
          const subIndustry = industry.subIndustries?.find((sub: { value: string; label: string }) => sub.label === industryLabel);
          if (subIndustry) {
            setSelectedSector(sectorKey);
            setSelectedIndustryGroup(groupKey);
            setSelectedIndustry(industryKey);
            setSelectedSubIndustry(subIndustry.value);
            return;
          }
        }
      }
    }
  };

  if (isLoading || portfoliosLoading) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolio management...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Language Toggle and Navigation */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = `/portfolio?lang=${language}`}
          data-testid="button-back-portfolio"
        >
          {language === "en" ? "← Back to Portfolio" : "← ポートフォリオに戻る"}
        </Button>
      </div>
      <Navigation language={language} onLanguageChange={setLanguage} />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white">
              <div className="flex items-center justify-center mb-4">
                <Building2 className="h-12 w-12 mr-4" />
                <h1 className="text-4xl font-bold" data-testid="text-portfolio-management-title">
                  {language === "en" ? "Portfolio Management" : "ポートフォリオ管理"}
                </h1>
              </div>
              <p className="text-xl opacity-90 mb-6" data-testid="text-portfolio-subtitle">
                {language === "en" 
                  ? "Manage your investment portfolio companies" 
                  : "投資ポートフォリオ企業の管理"}
              </p>
              <Badge variant="secondary" className="text-orange-600" data-testid="badge-portfolio-count">
                {portfolios?.length || 0} {language === "en" ? "Companies" : "企業"}
              </Badge>
            </div>
          </div>
        </section>

        {/* Management Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={language === "en" 
                      ? "Search companies or industries..." 
                      : "会社や業界を検索..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-portfolios"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]" data-testid="select-filter-type">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Investment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {investmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatInvestmentType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterCompany} onValueChange={setFilterCompany}>
                  <SelectTrigger className="w-[180px]" data-testid="select-filter-company">
                    <SelectValue placeholder="Felicity Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    <SelectItem value="felicity-singapore">Felicity Singapore</SelectItem>
                    <SelectItem value="felicity-japan">Felicity Japan</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCountry} onValueChange={setFilterCountry}>
                  <SelectTrigger className="w-[180px]" data-testid="select-filter-country">
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
                <Button 
                  onClick={handleExportTemplate}
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                  data-testid="button-export-template"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {language === "en" ? "Export Template" : "テンプレートエクスポート"}
                </Button>
                <Button 
                  onClick={handleExportPortfolio}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                  data-testid="button-export-portfolio"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {language === "en" ? "Export Excel" : "Excelエクスポート"}
                </Button>
                <Button 
                  onClick={() => document.getElementById('bulk-upload-portfolio')?.click()}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  data-testid="button-bulk-upload-portfolio"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {language === "en" ? "Bulk Upload" : "一括アップロード"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                      data-testid="button-delete-all-portfolios"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {language === "en" ? "Delete All" : "すべて削除"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {language === "en" 
                          ? "Are you absolutely sure?" 
                          : "本当によろしいですか？"
                        }
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {language === "en" 
                          ? "This action cannot be undone. This will permanently delete all portfolio companies from the database." 
                          : "この操作は元に戻すことができません。データベースからすべてのポートフォリオ会社が永続的に削除されます。"
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {language === "en" ? "Cancel" : "キャンセル"}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAllPortfolios}
                        className="bg-red-600 hover:bg-red-700"
                        data-testid="button-confirm-delete-all"
                      >
                        {language === "en" ? "Delete All" : "すべて削除"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <input
                  id="bulk-upload-portfolio"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: 'none' }}
                  onChange={handleBulkUpload}
                />
                <Dialog open={isAddDialogOpen || editingPortfolio !== null} 
                        onOpenChange={(open) => {
                          if (!open) {
                            setIsAddDialogOpen(false);
                            setEditingPortfolio(null);
                            form.reset({
                              companyName: "",
                              companyNameJa: "",
                              felicityCompany: "felicity-singapore",
                              industry: "",
                              investmentType: "growthequity",
                              country: "",
                              investmentYear: "",
                              website: "",
                        
                              description: "",
                              descriptionJa: "",
                            });
                            setSelectedSector("");
                            setSelectedIndustryGroup("");
                            setSelectedIndustry("");
                            setSelectedSubIndustry("");
                          }
                        }}>
                  <DialogTrigger asChild>
                    <Button onClick={handleCreateNew} data-testid="button-add-portfolio">
                      <Plus className="h-4 w-4 mr-2" />
                      {language === "en" ? "Add Portfolio" : "ポートフォリオを追加"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-portfolio-form">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPortfolio 
                          ? (language === "en" ? "Edit Portfolio Company" : "ポートフォリオ企業を編集")
                          : (language === "en" ? "Add New Portfolio Company" : "新しいポートフォリオ企業を追加")
                        }
                      </DialogTitle>
                      <DialogDescription>
                        {editingPortfolio 
                          ? (language === "en" 
                              ? "Update the portfolio company information below."
                              : "下記のポートフォリオ企業情報を更新してください。"
                            )
                          : (language === "en"
                              ? "Fill in the details for the new portfolio company."
                              : "新しいポートフォリオ企業の詳細を入力してください。"
                            )
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{language === "en" ? "Company Name" : "会社名"}</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-company-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="companyNameJa"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{language === "en" ? "Company Name (Japanese)" : "会社名（日本語）"}</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-company-name-ja" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="felicityCompany"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Felicity Company</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-felicity-company">
                                      <SelectValue placeholder="Select Felicity company" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="felicity-singapore">Felicity Singapore</SelectItem>
                                    <SelectItem value="felicity-japan">Felicity Japan</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="fundName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {language === "en" ? "Fund Name" : "ファンド名"}
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-fund-name">
                                      <SelectValue placeholder={language === "en" ? "Select fund name" : "ファンド名を選択"} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {funds.map((fund) => (
                                      <SelectItem key={fund.id} value={fund.name}>
                                        {fund.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* GICS Industry Classification - Multi-level Selection */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <FormLabel>Industry (GICS Classification)</FormLabel>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowGicsSearch(!showGicsSearch)}
                                data-testid="button-gics-search-toggle"
                              >
                                <Search className="h-4 w-4 mr-1" />
                                Search GICS
                              </Button>
                            </div>
                            
                            {/* GICS Search */}
                            {showGicsSearch && (
                              <div className="mb-4 relative">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Search GICS classifications... (e.g., 'software', 'healthcare', 'retail')"
                                    value={gicsSearchTerm}
                                    onChange={(e) => setGicsSearchTerm(e.target.value)}
                                    data-testid="input-gics-search"
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setShowGicsSearch(false);
                                      setGicsSearchTerm("");
                                    }}
                                  >
                                    Close
                                  </Button>
                                </div>
                                
                                {/* Search Results */}
                                {gicsSearchTerm.length >= 2 && (
                                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                                    {searchGicsData(gicsSearchTerm).map((result, index) => (
                                      <div
                                        key={index}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                        onClick={() => handleGicsSelection(result)}
                                        data-testid={`gics-result-${index}`}
                                      >
                                        <div className="text-sm font-medium text-gray-900">
                                          {result.value}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {result.path}
                                        </div>
                                        <div className="text-xs text-blue-600 mt-1 capitalize">
                                          {result.type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                        </div>
                                      </div>
                                    ))}
                                    {searchGicsData(gicsSearchTerm).length === 0 && (
                                      <div className="p-3 text-sm text-gray-500">
                                        No GICS classifications found for "{gicsSearchTerm}"
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Sector Selection */}
                            <div>
                              <Label htmlFor="sector" className="text-sm text-muted-foreground">Sector</Label>
                              <Select onValueChange={handleSectorChange} value={selectedSector}>
                                <SelectTrigger data-testid="select-sector">
                                  <SelectValue placeholder="Select sector" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(gicsData).map(([key, sector]) => (
                                    <SelectItem key={key} value={key}>
                                      {sector.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Industry Group Selection */}
                            {selectedSector && (
                              <div>
                                <Label htmlFor="industry-group" className="text-sm text-muted-foreground">Industry Group</Label>
                                <Select onValueChange={handleIndustryGroupChange} value={selectedIndustryGroup}>
                                  <SelectTrigger data-testid="select-industry-group">
                                    <SelectValue placeholder="Select industry group" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(gicsData[selectedSector]?.industryGroups || {}).map(([key, group]: [string, any]) => (
                                      <SelectItem key={key} value={key}>
                                        {group.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Industry Selection */}
                            {selectedIndustryGroup && (
                              <div>
                                <Label htmlFor="industry" className="text-sm text-muted-foreground">Industry</Label>
                                <Select onValueChange={handleIndustryChange} value={selectedIndustry}>
                                  <SelectTrigger data-testid="select-industry">
                                    <SelectValue placeholder="Select industry" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(gicsData[selectedSector]?.industryGroups[selectedIndustryGroup]?.industries || {}).map(([key, industry]: [string, any]) => (
                                      <SelectItem key={key} value={key}>
                                        {industry.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Sub-Industry Selection */}
                            {selectedIndustry && (
                              <div>
                                <Label htmlFor="sub-industry" className="text-sm text-muted-foreground">Sub-Industry</Label>
                                <Select onValueChange={handleSubIndustryChange} value={selectedSubIndustry}>
                                  <SelectTrigger data-testid="select-sub-industry">
                                    <SelectValue placeholder="Select sub-industry" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(gicsData[selectedSector]?.industryGroups[selectedIndustryGroup]?.industries[selectedIndustry]?.subIndustries || []).map((subIndustry: { value: string; label: string }) => (
                                      <SelectItem key={subIndustry.value} value={subIndustry.value}>
                                        {subIndustry.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Hidden field to store the final industry value */}
                            <FormField
                              control={form.control}
                              name="industry"
                              render={({ field }) => (
                                <FormItem className="hidden">
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Display selected industry */}
                            {selectedSubIndustry && (
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm font-medium">Selected Industry:</p>
                                <p className="text-sm text-muted-foreground">
                                  {getSelectedSubIndustryData(selectedSubIndustry)?.label}
                                </p>
                              </div>
                            )}
                          </div>
                          <FormField
                            control={form.control}
                            name="investmentType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Investment Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-investment-type">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="buyout">Buyout</SelectItem>
                                    <SelectItem value="growthequity">Growth Equity</SelectItem>
                                    <SelectItem value="secondary">Secondary</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{language === "en" ? "Company Status" : "会社ステータス"}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-status">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="ongoing">{language === "en" ? "Ongoing" : "継続中"}</SelectItem>
                                    <SelectItem value="exit">{language === "en" ? "Exit" : "売却済み"}</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-country">
                                      <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {countryOptions.map((country) => (
                                      <SelectItem key={country.value} value={country.value}>
                                        {country.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="investmentYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{language === "en" ? "Investment Year" : "投資年"}</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="MM/YYYY (e.g., 03/2023)"
                                    data-testid="input-investment-year" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company URL</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="url"
                                    placeholder="https://example.com"
                                    data-testid="input-website" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{language === "en" ? "Description" : "説明"}</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    rows={3}
                                    data-testid="textarea-description"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="descriptionJa"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{language === "en" ? "Description (Japanese)" : "説明（日本語）"}</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    rows={3}
                                    data-testid="textarea-description-ja"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAddDialogOpen(false);
                              setEditingPortfolio(null);
                              form.reset({
                                companyName: "",
                                companyNameJa: "",
                                felicityCompany: "felicity-singapore",
                                fundName: "",
                                industry: "",
                                investmentType: "growthequity",
                                country: "",
                                investmentYear: "",
                                website: "",
                          
                                description: "",
                                descriptionJa: "",
                              });
                              setSelectedSector("");
                              setSelectedIndustryGroup("");
                              setSelectedIndustry("");
                              setSelectedSubIndustry("");
                            }}
                            data-testid="button-cancel-portfolio"
                          >
                            {language === "en" ? "Cancel" : "キャンセル"}
                          </Button>
                          <Button 
                            type="submit"
                            disabled={addPortfolioMutation.isPending || updatePortfolioMutation.isPending}
                            data-testid="button-submit-portfolio"
                          >
                            {addPortfolioMutation.isPending || updatePortfolioMutation.isPending 
                              ? (language === "en" ? "Saving..." : "保存中...") 
                              : editingPortfolio 
                                ? (language === "en" ? "Update Company" : "企業を更新") 
                                : (language === "en" ? "Add Portfolio" : "ポートフォリオを追加")
                            }
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Portfolio Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolios?.map((portfolio) => (
                <Card key={portfolio.id} className="hover:shadow-lg transition-shadow" data-testid={`card-portfolio-${portfolio.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1" data-testid={`text-company-name-${portfolio.id}`}>
                          {language === 'jp' && portfolio.companyNameJa 
                            ? portfolio.companyNameJa 
                            : portfolio.companyName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground" data-testid={`text-industry-${portfolio.id}`}>
                          {portfolio.industry}
                        </p>
                        {/* Sector Information */}
                        <p className="text-xs text-blue-600 font-medium mt-1" data-testid={`text-sector-${portfolio.id}`}>
                          {language === 'jp' ? 'セクター:' : 'Sector:'} {getSectorFromIndustry(portfolio.industry)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge 
                          variant="outline" 
                          className={
                            portfolio.investmentType === "buyout" 
                              ? "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-400" 
                              : portfolio.investmentType === "growthequity"
                              ? "border-green-500 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300 dark:border-green-400"
                              : "border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-400"
                          }
                          data-testid={`badge-investment-type-${portfolio.id}`}
                        >
                          {formatInvestmentType(portfolio.investmentType)}
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
                            ? (language === "en" ? "Exit" : "売却済み")
                            : (language === "en" ? "Ongoing" : "継続中")
                          }
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{language === 'jp' ? '会社:' : 'Company:'}</span>
                        <span data-testid={`text-felicity-company-${portfolio.id}`} className="font-medium text-blue-700 dark:text-blue-300">
                          {formatFelicityCompany(portfolio.felicityCompany)}
                        </span>
                      </div>
                      {portfolio.fundName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{language === 'jp' ? 'ファンド:' : 'Fund:'}</span>
                          <span data-testid={`text-fund-name-${portfolio.id}`} className="font-medium text-green-700 dark:text-green-300">
                            {formatFundName(portfolio.fundName)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{language === 'jp' ? '国:' : 'Country:'}</span>
                        <span data-testid={`text-country-${portfolio.id}`}>
                          {formatCountryName(portfolio.country)}
                        </span>
                      </div>
                      {portfolio.investmentYear && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{language === 'jp' ? '投資年:' : 'Investment Year:'}</span>
                          <span data-testid={`text-investment-year-${portfolio.id}`} className="font-medium text-purple-700 dark:text-purple-300">
                            {portfolio.investmentYear}
                          </span>
                        </div>
                      )}
                      {portfolio.website && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{language === 'jp' ? 'ウェブサイト:' : 'Website:'}</span>
                          <a 
                            href={portfolio.website.startsWith('http') ? portfolio.website : `https://${portfolio.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm underline"
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
                    </div>
                    
                    {/* Company Description with language selection */}
                    {(portfolio.description || portfolio.descriptionJa) && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">
                          {language === 'jp' ? '会社説明:' : 'Company Description:'}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-description-${portfolio.id}`}>
                          {language === 'jp' && portfolio.descriptionJa 
                            ? portfolio.descriptionJa 
                            : portfolio.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Visibility Control */}
                    <div className="mt-4 mb-3 flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <Checkbox
                        id={`visibility-${portfolio.id}`}
                        checked={portfolio.isVisible !== false}
                        onCheckedChange={() => handleToggleVisibility(portfolio.id, portfolio.isVisible !== false)}
                        data-testid={`checkbox-visibility-${portfolio.id}`}
                      />
                      <label
                        htmlFor={`visibility-${portfolio.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                      >
                        {portfolio.isVisible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {language === 'en' ? 'Show on Portfolio Page' : 'ポートフォリオページに表示'}
                      </label>
                      <Badge variant={portfolio.isVisible !== false ? "default" : "secondary"} className="text-xs">
                        {portfolio.isVisible !== false 
                          ? (language === 'en' ? 'Visible' : '表示中') 
                          : (language === 'en' ? 'Hidden' : '非表示')}
                      </Badge>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(portfolio)}
                        data-testid={`button-edit-${portfolio.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" data-testid={`button-delete-${portfolio.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-testid={`dialog-delete-${portfolio.id}`}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Portfolio Company</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {portfolio.companyName}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-testid={`button-cancel-delete-${portfolio.id}`}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePortfolioMutation.mutate(portfolio.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              data-testid={`button-confirm-delete-${portfolio.id}`}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPortfolios?.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2" data-testid="text-no-companies">
                  No companies found
                </h3>
                <p className="text-muted-foreground" data-testid="text-no-companies-description">
                  {searchTerm || filterType !== "all" || filterCountry !== "all"
                    ? "Try adjusting your search or filters."
                    : "Get started by adding your first portfolio company."
                  }
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4 mt-12">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = `/portfolio?lang=${language}`}
                data-testid="button-back-portfolio"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'jp' ? 'ポートフォリオに戻る' : 'Back to Portfolio'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/management"}
                data-testid="button-back-management"
              >
                {language === 'jp' ? '管理ポータルに戻る' : 'Back to Management Portal'}
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer language={language} />
    </div>
  );
}