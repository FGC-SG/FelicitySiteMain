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

const portfolioFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  investmentType: z.enum(["buyout", "growthequity", "secondary"]),
  country: z.string().min(1, "Country is required"),
  businessType: z.string().min(1, "Business type is required"),
  succession: z.boolean().default(false),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type PortfolioFormData = z.infer<typeof portfolioFormSchema>;

export default function PortfolioManagementPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      investmentType: "growthequity",
      country: "",
      businessType: "",
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
    
    return matchesSearch && matchesType && matchesCountry;
  });

  // Get unique values for filters
  const investmentTypes = Array.from(new Set(portfolios?.map(p => p.investmentType) || []));
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
      industry: portfolio.industry,
      investmentType: portfolio.investmentType as "buyout" | "growthequity" | "secondary",
      country: portfolio.country,
      businessType: portfolio.businessType,
      succession: portfolio.succession ?? false,
      description: portfolio.description ?? "",
    });
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
                          }
                        }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-portfolio">
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
                            name="industry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Industry</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-industry" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                            name="businessType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Type</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-business-type" />
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
                        <span className="text-muted-foreground">Country:</span>
                        <span data-testid={`text-country-${portfolio.id}`}>
                          {formatCountryName(portfolio.country)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Business Type:</span>
                        <span data-testid={`text-business-type-${portfolio.id}`}>
                          {portfolio.businessType}
                        </span>
                      </div>
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