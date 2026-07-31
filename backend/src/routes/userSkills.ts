import { Router, Response } from 'express';
import prisma from '../prismaClient';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Attach a skill to the logged-in user
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { skillId, proficiency } = req.body;
    const userId = req.userId as number;

    const userSkill = await prisma.userSkill.create({
      data: { userId, skillId, proficiency },
    });

    res.status(201).json(userSkill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to link skill to user' });
  }
});

// Get all skills for a specific user (public — anyone can view a profile's skills)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userSkills = await prisma.userSkill.findMany({
      where: { userId: parseInt(userId) },
      include: { skill: true },
    });

    res.json(userSkills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user skills' });
  }
});

// Remove a skill from the logged-in user only
router.delete('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { skillId } = req.body;
    const userId = req.userId as number;

    await prisma.userSkill.delete({
      where: {
        userId_skillId: { userId, skillId },
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove skill from user' });
  }
});

export default router;