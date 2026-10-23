import { Question } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateQuizInput, QuestionInput, QuestionType } from '../validators/quiz.schema';

export interface QuizListItem {
  id: string;
  title: string;
  questionCount: number;
  createdAt: string;
}

export interface BooleanQuestionDetail {
  id: string;
  type: 'boolean';
  text: string;
  correctAnswer: boolean;
}

export interface InputQuestionDetail {
  id: string;
  type: 'input';
  text: string;
  correctAnswer: string;
}

export interface CheckboxQuestionDetail {
  id: string;
  type: 'checkbox';
  text: string;
  options: string[];
  correctAnswers: string[];
}

export type QuestionDetail = BooleanQuestionDetail | InputQuestionDetail | CheckboxQuestionDetail;

export interface QuizDetail {
  id: string;
  title: string;
  createdAt: string;
  questions: QuestionDetail[];
}

function serializeCorrectAnswer(question: QuestionInput): string | null {
  switch (question.type) {
    case 'boolean':
      return JSON.stringify(question.correctAnswer === true || question.correctAnswer === 'true');
    case 'input':
      return JSON.stringify(question.correctAnswer);
    case 'checkbox':
      return JSON.stringify(question.correctAnswers);
    default:
      return null;
  }
}

function deserializeQuestion(question: Question): QuestionDetail {
  const base = { id: question.id, text: question.text };
  switch (question.type as QuestionType) {
    case 'boolean':
      return {
        ...base,
        type: 'boolean',
        correctAnswer: JSON.parse(question.correctAnswer ?? 'false') as boolean,
      };
    case 'input':
      return {
        ...base,
        type: 'input',
        correctAnswer: JSON.parse(question.correctAnswer ?? '""') as string,
      };
    case 'checkbox':
      return {
        ...base,
        type: 'checkbox',
        options: JSON.parse(question.options ?? '[]') as string[],
        correctAnswers: JSON.parse(question.correctAnswer ?? '[]') as string[],
      };
    default:
      throw new Error(`Unknown question type: ${question.type}`);
  }
}

export const quizService = {
  async listQuizzes(): Promise<QuizListItem[]> {
    const quizzes = await prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { questions: true } } },
    });
    return quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      questionCount: quiz._count.questions,
      createdAt: quiz.createdAt.toISOString(),
    }));
  },

  async getQuizById(id: string): Promise<QuizDetail | null> {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: { orderBy: { position: 'asc' } } },
    });
    if (!quiz) {
      return null;
    }
    return {
      id: quiz.id,
      title: quiz.title,
      createdAt: quiz.createdAt.toISOString(),
      questions: quiz.questions.map(deserializeQuestion),
    };
  },

  async createQuiz(input: CreateQuizInput): Promise<QuizDetail> {
    const quiz = await prisma.quiz.create({
      data: {
        title: input.title,
        questions: {
          create: input.questions.map((question, index) => ({
            type: question.type,
            text: question.text,
            options: question.type === 'checkbox' ? JSON.stringify(question.options) : null,
            correctAnswer: serializeCorrectAnswer(question),
            position: index,
          })),
        },
      },
      include: { questions: { orderBy: { position: 'asc' } } },
    });
    return {
      id: quiz.id,
      title: quiz.title,
      createdAt: quiz.createdAt.toISOString(),
      questions: quiz.questions.map(deserializeQuestion),
    };
  },

  async deleteQuiz(id: string): Promise<boolean> {
    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) {
      return false;
    }
    await prisma.quiz.delete({ where: { id } });
    return true;
  },
};
