import { Router, Response } from 'express';
import prisma from '../prismaClient';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Create a new project (now requires authentication)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, techStack, link } = req.body;
    const userId = req.userId; // comes from the token, not the request body anymore

    const project = await prisma.project.create({
      data: { title, description, techStack, link, userId: userId as number },
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get all projects (public, no auth needed)
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get all projects for a specific user (public)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const projects = await prisma.project.findMany({
      where: { userId: parseInt(userId) },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user projects' });
  }
});

// Update a project (only the owner can update)
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId as number;
    const { title, description, techStack, link } = req.body;

    // First check the project belongs to this user
    const existing = await prisma.project.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this project' });
    }

    const updated = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { title, description, techStack, link },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete a project (only the owner can delete)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId as number;

    const existing = await prisma.project.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this project' });
    }

    await prisma.project.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;