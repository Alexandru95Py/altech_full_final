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
    registerData.firstName &&
    registerData.lastName &&
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
      toast({
        title: "Login failed",
        description: handleAPIError(error),
        variant: "destructive",
      });
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
        firstName: registerData.firstName,
        lastName: registerData.lastName,
      });

      if (response.success && response.data) {
        const access = response.data.access;
        const user = response.data.user;

        apiClient.setAuthToken(access);
        localStorage.setItem("authToken", access);
        localStorage.setItem("user", JSON.stringify(user));

        toast({
          title: "Registration successful",
          description: `Welcome to ALTech PDF, ${user.first_name}!`,
        });

        navigate("/");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration failed",
        description: handleAPIError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      </div>
    </div>
  );
}
