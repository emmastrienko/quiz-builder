import type { ReactNode } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import QuestionDisplay from "../../components/QuestionDisplay";
import { ApiError, quizApi } from "../../services/api";
import type { QuizDetail } from "../../types/quiz";

function DetailPage(): ReactNode {
  const router = useRouter();
  const { id } = router.query;

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (typeof id !== "string") {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    quizApi
      .getQuiz(id)
      .then((data) => {
        if (!cancelled) {
          setQuiz(data);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          window.alert(
            err instanceof ApiError
              ? err.message
              : "Failed to load the quiz. Please try again.",
          );
          router.push("/quizzes");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (loading || !id) {
    return (
      <div className="flex flex-col gap-4" aria-label="Loading quiz">
        <div className="h-8 w-1/2 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-32 animate-pulse rounded-xl border border-slate-200/60 bg-slate-100/70" />
        <div className="h-32 animate-pulse rounded-xl border border-slate-200/60 bg-slate-100/70" />
      </div>
    );
  }

  if (notFound || !quiz) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-lg text-slate-400">
          ?
        </span>
        <p className="mt-4 font-semibold text-slate-700">Quiz not found</p>
        <p className="mt-1 text-sm text-slate-500">It may have been deleted.</p>
        <Link
          href="/quizzes"
          className="mt-5 inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-all hover:shadow-md hover:shadow-indigo-500/40"
        >
          Back to all quizzes
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          {quiz ? `${quiz.title} | Quiz Builder` : "Quiz | Quiz Builder"}
        </title>
      </Head>
      <div className="flex flex-col gap-6">
        <div>
          <Link
            href="/quizzes"
            className="mb-3 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
          >
            &larr; Back to all quizzes
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {quiz.title}
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {quiz.questions.length}{" "}
              {quiz.questions.length === 1 ? "question" : "questions"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Read-only preview</p>
        </div>

        {quiz.questions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            This quiz has no questions.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {quiz.questions.map((question, index) => (
              <QuestionDisplay
                key={question.id}
                question={question}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default DetailPage;
