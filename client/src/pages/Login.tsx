import React, { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";
import { usePostLoginRedirect } from "../utils/auth";
import { Navigation } from "../components/ui/Navigation";

// Validation schemas
const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// Password strength indicator
const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  if (password.length === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded ${
              i < strength ? strengthColors[strength - 1] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs mt-1 text-gray-600">
        Strength: {strengthLabels[Math.max(0, strength - 1)]}
      </p>
    </div>
  );
};

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const {
    login,
    register: registerUser,
    isLoading,
    isAuthenticated,
  } = useAuthStore();
  const { redirectToIntendedDestination } = usePostLoginRedirect();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Successfully logged in!");
      redirectToIntendedDestination();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      toast.error(errorMessage);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.email, data.password, data.fullName);
      toast.success("Account created successfully!");
      redirectToIntendedDestination();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      toast.error(errorMessage);
    }
  };

  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    // Reset forms when switching tabs
    loginForm.reset();
    registerForm.reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // OAuth handlers (placeholder for MVP)
  const handleGoogleAuth = () => {
    toast.info("Google OAuth coming soon!");
  };

  const handleGithubAuth = () => {
    toast.info("GitHub OAuth coming soon!");
  };

  return (
    <>
      <Navigation />
      <main
        role="main"
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8"
      >
        <div className="w-full max-w-md">
          <Card className="overflow-hidden">
            <div className="p-6">
              {/* Logo/Title */}
              <header className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">CodeReview</h1>
                <p className="text-gray-600 mt-2" id="login-description">
                  {activeTab === "login"
                    ? "Sign in to your account"
                    : "Create your account"}
                </p>
              </header>

              {/* Tab Navigation */}
              <div
                role="tablist"
                aria-label="Authentication options"
                className="flex border-b border-gray-200 mb-6"
              >
                <button
                  role="tab"
                  id="login-tab"
                  aria-controls="login-panel"
                  aria-selected={activeTab === "login"}
                  onClick={() => handleTabChange("login")}
                  className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors min-h-[44px] 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      activeTab === "login"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Login
                </button>
                <button
                  role="tab"
                  id="register-tab"
                  aria-controls="register-panel"
                  aria-selected={activeTab === "register"}
                  onClick={() => handleTabChange("register")}
                  className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors min-h-[44px]
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      activeTab === "register"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Register
                </button>
              </div>

              {/* Login Form */}
              {activeTab === "login" && (
                <section
                  role="tabpanel"
                  id="login-panel"
                  aria-labelledby="login-tab"
                  aria-describedby="login-description"
                >
                  <FormProvider {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                      noValidate
                      aria-label="Sign in form"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            {...loginForm.register("email")}
                            error={loginForm.formState.errors.email?.message}
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-10 pr-10"
                            {...loginForm.register("password")}
                            error={loginForm.formState.errors.password?.message}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-red-500 text-sm mt-1">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-800"
                          onClick={() =>
                            toast.info("Password reset coming soon!")
                          }
                        >
                          Forgot password?
                        </button>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        loading={isLoading}
                        disabled={isLoading}
                      >
                        Sign In
                      </Button>
                    </form>
                  </FormProvider>
                </section>
              )}

              {/* Register Form */}
              {activeTab === "register" && (
                <section
                  role="tabpanel"
                  id="register-panel"
                  aria-labelledby="register-tab"
                  aria-describedby="login-description"
                >
                  <form
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                    className="space-y-4"
                    noValidate
                    aria-label="Create account form"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Enter your full name"
                          className="pl-10"
                          {...registerForm.register("fullName")}
                          error={
                            registerForm.formState.errors.fullName?.message
                          }
                        />
                      </div>
                      {registerForm.formState.errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">
                          {registerForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          {...registerForm.register("email")}
                          error={registerForm.formState.errors.email?.message}
                        />
                      </div>
                      {registerForm.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          {...registerForm.register("password")}
                          error={
                            registerForm.formState.errors.password?.message
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                      <PasswordStrength
                        password={registerForm.watch("password") || ""}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pl-10 pr-10"
                          {...registerForm.register("confirmPassword")}
                          error={
                            registerForm.formState.errors.confirmPassword
                              ?.message
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {
                            registerForm.formState.errors.confirmPassword
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Create Account
                    </Button>
                  </form>
                </section>
              )}

              {/* OAuth Section */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleGoogleAuth}
                    className="flex items-center justify-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleGithubAuth}
                    className="flex items-center justify-center gap-2"
                  >
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>GitHub</title>
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    GitHub
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <footer className="text-center mt-4 text-sm text-gray-600">
                By continuing, you agree to our Terms of Service and Privacy
                Policy
              </footer>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
};

export default Login;
