import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { Trash2 } from "lucide-react";
import type { UploadResult } from "@uppy/core";
import type { Language } from "@/lib/i18n";

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameJa: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  titleJa: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  companyJa: z.string().optional(),
  bio: z.string().max(1000, "Biography must be 1000 characters or less").optional(),
  bioJa: z.string().max(1000, "Biography must be 1000 characters or less").optional(),
  displayOrder: z.number().default(0),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface AddMemberFormProps {
  language: Language;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddMemberForm({ language, onSuccess, onCancel }: AddMemberFormProps) {
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      nameJa: "",
      title: "",
      titleJa: "",
      company: "",
      companyJa: "",
      bio: "",
      bioJa: "",
      displayOrder: 0,
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: async (data: MemberFormData & { photoUrl?: string }) => {
      const response = await apiRequest("POST", "/api/members", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: language === "en" ? "Success" : "成功",
        description: language === "en" 
          ? "Member added successfully" 
          : "メンバーが正常に追加されました",
      });
      form.reset();
      setPhotoUrl("");
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: language === "en" 
          ? "Failed to add member" 
          : "メンバーの追加に失敗しました",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: { successful: Array<{ uploadURL: string }> }) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = (uploadedFile as any).uploadURL || "";
      
      try {
        const response = await apiRequest("PUT", "/api/member-photos", { photoURL: uploadURL });
        const data = await response.json();
        setPhotoUrl(data.objectPath);
      } catch (error) {
        console.error("Error normalizing photo URL:", error);
        setPhotoUrl(uploadURL);
      }
      
      setIsUploading(false);
      toast({
        title: language === "en" ? "Success" : "成功",
        description: language === "en" 
          ? "Photo uploaded successfully" 
          : "写真のアップロードが完了しました",
      });
    }
  };

  const handleDeletePhoto = () => {
    setPhotoUrl("");
    toast({
      title: language === "en" ? "Success" : "成功",
      description: language === "en" 
        ? "Photo removed successfully" 
        : "写真が正常に削除されました",
    });
  };

  const onSubmit = (data: MemberFormData) => {
    createMemberMutation.mutate({
      ...data,
      photoUrl: photoUrl || undefined,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {language === "en" ? "Add Team Member" : "チームメンバーを追加"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload Section */}
          <div className="space-y-2">
            <Label>{language === "en" ? "Photo (Optional)" : "写真（任意）"}</Label>
            <div className="flex items-center gap-4">
              {photoUrl && (
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                  <img 
                    src={photoUrl} 
                    alt="Member photo preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={5242880}
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-fit"
                >
                  <div className="flex items-center gap-2">
                    <span>📷</span>
                    <span>{language === "en" ? "Upload Photo" : "写真をアップロード"}</span>
                  </div>
                </ObjectUploader>
                {photoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeletePhoto}
                    className="w-fit text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    data-testid="button-delete-photo"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {language === "en" ? "Delete Photo" : "写真を削除"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* English Content Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">
              🇬🇧 English Content
            </h3>
            
            {/* Name (EN) */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="name">Full Name (English) *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter full name"
                data-testid="input-member-name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Title (EN) */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="title">Job Title (English) *</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Enter job title"
                data-testid="input-member-title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            {/* Company (EN) */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="company">Company (English) *</Label>
              <Select
                value={form.watch("company")}
                onValueChange={(value) => form.setValue("company", value)}
              >
                <SelectTrigger data-testid="select-member-company">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Felicity Global Capital Pte. Ltd.">
                    Felicity Global Capital Pte. Ltd.
                  </SelectItem>
                  <SelectItem value="Felicity Capital Co., Ltd.">
                    Felicity Capital Co., Ltd.
                  </SelectItem>
                  <SelectItem value="Felicity Group">
                    Felicity Group
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.company && (
                <p className="text-sm text-destructive">{form.formState.errors.company.message}</p>
              )}
            </div>

            {/* Bio (EN) */}
            <div className="space-y-2">
              <Label htmlFor="bio">Biography (English)</Label>
              <Textarea
                id="bio"
                {...form.register("bio")}
                placeholder="Enter brief biography and background..."
                rows={4}
                data-testid="textarea-member-bio"
              />
              <div className="flex justify-between items-center text-sm">
                <span className={(form.watch("bio") || "").length > 1000 ? "text-destructive" : "text-muted-foreground"}>
                  {(form.watch("bio") || "").length} / 1000 characters
                </span>
              </div>
            </div>
          </div>

          {/* Japanese Content Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              🇯🇵 Japanese Content (日本語)
            </h3>
            
            {/* Name (JP) */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="nameJa">氏名 (日本語)</Label>
              <Input
                id="nameJa"
                {...form.register("nameJa")}
                placeholder="氏名を入力"
                data-testid="input-member-name-ja"
              />
            </div>

            {/* Title (JP) */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="titleJa">役職 (日本語)</Label>
              <Input
                id="titleJa"
                {...form.register("titleJa")}
                placeholder="役職を入力"
                data-testid="input-member-title-ja"
              />
            </div>

            {/* Company (JP) */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="companyJa">会社名 (日本語)</Label>
              <Select
                value={form.watch("companyJa") || ""}
                onValueChange={(value) => form.setValue("companyJa", value)}
              >
                <SelectTrigger data-testid="select-member-company-ja">
                  <SelectValue placeholder="会社を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="フェリシティ・グローバル・キャピタル">
                    フェリシティ・グローバル・キャピタル
                  </SelectItem>
                  <SelectItem value="フェリシティキャピタル株式会社">
                    フェリシティキャピタル株式会社
                  </SelectItem>
                  <SelectItem value="フェリシティグループ">
                    フェリシティグループ
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bio (JP) */}
            <div className="space-y-2">
              <Label htmlFor="bioJa">経歴 (日本語)</Label>
              <Textarea
                id="bioJa"
                {...form.register("bioJa")}
                placeholder="簡単な経歴と背景を入力..."
                rows={4}
                data-testid="textarea-member-bio-ja"
              />
              <div className="flex justify-between items-center text-sm">
                <span className={(form.watch("bioJa") || "").length > 1000 ? "text-destructive" : "text-muted-foreground"}>
                  {(form.watch("bioJa") || "").length} / 1000 文字
                </span>
              </div>
            </div>
          </div>

          {/* Display Order */}
          <div className="space-y-2 border-t pt-6">
            <Label htmlFor="displayOrder">
              {language === "en" ? "Display Order" : "表示順序"}
            </Label>
            <Input
              id="displayOrder"
              type="number"
              {...form.register("displayOrder", { valueAsNumber: true })}
              placeholder="0"
              data-testid="input-member-display-order"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={createMemberMutation.isPending}
              className="flex-1"
              data-testid="button-submit-member"
            >
              {createMemberMutation.isPending
                ? (language === "en" ? "Adding..." : "追加中...")
                : (language === "en" ? "Add Member" : "メンバーを追加")
              }
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
                data-testid="button-cancel-member"
              >
                {language === "en" ? "Cancel" : "キャンセル"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
