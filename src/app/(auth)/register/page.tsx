'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

import { AuthService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be valid'),
  role: z.enum(['customer', 'partner']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await AuthService.register(data);
      
      if (response.data) {
        login(response.data.user, response.data.token);
        toast.success('Account created successfully');
        
        if (response.data.user.role === 'partner') {
           router.push('/partner/dashboard');
        } else {
           router.push('/');
        }
      }
    } catch (error: any) {
      // Handle Laravel validation errors (422)
      if (error.response?.status === 422 && error.response.data.errors) {
         const errors = error.response.data.errors;
         Object.keys(errors).forEach((key) => {
            // @ts-ignore
            form.setError(key, { message: errors[key][0] });
         });
      } else {
         toast.error(error.response?.data?.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="glass p-10 rounded-[2.5rem] border-white/40 shadow-2xl space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tighter text-primary">Join the Escape.</h1>
        <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Create your luxury account</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                    <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                    <Input placeholder="08123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>I want to join as</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="customer">Guest (Book Stays)</SelectItem>
                        <SelectItem value="partner">Partner (List Property)</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 mt-4" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Onboarding...' : 'Start My Journey'}
          </Button>
        </form>
      </Form>

       <div className="mt-8 pt-8 border-t border-primary/5 text-center">
         <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-4">
           Already a member?
         </p>
         <Link href="/login" className="font-black text-sm text-accent hover:underline underline-offset-4 decoration-2 transition-all">
            SIGN IN INSTEAD
         </Link>
      </div>
    </div>
  );
}
