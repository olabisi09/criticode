import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import { usePostLoginRedirect } from '../utils/auth';
import { GitHubIcon, GoogleIcon } from '../components/ui/icons';
import { Divider } from '../components/ui/divider';

// Validation schemas
const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const { redirectToIntendedDestination } = usePostLoginRedirect();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Successfully logged in!');
      redirectToIntendedDestination();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
    }
  };

  // OAuth handlers (placeholder for MVP)
  const handleGoogleAuth = () => {
    toast.info('Google OAuth coming soon!');
  };

  const handleGithubAuth = () => {
    toast.info('GitHub OAuth coming soon!');
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email below to log into your account
          </p>
        </header>
        <div className="flex flex-col space-y-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleGoogleAuth}
          >
            <GoogleIcon className="w-4 h-4" />
            Sign in with Google
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleGithubAuth}
          >
            <GitHubIcon className="w-4 h-4" />
            Sign in with GitHub
          </Button>
        </div>
        <Divider text="OR CONTINUE WITH" />
        <FormProvider {...loginForm}>
          <form
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            className="space-y-2"
            noValidate
            aria-label="Sign in form"
          >
            <Input
              label="Email"
              placeholder="mail@example.com"
              {...loginForm.register('email')}
              error={loginForm.formState.errors.email?.message}
            />
            <div>
              <Input
                label="Password"
                type="password"
                {...loginForm.register('password')}
                error={loginForm.formState.errors.password?.message}
              />
              <Link to="/forgot-password" className="text-sm underline">
                Forgot your password?
              </Link>
            </div>
            <div>
              <Button
                type="submit"
                className="w-full mt-2"
                loading={isLoading}
                disabled={isLoading}
              >
                Sign In
              </Button>
              <p className="text-sm text-center mt-4">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="underline">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </FormProvider>
        <footer className="text-center text-sm text-gray-600">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </footer>
      </div>
    </Card>
  );
};

export default Login;
