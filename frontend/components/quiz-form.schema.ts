import { z } from "zod";
import type { QuestionType } from "../types/quiz";

export interface QuizFormValues {
  title: string;
  questions: QuizFormQuestion[];
}

export interface QuizFormQuestion {
  type: QuestionType;
  text: string;
  booleanAnswer: "true" | "false";
  inputAnswer: string;
  options: { value: string }[];
  correctOptions: string[];
}

export function createEmptyQuestion(): QuizFormQuestion {
  return {
    type: "boolean",
    text: "",
    booleanAnswer: "true",
    inputAnswer: "",
    options: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
    correctOptions: [],
  };
}

export const quizFormSchema = z
  .object({
    title: z.string(),
    questions: z.array(
      z.object({
        type: z.enum(["boolean", "input", "checkbox"]),
        text: z.string(),
        booleanAnswer: z.enum(["true", "false"]),
        inputAnswer: z.string(),
        options: z.array(z.object({ value: z.string() })),
        correctOptions: z.array(z.string()),
      }),
    ),
  })
  .superRefine((values, ctx) => {
    if (!values.title.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["title"],
        message: "Quiz title is required",
      });
    }

    if (values.questions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questions"],
        message: "Add at least one question",
      });
    }

    values.questions.forEach((question, index) => {
      if (!question.text.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", index, "text"],
          message: "Question text is required",
        });
      }

      if (question.type === "input" && !question.inputAnswer.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", index, "inputAnswer"],
          message: "Correct answer is required",
        });
      }

      if (question.type !== "checkbox") {
        return;
      }

      const trimmedOptions = question.options.map((option) =>
        option.value.trim(),
      );
      const filledOptions = trimmedOptions.filter((value) => value !== "");

      if (filledOptions.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", index, "options"],
          message: "Provide at least two non-empty options",
        });
      }

      if (new Set(filledOptions).size !== filledOptions.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", index, "options"],
          message: "Options must be unique",
        });
      }

      const checkedIndices = question.correctOptions.map(Number);
      if (checkedIndices.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", index, "correctOptions"],
          message: "Select at least one correct option",
        });
      }
      const indexOfEmpty = checkedIndices.find(
        (optionIndex) =>
          optionIndex < 0 ||
          optionIndex >= trimmedOptions.length ||
          trimmedOptions[optionIndex] === "",
      );
      if (indexOfEmpty !== undefined && checkedIndices.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", index, "correctOptions"],
          message: "A selected correct option has no text",
        });
      }
    });
  });
