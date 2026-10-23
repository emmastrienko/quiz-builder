import type { ReactNode } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import type {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import type { QuizFormValues } from "./quiz-form.schema";
import type { QuestionType } from "../types/quiz";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "boolean", label: "Boolean (True/False)" },
  { value: "input", label: "Input (short answer)" },
  { value: "checkbox", label: "Checkbox (multiple correct)" },
];

function messageFor(
  source: unknown,
  key: string,
  itemIndex?: number,
): string | undefined {
  if (!source) {
    return undefined;
  }
  const field = (source as Record<string, unknown>)[key];
  if (itemIndex !== undefined) {
    if (Array.isArray(field)) {
      return (field[itemIndex] as { message?: string } | undefined)?.message;
    }
    return undefined;
  }
  if (field && typeof field === "object" && "message" in field) {
    return (field as { message?: string }).message;
  }
  return undefined;
}

export default function QuestionEditor({
  index,
  register,
  control,
  getValues,
  setValue,
  errors,
  onRemove,
}: {
  index: number;
  register: UseFormRegister<QuizFormValues>;
  control: Control<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  onRemove: () => void;
}): ReactNode {
  const questionErrors = errors.questions?.[index];
  const type: QuestionType =
    useWatch({
      control,
      name: `questions.${index}.type` as `questions.${number}.type`,
    }) ?? "boolean";

  const optionsArray = useFieldArray({
    control,
    name: `questions.${index}.options` as `questions.${number}.options`,
  });

  const correctOptionsName: `questions.${number}.correctOptions` = `questions.${index}.correctOptions`;

  const removeOption = (optionIndex: number) => {
    const currentCorrect = getValues(correctOptionsName) ?? [];
    const adjusted = currentCorrect
      .filter((value) => Number(value) !== optionIndex)
      .map((value) => {
        const next = Number(value);
        return next > optionIndex ? String(next - 1) : String(next);
      });
    setValue(correctOptionsName, adjusted);
    optionsArray.remove(optionIndex);
  };

  const textError = messageFor(questionErrors, "text");
  const inputAnswerError = messageFor(questionErrors, "inputAnswer");
  const optionsError = messageFor(questionErrors, "options");
  const correctOptionsError = messageFor(questionErrors, "correctOptions");

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-500">
          Question {index + 1}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          Remove question
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <label
            htmlFor={`question-${index}-text`}
            className="text-sm font-medium text-slate-700"
          >
            Question text
          </label>
          <input
            id={`question-${index}-text`}
            {...register(`questions.${index}.text`)}
            placeholder="e.g. What is the capital of France?"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          {textError && (
            <p className="mt-1 text-xs text-red-600">{textError}</p>
          )}
        </div>
        <div className="sm:w-56">
          <label
            htmlFor={`question-${index}-type`}
            className="text-sm font-medium text-slate-700"
          >
            Type
          </label>
          <select
            id={`question-${index}-type`}
            {...register(`questions.${index}.type`)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            {QUESTION_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {type === "boolean" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700">
            Correct answer
          </span>
          {(["true", "false"] as const).map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm"
            >
              <input
                type="radio"
                value={value}
                {...register(`questions.${index}.booleanAnswer`)}
              />
              {value === "true" ? "True" : "False"}
            </label>
          ))}
        </div>
      )}

      {type === "input" && (
        <div className="mt-3">
          <label
            htmlFor={`question-${index}-input`}
            className="text-sm font-medium text-slate-700"
          >
            Correct answer
          </label>
          <input
            id={`question-${index}-input`}
            {...register(`questions.${index}.inputAnswer`)}
            placeholder="Short answer"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          {inputAnswerError && (
            <p className="mt-1 text-xs text-red-600">{inputAnswerError}</p>
          )}
        </div>
      )}

      {type === "checkbox" && (
        <fieldset className="mt-3">
          <legend className="text-sm font-medium text-slate-700">
            Options{" "}
            <span className="text-slate-400">(tick the correct ones)</span>
          </legend>
          <div className="mt-2 flex flex-col gap-2">
            {optionsArray.fields.map((field, optionIndex) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Option ${optionIndex + 1}`}
                  {...register(
                    `questions.${index}.options.${optionIndex}.value`,
                  )}
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <label className="flex items-center gap-1.5 whitespace-nowrap text-sm text-slate-600">
                  <input
                    type="checkbox"
                    value={String(optionIndex)}
                    {...register(correctOptionsName)}
                  />
                  correct
                </label>
                <button
                  type="button"
                  onClick={() => removeOption(optionIndex)}
                  aria-label={`Remove option ${optionIndex + 1}`}
                  className="rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  &#10005;
                </button>
              </div>
            ))}
          </div>
          {optionsError && (
            <p className="mt-1.5 text-xs text-red-600">{optionsError}</p>
          )}
          {correctOptionsError && (
            <p className="mt-1.5 text-xs text-red-600">{correctOptionsError}</p>
          )}
          <button
            type="button"
            onClick={() => optionsArray.append({ value: "" })}
            className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
          >
            + Add option
          </button>
        </fieldset>
      )}
    </div>
  );
}
