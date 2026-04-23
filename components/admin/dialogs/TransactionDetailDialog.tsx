"use client";

import { Badge } from "~/components/ui/badge";
import {
  Activity,
  Calendar,
  Check,
  Copy,
  CreditCard,
  Hash,
  Mail,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";

interface Payment {
  _id: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  referenceType: "application" | "tuition";
  stripePaymentIntentId: string;
  amount: number;
  status: string;
}

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
}

export function TransactionDetailDialog({
  open,
  onOpenChange,
  payment,
}: TransactionDetailDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!payment) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const details = [
    {
      label: "Reference ID",
      value: payment.stripePaymentIntentId,
      icon: Hash,
      copyable: true,
    },
    { label: "Customer Name", value: payment.userName, icon: User },
    { label: "Customer Email", value: payment.userEmail, icon: Mail },
    {
      label: "Payment Type",
      value:
        payment.referenceType === "application"
          ? "Application Fee"
          : "Tuition Fee",
      icon: CreditCard,
    },
    {
      label: "Date & Time",
      value: new Date(payment.createdAt).toLocaleString(undefined, {
        dateStyle: "long",
        timeStyle: "short",
      }),
      icon: Calendar,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="bg-indigo-600 px-6 py-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-100 font-medium text-sm">
              Amount Received
            </p>
            <div className="text-4xl font-black mt-1">
              ₦{payment.amount.toLocaleString()}
            </div>
          </div>
          <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
        </div>

        <div className="px-6 py-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Activity className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                Status
              </p>
              <p className="text-indigo-600 font-bold capitalize text-sm">
                {payment.status}
              </p>
            </div>
          </div>
          <Badge
            variant={payment.status === "succeeded" ? "default" : "destructive"}
            className={
              payment.status === "succeeded"
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-amber-500 hover:bg-amber-600"
            }
          >
            {payment.status.toUpperCase()}
          </Badge>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-6">
            {details.map((item: any) => (
              <div
                key={item.label}
                className="flex justify-between items-center gap-4"
              >
                <div className="flex justify-start items-center gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <item.icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-gray-400">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                </div>
                {item.copyable && (
                  <button
                    onClick={() => handleCopy(item.value)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto rounded-xl bg-white border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
          >
            Done
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
