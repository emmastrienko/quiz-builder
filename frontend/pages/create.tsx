import type { ReactNode } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError, quizApi } from "../services/api";
import type { CreateQuizPayload, QuestionPayload } from "../types/quiz";
import QuestionEditor from "../components/QuestionEditor";
import {
  createEmptyQuestion,
  quizFormSchema,
  type QuizFormQuestion,
  type QuizFormValues,
} from "../components/quiz-form.schema";

function mapQuestion(question: QuizFormQuestion): QuestionPayload {
  switch (question.type) {
    case "boolean":
      return {
        type: "boolean",
        text: question.text.trim(),
        correctAnswer: question.booleanAnswer === "true",
      };
    case "input":
      return {
        type: "input",
        text: question.text.trim(),
        correctAnswer: question.inputAnswer.trim(),
      };
    case "checkbox": {
      const trimmedOptions = question.options.map((option) =>
        option.value.trim(),
      );
      return {
        type: "checkbox",
        text: question.text.trim(),
        options: trimmedOptions.filter((value) => value !== ""),
        correctAnswers: question.correctOptions
          .map(Number)
          .sort((a, b) => a - b)
          .map((optionIndex) => trimmedOptions[optionIndex]),
      };
    }
  }
}

export default function CreateQuizPage(): ReactNode {
  const router = useRouter();
  const { register, control, handleSubmit, getValues, setValue, formState } =
    useForm<QuizFormValues>({
      resolver: zodResolver(quizFormSchema),
      defaultValues: {
        title: "",
        questions: [createEmptyQuestion()],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const onSubmit = async (values: QuizFormValues) => {
    const payload: CreateQuizPayload = {
      title: values.title.trim(),
      questions: values.questions.map(mapQuestion),
    };
    try {
      const quiz = await quizApi.createQuiz(payload);
      router.push(`/quizzes/${quiz.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.issues) {
        const details = err.issues
          .map((issue) => `${issue.field}: ${issue.message}`)
          .join("\n");
        window.alert(`Could not create quiz:\n${details}`);
      } else {
        window.alert(
          err instanceof ApiError
            ? `Could not create quiz: ${err.message}`
            : "Failed to create the quiz. Please check that the backend is running and try again.",
        );
      }
    }
  };

  return (
    <>
      <Head>
        <title>Create a quiz | Quiz Builder</title>
      </Head>
      <div className="flex flex-col gap-6">
        <div>
          <Link
            href="/quizzes"
            className="mb-3 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
          >
            &larr; Back to all quizzes
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create a quiz
          </h1>
        </div>

        <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
          <fieldset
            disabled={formState.isSubmitting}
            className="flex flex-col gap-6"
          >
            {/* Quiz title */}
            <div>
              <label
                htmlFor="quiz-title"
                className="text-sm font-medium text-slate-700"
              >
                Quiz title
              </label>
              <input
                id="quiz-title"
                {...register("title")}
                placeholder="e.g. Geography 101"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              {formState.errors.title?.message && (
                <p className="mt-1 text-xs text-red-600">
                  {formState.errors.title?.message}
                </p>
              )}
            </div>

            {/* Questions */}
            <section aria-label="Questions">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Questions
              </h2>
              <div className="flex flex-col gap-4">
                {fields.map((field, index) => (
                  <QuestionEditor
                    key={field.id}
                    index={index}
                    register={register}
                    control={control}
                    getValues={getValues}
                    setValue={setValue}
                    errors={formState.errors}
                    onRemove={() => remove(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => append(createEmptyQuestion())}
                className="mt-4 w-full rounded-xl border-2 border-dashed border-slate-300 bg-white/60 py-3.5 text-sm font-semibold text-slate-500 transition-all hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600"
              >
                + Add question
              </button>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={formState.isSubmitting}
                className={`rounded-xl px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all ${
                  formState.isSubmitting
                    ? "cursor-not-allowed bg-indigo-400 shadow-none"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/40"
                }`}
              >
                {formState.isSubmitting ? "Creating quiz..." : "Create quiz"}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </>
  );
}
