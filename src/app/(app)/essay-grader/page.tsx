"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { gradeEssay, GradeEssayOutput } from "@/ai/flows/grade-essay";

import { Loader2, FileText, Wand2, Sparkles, CheckCircle, BarChart3, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  essay: z.string().min(100, { message: "Essay must be at least 100 characters long." }),
});

const ScoreDisplay = ({ title, score, icon: Icon }: { title: string, score: number, icon: React.ElementType }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium">{title}</p>
            </div>
            <span className="font-bold">{score}/10</span>
        </div>
        <Progress value={score * 10} className="h-2" />
    </div>
);


export default function EssayGraderPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GradeEssayOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      essay: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResults(null);

    try {
      const response = await gradeEssay(values);
      setResults(response);
    } catch (error) {
      console.error("Error grading essay:", error);
      // You could show a toast here
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Essay Grader</CardTitle>
          <CardDescription>Paste your essay below to get AI-powered feedback.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="essay"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your essay here..."
                        className="min-h-[400px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Grade My Essay
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Grading Results</CardTitle>
          <CardDescription>Here's the breakdown of your essay's score.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex h-full min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && results && (
            <div className="space-y-6">
                <div className="grid gap-4 rounded-lg border p-4">
                    <ScoreDisplay title="Clarity" score={results.clarity} icon={Sparkles} />
                    <ScoreDisplay title="Argument" score={results.argument} icon={BarChart3} />
                    <ScoreDisplay title="Originality" score={results.originality} icon={BrainCircuit} />
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><CheckCircle className="h-5 w-5 text-green-500" /> Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{results.feedback}</p>
                    </CardContent>
                </Card>
            </div>
          )}
          {!isLoading && !results && (
            <div className="flex h-full min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <h2 className="mt-6 text-xl font-semibold">Awaiting Your Essay</h2>
              <p className="mt-2 text-center text-muted-foreground">
                Your feedback will appear here once you submit an essay for grading.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
