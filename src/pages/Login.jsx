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

import { login } from '@/components/auth/auth';

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
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);

      if (!user) {
        setError('root', {
          message: 'Invalid login response from server.',
        });

        return;
      }

      /*
       * These values are only for displaying the logged-in
       * admin information in the existing UI.
       *
       * IMPORTANT:
       * No access token or refresh token is stored here.
       */
      localStorage.setItem('adminUser', JSON.stringify(user));

      localStorage.setItem('adminRole', user.role || '');

      console.log('Logged-in user:', user);
      console.log('Logged-in role:', user.role);

      navigate('/admin/categories', {
        replace: true,
      });
    } catch (error) {
      console.error('Login error:', error);

      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unable to connect to the server.';

      if (status === 401) {
        setError('root', {
          message: message || 'Invalid email or password.',
        });

        return;
      }

      if (status === 429) {
        setError('root', {
          message: 'Too many login attempts. Please wait and try again.',
        });

        return;
      }

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

            {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}

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
