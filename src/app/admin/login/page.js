'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import Button from '@/shared/ui/Button';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        router.push('/admin');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4">
      <div className="w-full max-w-md bg-white p-10 shadow-2xl">
        <div className="mb-10">
          <h1 className="text-2xl font-black tracking-tight text-black mb-2 uppercase">Admin Login</h1>
          <p className="text-sm text-zinc-500">Sign in to manage your store</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="admin-email" className="block text-[10px] uppercase tracking-widest font-bold text-zinc-400">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@shopverse.com"
              required
              className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 focus:bg-white focus:outline-none focus:border-black transition-colors text-sm"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-password" className="block text-[10px] uppercase tracking-widest font-bold text-zinc-400">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 focus:bg-white focus:outline-none focus:border-black transition-colors text-sm"
            />
          </div>
          <div className="pt-4">
            <Button type="submit" fullWidth disabled={loading} className="h-12 uppercase tracking-widest text-[11px]">
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
