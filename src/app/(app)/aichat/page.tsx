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
  subject: z.string().min(1, { message: "Please select a subject." }),
  gradeLevel: z.string().min(1, { message: "Please select a grade." }),
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
      subject: "",
      gradeLevel: "",
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
      form.reset({ question: '', subject: values.subject, gradeLevel: values.gradeLevel, relevantMaterial: ''});
    }
  }

  return (
    <div className="grid h-[calc(100vh-8rem)] w-full md:grid-cols-[1fr_350px]">
      <div className="flex flex-col">
        <header className="flex items-center justify-between border-b px-4 py-2">
            <h1 className="text-xl font-bold">AI Tutor</h1>
            <p className="text-sm text-muted-foreground">Instant homework help</p>
        </header>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {messages.length === 0 && (
                <div className="flex h-full min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                    <Bot className="h-16 w-16 text-muted-foreground" />
                    <h2 className="mt-6 text-xl font-semibold">Ready to Help!</h2>
                    <p className="mt-2 text-center text-muted-foreground">
                    Ask any academic question and I'll do my best to answer. Fill out the form to get started.
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
                <div className={`max-w-xl rounded-lg px-4 py-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
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
        <div className="border-t p-4">
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                    <FormField
                        control={form.control}
                        name="question"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Input placeholder="Type your question here..." {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                        />
                    <Button type="submit" disabled={isLoading} size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </Form>
        </div>
      </div>
      <Card className="hidden md:flex flex-col border-l rounded-none">
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>Provide context for a better answer.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Explain Newton's First Law of Motion." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="math">Math</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a grade" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[...Array(5)].map((_, i) => (
                          <SelectItem key={i+8} value={`${i+8}`}>{`Grade ${i+8}`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="relevantMaterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevant Material (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any context, like from your textbook." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : "Ask AI Tutor"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
