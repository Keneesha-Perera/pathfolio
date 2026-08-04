'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDirectory } from '@/lib/api';

interface DirectoryUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  skills: {
    proficiency: string | null;
    skill: { name: string; category: string | null };
  }[];
  projects: { id: number }[];
}

export default function DirectoryPage() {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async (skillFilter?: string) => {
    setLoading(true);
    try {
      const data = await getDirectory(skillFilter);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadUsers();
    })();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(search.trim() || undefined);
  };

  const clearSearch = () => {
    setSearch('');
    loadUsers();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Directory</h1>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[#4F46E5] hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>
        <p className="text-sm text-[#8A877D] mb-6">
          Browse everyone on Pathfolio, or search by skill
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Search by skill (e.g. React)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-[#E5E1D8] rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#8A877D] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-[#4F46E5] text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-[#4338CA] transition-colors"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="text-sm text-[#5B5952] hover:text-[#1A1A1A] px-2"
            >
              Clear
            </button>
          )}
        </form>

        {loading ? (
          <p className="text-[#8A877D]">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-[#8A877D] text-sm italic">No one found with that skill yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-white p-5 rounded-xl border border-[#E5E1D8] shadow-sm"
              >
                <div className="flex justify-between items-start mb-1">
                  <h2 className="font-semibold text-[#1A1A1A]">{u.name}</h2>
                  <span className="text-xs text-[#8A877D]">
                    {u.projects.length} project{u.projects.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <a
                  href={`mailto:${u.email}`}
                  className="text-xs text-[#4F46E5] hover:underline block mb-2"
                >
                  {u.email}
                </a>

                {u.skills.length === 0 ? (
                  <p className="text-sm text-[#8A877D] italic">No skills listed yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {u.skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs bg-[#EEF2FF] text-[#4338CA] font-medium px-2 py-0.5 rounded-full border border-[#E0E7FF]"
                      >
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}