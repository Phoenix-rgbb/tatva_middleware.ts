import frontImage from "@/pages/front.jpeg";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useI18n } from "@/contexts/I18nContext";
import { useToast } from "@/hooks/use-toast";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setLanguage } = usePreferences();
  const { t, language } = useI18n();
  const [localLanguage, setLocalLanguage] = useState(language);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessName: "",
  });

  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const languages = [
    { value: "en", label: "English", flag: "🇬🇧" },
    { value: "hi", label: "हिन्दी", flag: "🇮🇳" },
  ];

  // ---- Login Handler ----
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!loginForm.email || !loginForm.password) {
        throw new Error("Please fill in all fields");
      }

      const { data, error } = await signIn(loginForm.email, loginForm.password);
      if (error) throw error;

      if (data.session) {
        toast({ title: "Welcome back!", description: "Logged in successfully" });
        navigate("/");
      } else {
        throw new Error("No session established");
      }
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
      toast({
        title: "Login Failed",
        description: err.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Signup Handler ----
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!signupForm.email || !signupForm.password || !signupForm.firstName || !signupForm.lastName) {
        throw new Error("Please fill in all required fields");
      }
      if (signupForm.password !== signupForm.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (signupForm.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const { data, error } = await signUp(signupForm.email, signupForm.password, {
        first_name: signupForm.firstName,
        last_name: signupForm.lastName,
        phone: signupForm.phone,
        business_name: signupForm.businessName,
        preferred_language: localLanguage,
      });

      if (error) throw error;

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });

      if (data.session) navigate("/");
      else setError("Please check your email to verify your account before logging in.");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
      toast({
        title: "Signup Failed",
        description: err.message || "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex flex-col lg:flex-row items-center justify-center p-4 gap-8">
      {/* Hero Image Section */}
      <div className="flex-1 flex items-center justify-center w-full lg:max-w-lg">
        <img
          src={frontImage}
          alt="Finance Tracking"
          className="rounded-2xl shadow-lg w-full h-auto object-cover"
        />
      </div>

      {/* Auth Form Section */}
      <div className="flex-1 w-full max-w-md">
        <Card className="shadow-floating">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Welcome</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                ← Back to Home
              </Button>
            </div>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mb-4">
              <Label htmlFor="lang-select">{t("language")}</Label>
              <select
                id="lang-select"
                value={localLanguage}
                onChange={(e) => {
                  setLocalLanguage(e.target.value);
                  setLanguage(e.target.value);
                }}
                className="w-full px-3 py-2 border border-input rounded-md bg-background mt-1"
                disabled={isLoading}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <Tabs defaultValue="login" className="space-y-4">
              {/* Login Tab */}
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  {/* First & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        placeholder="राम / Ram"
                        value={signupForm.firstName}
                        onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        placeholder="शर्मा / Sharma"
                        value={signupForm.lastName}
                        onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input
                      id="business-name"
                      placeholder="Sharma's Store"
                      value={signupForm.businessName}
                      onChange={(e) => setSignupForm({ ...signupForm, businessName: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="ram.sharma@example.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-success hover:opacity-90" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6">
              <Separator className="my-4" />
              <p className="text-center text-sm text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
