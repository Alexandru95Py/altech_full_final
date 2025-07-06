import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Shield,
  CheckCircle,
  XCircle,
  FileText,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { djangoAPI, handleAPIError, apiClient } from "@/lib/api";
import { CutePopup } from "@/components/CutePopup";

// Corrected AuthResponse type and destructuring logic
interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    plan?: string;
  };
}

interface PasswordRequirement {
  text: string;
  met: boolean;
}

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Main state management
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: code, 3: new password
  const [forgotPasswordCode, setForgotPasswordCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCutePopup, setShowCutePopup] = useState(false);
  const [cutePopupMessage, setCutePopupMessage] = useState("");

  // Password validation
  const passwordRequirements: PasswordRequirement[] = [
    {
      text: "At least 8 characters",
      met: registerData.password.length >= 8,
    },
    {
      text: "At least one uppercase letter",
      met: /[A-Z]/.test(registerData.password),
    },
    {
      text: "At least one lowercase letter",
      met: /[a-z]/.test(registerData.password),
    },
    {
      text: "At least one number",
      met: /\d/.test(registerData.password),
    },
    {
      text: "At least one special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(registerData.password),
    },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.met);
  const isPasswordsMatch =
    registerData.password === registerData.confirmPassword &&
    registerData.confirmPassword !== "";

  // Validation functions
  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isLoginValid =
    loginData.email && loginData.password && isEmailValid(loginData.email);
  const isRegisterValid =
    registerData.email &&
    isEmailValid(registerData.email) &&
    isPasswordValid &&
    isPasswordsMatch &&
    termsAgreed;

  // Handle Django login
  const handleLogin = async () => {
    if (!isLoginValid) return;

    setIsLoading(true);

    try {
      const response = await djangoAPI.login(
        loginData.email,
        loginData.password
      );

      if (response.success && response.data) {
        const access = response.data.access;
        const user = response.data.user;

        apiClient.setAuthToken(access);
        localStorage.setItem("authToken", access);
        localStorage.setItem("user", JSON.stringify(user));

        toast({
          title: "Login successful",
          description: `Welcome back, ${user.first_name || "User"}!`,
        });

        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      
      // Show cute popup instead of harsh red toast
      setCutePopupMessage("Your email address or password is incorrect. Please try again! 😊");
      setShowCutePopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Django registration
  const handleRegister = async () => {
    if (!termsAgreed) {
      setShowTermsError(true);
      return;
    }

    if (!isRegisterValid) return;

    setIsLoading(true);
    setShowTermsError(false);

    try {
      const response = await djangoAPI.register({
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName || "",
        lastName: registerData.lastName || "",
      });

      if (response.success && response.data && response.data.user) {
        // Registration successful, redirect to verify email page
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        toast({
          title: "Registration successful",
          description: `Please check your email for the 6-digit verification code and enter it below to activate your account.`,
        });
        navigate(
          `/verify-email?email=${encodeURIComponent(response.data.user.email)}`
        );
      } else {
        // Registration failed, show error toast
        toast({
          title: "Registration failed",
          description: handleAPIError(response),
          variant: "destructive",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration failed",
        description: handleAPIError(error),
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (forgotPasswordStep === 1) {
      // Step 1: Send reset code to email
      if (!forgotPasswordEmail || !isEmailValid(forgotPasswordEmail)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      try {
        const response = await djangoAPI.forgotPassword(forgotPasswordEmail);
        
        if (response.success) {
          toast({
            title: "Reset code sent",
            description: `A 6-digit verification code has been sent to ${forgotPasswordEmail}`,
          });
          
          setForgotPasswordStep(2);
        } else {
          toast({
            title: "Failed to send reset code",
            description: handleAPIError(response),
            variant: "destructive",
            duration: 4000,
          });
        }
      } catch (error) {
        console.error("Failed to send reset code:", error);
        toast({
          title: "Failed to send reset code",
          description: handleAPIError(error),
          variant: "destructive",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    } else if (forgotPasswordStep === 2) {
      // Step 2: Verify code
      if (!forgotPasswordCode || forgotPasswordCode.length !== 6) {
        toast({
          title: "Invalid code",
          description: "Please enter the 6-digit code from your email.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      try {
        const response = await djangoAPI.verifyResetCode(forgotPasswordEmail, forgotPasswordCode);
        
        if (response.success) {
          toast({
            title: "Code verified",
            description: "Please enter your new password.",
          });
          
          setForgotPasswordStep(3);
        } else {
          toast({
            title: "Invalid code",
            description: handleAPIError(response),
            variant: "destructive",
            duration: 4000,
          });
        }
      } catch (error) {
        console.error("Code verification failed:", error);
        toast({
          title: "Invalid code",
          description: handleAPIError(error),
          variant: "destructive",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    } else if (forgotPasswordStep === 3) {
      // Step 3: Set new password
      if (!newPassword || newPassword.length < 8) {
        toast({
          title: "Password too short",
          description: "Password must be at least 8 characters long.",
          variant: "destructive",
        });
        return;
      }

      if (newPassword !== confirmNewPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure both passwords match.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      try {
        const response = await djangoAPI.resetPassword(forgotPasswordEmail, forgotPasswordCode, newPassword);
        
        if (response.success) {
          toast({
            title: "Password reset successful",
            description: "Your password has been updated. You can now sign in with your new password.",
          });
          
          // Reset all states and close modal
          setShowForgotPasswordModal(false);
          setForgotPasswordStep(1);
          setForgotPasswordEmail("");
          setForgotPasswordCode("");
          setNewPassword("");
          setConfirmNewPassword("");
        } else {
          toast({
            title: "Password reset failed",
            description: handleAPIError(response),
            variant: "destructive",
            duration: 4000,
          });
        }
      } catch (error) {
        console.error("Password reset failed:", error);
        toast({
          title: "Password reset failed",
          description: handleAPIError(error),
          variant: "destructive",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Reset forgot password modal when closing
  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotPasswordStep(1);
    setForgotPasswordEmail("");
    setForgotPasswordCode("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  // Check for existing authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // User is already authenticated, redirect to dashboard
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-xl">
              <FileText className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ALTech PDF</h1>
          <p className="text-slate-600 mt-2">
            Professional PDF tools for your business
          </p>
        </div>

        {/* Auth Forms */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <div className="text-center">
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to your ALTech PDF account
                  </CardDescription>
                </div>

                <div className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <Button
                    className="w-full"
                    onClick={handleLogin}
                    disabled={!isLoginValid || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  {/* Forgot Password Button */}
                  <div className="text-center">
                    <Button
                      variant="link"
                      size="sm"
                      className="text-sm text-slate-600 hover:text-slate-900 p-0 h-auto font-normal"
                      onClick={() => setShowForgotPasswordModal(true)}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <div className="text-center">
                  <CardTitle>Create account</CardTitle>
                  <CardDescription>
                    Join ALTech PDF and get started today
                  </CardDescription>
                </div>

                <div className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="First name"
                        value={registerData.firstName}
                        onChange={(e) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        value={registerData.lastName}
                        onChange={(e) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="registerPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        className="pl-10 pr-10"
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  {registerData.password && (
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-600">
                        Password requirements:
                      </Label>
                      <div className="space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            {req.met ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-slate-400" />
                            )}
                            <span
                              className={
                                req.met ? "text-green-600" : "text-slate-500"
                              }
                            >
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        className="pl-10 pr-10"
                        value={registerData.confirmPassword}
                        onChange={(e) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-500" />
                        )}
                      </Button>
                    </div>
                    {registerData.confirmPassword && !isPasswordsMatch && (
                      <p className="text-sm text-red-500">
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  {/* Terms Agreement */}
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={termsAgreed}
                        onCheckedChange={(checked) => {
                          setTermsAgreed(checked as boolean);
                          setShowTermsError(false);
                        }}
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor="terms"
                        className="text-sm leading-5 text-slate-700"
                      >
                        I agree to the{" "}
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          Terms of Service
                        </span>{" "}
                        and{" "}
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          Privacy Policy
                        </span>
                      </Label>
                    </div>
                    {showTermsError && (
                      <p className="text-sm text-red-500">
                        Please agree to the terms and conditions
                      </p>
                    )}
                  </div>

                  {/* Register Button */}
                  <Button
                    className="w-full"
                    onClick={handleRegister}
                    disabled={!isRegisterValid || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-600 hover:text-slate-900"
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Forgot Password Modal */}
        <Dialog open={showForgotPasswordModal} onOpenChange={closeForgotPasswordModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {forgotPasswordStep === 1 && "Reset your password"}
                {forgotPasswordStep === 2 && "Enter verification code"}
                {forgotPasswordStep === 3 && "Set new password"}
              </DialogTitle>
              <DialogDescription>
                {forgotPasswordStep === 1 && "Enter your email address and we'll send you a verification code."}
                {forgotPasswordStep === 2 && `Enter the 6-digit code sent to ${forgotPasswordEmail}`}
                {forgotPasswordStep === 3 && "Enter your new password below."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Step 1: Email Input */}
              {forgotPasswordStep === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="forgotPasswordEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="forgotPasswordEmail"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleForgotPassword();
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Code Input */}
              {forgotPasswordStep === 2 && (
                <div className="space-y-2">
                  <Label htmlFor="forgotPasswordCode">Verification Code</Label>
                  <Input
                    id="forgotPasswordCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    value={forgotPasswordCode}
                    onChange={(e) => setForgotPasswordCode(e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && forgotPasswordCode.length === 6) {
                        handleForgotPassword();
                      }
                    }}
                  />
                  <p className="text-sm text-slate-500 text-center">
                    Didn't receive the code?{" "}
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-sm"
                      onClick={() => setForgotPasswordStep(1)}
                      disabled={isLoading}
                    >
                      Resend
                    </Button>
                  </p>
                </div>
              )}

              {/* Step 3: New Password Input */}
              {forgotPasswordStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="pl-10 pr-10"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isLoading}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="confirmNewPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="pl-10"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleForgotPassword();
                          }
                        }}
                      />
                    </div>
                    {confirmNewPassword && newPassword !== confirmNewPassword && (
                      <p className="text-sm text-red-500">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={closeForgotPasswordModal}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleForgotPassword}
                  disabled={isLoading || 
                    (forgotPasswordStep === 1 && !forgotPasswordEmail) ||
                    (forgotPasswordStep === 2 && forgotPasswordCode.length !== 6) ||
                    (forgotPasswordStep === 3 && (!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword))
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {forgotPasswordStep === 1 && "Sending..."}
                      {forgotPasswordStep === 2 && "Verifying..."}
                      {forgotPasswordStep === 3 && "Updating..."}
                    </>
                  ) : (
                    <>
                      {forgotPasswordStep === 1 && "Send verification code"}
                      {forgotPasswordStep === 2 && "Verify code"}
                      {forgotPasswordStep === 3 && "Update password"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cute Popup for Login Errors */}
        <CutePopup
          isVisible={showCutePopup}
          message={cutePopupMessage}
          onClose={() => setShowCutePopup(false)}
          duration={3000}
        />
      </div>
    </div>
  );
}