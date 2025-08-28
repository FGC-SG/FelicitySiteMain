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
import { Users, UserPlus, Shield, Edit, Trash2, Search, Filter } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  department?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserManagementPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
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
        window.location.href = "/api/login";
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
      return await apiRequest(`/api/users/${userId}`, "PUT", updates);
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
      return await apiRequest(`/api/users/${userId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user.",
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

  // Check if current user is superuser
  const isSuperuser = (currentUser as any)?.email === "onuma@fgcsg.com" || (currentUser as any)?.role === "superuser";

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superuser": return "bg-red-100 text-red-800";
      case "admin": return "bg-purple-100 text-purple-800";
      case "manager": return "bg-blue-100 text-blue-800";
      case "member": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = (users as User[]).filter((user: User) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesDepartment = departmentFilter === "all" || user.department === departmentFilter;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const uniqueRoles = Array.from(new Set((users as User[]).map((user: User) => user.role).filter(Boolean)));
  const uniqueDepartments = Array.from(new Set((users as User[]).map((user: User) => user.department).filter(Boolean)));

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
              {isSuperuser && (
                <Badge variant="secondary" className="text-primary" data-testid="badge-superuser-status">
                  <Shield className="h-4 w-4 mr-1" />
                  {language === "en" ? "Superuser Access" : "スーパーユーザーアクセス"}
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

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-48" data-testid="select-department-filter">
                    <SelectValue placeholder={language === "en" ? "All Departments" : "全ての部署"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === "en" ? "All Departments" : "全ての部署"}</SelectItem>
                    {uniqueDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isSuperuser && (
                <Button 
                  onClick={() => setShowAddUser(true)}
                  data-testid="button-add-new-user"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {language === "en" ? "Add User" : "ユーザー追加"}
                </Button>
              )}
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-users-table-title">
                  {language === "en" ? "Team Members" : "チームメンバー"} ({filteredUsers.length})
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
                        <TableHead>{language === "en" ? "Department" : "部署"}</TableHead>
                        <TableHead>{language === "en" ? "Joined" : "参加日"}</TableHead>
                        {isSuperuser && <TableHead>{language === "en" ? "Actions" : "アクション"}</TableHead>}
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
                            <Badge className={getRoleColor(user.role || "member")} data-testid={`user-role-${user.id}`}>
                              {user.role || "member"}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`user-department-${user.id}`}>
                            {user.department || "-"}
                          </TableCell>
                          <TableCell data-testid={`user-joined-${user.id}`}>
                            {new Date(user.createdAt).toLocaleDateString(
                              language === "en" ? "en-US" : "ja-JP"
                            )}
                          </TableCell>
                          {isSuperuser && (
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

        {/* Add User Form Modal */}
        {showAddUser && (
          <section className="py-20 bg-muted/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AddUserForm
                language={language}
                onSuccess={() => {
                  setShowAddUser(false);
                  queryClient.invalidateQueries({ queryKey: ["/api/users"] });
                  toast({
                    title: "Success",
                    description: "User has been created successfully.",
                  });
                }}
                onCancel={() => setShowAddUser(false)}
              />
            </div>
          </section>
        )}

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
                    ? "Update user role and department information"
                    : "ユーザーの役割と部署情報を更新"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-role">{language === "en" ? "Role" : "役割"}</Label>
                  <Select 
                    value={editingUser.role || "member"} 
                    onValueChange={(value) => setEditingUser({...editingUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      {(currentUser as any)?.email === "onuma@fgcsg.com" && (
                        <SelectItem value="superuser">Superuser</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-department">{language === "en" ? "Department" : "部署"}</Label>
                  <Input 
                    value={editingUser.department || ""} 
                    onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                    placeholder={language === "en" ? "Enter department" : "部署を入力"}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                    {language === "en" ? "Cancel" : "キャンセル"}
                  </Button>
                  <Button 
                    onClick={() => updateUserMutation.mutate({
                      userId: editingUser.id,
                      updates: {
                        role: editingUser.role,
                        department: editingUser.department
                      }
                    })}
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