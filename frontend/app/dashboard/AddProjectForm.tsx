// frontend/app/dashboard/AddProjectForm.tsx
'use client';

import { useState } from 'react';
import { createProject } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function AddProjectForm({ onProjectAdded }: { onProjectAdded: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = getToken();
      if (!token) throw new Error('Not logged in');

      const techArray = techStack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await createProject(title, description, techArray, link, token);

      setTitle('');
      setDescription('');
      setTechStack('');
      setLink('');
      onProjectAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-5 pt-5 border-t border-[#E5E1D8]">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full px-3 py-2 border border-[#E5E1D8] rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#8A877D] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2 border border-[#E5E1D8] rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#8A877D] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
        rows={2}
      />

      <input
        type="text"
        placeholder="Tech stack, comma separated (e.g. React, Node.js)"
        value={techStack}
        onChange={(e) => setTechStack(e.target.value)}
        className="w-full px-3 py-2 border border-[#E5E1D8] rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#8A877D] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
      />

      <input
        type="text"
        placeholder="Link (GitHub/live URL, optional)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="w-full px-3 py-2 border border-[#E5E1D8] rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#8A877D] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#4F46E5] text-white font-medium py-2 rounded-lg text-sm hover:bg-[#4338CA] transition-colors disabled:opacity-50"
      >
        {loading ? 'Adding...' : '+ Add Project'}
      </button>
    </form>
  );
}