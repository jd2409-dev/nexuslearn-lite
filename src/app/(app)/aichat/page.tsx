"use client";
import { useState, useRef, useEffect, FormEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, CornerDownLeft, Mic, Paperclip, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { askTutor } from "@/ai/flows/ask-tutor";

interface Message {
  role: "user" | "tutor";
  content: string;
}

const exampleQuestions = [
  "Explain Newton's First Law in simple terms.",
  "What is photosynthesis?",
  "Summarize the plot of 'To Kill a Mockingbird'.",
  "Help me brainstorm ideas for an essay on climate change.",
];

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: FormEvent, question?: string) => {
    e.preventDefault();
    const userMessage = question || input;
    if (!userMessage.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askTutor({ query: userMessage });
      setMessages([...newMessages, { role: "tutor", content: response }]);
    } catch (error) {
      console.error("Error asking tutor:", error);
      setMessages([...newMessages, { role: "tutor", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
            <Card className="w-full max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-primary"/>
                        Your Personal AI Tutor
                    </CardTitle>
                    <CardDescription>
                        Stuck on a problem? Need a concept explained? I'm here to help you with any subject.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exampleQuestions.map((q, i) => (
                        <button key={i} onClick={(e) => handleSend(e as any, q)} className="p-4 border rounded-lg text-left hover:bg-secondary transition-colors">
                            <p className="font-semibold text-sm">{q}</p>
                        </button>
                    ))}
                </CardContent>
            </Card>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-4 ${
              message.role === "user" ? "justify-end" : ""
            }`}
          >
            {message.role === "tutor" && (
              <Avatar className="h-8 w-8">
                <AvatarFallback><Bot /></AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-prose rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
            {message.role === "user" && (
              <Avatar className="h-8 w-8">
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
         {isLoading && (
            <div className="flex items-start gap-4">
                <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="max-w-prose rounded-lg p-3 bg-secondary flex items-center">
                   <Loader2 className="h-5 w-5 animate-spin"/>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-background p-4">
          <form onSubmit={handleSend} className="relative max-w-3xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your studies..."
              className="w-full rounded-full bg-secondary pr-28 pl-12"
              disabled={isLoading}
            />
            <Button type="button" variant="ghost" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Paperclip className="h-5 w-5" />
            </Button>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                    <Mic className="h-5 w-5" />
                </Button>
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                    <Send className="h-5 w-5" />
                </Button>
            </div>
          </form>
      </div>
    </div>
  );
}
