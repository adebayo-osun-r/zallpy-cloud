import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { useState, useEffect } from "react";
  import { toast } from "@/hooks/use-toast";
  import { supabase } from "@/integrations/supabase/client";
  import { Loader2 } from "lucide-react";
  import { useAuth } from "@/contexts/AuthContext";
  
  interface AddNewUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
  
  export function AddNewUserDialog({ open, onOpenChange }: AddNewUserDialogProps) {
    const { signUp } = useAuth();
  
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "User", // default role
    });
  
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      if (open) {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "User",
        });
      }
    }, [open]);
  
    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = async () => {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.password
      ) {
        toast({
          title: "Validation Error",
          description: "First name, last name, email, and password are required.",
          variant: "destructive",
        });
        return;
      }
  
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Validation Error",
          description: "Passwords do not match.",
          variant: "destructive",
        });
        return;
      }
  
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              role: formData.role,
            },
          },
        });
  
        if (error) {
          throw error;
        }
  
        const user = data.user;
        if (!user) {
          throw new Error("User sign-up failed.");
        }
  
        const { error: insertError } = await supabase.from("profiles").upsert({
          id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
        });
  
        if (insertError) {
          throw insertError;
        }
  
        toast({
          title: "User added",
          description: `Successfully created ${formData.role} user.`,
        });
  
        onOpenChange(false);
      } catch (error: any) {
        console.error("Error creating user:", error);
        toast({
          title: "Error",
          description: error.message || "Something went wrong.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
  
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                name="password"
                placeholder="******"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                name="confirmPassword"
                placeholder="******"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="Front Desk">Front Desk</option>
                <option value="Bar">Bar</option>
                <option value="Manager">Manager</option>
                <option value="Superadmin">Superadmin</option>
              </select>
            </div>
          </div>
  
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  