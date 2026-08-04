import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Get all users, optionally filtered by skill name
router.get('/', async (req, res) => {
  try {
    const { skill } = req.query;

    const users = await prisma.user.findMany({
      where: skill
        ? {
            skills: {
              some: {
                skill: {
                  name: {
                    contains: skill as string,
                    mode: 'insensitive',
                  },
                },
              },
            },
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        skills: {
          select: {
            proficiency: true,
            skill: { select: { name: true, category: true } },
          },
        },
            projects: {
            select: {
                id: true,
                title: true,
                techStack: true,
                link: true,
            },
         },
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch directory' });
  }
});

export default router;