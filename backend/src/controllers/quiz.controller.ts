import { Request, Response } from 'express';
import { createQuizSchema } from '../validators/quiz.schema';
import { quizService } from '../services/quiz.service';

function formatIssues(issues: { path: string; message: string }[]) {
  return issues.map((issue) => ({
    field: issue.path,
    message: issue.message,
  }));
}

export const quizController = {
  async listQuizzes(req: Request, res: Response) {
    const quizzes = await quizService.listQuizzes();
    res.json(quizzes);
  },

  async getQuizById(req: Request, res: Response) {
    const quiz = await quizService.getQuizById(req.params.id);
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }
    res.json(quiz);
  },

  async createQuiz(req: Request, res: Response) {
    const result = createQuizSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        issues: formatIssues(
          result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        ),
      });
      return;
    }
    const quiz = await quizService.createQuiz(result.data);
    res.status(201).json(quiz);
  },

  async deleteQuiz(req: Request, res: Response) {
    const deleted = await quizService.deleteQuiz(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }
    res.status(204).send();
  },
};
