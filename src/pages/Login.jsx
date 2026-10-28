import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';


import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import api from '@/services/api';


// 1. Define validation rules
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),

  password: z.string().min(1, 'Password is required'),
});

function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // 3. Runs when validation is successful
  const onSubmit = async (data) => {
    try {
      // Send email and password to backend
      const response = await api.post('/admin/login', {
        email: data.email,
        password: data.password,
      });

      console.log('Login response:', response.data);
      // Check backend success
      if (!response.data.success) {
        setError('root', {
          message: response.data.message || 'Login failed',
        });

        return;
      }

      // Get token from backend
      const token = response.data.data.token;

      // Store token
      localStorage.setItem('adminToken', token);

      // Store token type
      localStorage.setItem('tokenType', response.data.data.token_type);

      // Login successful
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);

      const message = error.response?.data?.message || 'Unable to connect to the server.';

      setError('root', {
        message,
      });
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>

          <CardDescription>Login to your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
              />

              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register('password')}
              />

              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Backend error */}
            {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;