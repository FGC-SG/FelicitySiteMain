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
import type { UploadResult } from "@uppy/core";
import type { Language } from "@/lib/i18n";
import type { Member } from "@shared/schema";

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  bio: z.string().optional(),
  displayOrder: z.number().default(0),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface EditMemberFormProps {
  member: Member;
  language: Language;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditMemberForm({ member, language, onSuccess, onCancel }: EditMemberFormProps) {
  const [photoUrl, setPhotoUrl] = useState<string>(member.photoUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: member.name || "",
      title: member.title || "",
      company: member.company || "",
      bio: member.bio || "",
      displayOrder: member.displayOrder || 0,
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async (data: MemberFormData & { photoUrl?: string }) => {
      const response = await apiRequest("PUT", `/api/members/${member.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: language === "en" ? "Success" : "成功",
        description: language === "en" 
          ? "Member updated successfully" 
          : "メンバーが正常に更新されました",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: language === "en" 
          ? "Failed to update member" 
          : "メンバーの更新に失敗しました",
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

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = (uploadedFile as any).uploadURL || "";
      
      // Normalize the photo URL to use local object serving path
      try {
        const response = await apiRequest("PUT", "/api/member-photos", { photoURL: uploadURL });
        const data = await response.json();
        setPhotoUrl(data.objectPath);
      } catch (error) {
        console.error("Error normalizing photo URL:", error);
        setPhotoUrl(uploadURL); // Fallback to original URL
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

  const onSubmit = (data: MemberFormData) => {
    updateMemberMutation.mutate({
      ...data,
      photoUrl: photoUrl || undefined,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {language === "en" ? "Edit Member" : "メンバーを編集"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Photo Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {photoUrl && (
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                  <img 
                    src={photoUrl} 
                    alt="Member photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={5242880} // 5MB
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-full"
                >
                  <div className="flex items-center gap-2">
                    <span>📸</span>
                    <span>{language === "en" ? "Change Photo" : "写真を変更"}</span>
                  </div>
                </ObjectUploader>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {language === "en" ? "Name" : "氏名"} *
            </Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder={language === "en" ? "Enter full name" : "氏名を入力"}
              data-testid="input-edit-member-name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {language === "en" ? "Title" : "役職"} *
            </Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder={language === "en" ? "Enter job title" : "役職を入力"}
              data-testid="input-edit-member-title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">
              {language === "en" ? "Company" : "会社名"} *
            </Label>
            <Select
              value={form.watch("company")}
              onValueChange={(value) => form.setValue("company", value)}
            >
              <SelectTrigger data-testid="select-edit-member-company">
                <SelectValue placeholder={language === "en" ? "Select company" : "会社を選択"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Felicity Global Capital Pte. Ltd.">
                  Felicity Global Capital Pte. Ltd.
                </SelectItem>
                <SelectItem value="Felicity Capital Co., Ltd.">
                  Felicity Capital Co., Ltd.
                </SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.company && (
              <p className="text-sm text-destructive">{form.formState.errors.company.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              {language === "en" ? "Biography" : "経歴"}
            </Label>
            <Textarea
              id="bio"
              {...form.register("bio")}
              placeholder={language === "en" 
                ? "Enter brief biography and background..." 
                : "簡単な経歴と背景を入力..."}
              rows={4}
              data-testid="textarea-edit-member-bio"
            />
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="displayOrder">
              {language === "en" ? "Display Order" : "表示順序"}
            </Label>
            <Input
              id="displayOrder"
              type="number"
              {...form.register("displayOrder", { valueAsNumber: true })}
              placeholder="0"
              data-testid="input-edit-member-display-order"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={updateMemberMutation.isPending}
              className="flex-1"
              data-testid="button-update-member"
            >
              {updateMemberMutation.isPending
                ? (language === "en" ? "Updating..." : "更新中...")
                : (language === "en" ? "Update Member" : "メンバーを更新")
              }
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
                data-testid="button-cancel-edit-member"
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