import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Calendar, Building } from "lucide-react";
import { type Language } from "@/lib/i18n";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  title?: string;
  isActive: boolean;
  createdAt: string;
}

interface UsersTableProps {
  language: Language;
}

export function UsersTable({ language }: UsersTableProps) {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return await response.json();
    },
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "manager": return "bg-blue-100 text-blue-800";
      case "analyst": return "bg-green-100 text-green-800";
      case "member": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: language === "en" ? "Administrator" : "管理者",
      manager: language === "en" ? "Manager" : "マネージャー",
      member: language === "en" ? "Member" : "メンバー",
      analyst: language === "en" ? "Analyst" : "アナリスト",
      viewer: language === "en" ? "Viewer" : "閲覧者",
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getDepartmentLabel = (department: string) => {
    const labels = {
      investment: language === "en" ? "Investment" : "投資部門",
      research: language === "en" ? "Research" : "調査部門",
      operations: language === "en" ? "Operations" : "運営部門",
      compliance: language === "en" ? "Compliance" : "コンプライアンス",
      technology: language === "en" ? "Technology" : "テクノロジー",
    };
    return labels[department as keyof typeof labels] || department;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-users-loading">
            {language === "en" ? "Loading users..." : "ユーザーを読み込み中..."}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600" data-testid="text-users-error">
            {language === "en" ? "Error loading users" : "ユーザーの読み込みエラー"}
          </CardTitle>
          <CardDescription>
            {language === "en" 
              ? "Unable to fetch user data. Please try again later." 
              : "ユーザーデータを取得できません。後でもう一度お試しください。"
            }
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2" data-testid="text-users-title">
          <Users className="h-5 w-5" />
          <span>{language === "en" ? "Team Members" : "チームメンバー"}</span>
        </CardTitle>
        <CardDescription data-testid="text-users-description">
          {language === "en" 
            ? "Manage team members and their roles within the organization"
            : "組織内のチームメンバーとその役割を管理します"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users && users.length > 0 ? (
            users.map((user: User) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card"
                data-testid={`user-card-${user.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg" data-testid={`user-name-${user.id}`}>
                      {user.firstName} {user.lastName}
                    </h3>
                    <Badge className={getRoleColor(user.role)} data-testid={`user-role-${user.id}`}>
                      {getRoleLabel(user.role)}
                    </Badge>
                    {!user.isActive && (
                      <Badge variant="secondary" data-testid={`user-status-${user.id}`}>
                        {language === "en" ? "Inactive" : "非アクティブ"}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span data-testid={`user-email-${user.id}`}>{user.email}</span>
                    </div>
                    
                    {user.department && (
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span data-testid={`user-department-${user.id}`}>
                          {getDepartmentLabel(user.department)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span data-testid={`user-created-${user.id}`}>
                        {language === "en" ? "Joined" : "参加日"}: {" "}
                        {new Date(user.createdAt).toLocaleDateString(
                          language === "en" ? "en-US" : "ja-JP"
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {user.title && (
                    <p className="text-sm text-muted-foreground mt-1" data-testid={`user-title-${user.id}`}>
                      {user.title}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    data-testid={`button-edit-user-${user.id}`}
                  >
                    {language === "en" ? "Edit" : "編集"}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-users">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {language === "en" 
                  ? "No team members found. Add your first user to get started."
                  : "チームメンバーが見つかりません。最初のユーザーを追加して開始してください。"
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}