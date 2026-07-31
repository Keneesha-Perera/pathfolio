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

export default router;