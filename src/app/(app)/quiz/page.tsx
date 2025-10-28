
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateQuizFromTopic } from "@/ai/flows/generate-quiz-from-topic";
import { receiveAiPoweredFeedbackOnQuiz } from "@/ai/flows/receive-ai-powered-feedback-on-quiz";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";


import { Loader2, Wand2, Lightbulb, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";

const quizFormSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }),
  numQuestions: z.coerce.number().min(1).max(10),
  questionType: z.enum(['MCQ', '1-mark', '2-mark', '3-mark', '5-mark']),
});

type QuizQuestion = {
  question: string;
  options?: string[];
  answer: string;
  userAnswer?: string;
  isCorrect?: boolean;
};

export default function QuizPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [quizContent, setQuizContent] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  const { user } = useUser();
  const firestore = useFirestore();
  
  const userDocRef = useMemoFirebase(() => 
    user ? doc(firestore, `users/${user.uid}`) : null
  , [firestore, user]);

  const form = useForm<z.infer<typeof quizFormSchema>>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      topic: "",
      numQuestions: 5,
      questionType: "MCQ",
    },
  });

  const parseQuizContent = (content: string): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    const questionBlocks = content.split(/\n\s*\n/);
    
    questionBlocks.forEach(block => {
      const questionMatch = block.match(/^(?:Q\d*\.|\d+\.)\s*(.*?)(?:\n|$)/);
      const answerMatch = block.match(/Answer:\s*(.*)/);
  
      if (questionMatch && answerMatch) {
        const questionText = questionMatch[1].trim();
        const answerText = answerMatch[1].trim();
        const optionsMatch = block.matchAll(/\n\s*([A-D])\)\s(.*?)(?:\n|$)/g);
        const options = Array.from(optionsMatch, m => `${m[1]}) ${m[2]}`);
        
        questions.push({
          question: questionText,
          options: options.length > 0 ? options : undefined,
          answer: answerText,
        });
      }
    });
    return questions;
  };

  async function onGenerateQuiz(values: z.infer<typeof quizFormSchema>) {
    setIsLoading(true);
    setQuizContent(null);
    setQuizQuestions([]);
    setIsSubmitted(false);
    setFeedback([]);
    try {
      const response = await generateQuizFromTopic(values);
      setQuizContent(response.quiz);
      setQuizQuestions(parseQuizContent(response.quiz));
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAnswerChange = (qIndex: number, answer: string) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[qIndex].userAnswer = answer;
    setQuizQuestions(updatedQuestions);
  };
  
  const handleSubmitQuiz = async () => {
    let correctAnswers = 0;
    const submittedQuestions = quizQuestions.map(q => {
      let isCorrect = false;
      if (q.userAnswer) {
          const userAnswerFormatted = q.userAnswer.trim().toLowerCase();
          const correctAnswerFormatted = q.answer.trim().toLowerCase();
          isCorrect = userAnswerFormatted === correctAnswerFormatted || (q.options && userAnswerFormatted.startsWith(correctAnswerFormatted.charAt(0).toLowerCase()));
      }
      if (isCorrect) {
          correctAnswers++;
      }
      return { ...q, isCorrect };
    });

    setQuizQuestions(submittedQuestions);
    setIsSubmitted(true);

    setIsFeedbackLoading(true);
    try {
        const feedbackInput = {
            quizQuestions: quizQuestions.map(q => q.question),
            userAnswers: quizQuestions.map(q => q.userAnswer || ""),
            correctAnswers: quizQuestions.map(q => q.answer),
        };
        const feedbackResponse = await receiveAiPoweredFeedbackOnQuiz(feedbackInput);
        setFeedback(feedbackResponse.feedback);
    } catch (error) {
        console.error("Error getting feedback:", error);
        setFeedback(quizQuestions.map(() => "Could not load feedback for this question."));
    } finally {
        setIsFeedbackLoading(false);
    }
  };

  const getScore = () => {
    const correctAnswers = quizQuestions.filter(q => q.isCorrect).length;
    return `${correctAnswers} / ${quizQuestions.length}`;
  };

  return (
    <div className="grid gap-8 md:grid-cols-[300px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Create Quiz</CardTitle>
          <CardDescription>Generate a custom quiz on any topic.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onGenerateQuiz)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Photosynthesis" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="questionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MCQ">MCQ</SelectItem>
                        <SelectItem value="1-mark">1-mark</SelectItem>
                        <SelectItem value="2-mark">2-mark</SelectItem>
                        <SelectItem value="3-mark">3-mark</SelectItem>
                        <SelectItem value="5-mark">5-mark</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Quiz
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="space-y-6">
        {isLoading && (
          <div className="flex h-full min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="mt-6 text-xl font-semibold">Generating Your Quiz...</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Our AI is crafting the questions. This might take a moment.
            </p>
          </div>
        )}

        {!isLoading && quizQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quiz on: {form.getValues("topic")}</CardTitle>
              {isSubmitted && <CardDescription>Your score: {getScore()}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-6">
              {quizQuestions.map((q, qIndex) => (
                <div key={qIndex} className="space-y-2">
                  <p className="font-semibold">{qIndex + 1}. {q.question}</p>
                  {q.options ? (
                    <RadioGroup onValueChange={(value) => handleAnswerChange(qIndex, value)} disabled={isSubmitted}>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt.substring(0, 1)} id={`q${qIndex}o${oIndex}`} />
                          <Label htmlFor={`q${qIndex}o${oIndex}`}>{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Textarea placeholder="Your answer..." onChange={(e) => handleAnswerChange(qIndex, e.target.value)} disabled={isSubmitted} />
                  )}
                  {isSubmitted && (
                    <Alert variant={q.isCorrect ? "default" : "destructive"} className="mt-2 bg-card">
                      <div className="flex items-center gap-2">
                         {q.isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                         <AlertTitle>
                            {q.isCorrect ? "Correct!" : "Incorrect"}
                         </AlertTitle>
                      </div>
                      <AlertDescription>
                        Correct answer: <strong>{q.answer}</strong>
                      </AlertDescription>
                      {feedback[qIndex] && (
                        <Accordion type="single" collapsible className="w-full mt-2">
                          <AccordionItem value="item-1" className="border-none">
                            <AccordionTrigger className="text-sm py-1 hover:no-underline text-accent-foreground/80 hover:text-accent-foreground [&[data-state=open]>svg]:text-accent-foreground">
                              <Lightbulb className="mr-2 h-4 w-4" /> AI Feedback
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 text-sm text-muted-foreground">
                              {isFeedbackLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : feedback[qIndex]}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </Alert>
                  )}
                </div>
              ))}
              {!isSubmitted && (
                <Button onClick={handleSubmitQuiz} className="w-full">Submit Quiz</Button>
              )}
            </CardContent>
          </Card>
        )}
        
        {!isLoading && quizQuestions.length === 0 && (
             <div className="flex h-full min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                <ClipboardCheck className="h-16 w-16 text-muted-foreground" />
                <h2 className="mt-6 text-xl font-semibold">Ready to Test Your Knowledge?</h2>
                <p className="mt-2 text-center text-muted-foreground">
                Use the panel on the left to generate a new quiz on any topic.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
