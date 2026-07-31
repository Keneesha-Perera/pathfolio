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
      onSkillAdded(); // tell the parent dashboard to refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4 border-t pt-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Skill name (e.g. React)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 px-3 py-2 border rounded-md text-sm"
        />
        <input
          type="text"
          placeholder="Category (e.g. Frontend)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md text-sm"
        />
      </div>

      <select
        value={proficiency}
        onChange={(e) => setProficiency(e.target.value)}
        className="w-full px-3 py-2 border rounded-md text-sm"
      >
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Adding...' : '+ Add Skill'}
      </button>
    </form>
  );
}