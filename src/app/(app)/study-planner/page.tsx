"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { generateStudyPlan } from "@/ai/flows/generate-study-plan";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";

import { Loader2, Calendar as CalendarIcon, Wand2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { doc } from "firebase/firestore";

const formSchema = z.object({
  topic: z.string().min(5, { message: "Please enter a detailed topic or syllabus." }),
  examDate: z.date({ required_error: "Exam date is required." }),
  studyHoursPerDay: z.number().min(1).max(12),
});

export default function StudyPlannerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<string | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const userDocRef = useMemoFirebase(() =>
    user ? doc(firestore, `users/${user.uid}`) : null
  , [firestore, user]);
  const { data: userData } = useDoc(userDocRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      studyHoursPerDay: 4,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userData) return;
    setIsLoading(true);
    setStudyPlan(null);

    const input = {
      ...values,
      grade: userData.grade,
      examDate: format(values.examDate, 'yyyy-MM-dd'),
      currentDate: format(new Date(), 'yyyy-MM-dd'),
    };

    try {
      const response = await generateStudyPlan(input);
      setStudyPlan(response.studyPlan);
    } catch (error) {
      console.error("Error generating study plan:", error);
      setStudyPlan("Sorry, an error occurred while generating the plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>AI Study Planner</CardTitle>
          <CardDescription>Enter your exam details to generate a personalized study plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic / Syllabus</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Entire syllabus for 10th Grade CBSE Physics, or specific chapters like 'Optics' and 'Electricity'."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="examDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Exam Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="studyHoursPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Study Hours: {field.value}</FormLabel>
                    <FormControl>
                       <Slider
                          min={1}
                          max={12}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Plan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Personalized Plan</CardTitle>
          <CardDescription>Here's your day-by-day guide to mastering the topic.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex h-full min-h-[50vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && studyPlan && (
            <div className="prose prose-sm prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm bg-card p-4 rounded-md">{studyPlan}</pre>
            </div>
          )}
          {!isLoading && !studyPlan && (
            <div className="flex h-full min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
              <h2 className="mt-6 text-xl font-semibold">Ready to Plan Your Success?</h2>
              <p className="mt-2 text-center text-muted-foreground">
                Fill in your details, and our AI will create a custom study schedule just for you.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
