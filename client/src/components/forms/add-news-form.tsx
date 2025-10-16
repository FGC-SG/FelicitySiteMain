import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Language } from "@/lib/i18n";
import { Languages, ArrowUp, ArrowDown } from "lucide-react";

const addNewsSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required"),
  titleJa: z.string().optional(),
  contentJa: z.string().optional(),
  attachmentUrl: z.string().optional().or(z.literal("")),
  language: z.enum(["en", "jp"]),
  category: z.string().min(1, "Category is required"),
  felicityCompany: z.enum(["felicity-singapore", "felicity-japan"]),
  publishedAt: z.string().min(1, "Announcement date is required"),
});

type AddNewsForm = z.infer<typeof addNewsSchema>;

interface AddNewsFormProps {
  language: Language;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddNewsForm({ language, onSuccess, onCancel }: AddNewsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Translation mutations for title and content
  const translateTitleMutation = useMutation({
    mutationFn: async ({ text, sourceLanguage, targetLanguage }: { text: string; sourceLanguage: string; targetLanguage: string }) => {
      const response = await apiRequest('POST', '/api/translate', { text, sourceLanguage, targetLanguage });
      return response.json();
    },
    onSuccess: (data: { translatedText: string }, { targetLanguage }) => {
      if (targetLanguage === 'jp') {
        form.setValue('titleJa', data.translatedText);
      } else {
        form.setValue('title', data.translatedText);
      }
      toast({
        title: language === 'jp' ? "翻訳完了" : "Translation Complete",
        description: language === 'jp' ? "タイトルが翻訳されました。" : "Title has been translated.",
      });
    },
    onError: (error: any) => {
      let errorMessage = error.message || (language === 'jp' ? "翻訳に失敗しました。" : "Failed to translate text.");
      
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        errorMessage = language === 'jp' 
          ? "翻訳サービスの利用制限に達しました。しばらく時間をおいて再度お試しください。"
          : "Translation service temporarily unavailable due to quota limits. Please try again later.";
      } else if (error.message?.includes('configuration') || error.message?.includes('401')) {
        errorMessage = language === 'jp' 
          ? "翻訳サービスの設定に問題があります。管理者にお問い合わせください。"
          : "Translation service configuration issue. Please contact administrator.";
      }

      toast({
        title: language === 'jp' ? "翻訳エラー" : "Translation Error", 
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const translateContentMutation = useMutation({
    mutationFn: async ({ text, sourceLanguage, targetLanguage }: { text: string; sourceLanguage: string; targetLanguage: string }) => {
      const response = await apiRequest('POST', '/api/translate', { text, sourceLanguage, targetLanguage });
      return response.json();
    },
    onSuccess: (data: { translatedText: string }, { targetLanguage }) => {
      if (targetLanguage === 'jp') {
        form.setValue('contentJa', data.translatedText);
      } else {
        form.setValue('content', data.translatedText);
      }
      toast({
        title: language === 'jp' ? "翻訳完了" : "Translation Complete",
        description: language === 'jp' ? "内容が翻訳されました。" : "Content has been translated.",
      });
    },
    onError: (error: any) => {
      let errorMessage = error.message || (language === 'jp' ? "翻訳に失敗しました。" : "Failed to translate text.");
      
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        errorMessage = language === 'jp' 
          ? "翻訳サービスの利用制限に達しました。しばらく時間をおいて再度お試しください。"
          : "Translation service temporarily unavailable due to quota limits. Please try again later.";
      } else if (error.message?.includes('configuration') || error.message?.includes('401')) {
        errorMessage = language === 'jp' 
          ? "翻訳サービスの設定に問題があります。管理者にお問い合わせください。"
          : "Translation service configuration issue. Please contact administrator.";
      }

      toast({
        title: language === 'jp' ? "翻訳エラー" : "Translation Error", 
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const form = useForm<AddNewsForm>({
    resolver: zodResolver(addNewsSchema),
    defaultValues: {
      title: "",
      content: "",
      titleJa: "",
      contentJa: "",
      attachmentUrl: "",
      language: language,
      category: "",
      felicityCompany: "felicity-singapore",
      publishedAt: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    },
  });

  const addNewsMutation = useMutation({
    mutationFn: async (data: AddNewsForm) => {
      const response = await fetch("/api/news", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to create news article");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "News article has been added successfully.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add news article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: AddNewsForm) => {
    setIsSubmitting(true);
    try {
      await addNewsMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: "company", label: language === "en" ? "Company News" : "会社ニュース" },
    { value: "investment", label: language === "en" ? "Investment Updates" : "投資アップデート" },
    { value: "market", label: language === "en" ? "Market Analysis" : "市場分析" },
    { value: "announcement", label: language === "en" ? "Announcements" : "お知らせ" },
  ];

  const handleTranslateTitle = () => {
    const englishTitle = form.getValues('title');
    const japaneseTitle = form.getValues('titleJa');
    
    // Determine which direction to translate based on which field is empty
    if (englishTitle && !japaneseTitle) {
      // Translate English to Japanese
      translateTitleMutation.mutate({ text: englishTitle, sourceLanguage: 'en', targetLanguage: 'jp' });
    } else if (japaneseTitle && !englishTitle) {
      // Translate Japanese to English
      translateTitleMutation.mutate({ text: japaneseTitle, sourceLanguage: 'jp', targetLanguage: 'en' });
    } else if (!englishTitle && !japaneseTitle) {
      toast({
        title: language === 'jp' ? "翻訳エラー" : "Translation Error",
        description: language === 'jp' ? "翻訳するにはどちらかのタイトルフィールドに入力してください。" : "Please enter text in one of the title fields to translate.",
        variant: "destructive",
      });
    } else {
      toast({
        title: language === 'jp' ? "翻訳エラー" : "Translation Error",
        description: language === 'jp' ? "両方のフィールドに内容がある場合は翻訳できません。" : "Cannot translate when both fields have content.",
        variant: "destructive",
      });
    }
  };

  const handleTranslateContent = () => {
    const englishContent = form.getValues('content');
    const japaneseContent = form.getValues('contentJa');
    
    // Determine which direction to translate based on which field is empty
    if (englishContent && !japaneseContent) {
      // Translate English to Japanese
      translateContentMutation.mutate({ text: englishContent, sourceLanguage: 'en', targetLanguage: 'jp' });
    } else if (japaneseContent && !englishContent) {
      // Translate Japanese to English
      translateContentMutation.mutate({ text: japaneseContent, sourceLanguage: 'jp', targetLanguage: 'en' });
    } else if (!englishContent && !japaneseContent) {
      toast({
        title: language === 'jp' ? "翻訳エラー" : "Translation Error",
        description: language === 'jp' ? "翻訳するにはどちらかの内容フィールドに入力してください。" : "Please enter text in one of the content fields to translate.",
        variant: "destructive",
      });
    } else {
      toast({
        title: language === 'jp' ? "翻訳エラー" : "Translation Error",
        description: language === 'jp' ? "両方のフィールドに内容がある場合は翻訳できません。" : "Cannot translate when both fields have content.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle data-testid="text-add-news-title">
          {language === "en" ? "Add News Article" : "ニュース記事を追加"}
        </CardTitle>
        <CardDescription data-testid="text-add-news-description">
          {language === "en" 
            ? "Create a new news article to share company updates and insights"
            : "会社の最新情報や洞察を共有するための新しいニュース記事を作成します"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-news-title">
                      {language === "en" ? "Article Title" : "記事タイトル"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={language === "en" ? "Enter article title" : "記事タイトルを入力"}
                        {...field}
                        data-testid="input-news-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-news-category">
                      {language === "en" ? "Category" : "カテゴリー"}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-news-category">
                          <SelectValue placeholder={language === "en" ? "Select category" : "カテゴリーを選択"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
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
                name="felicityCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-felicity-company">
                      {language === "en" ? "Felicity Company" : "フェリシティ会社"}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-felicity-company">
                          <SelectValue placeholder={language === "en" ? "Select company" : "会社を選択"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="felicity-singapore">
                          {language === "en" ? "Felicity Singapore" : "フェリシティ・シンガポール"}
                        </SelectItem>
                        <SelectItem value="felicity-japan">
                          {language === "en" ? "Felicity Japan" : "フェリシティ・ジャパン"}
                        </SelectItem>
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
                  <FormItem>
                    <FormLabel data-testid="label-news-published-at">
                      {language === "en" ? "Date of Announcement" : "発表日"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                        data-testid="input-news-published-at"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="attachmentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-news-attachment">
                    {language === "en" ? "SharePoint URL (Optional)" : "SharePoint URL（オプション）"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="url"
                      placeholder={language === "en" ? "https://yourcompany.sharepoint.com/..." : "https://yourcompany.sharepoint.com/..."}
                      {...field}
                      data-testid="input-news-attachment"
                    />
                  </FormControl>
                  <FormDescription>
                    {language === "en" 
                      ? "Enter SharePoint file URL. File will be displayed in embedded viewer." 
                      : "SharePointファイルURLを入力してください。ファイルは埋め込みビューアーで表示されます。"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-news-content">
                    {language === "en" ? "Article Content (English)" : "記事内容（英語）"}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={language === "en" ? "Full article content in English" : "英語での記事の全内容"}
                      className="min-h-[300px]"
                      {...field}
                      data-testid="textarea-news-content"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Translation Section */}
            <div className="flex justify-center py-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  // Handle both title and content translation
                  handleTranslateTitle();
                  handleTranslateContent();
                }}
                disabled={translateTitleMutation.isPending || translateContentMutation.isPending}
                className="flex items-center gap-2 px-6"
                data-testid="button-translate-all"
              >
                <div className="flex flex-col items-center">
                  <ArrowUp className="w-3 h-3" />
                  <Languages className="w-4 h-4" />
                  <ArrowDown className="w-3 h-3" />
                </div>
                {translateTitleMutation.isPending || translateContentMutation.isPending
                  ? (language === 'jp' ? "翻訳中..." : "Translating...") 
                  : (language === 'jp' ? "翻訳" : "Translate")
                }
              </Button>
            </div>

            {/* Japanese Content Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Japanese
                </h3>
                <div className="text-sm text-muted-foreground">
                  {language === "en" ? "Use translate buttons to convert between languages" : "翻訳ボタンを使用して言語を変換"}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="titleJa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-news-title-ja">
                      {language === "en" ? "Article Title (Japanese)" : "記事タイトル（日本語）"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={language === "en" ? "Japanese title" : "日本語タイトル"}
                        {...field}
                        data-testid="input-news-title-ja"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contentJa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-news-content-ja">
                      {language === "en" ? "Article Content (Japanese)" : "記事内容（日本語）"}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={language === "en" ? "Full article content in Japanese" : "日本語での記事の全内容"}
                        className="min-h-[300px]"
                        {...field}
                        data-testid="textarea-news-content-ja"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <div className="flex justify-end space-x-4 pt-6 border-t">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  data-testid="button-cancel-news"
                >
                  {language === "en" ? "Cancel" : "キャンセル"}
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting || addNewsMutation.isPending}
                className="min-w-[120px]"
                data-testid="button-submit-news"
              >
                {isSubmitting || addNewsMutation.isPending
                  ? (language === "en" ? "Adding..." : "追加中...")
                  : (language === "en" ? "Add Article" : "記事を追加")
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}