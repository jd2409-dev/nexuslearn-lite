"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getAiAssistanceWithHomework, GetAiAssistanceWithHomeworkOutput } from "@/ai/flows/get-ai-assistance-with-homework";

import { Bot, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  question: z.string().min(10, { message: "Please ask a detailed question." }),
  relevantMaterial: z.string().optional(),
});

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string | GetAiAssistanceWithHomeworkOutput;
};

export default function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      relevantMaterial: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: values.question }]);

    try {
      const response = await getAiAssistanceWithHomework(values);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Error getting AI assistance:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
      form.reset({ ...form.getValues(), question: '', relevantMaterial: '' });
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] w-full">
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between border-b px-4 py-2">
            <h1 className="text-xl font-bold">AI Tutor</h1>
        </header>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.length === 0 && (
                <div className="flex h-full min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                    <Bot className="h-16 w-16 text-muted-foreground" />
                    <h2 className="mt-6 text-xl font-semibold">Ready to Help!</h2>
                    <p className="mt-2 text-center text-muted-foreground">
                      Ask me any academic question.
                    </p>
                </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                     <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-2xl rounded-lg px-4 py-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  {typeof message.content === 'string' ? (
                    <p>{message.content}</p>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Answer:</h3>
                        <p>{message.content.answer}</p>
                      </div>
                      {message.content.stepByStepSolution && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold">Step-by-step Solution:</h3>
                            <pre className="whitespace-pre-wrap font-code text-sm">{message.content.stepByStepSolution}</pre>
                          </div>
                        </>
                      )}
                      {message.content.explanation && (
                         <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold">Explanation:</h3>
                            <p className="text-sm">{message.content.explanation}</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                     <AvatarImage src="https://picsum.photos/seed/avatar/32/32" />
                     <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div className="max-w-xl rounded-lg bg-card px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4 bg-background">
            <div className="max-w-4xl mx-auto">
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
                    <FormField
                        control={form.control}
                        name="question"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Textarea placeholder="Type your question here..." {...field} rows={1} className="min-h-0 resize-none"/>
                                </FormControl>
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="relevantMaterial"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Textarea placeholder="Add any relevant material or context here..." {...field} rows={1} className="min-h-0 resize-none"/>
                                </FormControl>
                            </FormItem>
                        )}
                        />
                    <Button type="submit" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </Form>
            </div>
        </div>
      </div>
    </div>
  );
}
