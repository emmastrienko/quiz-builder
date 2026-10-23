import { z } from 'zod';

const questionTextSchema = z.string().trim().min(1, 'Question text is required');

export const booleanQuestionSchema = z.object({
  type: z.literal('boolean'),
  text: questionTextSchema,
  correctAnswer: z.union([z.boolean(), z.enum(['true', 'false'])]),
});

export const inputQuestionSchema = z.object({
  type: z.literal('input'),
  text: questionTextSchema,
  correctAnswer: z.string().trim().min(1, 'Correct answer is required'),
});

export const checkboxQuestionSchema = z.object({
  type: z.literal('checkbox'),
  text: questionTextSchema,
  options: z
    .array(z.string().trim().min(1, 'Options cannot be empty'))
    .min(2, 'At least two options are required'),
  correctAnswers: z
    .array(z.string().trim().min(1, 'Correct answers cannot be empty'))
    .min(1, 'At least one correct answer is required'),
});

export const questionInputSchema = z
  .discriminatedUnion('type', [booleanQuestionSchema, inputQuestionSchema, checkboxQuestionSchema])
  .superRefine((question, ctx) => {
    if (question.type !== 'checkbox') {
      return;
    }
    if (new Set(question.options).size !== question.options.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'Options must be unique',
      });
    }
    const optionSet = new Set(question.options);
    const hasInvalidAnswer = question.correctAnswers.some((answer) => !optionSet.has(answer));
    if (hasInvalidAnswer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctAnswers'],
        message: 'Correct answers must match one of the options',
      });
    }
  });

export const createQuizSchema = z.object({
  title: z.string().trim().min(1, 'Quiz title is required'),
  questions: z.array(questionInputSchema).min(1, 'At least one question is required'),
});

export type BooleanQuestionInput = z.infer<typeof booleanQuestionSchema>;
export type InputQuestionInput = z.infer<typeof inputQuestionSchema>;
export type CheckboxQuestionInput = z.infer<typeof checkboxQuestionSchema>;
export type QuestionInput = z.infer<typeof questionInputSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export type QuestionType = 'boolean' | 'input' | 'checkbox';
