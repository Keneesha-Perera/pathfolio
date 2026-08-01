'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup } from '@/lib/api';
import { saveAuth } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await signup(name, email, password);
      saveAuth(data.token, data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-[#E5E1D8] shadow-sm">
        <h1 className="text-2xl font-bold mb-1 text-center text-[#1A1A1A] tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-[#8A877D] text-center mb-6">
          Start tracking your skills and projects
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#1A1A1A]">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#E5E1D8] rounded-lg text-[#1A1A1A] placeholder:text-[#8A877D] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#1A1A1A]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#E5E1D8] rounded-lg text-[#1A1A1A] placeholder:text-[#8A877D] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#1A1A1A]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-[#E5E1D8] rounded-lg text-[#1A1A1A] placeholder:text-[#8A877D] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4F46E5] text-white font-medium py-2 rounded-lg hover:bg-[#4338CA] transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#5B5952]">
          Already have an account?{' '}
          <a href="/login" className="text-[#4F46E5] font-medium hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}