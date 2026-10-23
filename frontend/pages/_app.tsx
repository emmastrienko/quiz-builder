import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { ReactNode } from "react";
import Link from "next/link";

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-base font-bold tracking-tight text-slate-900"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-black text-white shadow-sm shadow-indigo-500/30">
            Q
          </span>
          Quiz Builder
        </Link>
        <nav className="flex items-center gap-1.5 text-sm font-medium">
          <Link
            href="/quizzes"
            className="rounded-lg px-3.5 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            All quizzes
          </Link>
          <Link
            href="/create"
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 font-semibold text-white shadow-sm shadow-indigo-500/30 transition-all hover:shadow-md hover:shadow-indigo-500/40"
          >
            + Create quiz
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function App({ Component, pageProps }: AppProps): ReactNode {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <Component {...pageProps} />
      </main>
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-400">
        Quiz Builder &middot; built with Next.js, Express &amp; Prisma
      </footer>
    </div>
  );
}
