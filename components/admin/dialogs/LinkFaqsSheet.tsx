"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import type { Id } from "~/convex/_generated/dataModel";

interface Faq {
  _id: Id<"faqs">;
  question: string;
  answer: string;
}

interface LinkFaqsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableFaqs: Faq[];
  linkedFaqs: Faq[];
  onLink: (faqIds: Id<"faqs">[]) => void;
  onUnlink: (faqId: Id<"faqs">) => void;
  onCreateNew: () => void;
}

export function LinkFaqsSheet({
  isOpen,
  onOpenChange,
  availableFaqs,
  linkedFaqs,
  onLink,
  onCreateNew,
}: LinkFaqsSheetProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Id<"faqs">[]>([]);

  const allFaqs = [...linkedFaqs, ...availableFaqs];
  const filteredFaqs = allFaqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase()),
  );

  const linkedIds = linkedFaqs.map((f) => f._id);

  const handleLink = () => {
    if (selectedIds.length > 0) {
      const newIds = selectedIds.filter(id => !linkedIds.includes(id));
      if (newIds.length > 0) {
        onLink(newIds);
      }
    }
    setSelectedIds([]);
    setSearch("");
    onOpenChange(false);
  };

  const isLinked = (faqId: Id<"faqs">) => linkedIds.includes(faqId);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Link FAQs to Course</SheetTitle>
          <SheetDescription>
            Select an FAQ to link to this course or create a new one.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <Input
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          <div className="space-y-2">
            {filteredFaqs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No FAQs found matching your search.
              </p>
            ) : (
              filteredFaqs.map((faq) => {
                const linked = isLinked(faq._id);
                const selected = selectedIds.includes(faq._id);

                return (
                  <button
                    key={faq._id}
                    type="button"
                    disabled={linked}
                    onClick={() => {
                      if (!linked) {
                        setSelectedIds((prev) =>
                          prev.includes(faq._id)
                            ? prev.filter((id) => id !== faq._id)
                            : [...prev, faq._id]
                        );
                      }
                    }}
                    className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left ${
                      linked
                        ? "border-gray-200 bg-gray-50 opacity-50"
                        : selected
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`mt-1 flex h-4 w-4 items-center justify-center rounded-sm border ${
                        selected
                          ? "border-primary bg-primary"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selected && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3 text-white"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm ${
                          linked ? "text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {faq.question}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {faq.answer}
                      </p>
                      {linked && (
                        <span className="text-xs text-green-600 font-medium">
                          Already linked
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="border-t py-4">
          <p className="text-sm text-gray-500 mb-3">
            Can't find what you're looking for?
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCreateNew}
            className="w-full"
          >
            + Create New FAQ
          </Button>
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleLink} disabled={selectedIds.length === 0}>
            Link FAQ{selectedIds.length > 1 ? "s" : ""}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
