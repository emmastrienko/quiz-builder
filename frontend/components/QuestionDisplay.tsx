import { CheckboxQuestionDetail, QuestionDetail } from "../types/quiz";

const TYPE_BADGES: Record<
  QuestionDetail["type"],
  { label: string; style: string }
> = {
  boolean: {
    label: "True / false",
    style: "bg-sky-50 text-sky-700 ring-sky-200/70",
  },
  input: {
    label: "Short answer",
    style: "bg-amber-50 text-amber-700 ring-amber-200/70",
  },
  checkbox: {
    label: "Multiple choice",
    style: "bg-violet-50 text-violet-700 ring-violet-200/70",
  },
};

function TypeBadge({ type }: { type: QuestionDetail["type"] }) {
  const badge = TYPE_BADGES[type];
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ring-1 ring-inset ${badge.style}`}
    >
      {badge.label}
    </span>
  );
}

function BooleanQuestionView({
  question,
}: {
  question: QuestionDetail & { type: "boolean" };
}) {
  return (
    <ul className="mt-3 flex flex-col gap-1.5 text-sm">
      {[true, false].map((value) => (
        <li
          key={String(value)}
          className={`w-fit rounded-full border px-3 py-1 ${
            question.correctAnswer === value
              ? "border-emerald-300 bg-emerald-50 font-medium text-emerald-700"
              : "border-slate-200 bg-white text-slate-400"
          }`}
        >
          {value ? "True" : "False"}
          {question.correctAnswer === value && (
            <span className="ml-2 font-semibold">&#10003; correct</span>
          )}
        </li>
      ))}
    </ul>
  );
}

function InputQuestionView({
  question,
}: {
  question: QuestionDetail & { type: "input" };
}) {
  return (
    <p className="mt-3 text-sm text-slate-500">
      Answer:{" "}
      <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
        {question.correctAnswer}
      </span>
    </p>
  );
}

function CheckboxQuestionView({
  question,
}: {
  question: CheckboxQuestionDetail;
}) {
  const correctSet = new Set(question.correctAnswers);
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5 text-sm">
      {question.options.map((option) => {
        const isCorrect = correctSet.has(option);
        return (
          <li
            key={option}
            className={`rounded-full border px-3 py-1 ${
              isCorrect
                ? "border-emerald-300 bg-emerald-50 font-medium text-emerald-700"
                : "border-slate-200 bg-white text-slate-400"
            }`}
          >
            {isCorrect && (
              <span className="mr-1.5 font-semibold">&#10003;</span>
            )}
            {option}
          </li>
        );
      })}
    </ul>
  );
}

export default function QuestionDisplay({
  question,
  index,
}: {
  question: QuestionDetail;
  index: number;
}) {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <TypeBadge type={question.type} />
        <span className="text-xs font-semibold tabular-nums text-slate-300">
          Q{index + 1}
        </span>
      </div>
      <p className="mt-3 font-medium leading-snug text-slate-900">
        {question.text}
      </p>
      {question.type === "boolean" && (
        <BooleanQuestionView question={question} />
      )}
      {question.type === "input" && <InputQuestionView question={question} />}
      {question.type === "checkbox" && (
        <CheckboxQuestionView question={question} />
      )}
    </article>
  );
}
