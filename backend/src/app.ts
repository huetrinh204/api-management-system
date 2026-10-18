import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import authRoutes from './routes/auth';
import apiDocRoutes from './routes/apiDocs';
import issueRoutes from './routes/issues';
import commentRoutes from './routes/comments';
import projectRoutes from './routes/projects';
import userRoutes from './routes/users';
import profileRoutes from './routes/profile';
import { errorHandler } from './middlewares/errorHandler';
// Import models để đảm bảo associations được load
import './models';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/api-docs', apiDocRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);

// Global error handler — phải đặt cuối cùng
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

export default app;
