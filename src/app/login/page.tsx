'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Church, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['admin', 'staff']),
});

type LoginFormData = z.infer<typeof loginSchema>;

const CREDENTIALS: Record<string, { password: string; role: 'admin' | 'staff' }> = {
  'admin@presense.app': { password: 'admin', role: 'admin' },
  'staff@presense.app': { password: 'staff', role: 'staff' },
};

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Only redirect once hydrated — avoids false "not authenticated" read
  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace('/');
    }
  }, [hydrated, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@presense.app', password: 'admin', role: 'admin' },
  });

  const onSubmit = async (data: LoginFormData) => {
    await new Promise((r) => setTimeout(r, 500));
    const cred = CREDENTIALS[data.email];
    if (!cred || cred.password !== data.password) {
      toast.error('Invalid credentials', {
        description: 'Check your email and password.',
      });
      return;
    }
    login(cred.role);
    toast.success('Welcome back!', { description: `Logged in as ${cred.role}` });
    router.replace('/');
  };

  const selectedRole = watch('role');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-background to-indigo-50 dark:from-violet-950/20 dark:via-background dark:to-indigo-950/20 p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-violet-600 text-white shadow-lg mb-2">
            <Church className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Presense</h1>
          <p className="text-sm text-muted-foreground">
            Church attendance management
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>Use the demo credentials below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Quick role picker */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                {(['admin', 'staff'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setValue('role', r);
                      setValue('email', `${r}@presense.app`);
                      setValue('password', r);
                    }}
                    className={`rounded-md py-2 text-sm font-medium transition-all capitalize ${
                      selectedRole === r
                        ? 'bg-background shadow text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
                disabled={isSubmitting}
              >
                <LogIn className="h-4 w-4" />
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            {/* Demo hint */}
            <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Demo credentials:</p>
              <p>admin@presense.app / admin</p>
              <p>staff@presense.app / staff</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
