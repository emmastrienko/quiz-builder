import { CreateQuizPayload, QuizDetail, QuizListItem } from "../types/quiz";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  status: number;
  issues?: { field: string; message: string }[];

  constructor(message: string, status: number, issues?: ApiError["issues"]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!response.ok) {
    const body: unknown = await response
      .clone()
      .json()
      .catch(() => null);
    if (
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      const issues =
        "issues" in body &&
        Array.isArray(body.issues) &&
        body.issues.every(
          (issue) =>
            issue &&
            typeof issue === "object" &&
            "field" in issue &&
            "message" in issue,
        )
          ? (body.issues as { field: string; message: string }[])
          : undefined;
      throw new ApiError(body.error, response.status, issues);
    }
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const quizApi = {
  listQuizzes(): Promise<QuizListItem[]> {
    return request<QuizListItem[]>("/quizzes");
  },

  getQuiz(id: string): Promise<QuizDetail> {
    return request<QuizDetail>(`/quizzes/${id}`);
  },

  createQuiz(payload: CreateQuizPayload): Promise<QuizDetail> {
    return request<QuizDetail>("/quizzes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteQuiz(id: string): Promise<void> {
    return request<void>(`/quizzes/${id}`, { method: "DELETE" });
  },
};
