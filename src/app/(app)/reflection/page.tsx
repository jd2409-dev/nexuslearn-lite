"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { receivePersonalizedStudySuggestions } from "@/ai/flows/receive-personalized-study-suggestions";

import { Loader2, Lightbulb, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const questionSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  score: z.string().min(1, "Score is required"),
});

const formSchema = z.object({
  studentGrade: z.string().min(1, "Grade is required"),
  studentBoard: z.string().min(1, "Board is required"),
  quizResults: z.array(questionSchema),
});

export default function ReflectionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentGrade: "10",
      studentBoard: "CBSE",
      quizResults: [{ topic: "Algebra", score: "6/10" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "quizResults",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions(null);

    const formattedQuizResults = values.quizResults
        .map(r => `Topic: ${r.topic}, Score: ${r.score}`)
        .join('; ');

    const topicsCovered = values.quizResults.map(r => r.topic).join(', ');

    const input = {
        quizResults: formattedQuizResults,
        topicsCovered,
        studentGrade: values.studentGrade,
        studentBoard: values.studentBoard,
    };

    try {
      const response = await receivePersonalizedStudySuggestions(input);
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      setSuggestions("Sorry, I encountered an error while generating suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Mistake Analysis</CardTitle>
          <CardDescription>Enter your quiz results to get personalized AI suggestions for improvement.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="studentGrade"
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
                    name="studentBoard"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Board</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a board" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="CBSE">CBSE</SelectItem>
                            <SelectItem value="ICSE">ICSE</SelectItem>
                            <SelectItem value="IB">IB</SelectItem>
                            <SelectItem value="State Board">State Board</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

              <div>
                <Label>Quiz Results</Label>
                <div className="mt-2 space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                        <FormField
                            control={form.control}
                            name={`quizResults.${index}.topic`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="Topic (e.g., Trigonometry)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`quizResults.${index}.score`}
                            render={({ field }) => (
                                <FormItem className="w-32">
                                    <FormControl>
                                        <Input placeholder="Score (e.g., 7/10)" {...field} />
                                    </FormControl>
                                     <FormMessage />
                                </FormItem>
                            )}
                        />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => append({ topic: "", score: "" })}
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Topic
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                Get AI Suggestions
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Personalized Feedback</CardTitle>
          <CardDescription>Here are AI-powered suggestions to help you improve.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex h-full min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && suggestions && (
            <div className="prose prose-sm prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm">{suggestions}</pre>
            </div>
          )}
          {!isLoading && !suggestions && (
            <div className="flex h-full min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <Lightbulb className="h-16 w-16 text-muted-foreground" />
              <h2 className="mt-6 text-xl font-semibold">Ready for Your Insights?</h2>
              <p className="mt-2 text-center text-muted-foreground">
                Fill in your quiz details, and I'll provide a custom plan to help you improve.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
