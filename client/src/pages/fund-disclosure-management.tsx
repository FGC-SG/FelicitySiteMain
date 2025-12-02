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
import { ObjectUploader } from "@/components/ObjectUploader";
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

  // Fetch fund disclosures
  const { data: disclosures, isLoading } = useQuery<FundDisclosure[]>({
    queryKey: ['/api/fund-disclosures']
  });

  // Fetch funds for selection
  const { data: funds } = useQuery({
    queryKey: ['/api/funds']
  });

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fundId: "",
      descriptionJa: "",
      pdfUrl: "",
      disclosureType: "business-report",
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
      fundId: disclosure.fundId,
      descriptionJa: disclosure.descriptionJa ?? "",
      pdfUrl: disclosure.pdfUrl,
      disclosureType: disclosure.disclosureType,
      isVisible: disclosure.isVisible,
      publishedAt: new Date(disclosure.publishedAt)
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (disclosure: FundDisclosure) => {
    const disclosureTypeText = disclosure.disclosureType === 'business-report' ? 'Business Report' : 'Semi-annual Report';
    if (window.confirm(`Are you sure you want to delete this ${disclosureTypeText}? This action cannot be undone.`)) {
      deleteMutation.mutate(disclosure.id);
    }
  };

  const getUploadParameters = async () => {
    const response = await fetch('/api/objects/upload', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to get upload parameters');
    }
    
    const { uploadURL } = await response.json();
    return {
      method: 'PUT' as const,
      url: uploadURL
    };
  };

  const handleUploadComplete = (result: { successful: Array<{ uploadURL: string }> }) => {
    if (result.successful.length > 0) {
      const uploadedUrl = result.successful[0].uploadURL;
      // Extract the path from the presigned URL and create a local object serving path
      const urlObj = new URL(uploadedUrl);
      const pathParts = urlObj.pathname.split('/');
      const filename = pathParts[pathParts.length - 1];
      const objectPath = `/objects/uploads/${filename}`;
      
      form.setValue('pdfUrl', objectPath);
      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, 'MMM dd, yyyy');
  };

  const formatDisclosureType = (type: string) => {
    switch (type) {
      case "business-report":
        return language === 'jp' ? '事業報告書' : 'Business Report';
      case "semi-annual-report":
        return language === 'jp' ? '半期運用報告書' : 'Semi-annual Management Report';
      default:
        return language === 'jp' ? '事業報告書' : 'Business Report';
    }
  };

  const getFundName = (fundId: string | null) => {
    if (!fundId || !funds || !Array.isArray(funds)) return 'Unknown Fund';
    const fund = funds.find((f: any) => f.id === fundId);
    return fund ? fund.name : 'Unknown Fund';
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
                    {/* Fund Selection and Disclosure Type */}
                    <FormField
                      control={form.control}
                      name="fundId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fund *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-fund">
                                <SelectValue placeholder="Select fund" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(funds as any[])?.map((fund: any) => (
                                <SelectItem key={fund.id} value={fund.id}>
                                  {fund.name}
                                </SelectItem>
                              )) || []}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="disclosureType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disclosure Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-disclosure-type">
                                <SelectValue placeholder="Select disclosure type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="business-report">事業報告書 (Business Report)</SelectItem>
                              <SelectItem value="semi-annual-report">半期運用報告書 (Semi-annual Report)</SelectItem>
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

                  {/* Description Field (Japanese Only) */}
                  <FormField
                    control={form.control}
                    name="descriptionJa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Japanese)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            value={field.value || ""}
                            rows={3}
                            data-testid="textarea-disclosure-description-ja"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* PDF Upload or URL */}
                  <div className="space-y-4">
                    <Label>PDF Document *</Label>
                    
                    {/* Toggle between Upload and URL */}
                    <div className="flex gap-2 mb-4">
                      <Button
                        type="button"
                        variant={form.watch('pdfUrl')?.startsWith('http') ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => {
                          // Switch to upload mode - clear any URL
                          if (form.watch('pdfUrl')?.startsWith('http')) {
                            form.setValue('pdfUrl', '');
                          }
                        }}
                        data-testid="button-upload-mode"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch('pdfUrl')?.startsWith('http') ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          // Switch to URL mode - focus will be on input
                        }}
                        data-testid="button-url-mode"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        OneDrive URL
                      </Button>
                    </div>

                    {/* Upload Section */}
                    {!form.watch('pdfUrl')?.startsWith('http') && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <ObjectUploader
                            acceptedTypes="application/pdf"
                            maxFileSize={20971520} // 20MB for PDFs
                            onGetUploadParameters={getUploadParameters}
                            onComplete={handleUploadComplete}
                            buttonClassName="border border-gray-300"
                          >
                            Select PDF File
                          </ObjectUploader>
                          {form.watch('pdfUrl') && !form.watch('pdfUrl')?.startsWith('http') && (
                            <p className="mt-2 text-sm text-green-600">
                              PDF uploaded successfully
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* URL Input Section */}
                    {form.watch('pdfUrl')?.startsWith('http') && (
                      <FormField
                        control={form.control}
                        name="pdfUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>OneDrive or External PDF URL</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="https://onedrive.live.com/..." 
                                data-testid="input-onedrive-url"
                              />
                            </FormControl>
                            <div className="text-sm text-gray-500">
                              Enter a publicly accessible OneDrive, Google Drive, or direct PDF URL
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {/* Show URL input when no file uploaded */}
                    {!form.watch('pdfUrl') && (
                      <div className="text-center text-sm text-gray-500">
                        <p>or enter a OneDrive/external URL below</p>
                        <FormField
                          control={form.control}
                          name="pdfUrl"
                          render={({ field }) => (
                            <FormItem className="mt-2">
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="https://onedrive.live.com/..." 
                                  data-testid="input-pdf-url"
                                  onChange={(e) => {
                                    field.onChange(e);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
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
                        {getFundName(disclosure.fundId)} - {formatDisclosureType(disclosure.disclosureType)}
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
                        <span>{getFundName(disclosure.fundId)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!disclosure.pdfUrl || disclosure.pdfUrl.trim() === '') {
                          toast({
                            title: "No PDF Available",
                            description: "This disclosure does not have a PDF file attached.",
                            variant: "destructive",
                          });
                          return;
                        }
                        window.open(disclosure.pdfUrl, '_blank');
                      }}
                      disabled={!disclosure.pdfUrl || disclosure.pdfUrl.trim() === ''}
                      data-testid={`button-view-pdf-${disclosure.id}`}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {disclosure.pdfUrl && disclosure.pdfUrl.trim() !== '' ? 'View' : 'No PDF'}
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
              {disclosure.descriptionJa && (
                <CardContent>
                  <p className="text-sm text-gray-600" data-testid={`text-description-${disclosure.id}`}>
                    {disclosure.descriptionJa}
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
                {/* Disclosure Type and Publication Date */}
                <FormField
                  control={form.control}
                  name="disclosureType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disclosure Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-disclosure-type">
                            <SelectValue placeholder="Select disclosure type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="business-report">事業報告書 (Business Report)</SelectItem>
                          <SelectItem value="semi-annual-report">半期運用報告書 (Semi-annual Report)</SelectItem>
                          <SelectItem value="general">一般開示資料 (General Disclosure)</SelectItem>
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

              {/* Description Field (Japanese Only) */}
              <FormField
                control={form.control}
                name="descriptionJa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Japanese)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""}
                        rows={3}
                        data-testid="textarea-edit-disclosure-description-ja"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PDF URL */}
              <FormField
                control={form.control}
                name="pdfUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PDF URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/document.pdf" data-testid="input-edit-pdf-url" />
                    </FormControl>
                    <div className="text-sm text-gray-500">
                      Enter the URL to the PDF document
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