export type QuestionType = "boolean" | "input" | "checkbox";

export interface BooleanQuestionPayload {
  type: "boolean";
  text: string;
  correctAnswer: boolean;
}

export interface InputQuestionPayload {
  type: "input";
  text: string;
  correctAnswer: string;
}

export interface CheckboxQuestionPayload {
  type: "checkbox";
  text: string;
  options: string[];
  correctAnswers: string[];
}

export type QuestionPayload =
  | BooleanQuestionPayload
  | InputQuestionPayload
  | CheckboxQuestionPayload;

export interface CreateQuizPayload {
  title: string;
  questions: QuestionPayload[];
}

export interface QuizListItem {
  id: string;
  title: string;
  questionCount: number;
  createdAt: string;
}

export interface BooleanQuestionDetail {
  id: string;
  type: "boolean";
  text: string;
  correctAnswer: boolean;
}

export interface InputQuestionDetail {
  id: string;
  type: "input";
  text: string;
  correctAnswer: string;
}

export interface CheckboxQuestionDetail {
  id: string;
  type: "checkbox";
  text: string;
  options: string[];
  correctAnswers: string[];
}

export type QuestionDetail =
  | BooleanQuestionDetail
  | InputQuestionDetail
  | CheckboxQuestionDetail;

export interface QuizDetail {
  id: string;
  title: string;
  createdAt: string;
  questions: QuestionDetail[];
}
