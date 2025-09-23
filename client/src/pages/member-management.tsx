import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AddMemberForm } from "@/components/forms/add-member-form";
import { EditMemberForm } from "@/components/forms/edit-member-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { type Member } from "@shared/schema";
import { Users, Edit, Trash2, Plus, ArrowUpDown, Eye, EyeOff } from "lucide-react";

export default function MemberManagementPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [reverseOrder, setReverseOrder] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["/api/members"],
    enabled: isAuthenticated,
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: language === "en" ? "Success" : "成功",
        description: language === "en" 
          ? "Member deleted successfully" 
          : "メンバーが正常に削除されました",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: language === "en" 
          ? "Failed to delete member" 
          : "メンバーの削除に失敗しました",
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      return apiRequest("PUT", `/api/members/${id}`, { isVisible: !isVisible });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: language === "en" ? "Success" : "成功",
        description: language === "en" 
          ? "Member visibility updated successfully" 
          : "メンバーの表示設定が正常に更新されました",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: language === "en" 
          ? "Failed to update member visibility" 
          : "メンバーの表示設定の更新に失敗しました",
        variant: "destructive",
      });
    },
  });

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    toggleVisibilityMutation.mutate({ id, isVisible });
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (confirm(language === "en" 
      ? `Are you sure you want to delete ${name}?` 
      : `${name}を削除してもよろしいですか？`)) {
      deleteMemberMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navigation language={language} onLanguageChange={setLanguage} />
        <main className="pt-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </main>
        <Footer language={language} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Check if current user is superadmin
  const isSuperadmin = (user as any)?.email === "onuma@fgcsg.com" || 
                       (user as any)?.role === "superadmin" || 
                       (user as any)?.role === "admin";

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation language={language} onLanguageChange={setLanguage} />
      
      <main className="pt-16">
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold felicity-primary mb-4" data-testid="text-page-title">
                {language === "en" ? "Member Management" : "メンバー管理"}
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-page-subtitle">
                {language === "en" 
                  ? "Manage team member profiles, photos, and information" 
                  : "チームメンバーのプロフィール、写真、情報を管理"}
              </p>
            </div>

            {/* Action Buttons */}
            {isSuperadmin && (
              <div className="mb-8 flex justify-center gap-4">
                <Button 
                  onClick={() => setShowAddMember(true)}
                  className="gap-2"
                  data-testid="button-add-member"
                >
                  <Plus className="h-4 w-4" />
                  {language === "en" ? "Add New Member" : "新しいメンバーを追加"}
                </Button>
                <Button 
                  onClick={() => setReverseOrder(!reverseOrder)}
                  variant="outline"
                  className="gap-2"
                  data-testid="button-reverse-display-order"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {language === "en" 
                    ? (reverseOrder ? "Normal Order" : "Reverse Order")
                    : (reverseOrder ? "通常順序" : "逆順序")
                  }
                </Button>
              </div>
            )}

            {/* Members Grid */}
            {membersLoading ? (
              <div className="text-center py-12">
                <div className="text-lg">{language === "en" ? "Loading members..." : "メンバーを読み込み中..."}</div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  let sortedMembers = (members as Member[]) ? [...(members as Member[])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) : [];
                  if (reverseOrder) {
                    sortedMembers = sortedMembers.reverse();
                  }
                  return sortedMembers;
                })().map((member) => (
                  <Card key={member.id} className="overflow-hidden" data-testid={`card-member-${member.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="w-12 h-12 rounded-full object-cover"
                              data-testid={`img-member-photo-${member.id}`}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg" data-testid={`text-member-name-${member.id}`}>
                              {member.name}
                            </CardTitle>
                            <CardDescription data-testid={`text-member-title-${member.id}`}>
                              {member.title}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" data-testid={`badge-member-order-${member.id}`}>
                          #{member.displayOrder || 0}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground" data-testid={`text-member-company-${member.id}`}>
                          <strong>{language === "en" ? "Company:" : "会社:"}</strong> {member.company}
                        </p>
                        {member.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-member-bio-${member.id}`}>
                            {member.bio}
                          </p>
                        )}
                      </div>
                      
                      {/* Visibility Control */}
                      {isSuperadmin && (
                        <div className="mt-4 mb-3 flex items-center space-x-2 pb-2 border-b border-gray-100">
                          <Checkbox
                            id={`visibility-${member.id}`}
                            checked={member.isVisible !== false}
                            onCheckedChange={() => handleToggleVisibility(member.id, member.isVisible !== false)}
                            data-testid={`checkbox-visibility-${member.id}`}
                          />
                          <label
                            htmlFor={`visibility-${member.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                          >
                            {member.isVisible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {language === 'en' ? 'Show on Members Page' : 'メンバーページに表示'}
                          </label>
                          <Badge variant={member.isVisible !== false ? "default" : "secondary"} className="text-xs">
                            {member.isVisible !== false 
                              ? (language === 'en' ? 'Visible' : '表示中') 
                              : (language === 'en' ? 'Hidden' : '非表示')}
                          </Badge>
                        </div>
                      )}
                      
                      {isSuperadmin && (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingMember(member)}
                            className="flex-1"
                            data-testid={`button-edit-member-${member.id}`}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {language === "en" ? "Edit" : "編集"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            disabled={deleteMemberMutation.isPending}
                            className="flex-1"
                            data-testid={`button-delete-member-${member.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {language === "en" ? "Delete" : "削除"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!membersLoading && (!members || (members as Member[]).length === 0) && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === "en" ? "No members yet" : "まだメンバーがいません"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === "en" 
                    ? "Get started by adding your first team member" 
                    : "最初のチームメンバーを追加して始めましょう"}
                </p>
                <Button onClick={() => setShowAddMember(true)} data-testid="button-add-first-member">
                  {language === "en" ? "Add First Member" : "最初のメンバーを追加"}
                </Button>
              </div>
            )}

          </div>
        </section>

        {/* Add Member Form Modal */}
        {showAddMember && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {language === "en" ? "Add Team Member" : "チームメンバーを追加"}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddMember(false)}
                    data-testid="button-close-member-form"
                  >
                    {language === "en" ? "Close" : "閉じる"}
                  </Button>
                </div>
                <AddMemberForm
                  language={language}
                  onSuccess={() => {
                    setShowAddMember(false);
                    toast({
                      title: language === "en" ? "Success" : "成功",
                      description: language === "en" 
                        ? "Member has been added successfully." 
                        : "メンバーが正常に追加されました。",
                    });
                  }}
                  onCancel={() => setShowAddMember(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Member Form Modal */}
        {editingMember && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {language === "en" ? "Edit Team Member" : "チームメンバーを編集"}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingMember(null)}
                    data-testid="button-close-edit-member-form"
                  >
                    {language === "en" ? "Close" : "閉じる"}
                  </Button>
                </div>
                <EditMemberForm
                  member={editingMember}
                  language={language}
                  onSuccess={() => {
                    setEditingMember(null);
                    toast({
                      title: language === "en" ? "Success" : "成功",
                      description: language === "en" 
                        ? "Member has been updated successfully." 
                        : "メンバーが正常に更新されました。",
                    });
                  }}
                  onCancel={() => setEditingMember(null)}
                />
              </div>
            </div>
          </div>
        )}

      </main>
      <Footer language={language} />
    </div>
  );
}