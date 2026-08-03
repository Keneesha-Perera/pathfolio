import { Router, Response } from 'express';
import OpenAI from 'openai';
import prisma from '../prismaClient';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

router.post('/skill-gap', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as number;
    const { targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({ error: 'Target role is required' });
    }

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    const projects = await prisma.project.findMany({
      where: { userId },
    });

    const skillsList =
      userSkills
        .map((s) => `${s.skill.name}${s.proficiency ? ` (${s.proficiency})` : ''}`)
        .join(', ') || 'None listed';

    const projectsList =
      projects.map((p) => `${p.title}: ${p.techStack.join(', ')}`).join('; ') ||
      'None listed';

    const prompt = `You are a career advisor helping a software engineering candidate understand their readiness for a specific role.

Candidate's current skills: ${skillsList}
Candidate's projects: ${projectsList}
Target role: ${targetRole}

Respond ONLY with valid JSON (no markdown, no preamble) in exactly this shape:
{
  "readinessScore": <number 0-100>,
  "strengths": ["...", "...", "..."],
  "gaps": ["...", "...", "..."],
  "learningPath": ["...", "...", "...", "..."],
  "summary": "..."
}

Keep each array to 3-5 concise items. The summary should be 2-3 sentences, encouraging but honest.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(cleaned);

    res.json(analysis);
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
});

export default router;