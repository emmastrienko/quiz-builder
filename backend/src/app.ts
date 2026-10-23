import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { quizRoutes } from './routes/quiz.routes';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/', quizRoutes);

  return app;
}
