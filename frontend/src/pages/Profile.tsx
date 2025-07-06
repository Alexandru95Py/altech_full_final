import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTutorialContext } from "@/contexts/TutorialContext";
import {
  User,
  Mail,
  Bell,
  Shield,
  Download,
  Trash2,
  Camera,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStorage } from "@/contexts/StorageContext";
import { downloadDataAsJSON } from "@/utils/realFileDownload";
import { djangoAPI, handleAPIError } from "@/lib/api";

export default function Profile() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    location: "",
  });

  // Load user profile data on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await djangoAPI.getUserProfile();

      if (response.success && response.data) {
        const userData = response.data;
        setFormData({
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          email: userData.email || "",
          phone: "", // Backend doesn't provide phone, keep as user input
          company: "", // Backend doesn't provide company, keep as user input
          location: "", // Backend doesn't provide location, keep as user input
        });

        if (userData.profile_image) {
          setProfileImage(userData.profile_image);
        }
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Using default values.",
        variant: "destructive",
      });
    }
  };

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
    weeklyReports: true,
  });

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
      };

      const response = await djangoAPI.updateUserProfile(updateData);

      if (response.success) {
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile information has been saved successfully.",
        });
      } else {
        throw new Error("Profile update failed");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast({
        title: "Error",
        description: `Failed to update profile: ${handleAPIError(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (1MB max)
    if (file.size > 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 1MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const response = await djangoAPI.updateProfileImage(file);

      if (response.success && response.data) {
        // Create a local URL for immediate preview
        const imageUrl = URL.createObjectURL(file);
        setProfileImage(imageUrl);

        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully.",
        });
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast({
        title: "Upload failed",
        description: `Failed to update profile picture: ${handleAPIError(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "A confirmation email has been sent to your email address.",
      variant: "destructive",
    });
  };

  const handleDownloadData = () => {
    // Export user's data including profile information, files, and settings
    const userData = {
      profile: formData,
      files: [], // Would come from API
      settings: {
        autoSave: true,
        notifications: true,
        theme: "light",
      },
      exportDate: new Date().toISOString(),
    };

    const filename = `altech-profile-data-${new Date().toISOString().split("T")[0]}.json`;

    try {
      downloadDataAsJSON(userData, filename);

      toast({
        title: "Data exported",
        description: "Your profile data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export profile data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />

      <main className="pl-60 pt-16 pb-20">
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Profile Settings
            </h1>
            <p className="text-slate-600">
              Manage your account information, security settings, and
              preferences.
            </p>
          </div>

          <div className="max-w-4xl">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="help">Help</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and how others see you.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        {profileImage && (
                          <AvatarImage
                            src={profileImage}
                            alt="Profile picture"
                          />
                        )}
                        <AvatarFallback className="bg-slate-200 text-slate-700 text-lg">
                          {formData.firstName?.[0] || "U"}
                          {formData.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Profile Picture</h3>
                        <p className="text-xs text-slate-500">
                          JPG, GIF or PNG. 1MB max.
                        </p>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleImageButtonClick}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Camera className="h-4 w-4 mr-2" />
                          )}
                          {isUploading ? "Uploading..." : "Change Picture"}
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Profile Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              company: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                          <User className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your password and two-factor authentication.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Password Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Password</h3>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-slate-500">
                            Last changed 3 months ago
                          </p>
                        </div>
                        <Button variant="outline">Change Password</Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Two-Factor Authentication */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        Two-Factor Authentication
                      </h3>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">2FA Enabled</p>
                            <p className="text-sm text-slate-500">
                              Using authenticator app
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200"
                        >
                          Active
                        </Badge>
                      </div>
                      <Button variant="outline">Manage 2FA</Button>
                    </div>

                    <Separator />

                    {/* Login Sessions */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Active Sessions</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-slate-500">
                              Chrome on Windows • Bucharest, Romania
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200"
                          >
                            Active
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Mobile App</p>
                            <p className="text-sm text-slate-500">
                              iPhone • Last seen 2 hours ago
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Revoke
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose what notifications you want to receive.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="emailUpdates">Email Updates</Label>
                          <p className="text-sm text-slate-500">
                            Get notified about important account updates
                          </p>
                        </div>
                        <Switch
                          id="emailUpdates"
                          checked={notifications.emailUpdates}
                          onCheckedChange={(checked) =>
                            handleNotificationChange("emailUpdates", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="securityAlerts">
                            Security Alerts
                          </Label>
                          <p className="text-sm text-slate-500">
                            Get alerted about suspicious account activity
                          </p>
                        </div>
                        <Switch
                          id="securityAlerts"
                          checked={notifications.securityAlerts}
                          onCheckedChange={(checked) =>
                            handleNotificationChange("securityAlerts", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="marketingEmails">
                            Marketing Emails
                          </Label>
                          <p className="text-sm text-slate-500">
                            Receive updates about new features and tips
                          </p>
                        </div>
                        <Switch
                          id="marketingEmails"
                          checked={notifications.marketingEmails}
                          onCheckedChange={(checked) =>
                            handleNotificationChange("marketingEmails", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="weeklyReports">Weekly Reports</Label>
                          <p className="text-sm text-slate-500">
                            Get a summary of your account activity
                          </p>
                        </div>
                        <Switch
                          id="weeklyReports"
                          checked={notifications.weeklyReports}
                          onCheckedChange={(checked) =>
                            handleNotificationChange("weeklyReports", checked)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy & Data</CardTitle>
                    <CardDescription>
                      Manage your data and privacy settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Data Export */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Data Export</h3>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Download Your Data</p>
                          <p className="text-sm text-slate-500">
                            Get a copy of all your data including files and
                            settings
                          </p>
                        </div>
                        <Button variant="outline" onClick={handleDownloadData}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Account Deletion */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-red-600">
                        Danger Zone
                      </h3>
                      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                        <div>
                          <p className="font-medium text-red-900">
                            Delete Account
                          </p>
                          <p className="text-sm text-red-700">
                            Permanently delete your account and all associated
                            data
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>

                    {/* Privacy Policy */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Legal</h3>
                      <div className="space-y-2">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600"
                        >
                          Privacy Policy
                        </Button>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600"
                        >
                          Terms of Service
                        </Button>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600"
                        >
                          Cookie Policy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Help Tab */}
              <TabsContent value="help">
                <Card>
                  <CardHeader>
                    <CardTitle>Help & Support</CardTitle>
                    <CardDescription>
                      Get help with using ALTech PDF and learn about new
                      features.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Tutorial Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Getting Started</h3>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Interactive Tutorial</p>
                          <p className="text-sm text-slate-500">
                            Take a guided tour of ALTech PDF's main features
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Use window.location to restart tutorial
                            localStorage.removeItem(
                              "altech-tutorial-completed",
                            );
                            localStorage.setItem(
                              "altech-restart-tutorial",
                              "true",
                            );
                            window.location.reload();
                          }}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Restart Tutorial
                        </Button>
                      </div>
                    </div>

                    {/* Support Resources */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Support Resources</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">FAQ</p>
                            <p className="text-sm text-slate-500">
                              Find answers to common questions
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => (window.location.href = "/faq")}
                          >
                            <HelpCircle className="mr-2 h-4 w-4" />
                            View FAQ
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Contact Support</p>
                            <p className="text-sm text-slate-500">
                              Get personalized help from our team
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => {
                              // This would trigger the support modal if available
                              toast({
                                title: "Support",
                                description:
                                  "Contact support feature will be available soon!",
                              });
                            }}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Support
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}