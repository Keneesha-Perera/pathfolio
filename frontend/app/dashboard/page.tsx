'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getToken, logout } from '@/lib/auth';
import {
  getUserSkills,
  getUserProjects,
  deleteProject,
  updateProject,
  deleteUserSkill,
} from '@/lib/api';
import AddSkillForm from './AddSkillForm';
import AddProjectForm from './AddProjectForm';
import SkillGapAnalyzer from './SkillGapAnalyzer';

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
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', techStack: '', link: '' });

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

  const handleDeleteSkill = async (skillId: number) => {
    const token = getToken();
    if (!token) return;
    if (!confirm('Remove this skill from your profile?')) return;

    try {
      await deleteUserSkill(skillId, token);
      handleRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: number) => {
    const token = getToken();
    if (!token) return;
    if (!confirm('Delete this project? This cannot be undone.')) return;

    try {
      await deleteProject(id, token);
      handleRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditingProject = (p: Project) => {
    setEditingProjectId(p.id);
    setEditForm({
      title: p.title,
      description: p.description || '',
      techStack: p.techStack.join(', '),
      link: p.link || '',
    });
  };

  const cancelEditingProject = () => {
    setEditingProjectId(null);
  };

  const saveEditingProject = async (id: number) => {
    const token = getToken();
    if (!token) return;

    try {
      const techArray = editForm.techStack.split(',').map((t) => t.trim()).filter(Boolean);
      await updateProject(id, editForm.title, editForm.description, techArray, editForm.link, token);
      setEditingProjectId(null);
      handleRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

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
          <>
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
                        className="group flex items-center gap-1.5 px-3 py-1 bg-[#EEF2FF] text-[#4338CA] font-medium rounded-full text-sm border border-[#E0E7FF]"
                      >
                        {s.skill.name}
                        {s.proficiency && ` · ${s.proficiency}`}
                        <button
                          onClick={() => handleDeleteSkill(s.skillId)}
                          className="text-[#4338CA] opacity-50 hover:opacity-100 hover:text-red-600 transition-opacity"
                          title="Remove skill"
                        >
                          ×
                        </button>
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
                    {projects.map((p) =>
                      editingProjectId === p.id ? (
                        <div key={p.id} className="border border-[#E0E7FF] bg-[#EEF2FF] rounded-lg p-3 space-y-2">
                          <input
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full px-2 py-1 border border-[#E5E1D8] rounded text-sm"
                            placeholder="Title"
                          />
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full px-2 py-1 border border-[#E5E1D8] rounded text-sm"
                            placeholder="Description"
                            rows={2}
                          />
                          <input
                            value={editForm.techStack}
                            onChange={(e) => setEditForm({ ...editForm, techStack: e.target.value })}
                            className="w-full px-2 py-1 border border-[#E5E1D8] rounded text-sm"
                            placeholder="Tech stack, comma separated"
                          />
                          <input
                            value={editForm.link}
                            onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                            className="w-full px-2 py-1 border border-[#E5E1D8] rounded text-sm"
                            placeholder="Link"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditingProject(p.id)}
                              className="text-sm bg-[#4F46E5] text-white px-3 py-1 rounded hover:bg-[#4338CA]"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditingProject}
                              className="text-sm text-[#5B5952] hover:text-[#1A1A1A]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div key={p.id} className="border-b border-[#E5E1D8] pb-3 last:border-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-[#1A1A1A]">{p.title}</h3>
                            <div className="flex gap-2 text-xs">
                              <button
                                onClick={() => startEditingProject(p)}
                                className="text-[#4F46E5] hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProject(p.id)}
                                className="text-red-500 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
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
                      )
                    )}
                  </div>
                )}
                <AddProjectForm onProjectAdded={handleRefresh} />
              </div>
            </div>

            <div className="mt-6">
              <SkillGapAnalyzer />
            </div>
          </>
        )}
      </div>
    </div>
  );
}