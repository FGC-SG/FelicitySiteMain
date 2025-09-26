import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Plus, Pencil, Trash2, Search, ArrowLeft, Download, Upload, FileSpreadsheet, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Fund as FundType } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const fundFormSchema = z.object({
  name: z.string().min(1, "Fund name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  descriptionJa: z.string().optional().or(z.literal("")),
  vintage: z.string().regex(/^\d{4}$/, "Vintage must be a 4-digit year (YYYY)").optional().or(z.literal("")),
});

type FundFormData = z.infer<typeof fundFormSchema>;

export default function FundManagementPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLanguage = urlParams.get('lang') as Language;
  const [language, setLanguage] = useState<Language>(urlLanguage === 'jp' ? 'jp' : 'en');
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<FundType | null>(null);
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FundFormData>({
    resolver: zodResolver(fundFormSchema),
    defaultValues: {
      name: "",
      description: "",
      descriptionJa: "",
      vintage: "",
    },
  });

  // Fetch funds
  const { data: funds = [], isLoading: fundsLoading } = useQuery({
    queryKey: ['/api/funds'],
    enabled: isAuthenticated && !isLoading,
  });

  // Create fund mutation
  const createFundMutation = useMutation({
    mutationFn: (fundData: FundFormData) =>
      apiRequest('POST', '/api/funds', fundData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });
      toast({
        title: language === 'jp' ? "ファンドが作成されました" : "Fund created",
        description: language === 'jp' ? "新しいファンドが正常に追加されました。" : "The new fund has been successfully added.",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: language === 'jp' ? "エラー" : "Error",
        description: error.message || (language === 'jp' ? "ファンドの作成に失敗しました。" : "Failed to create fund."),
        variant: "destructive",
      });
    },
  });

  // Update fund mutation
  const updateFundMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FundFormData> }) =>
      apiRequest('PUT', `/api/funds/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });
      toast({
        title: language === 'jp' ? "ファンドが更新されました" : "Fund updated",
        description: language === 'jp' ? "ファンド情報が正常に更新されました。" : "Fund information has been successfully updated.",
      });
      setEditingFund(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: language === 'jp' ? "エラー" : "Error", 
        description: error.message || (language === 'jp' ? "ファンドの更新に失敗しました。" : "Failed to update fund."),
        variant: "destructive",
      });
    },
  });

  // Delete fund mutation
  const deleteFundMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest('DELETE', `/api/funds/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });
      toast({
        title: language === 'jp' ? "ファンドが削除されました" : "Fund deleted",
        description: language === 'jp' ? "ファンドが正常に削除されました。" : "The fund has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'jp' ? "エラー" : "Error",
        description: error.message || (language === 'jp' ? "ファンドの削除に失敗しました。" : "Failed to delete fund."),
        variant: "destructive",
      });
    },
  });

  // Toggle fund visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      apiRequest('PUT', `/api/funds/${id}`, { isVisible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });
      toast({
        title: language === 'jp' ? "表示設定が更新されました" : "Visibility updated",
        description: language === 'jp' ? "ファンドの表示設定が正常に更新されました。" : "Fund visibility has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'jp' ? "エラー" : "Error",
        description: error.message || (language === 'jp' ? "表示設定の更新に失敗しました。" : "Failed to update visibility."),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FundFormData) => {
    if (editingFund) {
      updateFundMutation.mutate({ id: editingFund.id, data });
    } else {
      createFundMutation.mutate(data);
    }
  };

  const handleEdit = (fund: FundType) => {
    setEditingFund(fund);
    form.setValue("name", fund.name);
    form.setValue("description", fund.description);
    form.setValue("descriptionJa", fund.descriptionJa || "");
    form.setValue("vintage", fund.vintage || "");
    setIsAddDialogOpen(true);
  };

  const handleDelete = (fundId: string) => {
    deleteFundMutation.mutate(fundId);
  };

  const handleToggleVisibility = (fundId: string, currentVisibility: boolean) => {
    toggleVisibilityMutation.mutate({ id: fundId, isVisible: !currentVisibility });
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingFund(null);
    form.reset();
  };

  // Export fund data to Excel
  const handleExportFunds = async () => {
    try {
      const response = await fetch('/api/funds/export', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to export fund data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `felicity-funds-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: language === 'jp' ? "エクスポート成功" : "Export Successful",
        description: language === 'jp' ? "ファンドデータがExcelファイルにエクスポートされました。" : "Fund data has been exported to Excel file.",
      });
    } catch (error) {
      console.error('Error exporting funds:', error);
      toast({
        title: language === 'jp' ? "エクスポート失敗" : "Export Failed",
        description: language === 'jp' ? "ファンドデータのエクスポートに失敗しました。再度お試しください。" : "Failed to export fund data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Export template for fund import
  const handleExportTemplate = async () => {
    try {
      const response = await fetch('/api/funds/export-template', {
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
      a.download = `felicity-funds-template-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: language === 'jp' ? "テンプレートエクスポート成功" : "Template Export Successful",
        description: language === 'jp' ? "ファンドテンプレートがExcelファイルにエクスポートされました。" : "Fund template has been exported to Excel file.",
      });
    } catch (error) {
      console.error('Error exporting template:', error);
      toast({
        title: language === 'jp' ? "テンプレートエクスポート失敗" : "Template Export Failed",
        description: language === 'jp' ? "ファンドテンプレートのエクスポートに失敗しました。再度お試しください。" : "Failed to export fund template. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: language === 'jp' ? "無効なファイル形式" : "Invalid File Type",
        description: language === 'jp' ? "Excel (.xlsx, .xls) またはCSVファイルをアップロードしてください。" : "Please upload an Excel (.xlsx, .xls) or CSV file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/funds/import', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });

      toast({
        title: language === 'jp' ? "アップロード成功" : "Upload Successful",
        description: result.message || (language === 'jp' 
          ? `${result.imported || 0}件のファンドが正常にインポートされました。` 
          : `Successfully imported ${result.imported || 0} funds.`),
      });

      if (result.errors && result.errors.length > 0) {
        console.warn('Import errors:', result.errors);
        toast({
          title: language === 'jp' ? "インポート警告" : "Import Warnings",
          description: language === 'jp' ? `${result.errors.length}件のエラーがありました。詳細はコンソールをご確認ください。` : `${result.errors.length} errors occurred. Check console for details.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      let errorMessage = language === 'jp' ? "ファイルのアップロードに失敗しました。" : "Failed to upload file.";
      
      if (error.message?.includes('400')) {
        errorMessage = language === 'jp' ? "ファイル形式が無効です。" : "Invalid file format.";
      } else if (error.message?.includes('413')) {
        errorMessage = language === 'jp' ? "ファイルサイズが大きすぎます。" : "File size too large.";
      } else if (error.message?.includes('Network')) {
        errorMessage = language === 'jp' ? "ネットワークエラーまたはサーバーエラーが発生しました。" : "Network or server error occurred.";
      }
      
      toast({
        title: language === 'jp' ? "アップロード失敗" : "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }

    // Reset the input
    event.target.value = '';
  };

  // Filter funds based on search term
  const filteredFunds = (funds as FundType[]).filter((fund: FundType) =>
    fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fund.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-600">
            {language === 'jp' ? 'アクセスが拒否されました。ログインしてください。' : 'Access denied. Please log in.'}
          </div>
        </div>
      </div>
    );
  }

  if (!user || (user as any).role !== "admin" && (user as any).role !== "superadmin" && (user as any).role !== "Superadmin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-600">
            {language === 'jp' ? '管理者アクセスが必要です。' : 'Administrator access required.'}
          </div>
        </div>
      </div>
    );
  }

  const t = {
    title: language === 'jp' ? "ファンド管理" : "Fund Management",
    subtitle: language === 'jp' ? "Felicity Global Capitalのファンドを管理" : "Manage Felicity Global Capital funds",
    searchPlaceholder: language === 'jp' ? "ファンドを検索..." : "Search funds...",
    addFund: language === 'jp' ? "ファンドを追加" : "Add Fund",
    addFundTitle: language === 'jp' ? "新しいファンドを追加" : "Add New Fund",
    editFundTitle: language === 'jp' ? "ファンドを編集" : "Edit Fund",
    addFundDesc: language === 'jp' ? "新しいファンド情報を入力してください" : "Fill in the information for the new fund",
    editFundDesc: language === 'jp' ? "ファンド情報を更新してください" : "Update the fund information",
    name: language === 'jp' ? "ファンド名" : "Fund Name",
    description: language === 'jp' ? "説明" : "Description",
    descriptionJa: language === 'jp' ? "説明（日本語）" : "Description (Japanese)",
    vintage: language === 'jp' ? "ビンテージ（年）" : "Vintage (Year)",
    cancel: language === 'jp' ? "キャンセル" : "Cancel",
    save: language === 'jp' ? "保存" : "Save",
    update: language === 'jp' ? "更新" : "Update",
    edit: language === 'jp' ? "編集" : "Edit",
    delete: language === 'jp' ? "削除" : "Delete",
    confirmDelete: language === 'jp' ? "削除の確認" : "Confirm Delete",
    confirmDeleteDesc: language === 'jp' ? "このファンドを削除してもよろしいですか？この操作は元に戻すことができません。" : "Are you sure you want to delete this fund? This action cannot be undone.",
    noFunds: language === 'jp' ? "ファンドが見つかりません" : "No funds found",
    backToManagement: language === 'jp' ? "管理画面に戻る" : "Back to Management",
    exportFunds: language === 'jp' ? "ファンドをエクスポート" : "Export Funds",
    exportTemplate: language === 'jp' ? "テンプレートをダウンロード" : "Download Template",
    bulkUpload: language === 'jp' ? "一括アップロード" : "Bulk Upload",
    visibilityLabel: language === 'jp' ? "Fund Pageに表示" : "Show on Fund Page",
    visible: language === 'jp' ? "表示中" : "Visible",
    hidden: language === 'jp' ? "非表示" : "Hidden",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation language={language} onLanguageChange={setLanguage} />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                asChild
                data-testid="button-back-management"
              >
                <a href="/management">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t.backToManagement}
                </a>
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <DollarSign className="w-8 h-8" />
                  {t.title}
                </h1>
                <p className="text-gray-600 mt-2">{t.subtitle}</p>
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-fund">
                    <Plus className="w-4 h-4 mr-2" />
                    {t.addFund}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle data-testid="dialog-title-fund">
                      {editingFund ? t.editFundTitle : t.addFundTitle}
                    </DialogTitle>
                    <DialogDescription data-testid="dialog-description-fund">
                      {editingFund ? t.editFundDesc : t.addFundDesc}
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.name}</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-fund-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />


                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.description}</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={4}
                                data-testid="textarea-fund-description"
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
                            <FormLabel>{t.descriptionJa}</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={4}
                                data-testid="textarea-fund-description-ja"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vintage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.vintage}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="2024"
                                maxLength={4}
                                data-testid="input-fund-vintage"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseDialog}
                          data-testid="button-cancel-fund"
                        >
                          {t.cancel}
                        </Button>
                        <Button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={createFundMutation.isPending || updateFundMutation.isPending}
                          data-testid="button-save-fund"
                        >
                          {editingFund ? t.update : t.save}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Export/Import Section */}
          <div className="mb-6 flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleExportFunds}
              className="flex items-center gap-2"
              data-testid="button-export-funds"
            >
              <Download className="w-4 h-4" />
              {t.exportFunds}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportTemplate}
              className="flex items-center gap-2"
              data-testid="button-export-template"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {t.exportTemplate}
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleBulkUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                data-testid="input-bulk-upload"
              />
              <Button
                variant="outline"
                className="flex items-center gap-2"
                data-testid="button-bulk-upload"
              >
                <Upload className="w-4 h-4" />
                {t.bulkUpload}
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-funds"
              />
            </div>
          </div>

          {/* Funds Grid */}
          {fundsLoading ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFunds.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t.noFunds}</p>
                </div>
              ) : (
                filteredFunds.map((fund: FundType) => (
                  <Card key={fund.id} className="hover:shadow-lg transition-shadow" data-testid={`card-fund-${fund.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1" data-testid={`text-fund-name-${fund.id}`}>
                            {fund.name}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm line-clamp-3 mb-4" data-testid={`text-fund-description-${fund.id}`}>
                        {language === 'jp' && fund.descriptionJa ? fund.descriptionJa : fund.description}
                      </p>

                      {/* Visibility Checkbox */}
                      <div className="mb-4 flex items-center space-x-2">
                        <Checkbox
                          id={`visibility-${fund.id}`}
                          checked={fund.isVisible ?? true}
                          onCheckedChange={() => handleToggleVisibility(fund.id, fund.isVisible ?? true)}
                          data-testid={`checkbox-visibility-${fund.id}`}
                        />
                        <label
                          htmlFor={`visibility-${fund.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                        >
                          {fund.isVisible ?? true ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {t.visibilityLabel}
                        </label>
                        <Badge variant={fund.isVisible ?? true ? "default" : "secondary"} className="text-xs">
                          {fund.isVisible ?? true ? t.visible : t.hidden}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          {fund.createdAt ? new Date(fund.createdAt).toLocaleDateString() : ''}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(fund)}
                            data-testid={`button-edit-fund-${fund.id}`}
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            {t.edit}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                data-testid={`button-delete-fund-${fund.id}`}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                {t.delete}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t.confirmDelete}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t.confirmDeleteDesc}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(fund.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  data-testid={`button-confirm-delete-fund-${fund.id}`}
                                >
                                  {t.delete}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}