"use client";

import { Bot } from "lucide-react";

export default function AiChatPage() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <Bot className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-6 text-xl font-semibold">AI Tutor Disabled</h2>
        <p className="mt-2 text-center text-muted-foreground">
          This feature is temporarily unavailable due to persistent technical issues.
        </p>
    </div>
  );
}
