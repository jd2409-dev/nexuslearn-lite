
"use client";

import { ClipboardCheck } from "lucide-react";

export default function QuizPage() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <ClipboardCheck className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-6 text-xl font-semibold">Quiz Generator Disabled</h2>
        <p className="mt-2 text-center text-muted-foreground">
          This feature is temporarily unavailable.
        </p>
    </div>
  );
}
