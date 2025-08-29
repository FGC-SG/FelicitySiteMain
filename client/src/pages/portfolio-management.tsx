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
import { Building2, Plus, Pencil, Trash2, Search, Filter } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Portfolio } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { gicsData } from '../data/gics-data';

const portfolioFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  felicityCompany: z.enum(["felicity-singapore", "felicity-japan"]),
  industry: z.string().min(1, "Industry is required"),
  investmentType: z.enum(["buyout", "growthequity", "secondary"]),
  country: z.string().min(1, "Country is required"),
  businessDescription: z.string().optional().or(z.literal("")),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  succession: z.boolean().default(false),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type PortfolioFormData = z.infer<typeof portfolioFormSchema>;

export default function PortfolioManagementPage() {
  const [language, setLanguage] = useState<Language>('en');
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

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      companyName: "",
      felicityCompany: "felicity-singapore",
      industry: "",
      investmentType: "growthequity",
      country: "",
      businessDescription: "",
      website: "",
      succession: false,
      description: "",
    },
  });

  // Fetch portfolio companies
  const { data: portfolios, isLoading: portfoliosLoading } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
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

  // Filter portfolios
  const filteredPortfolios = portfolios?.filter(portfolio => {
    const matchesSearch = portfolio.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portfolio.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || portfolio.investmentType === filterType;
    const matchesCountry = filterCountry === "all" || portfolio.country === filterCountry;
    const matchesCompany = filterCompany === "all" || portfolio.felicityCompany === filterCompany;
    
    return matchesSearch && matchesType && matchesCountry && matchesCompany;
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
      felicityCompany: (portfolio.felicityCompany ?? "felicity-singapore") as "felicity-singapore" | "felicity-japan",
      industry: portfolio.industry,
      investmentType: portfolio.investmentType as "buyout" | "growthequity" | "secondary",
      country: portfolio.country,
      businessDescription: portfolio.businessDescription ?? "",
      website: portfolio.website ?? "",
      succession: portfolio.succession ?? false,
      description: portfolio.description ?? "",
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
      felicityCompany: "felicity-singapore",
      industry: "",
      investmentType: "growthequity",
      country: "",
      businessDescription: "",
      website: "",
      succession: false,
      description: "",
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

  const formatInvestmentType = (type: string) => {
    switch (type) {
      case "buyout": return "Buyout";
      case "growthequity": return "Growth Equity";
      case "secondary": return "Secondary";
      default: return type;
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
      <Navigation language={language} onLanguageChange={setLanguage} />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white">
              <div className="flex items-center justify-center mb-4">
                <Building2 className="h-12 w-12 mr-4" />
                <h1 className="text-4xl font-bold" data-testid="text-portfolio-management-title">
                  Portfolio Management
                </h1>
              </div>
              <p className="text-xl opacity-90 mb-6" data-testid="text-portfolio-subtitle">
                Manage your investment portfolio companies
              </p>
              <Badge variant="secondary" className="text-orange-600" data-testid="badge-portfolio-count">
                {portfolios?.length || 0} Companies
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
                    placeholder="Search companies or industries..."
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
                <Dialog open={isAddDialogOpen || editingPortfolio !== null} 
                        onOpenChange={(open) => {
                          if (!open) {
                            setIsAddDialogOpen(false);
                            setEditingPortfolio(null);
                            form.reset();
                            setSelectedSector("");
                            setSelectedIndustryGroup("");
                            setSelectedIndustry("");
                            setSelectedSubIndustry("");
                          }
                        }}>
                  <DialogTrigger asChild>
                    <Button onClick={handleCreateNew} data-testid="button-add-portfolio">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Company
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-portfolio-form">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPortfolio ? "Edit Portfolio Company" : "Add New Portfolio Company"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingPortfolio 
                          ? "Update the portfolio company information below."
                          : "Fill in the details for the new portfolio company."
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
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-company-name" />
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
                            name="businessDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Description <span className="text-muted-foreground text-sm">(Optional)</span></FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    rows={2}
                                    placeholder="Describe the business focus or industry segment..."
                                    data-testid="textarea-business-description" 
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
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
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
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAddDialogOpen(false);
                              setEditingPortfolio(null);
                              form.reset();
                              setSelectedSector("");
                              setSelectedIndustryGroup("");
                              setSelectedIndustry("");
                              setSelectedSubIndustry("");
                            }}
                            data-testid="button-cancel-portfolio"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={addPortfolioMutation.isPending || updatePortfolioMutation.isPending}
                            data-testid="button-submit-portfolio"
                          >
                            {addPortfolioMutation.isPending || updatePortfolioMutation.isPending 
                              ? "Saving..." 
                              : editingPortfolio 
                                ? "Update Company" 
                                : "Add Company"
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
                          {portfolio.companyName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground" data-testid={`text-industry-${portfolio.id}`}>
                          {portfolio.industry}
                        </p>
                      </div>
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
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span data-testid={`text-felicity-company-${portfolio.id}`} className="font-medium text-blue-700 dark:text-blue-300">
                          {formatFelicityCompany(portfolio.felicityCompany)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Country:</span>
                        <span data-testid={`text-country-${portfolio.id}`}>
                          {formatCountryName(portfolio.country)}
                        </span>
                      </div>
                      {portfolio.businessDescription && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Business:</span>
                          <span data-testid={`text-business-description-${portfolio.id}`} className="text-right max-w-[200px] truncate">
                            {portfolio.businessDescription}
                          </span>
                        </div>
                      )}
                      {portfolio.website && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Website:</span>
                          <a 
                            href={portfolio.website.startsWith('http') ? portfolio.website : `https://${portfolio.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm underline"
                            data-testid={`link-website-${portfolio.id}`}
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                      {portfolio.succession && (
                        <Badge variant="secondary" className="text-xs" data-testid={`badge-succession-${portfolio.id}`}>
                          Succession
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 line-clamp-2" data-testid={`text-description-${portfolio.id}`}>
                      {portfolio.description}
                    </p>
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

            {/* Back to Management */}
            <div className="flex justify-center mt-12">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/management"}
                data-testid="button-back-management"
              >
                Back to Management Portal
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer language={language} />
    </div>
  );
}