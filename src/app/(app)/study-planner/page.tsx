"use client";
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, startOfToday } from 'date-fns';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, CalendarDays, CheckSquare, BookOpen, Clock } from 'lucide-react';
import { generateStudyPlan, StudyPlan } from '@/ai/flows/study-planner-flow';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


const formSchema = z.object({
  goal: z.string().min(10, 'Please provide a more detailed goal.'),
  subjects: z.string().min(3, 'Please list at least one subject.'),
  timeframe: z.coerce.number().min(1, 'Timeframe must be at least 1 day.').max(90, 'Timeframe cannot exceed 90 days.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function StudyPlannerPage() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: '',
      subjects: '',
      timeframe: 7,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setPlan(null);
    setError(null);
    try {
      const result = await generateStudyPlan(values);
      setPlan(result);
      if (user && firestore && result.dailyBreakdown) {
        const studyGoalsCollection = collection(firestore, `users/${user.uid}/studyGoals`);
        const today = startOfToday();
        
        for (const day of result.dailyBreakdown) {
          const goal = {
            goalDescription: day.topic,
            dueDate: addDays(today, day.day - 1),
            completed: false,
            userId: user.uid,
            createdAt: serverTimestamp(),
          };
          await addDoc(studyGoalsCollection, goal);
        }
        
        toast({
          title: "Study Plan Saved!",
          description: "Your daily goals have been added to your dashboard.",
        });
      }

    } catch (e) {
      setError('Failed to generate study plan. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlan = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border-dashed p-8 text-center h-96">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <h2 className="mt-6 text-xl font-semibold">Generating Your Study Plan...</h2>
          <p className="mt-2 text-center text-muted-foreground">The AI is crafting your personalized schedule.</p>
        </div>
      );
    }

    if (error) {
        return <p className="text-destructive">{error}</p>;
    }

    if (!plan) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center h-96">
          <CalendarDays className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 text-xl font-semibold">Your AI-Generated Plan Awaits</h2>
          <p className="mt-2 text-center text-muted-foreground">
            Fill out the form to get a personalized study schedule.
          </p>
        </div>
      );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">{plan.title}</CardTitle>
                <CardDescription>A {plan.timeframe} day plan to help you achieve your goal: {plan.goal}</CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                    {plan.dailyBreakdown.map((day, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                <h3 className="text-lg font-semibold">Day {day.day}: {day.topic}</h3>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4">
                               <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary"/>
                                <p><span className="font-semibold">Focus:</span> {day.focus}</p>
                               </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2"><CheckSquare className="h-5 w-5 text-primary"/> Tasks:</h4>
                                    <ul className="list-disc list-inside pl-4 space-y-1 text-muted-foreground">
                                        {day.tasks.map((task, i) => (
                                            <li key={i}>{task}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-5 w-5 text-primary"/>
                                    <p><span className="font-semibold">Estimated Time:</span> {day.estimatedTime}</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Your Study Plan</CardTitle>
          <CardDescription>Tell the AI what you want to achieve.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Goal</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ace my final biology exam" {...field} />
                    </FormControl>
                    <FormDescription>What is the main objective of this study plan?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subjects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjects/Topics</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Biology, Chemistry, Algebra" {...field} />
                    </FormControl>
                    <FormDescription>List the subjects or topics to cover.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeframe (in days)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="90" {...field} />
                    </FormControl>
                     <FormDescription>How many days do you have to study?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Plan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="w-full">{renderPlan()}</div>
    </div>
  );
}
