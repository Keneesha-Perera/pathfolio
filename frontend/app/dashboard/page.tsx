'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getToken, logout } from '@/lib/auth';
import { getUserSkills, getUserProjects } from '@/lib/api';
import AddSkillForm from './AddSkillForm';
import AddProjectForm from './AddProjectForm';

interface Skill {
  skillId: number;
  proficiency: string | null;
  skill: { id: number; name: string; category: string | null };
}

interface Project {
  id: number;
  title: string;
  description: string | null;
  techStack: string[];
  link: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (currentUser: { id: number; name: string; email: string }) => {
    try {
      const [skillsData, projectsData] = await Promise.all([
        getUserSkills(currentUser.id),
        getUserProjects(currentUser.id),
      ]);
      setSkills(skillsData);
      setProjects(projectsData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    const currentUser = getUser();

    if (!token || !currentUser) {
      router.push('/login');
      return;
    }

    (async () => {
      setUser(currentUser);
      await loadData(currentUser);
    })();
  }, [router]);

  const handleRefresh = () => {
    if (user) loadData(user);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null; // brief flash before redirect check completes

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
            Welcome back, {user.name}
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-[#5B5952] hover:text-red-600 transition-colors"
          >
            Log out
          </button>
        </div>

        {loading ? (
          <p className="text-[#8A877D]">Loading your data...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Skills section */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E1D8] shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-[#1A1A1A]">Your Skills</h2>
              {skills.length === 0 ? (
                <p className="text-[#8A877D] text-sm italic">
                  No skills added yet — add your first one below.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s.skillId}
                      className="px-3 py-1 bg-[#EEF2FF] text-[#4338CA] font-medium rounded-full text-sm border border-[#E0E7FF]"
                    >
                      {s.skill.name}
                      {s.proficiency && ` · ${s.proficiency}`}
                    </span>
                  ))}
                </div>
              )}
              <AddSkillForm onSkillAdded={handleRefresh} />
            </div>

            {/* Projects section */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E1D8] shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-[#1A1A1A]">Your Projects</h2>
              {projects.length === 0 ? (
                <p className="text-[#8A877D] text-sm italic">
                  No projects added yet — add your first one below.
                </p>
              ) : (
                <div className="space-y-3">
                  {projects.map((p) => (
                    <div key={p.id} className="border-b border-[#E5E1D8] pb-3 last:border-0">
                      <h3 className="font-medium text-[#1A1A1A]">{p.title}</h3>
                      {p.description && (
                        <p className="text-sm text-[#5B5952] mt-0.5">{p.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs bg-[#F5F3EE] text-[#5B5952] font-medium px-2 py-0.5 rounded border border-[#E5E1D8]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <AddProjectForm onProjectAdded={handleRefresh} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}