import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Language } from "@/lib/i18n";

const addNewsSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  content: z.string().min(1, "Content is required"),
  titleJa: z.string().optional(),
  descriptionJa: z.string().optional(),
  contentJa: z.string().optional(),
  language: z.enum(["en", "jp"]),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
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

  const form = useForm<AddNewsForm>({
    resolver: zodResolver(addNewsSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      titleJa: "",
      descriptionJa: "",
      contentJa: "",
      language: language,
      category: "",
      tags: "",
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
            {/* Language section title - fixed as English */}
            <div className="border-b pb-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">English</h3>
            </div>

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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-news-description">
                    {language === "en" ? "Short Description" : "短い説明"}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={language === "en" ? "Brief summary of the article" : "記事の簡潔な要約"}
                      className="min-h-[100px]"
                      {...field}
                      data-testid="textarea-news-description"
                    />
                  </FormControl>
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

            {/* Japanese Content Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
              <h3 className="text-lg font-semibold text-foreground">
                Japanese
              </h3>
              
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
                name="descriptionJa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-news-description-ja">
                      {language === "en" ? "Short Description (Japanese)" : "短い説明（日本語）"}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={language === "en" ? "Brief summary in Japanese" : "日本語での簡潔な要約"}
                        className="min-h-[100px]"
                        {...field}
                        data-testid="textarea-news-description-ja"
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

            <div className="grid md:grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-news-tags">
                      {language === "en" ? "Tags (Optional)" : "タグ（オプション）"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={language === "en" ? "Comma-separated tags" : "コンマ区切りのタグ"}
                        {...field}
                        data-testid="input-news-tags"
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