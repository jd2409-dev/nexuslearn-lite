"use client";

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateQuiz } from '@/ai/flows/quiz-flow';
import type { QuizQuestion } from '@/ai/schemas/quiz-schemas';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters.'),
  numQuestions: z.coerce.number().min(1).max(10),
  questionType: z.enum(['mcq', 'true-false', 'short-answer']),
});

type QuizFormValues = z.infer<typeof formSchema>;
type UserAnswers = { [key: number]: string };

export default function QuizPage() {
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const quizAttemptsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/quizAttempts`) : null),
    [firestore, user]
  );

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      numQuestions: 5,
      questionType: 'mcq',
    },
  });

  const handleGenerateQuiz = async (values: QuizFormValues) => {
    setIsLoading(true);
    setQuiz(null);
    setQuizFinished(false);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    try {
      const generatedQuiz = await generateQuiz(values);
      setQuiz(generatedQuiz);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Quiz Generation Failed',
        description: 'There was an error generating the quiz. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };
  
  const finishQuiz = async () => {
    if (!quiz || !user || !quizAttemptsCollectionRef) return;
    
    let correctAnswers = 0;
    quiz.forEach((q, index) => {
      const userAnswer = userAnswers[index]?.trim().toLowerCase();
      const correctAnswer = q.correctAnswer?.trim().toLowerCase();
      if (userAnswer === correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = correctAnswers;
    setScore(finalScore);
    setQuizFinished(true);

    const quizAttemptData = {
        userId: user.uid,
        topic: form.getValues('topic'),
        score: finalScore,
        totalQuestions: quiz.length,
        createdAt: serverTimestamp(),
        questions: quiz.map((q, index) => ({
            question: q.question,
            userAnswer: userAnswers[index] || "",
            correctAnswer: q.correctAnswer,
        })),
    };

    try {
        await addDoc(quizAttemptsCollectionRef, quizAttemptData);
        toast({
            title: "Quiz Saved!",
            description: "Your results have been saved to your reflections.",
        });
    } catch (error) {
        console.error("Error saving quiz attempt:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save your quiz results. Please try again.",
        });
    }
  };


  const resetQuiz = () => {
    form.reset();
    setQuiz(null);
    setQuizFinished(false);
    setIsLoading(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setScore(0);
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <h2 className="mt-6 text-xl font-semibold">Generating Your Quiz...</h2>
        <p className="mt-2 text-muted-foreground">
          The AI is crafting your questions. This may take a moment.
        </p>
      </div>
    );
  }

  if (quizFinished && quiz) {
    return (
       <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
          <CardDescription>
            You scored {score} out of {quiz.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
             <Progress value={(score / quiz.length) * 100} className="w-full" />
             <p className="text-lg font-bold mt-2">{Math.round((score / quiz.length) * 100)}%</p>
          </div>
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-4">
            {quiz.map((q, index) => (
              <div key={index} className={`p-4 rounded-lg ${userAnswers[index]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ? 'bg-green-100 dark:bg-green-900/20 border border-green-400' : 'bg-red-100 dark:bg-red-900/20 border border-red-400'}`}>
                <p className="font-semibold">{index + 1}. {q.question}</p>
                <p className={`mt-2 text-sm ${userAnswers[index]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                  Your answer: {userAnswers[index] || "Not answered"}
                  {userAnswers[index]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() 
                    ? <CheckCircle className="inline ml-2 h-4 w-4"/> 
                    : <XCircle className="inline ml-2 h-4 w-4"/>
                  }
                </p>
                {userAnswers[index]?.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase() && (
                  <p className="mt-1 text-sm text-green-800 dark:text-green-300">Correct answer: {q.correctAnswer}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
         <CardFooter>
          <Button onClick={resetQuiz} className="w-full">
            Create a New Quiz
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (quiz) {
    const currentQuestion = quiz[currentQuestionIndex];
    return (
       <Card className="w-full max-w-2xl mx-auto">
        <Form {...form}>
          <CardHeader>
            <Progress value={((currentQuestionIndex + 1) / quiz.length) * 100} className="mb-4" />
            <CardTitle>
              Question {currentQuestionIndex + 1} of {quiz.length}
            </CardTitle>
            <CardDescription className="text-lg pt-2">
              {currentQuestion.question}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {form.getValues('questionType') === 'short-answer' ? (
                <Input
                    placeholder="Type your answer here..."
                    value={userAnswers[currentQuestionIndex] || ''}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                />
            ) : (
                <RadioGroup
                    onValueChange={handleAnswerSelect}
                    value={userAnswers[currentQuestionIndex]}
                    className="space-y-2"
                >
                    {currentQuestion.options?.map((option, i) => (
                    <FormItem
                        key={i}
                        className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent"
                    >
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal flex-1 cursor-pointer">
                          {option}
                        </FormLabel>
                    </FormItem>
                    ))}
                </RadioGroup>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleNextQuestion}
              disabled={!userAnswers[currentQuestionIndex]}
              className="w-full"
            >
              {currentQuestionIndex < quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          AI Quiz Generator
        </CardTitle>
        <CardDescription>
          Create a personalized quiz on any topic.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleGenerateQuiz)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Photosynthesis, World War II" {...field} />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              Generate Quiz
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
