const API_URL = 'http://localhost:5000/api';

export async function signup(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/users/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Signup failed');
  }

  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }

  return res.json();
}

export async function getUserSkills(userId: number) {
  const res = await fetch(`${API_URL}/user-skills/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch skills');
  return res.json();
}

export async function getUserProjects(userId: number) {
  const res = await fetch(`${API_URL}/projects/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function createSkill(name: string, category: string, token: string) {
  const res = await fetch(`${API_URL}/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, category }),
  });
  if (!res.ok) throw new Error('Failed to create skill');
  return res.json();
}

export async function attachSkillToUser(skillId: number, proficiency: string, token: string) {
  const res = await fetch(`${API_URL}/user-skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ skillId, proficiency }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to attach skill');
  }
  return res.json();
}

export async function createProject(
  title: string,
  description: string,
  techStack: string[],
  link: string,
  token: string
) {
  const res = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description, techStack, link }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create project');
  }
  return res.json();
}