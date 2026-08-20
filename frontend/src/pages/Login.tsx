import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/auriesta-logo-without-bg.png';
import './Login.css';
import { API_BASE_URL } from '../api/apiBaseUrl';

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
      toast.success('Login successful!', {
        position: 'top-center'
      });
      navigate('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || 'Login failed. Please try again.', {
          position: 'top-center'
        });
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="Auriesta Logo" className="login-logo" />
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to manage your inventory</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="login-actions">
            <Button type="submit" isLoading={isSubmitting}>
              Sign In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
