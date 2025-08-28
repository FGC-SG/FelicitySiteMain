import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type Language } from "@/lib/i18n";
import { type NewsArticle } from "@shared/schema";

const editNewsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  language: z.enum(["en", "ja"]),
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
  const form = useForm<EditNewsFormData>({
    resolver: zodResolver(editNewsSchema),
    defaultValues: {
      title: article.title,
      description: article.description || "",
      content: article.content || "",
      category: article.category,
      language: article.language as "en" | "ja",
    },
  });

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
          </div>

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel data-testid="label-language">
                  {language === "en" ? "Language *" : "言語 *"}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue placeholder={language === "en" ? "Select language" : "言語を選択"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="en" data-testid="option-language-en">English</SelectItem>
                    <SelectItem value="ja" data-testid="option-language-ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel data-testid="label-description">
                  {language === "en" ? "Description" : "説明"}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={language === "en" ? "Brief description of the article" : "記事の簡単な説明"}
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