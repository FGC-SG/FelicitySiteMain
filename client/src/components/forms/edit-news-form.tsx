import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type Language } from "@/lib/i18n";
import { type NewsArticle } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Languages, ArrowUp, ArrowDown } from "lucide-react";

const editNewsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  titleJa: z.string().optional(),
  contentJa: z.string().optional(),
  attachmentUrl: z.string().optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  language: z.enum(["en", "ja"]),
  publishedAt: z.string().min(1, "Announcement date is required"),
});

type EditNewsFormData = z.infer<typeof editNewsSchema>;

interface EditNewsFormProps {
  article: NewsArticle;
  language: Language;
  onSave: (data: EditNewsFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EditNewsForm({ article, language, onSave, onCancel, isLoading }: EditNewsFormProps) {
  const { toast } = useToast();
  
  const form = useForm<EditNewsFormData>({
    resolver: zodResolver(editNewsSchema),
    defaultValues: {
      title: article.title,
      content: article.content || "",
      titleJa: article.titleJa || "",
      contentJa: article.contentJa || "",
      attachmentUrl: article.attachmentUrl || "",
      category: article.category,
      language: article.language as "en" | "ja",
      publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  // Translation mutations
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

  const handleTranslateTitle = () => {
    const englishTitle = form.getValues('title');
    const japaneseTitle = form.getValues('titleJa');
    
    if (englishTitle && !japaneseTitle) {
      translateTitleMutation.mutate({ text: englishTitle, sourceLanguage: 'en', targetLanguage: 'jp' });
    } else if (japaneseTitle && !englishTitle) {
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
    
    if (englishContent && !japaneseContent) {
      translateContentMutation.mutate({ text: englishContent, sourceLanguage: 'en', targetLanguage: 'jp' });
    } else if (japaneseContent && !englishContent) {
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

  const handleSubmit = (data: EditNewsFormData) => {
    onSave(data);
  };

  const categories = [
    "NEWS AT PORTFOLIO",
    "CORPORATE", 
    "INVESTMENTS",
    "FUND-FORMATION",
    "GENERAL",
    "ANNOUNCEMENT"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">
          {language === "en" ? "Edit News Article" : "ニュース記事を編集"}
        </h3>
        <Button
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel-edit"
        >
          {language === "en" ? "Cancel" : "キャンセル"}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-title">
                    {language === "en" ? "Title *" : "タイトル *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={language === "en" ? "Enter article title" : "記事のタイトルを入力"}
                      data-testid="input-title"
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
                  <FormLabel data-testid="label-category">
                    {language === "en" ? "Category *" : "カテゴリー *"}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder={language === "en" ? "Select category" : "カテゴリーを選択"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} data-testid={`option-${cat.toLowerCase().replace(/\s+/g, '-')}`}>
                          {cat}
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
              name="publishedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-published-at">
                    {language === "en" ? "Date of Announcement *" : "発表日 *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      data-testid="input-published-at"
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
                  {language === "en" ? "File Embed URL (Optional)" : "ファイル埋め込みURL（オプション）"}
                </FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder={language === "en" ? "https://example.com/embed/..." : "https://example.com/embed/..."}
                    {...field}
                    data-testid="input-news-attachment"
                  />
                </FormControl>
                <FormDescription>
                  {language === "en" 
                    ? "Enter iframe embed URL (not a regular sharing link). For SharePoint files, upload to Object Storage instead for reliable embedding." 
                    : "iframe埋め込みURL（通常の共有リンクではありません）を入力してください。SharePointファイルの場合は、信頼性の高い埋め込みのためにオブジェクトストレージにアップロードしてください。"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Language section title - fixed as English */}
          <div className="border-b pb-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">English</h3>
          </div>

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel data-testid="label-content">
                  {language === "en" ? "Content *" : "内容 *"}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={language === "en" ? "Full article content" : "記事の全文"}
                    rows={8}
                    data-testid="textarea-content"
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
                // Handle all field translations
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

          {/* Japanese Translation Section */}
          <div className="border-t pt-6 mt-6">
            <h4 className="text-lg font-semibold mb-4 text-blue-600">
              Japanese
            </h4>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="titleJa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-title-ja">
                      {language === "en" ? "Japanese Title" : "日本語タイトル"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={language === "en" ? "Enter Japanese title" : "日本語タイトルを入力"}
                        data-testid="input-title-ja"
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
                    <FormLabel data-testid="label-content-ja">
                      {language === "en" ? "Japanese Content" : "日本語内容"}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={language === "en" ? "Full Japanese article content" : "日本語記事の全文"}
                        rows={8}
                        data-testid="textarea-content-ja"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="button-save-changes"
            >
              {isLoading 
                ? (language === "en" ? "Saving..." : "保存中...") 
                : (language === "en" ? "Save Changes" : "変更を保存")
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              data-testid="button-cancel-edit-form"
            >
              {language === "en" ? "Cancel" : "キャンセル"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}