"use client";

import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { safeArray } from "@/lib/data.helpers";

type DialogMode = "create" | "edit" | null;

interface QuestionFormData {
  id?: Id<"quizQuestions">;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

const DEFAULT_FORM_DATA: QuestionFormData = {
  question: "",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
};

export default function AdminQuizzesPage() {
  const questionsResult = useQuery(api.quizzes.list);
  const questions = safeArray<Doc<"quizQuestions">>(
    (questionsResult as any)?.data,
  );
  const createQuestion = useMutation(api.quizzes.create);
  const updateQuestion = useMutation(api.quizzes.update);
  const toggleActive = useMutation(api.quizzes.toggleActive);
  const removeQuestion = useMutation(api.quizzes.remove);

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formData, setFormData] = useState<QuestionFormData>(DEFAULT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDialog = (
    mode: DialogMode,
    data: QuestionFormData = DEFAULT_FORM_DATA,
  ) => {
    setFormData(data);
    setDialogMode(mode);
  };

  const handleCloseDialog = () => {
    setDialogMode(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleAddOption = () => {
    if (formData.options.length < 5) {
      setFormData({ ...formData, options: [...formData.options, ""] });
    }
  };

  const handleRemoveOption = (indexToRemove: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== indexToRemove);
      let newCorrectIndex = formData.correctOptionIndex;
      if (newCorrectIndex === indexToRemove) {
        newCorrectIndex = 0;
      } else if (newCorrectIndex > indexToRemove) {
        newCorrectIndex -= 1;
      }
      setFormData({
        ...formData,
        options: newOptions,
        correctOptionIndex: newCorrectIndex,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.options.length < 2 || formData.options.length > 5) {
      toast.error("Please provide between 2 and 5 options.");
      return;
    }
    if (formData.options.some((o) => !o.trim())) {
      toast.error("Please fill in all options.");
      return;
    }
    if (!formData.question.trim()) {
      toast.error("Please enter a question.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (dialogMode === "create") {
        const res = await createQuestion({
          question: formData.question.trim(),
          options: formData.options.map((o) => o.trim()),
          correctOptionIndex: formData.correctOptionIndex,
        });
        if (!res.success) throw new Error(res.error);
        toast.success("Question created successfully");
      } else if (dialogMode === "edit" && formData.id) {
        const res = await updateQuestion({
          id: formData.id,
          question: formData.question.trim(),
          options: formData.options.map((o) => o.trim()),
          correctOptionIndex: formData.correctOptionIndex,
        });
        if (!res.success) throw new Error(res.error);
        toast.success("Question updated successfully");
      }
      handleCloseDialog();
    } catch (error: any) {
      toast.error(error.message || "Failed to save question");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (
    id: Id<"quizQuestions">,
    currentStatus: boolean,
  ) => {
    try {
      const res = await toggleActive({ id, isActive: !currentStatus });
      if (!res.success) throw new Error(res.error);
      toast.success(
        `Question ${!currentStatus ? "activated" : "deactivated"} successfully`,
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update question status");
    }
  };

  const handleDelete = async (id: Id<"quizQuestions">) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await removeQuestion({ id });
      if (!res.success) throw new Error(res.error);
      toast.success("Question deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete question");
    }
  };

  if (questionsResult === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Manage Quiz Questions
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage the orientation quiz questions shown to enrolling students.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => handleOpenDialog("create")}
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
              Add Question
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Question
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Correct Answer
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {questions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center text-sm text-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                            <p>
                              No questions found. Add your first question to get
                              started.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      questions.map((q) => (
                        <tr
                          key={q._id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="whitespace-normal py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6 max-w-sm">
                            <div className="font-medium">{q.question}</div>
                            <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                              {q.options.map((opt, i) => (
                                <span key={i} className="mr-2">
                                  {i + 1}. {opt}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="whitespace-normal px-3 py-4 text-sm text-gray-600 max-w-xs">
                            <div className="line-clamp-2">
                              {q.options[q.correctOptionIndex]}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleActive(q._id, q.isActive)
                              }
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold hover:opacity-80 transition-opacity ${
                                q.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {q.isActive ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" />
                                  Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleOpenDialog("edit", {
                                    id: q._id,
                                    question: q.question,
                                    options: [...q.options],
                                    correctOptionIndex: q.correctOptionIndex,
                                  })
                                }
                                className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                                title="Edit Question"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(q._id)}
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                title="Delete Question"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Add Question" : "Edit Question"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <label
                htmlFor="question"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Question
              </label>
              <textarea
                id="question"
                required
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="E.g., What is the passing score for this orientation?"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium leading-none">
                Options
              </label>
              <p className="text-xs text-gray-500 -mt-2 mb-4">
                Provide between 2 and 5 options. Select the radio button next to
                the correct answer.
              </p>

              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={formData.correctOptionIndex === index}
                    onChange={() =>
                      setFormData({ ...formData, correctOptionIndex: index })
                    }
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    title={`Mark option ${index + 1} as correct`}
                  />
                  <input
                    type="text"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="ml-1 rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remove option"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              {formData.options.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </button>
              )}
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={handleCloseDialog}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {dialogMode === "create" ? "Create Question" : "Save Changes"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
