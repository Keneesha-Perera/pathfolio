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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Welcome, {user.name} 👋</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-red-600"
          >
            Log out
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading your data...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Skills section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Your Skills</h2>
              {skills.length === 0 ? (
                <p className="text-gray-500 text-sm">No skills added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s.skillId}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
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
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Your Projects</h2>
              {projects.length === 0 ? (
                <p className="text-gray-500 text-sm">No projects added yet.</p>
              ) : (
                <div className="space-y-3">
                  {projects.map((p) => (
                    <div key={p.id} className="border-b pb-3 last:border-0">
                      <h3 className="font-medium">{p.title}</h3>
                      {p.description && (
                        <p className="text-sm text-gray-600">{p.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.techStack.map((tech) => (
                          <span key={tech} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
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