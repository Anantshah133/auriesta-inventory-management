import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/auriesta-logo-without-bg.png';
import { API_BASE_URL } from '../api/apiBaseUrl';
import { Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, data);
      login(response.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || 'Login failed. Please try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(7,57,59,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.05) 0%, transparent 50%)',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-[#07393b] via-[#0a5457] to-emerald-500" />

          <div className="p-8">
            {/* Logo + heading */}
            <div className="flex flex-col items-center mb-8">
              <img
                src={logo}
                alt="Auriesta Logo"
                className="h-16 w-auto mb-4 object-contain"
              />
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-gray-500 text-sm mt-1">Sign in to manage your inventory</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="login-form">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                leftIcon={<Mail className="w-4 h-4" />}
                {...register('email')}
                id="login-email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                leftIcon={<Lock className="w-4 h-4" />}
                {...register('password')}
                id="login-password"
              />

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isSubmitting}
                size="lg"
                id="login-submit-btn"
              >
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Auriesta Inventory Management System · Secured Access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
