import type { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";

export default function Home(): ReactNode {
  return (
    <>
      <Head>
        <title>Quiz Builder</title>
        <meta
          name="description"
          content="Build, browse and share custom quizzes with boolean, input and multiple-choice questions."
        />
      </Head>
      <div className="flex flex-col items-center gap-8 py-16 text-center sm:py-24">
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-indigo-600">
          Full-stack quiz platform
        </span>
        <h1 className="max-w-xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Build your own{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            quizzes
          </span>
        </h1>
        <p className="max-w-md text-base leading-relaxed text-slate-600">
          Create quizzes with true/false questions, short answers, and
          multiple-choice questions &mdash; then browse them all from your
          dashboard.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/create"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-all hover:shadow-md hover:shadow-indigo-500/40"
          >
            Create a quiz
          </Link>
          <Link
            href="/quizzes"
            className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50"
          >
            Browse quizzes &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
