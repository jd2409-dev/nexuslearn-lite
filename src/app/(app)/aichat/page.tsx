
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/firebase";

type Message = {
  from: "user" | "bot";
  text: string;
  isError?: boolean;
};

export default function AiChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { from: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the detailed error message from the backend
        throw new Error(data.error || "Something went wrong");
      }
      
      const botMessage: Message = { from: "bot", text: data.text };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMessages((prev) => [...prev, { from: "bot", text: errorMessage, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border-dashed border-2 p-8 text-center">
            <Bot className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">AI Tutor</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Ask me anything about your studies!
            </p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-4 ${
              msg.from === "bot" ? "justify-start" : "justify-end"
            }`}
          >
            {msg.from === "bot" && (
              <Avatar>
                 <AvatarFallback>
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.from === "bot"
                  ? msg.isError ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.from === "user" && (
              <Avatar>
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback>{user?.displayName?.charAt(0) || <UserIcon className="h-5 w-5" />}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-4 justify-start">
             <Avatar>
                <AvatarFallback>
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            <div className="max-w-[70%] rounded-lg p-3 bg-secondary text-secondary-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse delay-0"></span>
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></span>
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4 bg-card">
        <div className="relative">
          <Textarea
            placeholder="Type your message here... (Shift+Enter for new line)"
            className="pr-16"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <Button
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={handleSend}
            disabled={loading || input.trim() === ""}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
