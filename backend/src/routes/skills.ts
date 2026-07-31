import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Create a new skill
router.post('/', async (req, res) => {
  try {
    const { name, category } = req.body;

    // If skill already exists, just return it instead of erroring
    const existing = await prisma.skill.findUnique({ where: { name } });
    if (existing) {
      return res.status(200).json(existing);
    }

    const skill = await prisma.skill.create({
      data: { name, category },
    });

    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

// Get all skills
router.get('/', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

export default router;