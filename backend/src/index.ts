import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users';
import skillRoutes from './routes/skills';
import projectRoutes from './routes/projects';
import userSkillRoutes from './routes/userSkills';
import analyzeRoutes from './routes/analyze';
import directoryRoutes from './routes/directory';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Pathfolio API is running 🚀' });
});

app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/user-skills', userSkillRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/directory', directoryRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});