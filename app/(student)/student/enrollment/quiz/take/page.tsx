"use client";

import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, ChevronRight, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";

export default function ActiveQuizPage() {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ passed: boolean; score: number } | null>(null);

    const activeQuestionsResult = useQuery(api.quizzes.listActiveForStudents);
    const enrollmentResult = useQuery(api.enrollments.get);
    const submitQuiz = useMutation(api.enrollments.submitQuiz);

    const activeQuestions = activeQuestionsResult?.success ? activeQuestionsResult.data : null;
    const enrollment = enrollmentResult?.success ? enrollmentResult.data : null;

    const handleOptionSelect = (questionId: string, optionIndex: number) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionIndex,
        }));
    };

    if (activeQuestionsResult === undefined || enrollmentResult === undefined) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!activeQuestions || activeQuestions.length === 0) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center text-center px-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-4">
                    <XCircle className="h-8 w-8 text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-901">No Quiz Available</h2>
                <p className="mt-2 text-gray-500 max-w-md">
                    {activeQuestionsResult?.success === false
                        ? activeQuestionsResult.error
                        : "There are currently no active orientation questions. Please contact support or check back later."}
                </p>
                <button
                    onClick={() => router.push('/student/enrollment')}
                    className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                >
                    Back to Enrollment
                </button>
            </div>
        );
    }

    if (!enrollment) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-gray-500">
                {enrollmentResult?.success === false ? enrollmentResult.error : "Enrollment record not found."}
            </div>
        );
    }

    const allAnswered = activeQuestions.every((q) => answers[q._id] !== undefined);

    const handleSubmit = async () => {
        if (!allAnswered) return;

        setIsSubmitting(true);

        try {
            const gradeResult = await submitQuiz({
                enrollmentId: enrollment._id,
                answers: answers
            });

            if (!gradeResult.success) {
                throw new Error(gradeResult.error);
            }

            setResult({ passed: gradeResult.data.passed, score: gradeResult.data.score });
        } catch (error: any) {
            console.error("Failed to submit quiz:", error);
            alert(error.message || "Something went wrong submitting your quiz. Please try again.");
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setResult(null);
        setIsSubmitting(false);
    };

    // --- Result View ---
    if (result) {
        return (
            <div className="flex flex-1 items-center justify-center p-6 mt-12">
                <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg">
                    {result.passed ? (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h2 className="mt-6 text-2xl font-bold text-gray-900">Quiz Passed!</h2>
                            <p className="mt-2 text-gray-600">
                                You scored <span className="font-semibold text-gray-900">{result.score}%</span>.
                                Excellent work completing the orientation.
                            </p>
                            <button
                                onClick={() => router.push('/student/enrollment')}
                                className="mt-8 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors"
                            >
                                Continue Enrollment
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <h2 className="mt-6 text-2xl font-bold text-gray-900">Keep Trying</h2>
                            <p className="mt-2 text-gray-600">
                                You scored <span className="font-semibold text-gray-900">{result.score}%</span>.
                                A score of 80% is required to pass.
                            </p>
                            <div className="mt-8 space-y-3">
                                <button
                                    onClick={handleRetry}
                                    className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                                >
                                    Retake Quiz
                                </button>
                                <button
                                    onClick={() => router.push('/student/enrollment/quiz')}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none transition-colors"
                                >
                                    Review Instructions
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // --- Active Quiz View ---
    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            {/* Header Progress */}
            <div className="mb-8">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-gray-900">Orientation Quiz</span>
                    <span className="text-gray-500">
                        {Object.keys(answers).length} of {activeQuestions.length} Answered
                    </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(Object.keys(answers).length / activeQuestions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-8">
                {activeQuestions.map((q, index) => (
                    <div
                        key={q._id}
                        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-6">
                            <span className="text-gray-400 mr-3">{index + 1}.</span>
                            {q.question}
                        </h3>

                        <div className="space-y-3">
                            {q.options.map((option, optIdx) => {
                                const isSelected = answers[q._id] === optIdx;
                                return (
                                    <label
                                        key={optIdx}
                                        className={`relative flex cursor-pointer items-start rounded-xl border p-4 transition-all focus:outline-none ${isSelected
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-gray-200 bg-white hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex h-5 items-center">
                                            <input
                                                type="radio"
                                                name={q._id}
                                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                                checked={isSelected}
                                                onChange={() => handleOptionSelect(q._id, optIdx)}
                                                required
                                            />
                                        </div>
                                        <div className="ml-3 flex flex-col">
                                            <span className={`block text-sm font-medium ${isSelected ? "text-primary" : "text-gray-900"}`}>
                                                {option}
                                            </span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit Action */}
            <div className="mt-10 flex flex-col items-center justify-center border-t border-gray-200 pt-10 pb-8">
                {!allAnswered && (
                    <p className="mb-4 text-sm text-amber-600 font-medium bg-amber-50 px-4 py-2 rounded-full">
                        Please answer all {activeQuestions.length} questions before submitting.
                    </p>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={!allAnswered || isSubmitting}
                    className="group flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Grading Quiz...
                        </>
                    ) : (
                        <>
                            Submit Quiz Responses
                            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
