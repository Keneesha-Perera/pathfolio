// frontend/app/dashboard/AddSkillForm.tsx
'use client';

import { useState } from 'react';
import { createSkill, attachSkillToUser } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function AddSkillForm({ onSkillAdded }: { onSkillAdded: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [proficiency, setProficiency] = useState('Intermediate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = getToken();
      if (!token) throw new Error('Not logged in');

      const skill = await createSkill(name, category, token);
      await attachSkillToUser(skill.id, proficiency, token);

      setName('');
      setCategory('');
      setProficiency('Intermediate');
      onSkillAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-5 pt-5 border-t border-[#E5E1D8]">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Skill name (e.g. React)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 px-3 py-2 border border-[#E5E1D8] rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#8A877D] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Category (e.g. Frontend)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 px-3 py-2 border border-[#E5E1D8] rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#8A877D] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
        />
      </div>

      <select
        value={proficiency}
        onChange={(e) => setProficiency(e.target.value)}
        className="w-full px-3 py-2 border border-[#E5E1D8] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
      >
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#4F46E5] text-white font-medium py-2 rounded-lg text-sm hover:bg-[#4338CA] transition-colors disabled:opacity-50"
      >
        {loading ? 'Adding...' : '+ Add Skill'}
      </button>
    </form>
  );
}