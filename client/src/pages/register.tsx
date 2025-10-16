import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import { usePostLoginRedirect } from '../utils/auth';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

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
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
  ];

  if (password.length === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded ${
              i < strength ? strengthColors[strength - 1] : 'bg-gray-200'
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

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, isAuthenticated } = useAuthStore();
  const { redirectToIntendedDestination } = usePostLoginRedirect();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(
        data.email,
        data.password,
        `${data.firstName} ${data.lastName}`
      );
      toast.success('Account created successfully!');
      redirectToIntendedDestination();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="overflow-hidden">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Sign Up</h1>
        <p className="text-muted-foreground text-sm">
          Enter your information to create an account
        </p>
      </header>
      <FormProvider {...registerForm}>
        <form
          onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
          className="space-y-4"
          noValidate
          aria-label="Sign in form"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="John"
              {...registerForm.register('firstName')}
              error={registerForm.formState.errors.firstName?.message}
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              {...registerForm.register('lastName')}
              error={registerForm.formState.errors.lastName?.message}
            />
          </div>
          <Input
            label="Email"
            placeholder="mail@example.com"
            {...registerForm.register('email')}
            error={registerForm.formState.errors.email?.message}
          />
          <div>
            <Input
              label="Password"
              type="password"
              {...registerForm.register('password')}
              error={registerForm.formState.errors.password?.message}
            />
            <PasswordStrength password={registerForm.watch('password') || ''} />
          </div>
          <div>
            <Button
              type="submit"
              className="w-full mt-2"
              loading={isLoading}
              disabled={isLoading}
            >
              Sign Up
            </Button>
            <p className="text-sm text-center mt-4">
              Already have an account?{' '}
              <Link to="/login" className="underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </FormProvider>
    </Card>
  );
};

export default Register;
