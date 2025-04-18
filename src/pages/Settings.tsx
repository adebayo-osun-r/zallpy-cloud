import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type SettingsType = {
  id: string;
  hotel_name: string;
  time_zone: string;
  currency: string;
  language: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  dark_mode: boolean;
};

export default function Settings() {
  const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [localSettings, setLocalSettings] = useState<SettingsType>({
    id: SETTINGS_ID,
    hotel_name: "",
    time_zone: "",
    currency: "",
    language: "",
    address: "",
    contact_email: "",
    contact_phone: "",
    email_notifications: true,
    sms_notifications: false,
    dark_mode: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false); // To manage loading state
  const [passwordError, setPasswordError] = useState(""); // To handle error messages

  const handleChangePassword = async () => {
    setPasswordError(""); // Reset error message

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    // Optionally, you can add more validation here for password strength (e.g., length, special characters)

    try {
      setIsPasswordUpdating(true);

      // Call your API or Supabase function to update the password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError(error.message);
        return;
      }

      toast({
        title: "Password updated successfully",
        description: "Your password has been updated.",
      });

      // Clear the password fields after successful update
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError("An error occurred while updating your password.");
    } finally {
      setIsPasswordUpdating(false);
    }
  };


  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", SETTINGS_ID)
        .single();

      if (!error && data) {
        setSettings(data);
        setLocalSettings(data);
      }

      setIsLoading(false);
    };

    fetchSettings();
  }, []);

  const saveSettings = async (updates: Partial<SettingsType>) => {
    const { data, error } = await supabase
      .from("settings")
      .upsert([{ id: SETTINGS_ID, ...updates }], { onConflict: "id" });

    if (!error && data) {
      setSettings(data[0]);
      setLocalSettings((prev) => ({ ...prev, ...updates }));
    }

    return { data, error };
  };

  const handleSaveGeneralSettings = async () => {
    await saveSettings({
      hotel_name: localSettings.hotel_name,
      time_zone: localSettings.time_zone,
      currency: localSettings.currency,
      language: localSettings.language,
      address: localSettings.address,
      contact_email: localSettings.contact_email,
      contact_phone: localSettings.contact_phone,
    });

    toast({
      title: "Settings updated",
      description: "Your general settings have been saved successfully.",
    });
  };

  const handleSaveNotificationSettings = async () => {
    await saveSettings({
      email_notifications: localSettings.email_notifications,
      sms_notifications: localSettings.sms_notifications,
    });

    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved successfully.",
    });
  };

  const handleSaveAppearanceSettings = async () => {
    await saveSettings({ dark_mode: localSettings.dark_mode });

    toast({
      title: "Appearance settings updated",
      description: "Your preferences have been saved.",
    });
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <AppLayout title="Settings">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your basic account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {["hotel_name", "time_zone", "currency", "language"].map((field) => (
                    <div className="space-y-2" key={field}>
                      <Label htmlFor={field}>{field.replace("_", " ").toUpperCase()}</Label>
                      <Input
                        id={field}
                        value={String(localSettings[field as keyof SettingsType] || "")} // Ensure the value is always a string
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            [field]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}

                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="address">Hotel Address</Label>
                  <Textarea
                    id="address"
                    value={localSettings.address}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({ ...prev, address: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    type="email"
                    value={localSettings.contact_email}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({ ...prev, contact_email: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    value={localSettings.contact_phone}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({ ...prev, contact_phone: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveGeneralSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.email_notifications}
                    onCheckedChange={(val) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        email_notifications: val,
                      }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive text message alerts for critical updates
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.sms_notifications}
                    onCheckedChange={(val) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        sms_notifications: val,
                      }))
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveNotificationSettings}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize how the application looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Enable dark mode for the application
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.dark_mode}
                    onCheckedChange={(val) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        dark_mode: val,
                      }))
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveAppearanceSettings}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {/* Display error message if any */}
                {passwordError && (
                  <div className="text-red-600 text-sm">{passwordError}</div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleChangePassword}
                  disabled={isPasswordUpdating} // Disable the button while updating
                >
                  {isPasswordUpdating ? "Updating..." : "Change Password"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
        </Tabs>
      </div>
    </AppLayout>
  );
}
