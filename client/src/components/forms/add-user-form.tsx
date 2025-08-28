import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Language } from "@/lib/i18n";

const addUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  role: z.string().min(1, "Role is required"),
});

type AddUserForm = z.infer<typeof addUserSchema>;

interface AddUserFormProps {
  language: Language;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddUserForm({ language, onSuccess, onCancel }: AddUserFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddUserForm>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "user",
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async (data: AddUserForm) => {
      const response = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to create user");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: language === "en" ? "Success" : "成功",
        description: language === "en" 
          ? "User has been created successfully." 
          : "ユーザーが正常に作成されました。",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: error.message || (language === "en" 
          ? "Failed to create user. Please try again." 
          : "ユーザーの作成に失敗しました。もう一度お試しください。"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: AddUserForm) => {
    setIsSubmitting(true);
    try {
      await addUserMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { value: "superadmin", label: language === "en" ? "Superadmin" : "スーパー管理者" },
    { value: "user", label: language === "en" ? "User" : "ユーザー" },
  ];



  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle data-testid="text-add-user-title">
          {language === "en" ? "Create New User" : "新しいユーザーを作成"}
        </CardTitle>
        <CardDescription data-testid="text-add-user-description">
          {language === "en" 
            ? "Add a new team member to the Felicity Global Capital system"
            : "フェリシティグローバルキャピタルシステムに新しいチームメンバーを追加します"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-user-firstname">
                      {language === "en" ? "First Name" : "名"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={language === "en" ? "Enter first name" : "名を入力"}
                        {...field}
                        data-testid="input-user-firstname"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-user-lastname">
                      {language === "en" ? "Last Name" : "姓"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={language === "en" ? "Enter last name" : "姓を入力"}
                        {...field}
                        data-testid="input-user-lastname"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-user-email">
                    {language === "en" ? "Email Address" : "メールアドレス"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder={language === "en" ? "Enter email address" : "メールアドレスを入力"}
                      {...field}
                      data-testid="input-user-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-user-role">
                    {language === "en" ? "Role" : "役割"}
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-user-role">
                        <SelectValue placeholder={language === "en" ? "Select role" : "役割を選択"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-6 border-t">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  data-testid="button-cancel-user"
                >
                  {language === "en" ? "Cancel" : "キャンセル"}
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting || addUserMutation.isPending}
                className="min-w-[120px]"
                data-testid="button-submit-user"
              >
                {isSubmitting || addUserMutation.isPending
                  ? (language === "en" ? "Creating..." : "作成中...")
                  : (language === "en" ? "Create User" : "ユーザーを作成")
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}