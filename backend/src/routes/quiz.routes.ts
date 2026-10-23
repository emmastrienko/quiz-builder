import { Router } from 'express';
import { quizController } from '../controllers/quiz.controller';
import { asyncHandler, notFoundHandler, errorHandler } from '../middleware/error.middleware';

const router = Router();

router.post('/quizzes', asyncHandler(quizController.createQuiz));
router.get('/quizzes', asyncHandler(quizController.listQuizzes));
router.get('/quizzes/:id', asyncHandler(quizController.getQuizById));
router.delete('/quizzes/:id', asyncHandler(quizController.deleteQuiz));

router.use(notFoundHandler);
router.use(errorHandler);

export { router as quizRoutes };
