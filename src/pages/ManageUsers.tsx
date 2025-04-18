import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge, Edit, Plus, Search, User, Lock } from "lucide-react";
import { Guest } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AddNewUserDialog } from "@/components/users/AddNewUserDialog";
import { User as USER } from "@supabase/supabase-js";
import { formatDistanceToNow } from 'date-fns';

export default function ManageUsers() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Guest | undefined>();
  const [users, setUsers] = useState<USER[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const roles = ['Admin', 'User', 'Front Desk', 'Bar', 'Manager', 'Superadmin'];

  async function fetchUsers() {
    try {
      setLoading(true);
      // fetch all users
      const { data, error } = await supabase.auth.admin.listUsers();

      setUsers(data.users);
      console.log(data.users);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    `${user.user_metadata.firstName} ${user.user_metadata.lastName} ${user.user_metadata.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Update the role of the user using Supabase API
      const { error } = await supabase.auth.admin.updateUserById(userId, { role: newRole });

      if (error) throw error;
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`,
        variant: "default",
      });
      // Re-fetch the users to reflect the changes
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (userId: string) => {
    const newPassword = prompt("Enter a new password for this user:");
    if (!newPassword) return;

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "User password has been updated successfully",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout title="Manage Users">
      <AddNewUserDialog
        open={showDialog}
        onOpenChange={setShowDialog}
      />

      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage existing users and create new users
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="default" size="sm" onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New User
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users List</CardTitle>
            <CardDescription>View and manage user profiles</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fullname</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={""} />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{`${user.user_metadata.firstName || "Unknown"} ${user.user_metadata.lastName || ""}`}</div>
                              <div className="text-xs text-muted-foreground">

                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{user.user_metadata.email || "No email"}</div>
                          <div className="text-xs text-muted-foreground">
                            Last sign in {formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.user_metadata.role || "Unknown"}</div>
                          <div>
                          <select
                            value={user.user_metadata.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-white p-2 rounded-md"
                          >
                            {roles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                        <Button
                            onClick={() => handlePasswordChange(user.id)}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredUsers.length} of {users.length} users
                      </p>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
