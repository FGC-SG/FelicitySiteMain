import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Upload, 
  Calendar as CalendarIcon,
  Building2,
  Eye,
  EyeOff
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type FundDisclosure, type InsertFundDisclosure, fundDisclosures } from "@shared/schema";
import { createInsertSchema } from "drizzle-zod";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { type Language } from "@/lib/i18n";

// Form validation schema
const insertFundDisclosureSchema = createInsertSchema(fundDisclosures);
const formSchema = insertFundDisclosureSchema.extend({
  publishedAt: z.date({
    required_error: "Publication date is required"
  })
});

type FormData = z.infer<typeof formSchema>;

export default function FundDisclosureManagementPage() {
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>('en');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDisclosure, setEditingDisclosure] = useState<FundDisclosure | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Fetch fund disclosures
  const { data: disclosures, isLoading } = useQuery<FundDisclosure[]>({
    queryKey: ['/api/fund-disclosures']
  });

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      titleJa: "",
      description: "",
      descriptionJa: "",
      pdfUrl: "",
      felicityCompany: "felicity-singapore",
      isVisible: true,
      publishedAt: new Date()
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      // Convert date to ISO string for API
      const payload = {
        ...data,
        publishedAt: data.publishedAt.toISOString()
      };
      return apiRequest('POST', '/api/fund-disclosures', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fund-disclosures'] });
      toast({ title: "Success", description: "Fund disclosure created successfully" });
      setIsAddDialogOpen(false);
      form.reset();
      setPdfFile(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create fund disclosure",
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => {
      const payload = {
        ...data,
        publishedAt: data.publishedAt.toISOString()
      };
      return apiRequest('PUT', `/api/fund-disclosures/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fund-disclosures'] });
      toast({ title: "Success", description: "Fund disclosure updated successfully" });
      setIsEditDialogOpen(false);
      setEditingDisclosure(null);
      form.reset();
      setPdfFile(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update fund disclosure",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/fund-disclosures/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fund-disclosures'] });
      toast({ title: "Success", description: "Fund disclosure deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete fund disclosure",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FormData) => {
    if (editingDisclosure) {
      updateMutation.mutate({ id: editingDisclosure.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (disclosure: FundDisclosure) => {
    setEditingDisclosure(disclosure);
    form.reset({
      title: disclosure.title,
      titleJa: disclosure.titleJa || "",
      description: disclosure.description || "",
      descriptionJa: disclosure.descriptionJa || "",
      pdfUrl: disclosure.pdfUrl,
      felicityCompany: disclosure.felicityCompany,
      isVisible: disclosure.isVisible,
      publishedAt: new Date(disclosure.publishedAt)
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (disclosure: FundDisclosure) => {
    if (window.confirm(`Are you sure you want to delete "${disclosure.title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(disclosure.id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      // For now, set a placeholder URL - in real implementation, upload to object storage
      form.setValue('pdfUrl', `/uploads/pdfs/${file.name}`);
    } else {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive"
      });
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, 'MMM dd, yyyy');
  };

  const formatFelicityCompany = (company: string) => {
    switch (company) {
      case "felicity-singapore":
        return 'Felicity Singapore';
      case "felicity-japan":
        return 'Felicity Japan';
      default:
        return 'Felicity Singapore';
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
        onLanguageChange={setLanguage}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-fund-disclosure-management-title">
              Fund Disclosure Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage fund disclosure documents and publications
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-disclosure">
                <Plus className="h-4 w-4 mr-2" />
                Add Disclosure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Fund Disclosure</DialogTitle>
                <DialogDescription>
                  Upload a new fund disclosure document with publication details
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title Fields */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title (English) *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-disclosure-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="titleJa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title (Japanese)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-disclosure-title-ja" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Company and Publication Date */}
                    <FormField
                      control={form.control}
                      name="felicityCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Felicity Company *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-felicity-company">
                                <SelectValue placeholder="Select company" />
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
                      name="publishedAt"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Publication Date *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  data-testid="button-publication-date"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (English)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={3}
                              data-testid="textarea-disclosure-description"
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
                          <FormLabel>Description (Japanese)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={3}
                              data-testid="textarea-disclosure-description-ja"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* PDF Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="pdf-upload">PDF Document *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <input
                          id="pdf-upload"
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          data-testid="input-pdf-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('pdf-upload')?.click()}
                          data-testid="button-select-pdf"
                        >
                          Select PDF File
                        </Button>
                        {pdfFile && (
                          <p className="mt-2 text-sm text-green-600">
                            Selected: {pdfFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visibility Toggle */}
                  <FormField
                    control={form.control}
                    name="isVisible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Visibility</FormLabel>
                          <div className="text-sm text-gray-600">
                            Make this disclosure visible to public users
                          </div>
                        </div>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(!field.value)}
                            data-testid="button-toggle-visibility"
                          >
                            {field.value ? (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Visible
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hidden
                              </>
                            )}
                          </Button>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      data-testid="button-cancel-add"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      data-testid="button-save-disclosure"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Disclosure"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Disclosures List */}
        <div className="grid gap-6">
          {disclosures?.map((disclosure) => (
            <Card key={disclosure.id} data-testid={`card-disclosure-${disclosure.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="flex items-center gap-2" data-testid={`text-disclosure-title-${disclosure.id}`}>
                        <FileText className="h-5 w-5 text-blue-600" />
                        {disclosure.title}
                      </CardTitle>
                      <Badge variant={disclosure.isVisible ? "default" : "secondary"}>
                        {disclosure.isVisible ? "Visible" : "Hidden"}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{formatDate(disclosure.publishedAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        <span>{formatFelicityCompany(disclosure.felicityCompany)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(disclosure.pdfUrl, '_blank')}
                      data-testid={`button-view-pdf-${disclosure.id}`}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(disclosure)}
                      data-testid={`button-edit-disclosure-${disclosure.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(disclosure)}
                      data-testid={`button-delete-disclosure-${disclosure.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {disclosure.description && (
                <CardContent>
                  <p className="text-sm text-gray-600" data-testid={`text-description-${disclosure.id}`}>
                    {disclosure.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}

          {disclosures?.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No fund disclosures yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start by creating your first fund disclosure document.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Disclosure
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Fund Disclosure</DialogTitle>
            <DialogDescription>
              Update the fund disclosure document and details
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title Fields */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (English) *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-disclosure-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="titleJa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Japanese)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-disclosure-title-ja" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company and Publication Date */}
                <FormField
                  control={form.control}
                  name="felicityCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Felicity Company *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-felicity-company">
                            <SelectValue placeholder="Select company" />
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
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Publication Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="button-edit-publication-date"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (English)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
                          data-testid="textarea-edit-disclosure-description"
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
                      <FormLabel>Description (Japanese)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
                          data-testid="textarea-edit-disclosure-description-ja"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* PDF URL - Read only for edit */}
              <FormField
                control={form.control}
                name="pdfUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PDF URL</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-gray-50" data-testid="input-edit-pdf-url" />
                    </FormControl>
                    <div className="text-sm text-gray-500">
                      To change the PDF file, please create a new disclosure.
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Visibility Toggle */}
              <FormField
                control={form.control}
                name="isVisible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Visibility</FormLabel>
                      <div className="text-sm text-gray-600">
                        Make this disclosure visible to public users
                      </div>
                    </div>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => field.onChange(!field.value)}
                        data-testid="button-edit-toggle-visibility"
                      >
                        {field.value ? (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hidden
                          </>
                        )}
                      </Button>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingDisclosure(null);
                    form.reset();
                  }}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  data-testid="button-update-disclosure"
                >
                  {updateMutation.isPending ? "Updating..." : "Update Disclosure"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Footer language={language} />
    </div>
  );
}