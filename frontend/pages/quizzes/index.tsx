import type { ReactNode } from "react";
import Link from "next/link";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { ApiError, quizApi } from "../../services/api";
import type { QuizListItem } from "../../types/quiz";

function DeleteIcon() {
  return (
    <svg
      aria-hidden
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function QuizCard({
  quiz,
  onDelete,
  deleting,
}: {
  quiz: QuizListItem;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  return (
    <li className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <Link
        href={`/quizzes/${quiz.id}`}
        className="flex-1 min-w-0"
        title={`View "${quiz.title}"`}
      >
        <p className="truncate font-semibold text-slate-900 group-hover:text-indigo-600">
          {quiz.title}
        </p>
        <div className="mt-1.5 flex items-center gap-2.5 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium tabular-nums">
            {quiz.questionCount}{" "}
            {quiz.questionCount === 1 ? "question" : "questions"}
          </span>
          <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
        </div>
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={`/quizzes/${quiz.id}`}
          className="rounded-lg px-2 py-1.5 text-sm font-medium text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
          tabIndex={-1}
        >
          View &rarr;
        </Link>
        <button
          type="button"
          onClick={() => onDelete(quiz.id)}
          aria-label={`Delete quiz "${quiz.title}"`}
          title={`Delete "${quiz.title}"`}
          disabled={deleting}
          className={`rounded-lg border border-slate-200 p-2 text-slate-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 ${
            deleting ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <DeleteIcon />
        </button>
      </div>
    </li>
  );
}

function SkeletonCard() {
  return (
    <li className="h-[86px] animate-pulse rounded-xl border border-slate-200/60 bg-slate-100/70" />
  );
}

function QuizzesPage(): ReactNode {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQuizzes(await quizApi.listQuizzes());
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load quizzes. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuizzes();
  }, [loadQuizzes]);

  const handleDelete = async (id: string) => {
    const quiz = quizzes.find((item) => item.id === id);
    const confirmed = window.confirm(
      `Delete quiz "${quiz?.title ?? id}"? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }
    setDeletingId(id);
    try {
      await quizApi.deleteQuiz(id);
      setQuizzes((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 404
          ? "This quiz was already deleted."
          : err instanceof ApiError
            ? err.message
            : "Failed to delete the quiz. Please try again.";
      window.alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Head>
        <title>All quizzes | Quiz Builder</title>
      </Head>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              All quizzes
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Browse your quizzes or create a new one.
            </p>
          </div>
          <Link
            href="/create"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-all hover:shadow-md hover:shadow-indigo-500/40"
          >
            + New quiz
          </Link>
        </div>

        {loading && (
          <ul className="flex flex-col gap-3" aria-label="Loading quizzes">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </ul>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void loadQuizzes()}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && quizzes.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-indigo-50 text-lg text-indigo-500">
              +
            </span>
            <p className="mt-4 font-semibold text-slate-700">No quizzes yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Create your first quiz to get started.
            </p>
            <Link
              href="/create"
              className="mt-5 inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-all hover:shadow-md hover:shadow-indigo-500/40"
            >
              Create a quiz
            </Link>
          </div>
        )}

        {!loading && !error && quizzes.length > 0 && (
          <ul className="flex flex-col gap-3">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                deleting={deletingId === quiz.id}
                onDelete={(id) => void handleDelete(id)}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default QuizzesPage;
