"use client";

import React, { useState } from "react";
import { Bot, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/firebase";

type Message = {
  from: "user" | "bot";
  text: string;
};

export default function AiChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock AI response for demo - replace with real AI API call
  const getAiResponse = async (userMessage: string) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(`This is a mocked AI response to: "${userMessage}"`);
      }, 1000);
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { from: "user", text: input.trim() };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput("");
    setLoading(true);
    
    // Get AI response
    const botReply = await getAiResponse(userMessage.text);
    setMessages((msgs) => [...msgs, { from: "bot", text: botReply }]);
    setLoading(false);
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
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.from === "bot"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.from === "user" && (
              <Avatar>
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-4 justify-start">
             <Avatar>
                <AvatarFallback>AI</AvatarFallback>
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
