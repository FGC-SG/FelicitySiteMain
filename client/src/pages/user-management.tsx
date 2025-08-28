import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddUserForm } from "@/components/forms/add-user-form";
import { Users, UserPlus, Shield, Edit, Trash2, Search, Filter, Mail, Send } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  password?: string;
  passwordConfirm?: string;
}

export default function UserManagementPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "user"
  });
  const { user: currentUser, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Access Required",
        description: "Please log in to access user management.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: isAuthenticated,
  });

  // Update user role mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      return await apiRequest("PUT", `/api/users/${userId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User updated successfully.",
      });
      setEditingUser(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: language === "en" ? "Success" : "成功",
        description: language === "en" ? "User deleted successfully." : "ユーザーが正常に削除されました。",
      });
    },
    onError: (error: any) => {
      let errorMessage = language === "en" ? "Failed to delete user." : "ユーザーの削除に失敗しました。";
      
      if (error.message?.includes("403")) {
        errorMessage = language === "en" 
          ? "Access denied. Only superusers can delete users." 
          : "アクセスが拒否されました。スーパーユーザーのみがユーザーを削除できます。";
      } else if (error.message?.includes("401")) {
        errorMessage = language === "en" 
          ? "Authentication required. Please log in again." 
          : "認証が必要です。再度ログインしてください。";
      }
      
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async (invitationData: typeof inviteForm) => {
      return await apiRequest("POST", "/api/invitations", invitationData);
    },
    onSuccess: (data: any) => {
      toast({
        title: language === "en" ? "Invitation Sent" : "招待が送信されました",
        description: language === "en" 
          ? "User invitation has been sent successfully. Invitation link copied to clipboard."
          : "ユーザー招待が正常に送信されました。招待リンクがクリップボードにコピーされました。",
      });
      
      // Copy invitation link to clipboard
      if (data.invitationLink && navigator.clipboard) {
        navigator.clipboard.writeText(data.invitationLink);
      }
      
      setShowInviteDialog(false);
      setInviteForm({ email: "", firstName: "", lastName: "", role: "user" });
    },
    onError: (error: any) => {
      toast({
        title: language === "en" ? "Error" : "エラー",
        description: language === "en" 
          ? "Failed to send invitation." 
          : "招待の送信に失敗しました。",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Check if current user is superadmin
  const isSuperadmin = (currentUser as any)?.role === "superadmin" || 
                       (currentUser as any)?.role === "admin" ||
                       (currentUser as any)?.email === "onuma@fgcsg.com";

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superadmin": return "bg-red-100 text-red-800";
      case "user": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = (users as User[]).filter((user: User) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Get unique roles for filtering - restrict to only new roles
  const allowedRoles = ["superadmin", "user"];
  const uniqueRoles = Array.from(new Set((users as User[]).map((user: User) => user.role || "user").filter(role => allowedRoles.includes(role))));

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation language={language} onLanguageChange={setLanguage} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white">
              <div className="flex items-center justify-center mb-4">
                <Users className="h-12 w-12 mr-4" />
                <h1 className="text-4xl font-bold" data-testid="text-user-management-title">
                  {language === "en" ? "User Management" : "ユーザー管理"}
                </h1>
              </div>
              <p className="text-xl opacity-90 mb-6" data-testid="text-user-management-subtitle">
                {language === "en" 
                  ? "Manage team members, roles, and permissions"
                  : "チームメンバー、役割、権限を管理"
                }
              </p>
              {isSuperadmin && (
                <Badge variant="secondary" className="text-primary" data-testid="badge-superadmin-status">
                  <Shield className="h-4 w-4 mr-1" />
                  {language === "en" ? "Superadmin Access" : "スーパー管理者アクセス"}
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Management Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={language === "en" ? "Search users..." : "ユーザーを検索..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                    data-testid="input-search-users"
                  />
                </div>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-40" data-testid="select-role-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={language === "en" ? "All Roles" : "全ての役割"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === "en" ? "All Roles" : "全ての役割"}</SelectItem>
                    {uniqueRoles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>


              </div>

              {isSuperadmin && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setShowInviteDialog(true)}
                    data-testid="button-invite-user"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {language === "en" ? "Invite User" : "ユーザーを招待"}
                  </Button>
                  <Button 
                    onClick={() => window.open("/add-user", "_blank", "width=1200,height=800,scrollbars=yes,resizable=yes")}
                    data-testid="button-add-new-user"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {language === "en" ? "Add User" : "ユーザー追加"}
                  </Button>
                </div>
              )}
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-users-table-title">
                  {language === "en" ? "Users" : "ユーザー"} ({filteredUsers.length})
                </CardTitle>
                <CardDescription>
                  {language === "en" 
                    ? "Manage user accounts, roles, and permissions"
                    : "ユーザーアカウント、役割、権限を管理"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === "en" ? "User" : "ユーザー"}</TableHead>
                        <TableHead>{language === "en" ? "Role" : "役割"}</TableHead>
                        <TableHead>{language === "en" ? "Joined" : "参加日"}</TableHead>
                        {isSuperadmin && <TableHead>{language === "en" ? "Actions" : "アクション"}</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user: User) => (
                        <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {user.firstName?.[0] || user.email[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium" data-testid={`user-name-${user.id}`}>
                                  {user.firstName && user.lastName 
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.email
                                  }
                                </div>
                                <div className="text-sm text-muted-foreground" data-testid={`user-email-${user.id}`}>
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.role || "user")} data-testid={`user-role-${user.id}`}>
                              {user.role || "user"}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`user-joined-${user.id}`}>
                            {new Date(user.createdAt).toLocaleDateString(
                              language === "en" ? "en-US" : "ja-JP"
                            )}
                          </TableCell>
                          {isSuperadmin && (
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setEditingUser(user)}
                                  data-testid={`button-edit-${user.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {user.email !== "onuma@fgcsg.com" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => deleteUserMutation.mutate(user.id)}
                                    data-testid={`button-delete-${user.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </section>



        {/* Invite User Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === "en" ? "Invite New User" : "新しいユーザーを招待"}
              </DialogTitle>
              <DialogDescription>
                {language === "en" 
                  ? "Send an invitation email to add a new user to the system"
                  : "システムに新しいユーザーを追加するための招待メールを送信"
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-email">{language === "en" ? "Email Address" : "メールアドレス"}</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  placeholder={language === "en" ? "Enter email address" : "メールアドレスを入力"}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invite-firstName">{language === "en" ? "First Name" : "名"}</Label>
                  <Input
                    id="invite-firstName"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({...inviteForm, firstName: e.target.value})}
                    placeholder={language === "en" ? "First name" : "名"}
                  />
                </div>
                <div>
                  <Label htmlFor="invite-lastName">{language === "en" ? "Last Name" : "姓"}</Label>
                  <Input
                    id="invite-lastName"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({...inviteForm, lastName: e.target.value})}
                    placeholder={language === "en" ? "Last name" : "姓"}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="invite-role">{language === "en" ? "Role" : "役割"}</Label>
                <Select 
                  value={inviteForm.role} 
                  onValueChange={(value) => setInviteForm({...inviteForm, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  {language === "en" ? "Cancel" : "キャンセル"}
                </Button>
                <Button 
                  onClick={() => sendInvitationMutation.mutate(inviteForm)}
                  disabled={sendInvitationMutation.isPending || !inviteForm.email}
                >
                  {sendInvitationMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {language === "en" ? "Sending..." : "送信中..."}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {language === "en" ? "Send Invitation" : "招待を送信"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        {editingUser && (
          <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {language === "en" ? "Edit User" : "ユーザー編集"}
                </DialogTitle>
                <DialogDescription>
                  {language === "en" 
                    ? "Update user information including name, email, and role"
                    : "名前、メール、役割を含むユーザー情報を更新"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-firstName">{language === "en" ? "First Name" : "名"}</Label>
                  <Input
                    id="edit-firstName"
                    value={editingUser.firstName || ""}
                    onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                    placeholder={language === "en" ? "Enter first name" : "名を入力"}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-lastName">{language === "en" ? "Last Name" : "姓"}</Label>
                  <Input
                    id="edit-lastName"
                    value={editingUser.lastName || ""}
                    onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                    placeholder={language === "en" ? "Enter last name" : "姓を入力"}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-email">{language === "en" ? "Email" : "メールアドレス"}</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingUser.email || ""}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    placeholder={language === "en" ? "Enter email address" : "メールアドレスを入力"}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-role">{language === "en" ? "Role" : "役割"}</Label>
                  <Select 
                    value={editingUser.role || "user"} 
                    onValueChange={(value) => setEditingUser({...editingUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="superadmin">Superadmin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Password Setup Section */}
                <div className="border-t pt-4 mt-6">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      {language === "en" ? "Password Settings" : "パスワード設定"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {language === "en" 
                        ? "Set or update the user's password" 
                        : "ユーザーのパスワードを設定または更新"}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="edit-password">{language === "en" ? "New Password" : "新しいパスワード"}</Label>
                      <Input
                        id="edit-password"
                        type="password"
                        value={editingUser.password || ""}
                        onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                        placeholder={language === "en" ? "Enter new password" : "新しいパスワードを入力"}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-password-confirm">{language === "en" ? "Confirm Password" : "パスワード確認"}</Label>
                      <Input
                        id="edit-password-confirm"
                        type="password"
                        value={editingUser.passwordConfirm || ""}
                        onChange={(e) => setEditingUser({...editingUser, passwordConfirm: e.target.value})}
                        placeholder={language === "en" ? "Confirm new password" : "新しいパスワードを確認"}
                      />
                    </div>
                    
                    {editingUser.password && editingUser.passwordConfirm && editingUser.password !== editingUser.passwordConfirm && (
                      <p className="text-xs text-destructive">
                        {language === "en" ? "Passwords do not match" : "パスワードが一致しません"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                    {language === "en" ? "Cancel" : "キャンセル"}
                  </Button>
                  <Button 
                    onClick={() => {
                      // Validate password match if password is being updated
                      if (editingUser.password && editingUser.password !== editingUser.passwordConfirm) {
                        toast({
                          title: language === "en" ? "Error" : "エラー",
                          description: language === "en" ? "Passwords do not match" : "パスワードが一致しません",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      const updates: any = {
                        firstName: editingUser.firstName,
                        lastName: editingUser.lastName,
                        email: editingUser.email,
                        role: editingUser.role
                      };
                      
                      // Only include password if it's provided
                      if (editingUser.password && editingUser.password.trim()) {
                        updates.password = editingUser.password;
                      }
                      
                      updateUserMutation.mutate({
                        userId: editingUser.id,
                        updates
                      });
                    }}
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending 
                      ? (language === "en" ? "Updating..." : "更新中...")
                      : (language === "en" ? "Update" : "更新")
                    }
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
      
      <Footer language={language} />
    </div>
  );
}