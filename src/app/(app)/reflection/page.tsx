"use client";

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { analyzeMistakes, MistakeAnalysis } from '@/ai/flows/mistake-analyzer-flow';

import { Loader2, Lightbulb, AlertTriangle, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Mock quiz data structure for demonstration
// In a real app, this would come from Firestore `useCollection`
type QuizAttempt = {
  id: string;
  topic: string;
  score: number;
  totalQuestions: number;
  questions: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
  }>;
};

export default function ReflectionPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [analysis, setAnalysis] = useState<MistakeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This is a placeholder for fetching real quiz data.
  // We will use mock data for now.
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([
    {
        id: "1",
        topic: "Cellular Biology",
        score: 2,
        totalQuestions: 4,
        questions: [
            { question: "What is the powerhouse of the cell?", userAnswer: "Nucleus", correctAnswer: "Mitochondria" },
            { question: "What does DNA stand for?", userAnswer: "Deoxyribonucleic Acid", correctAnswer: "Deoxyribonucleic Acid" },
            { question: "What is the function of the cell membrane?", userAnswer: "To provide structure", correctAnswer: "To control what enters and leaves the cell" },
            { question: "What is photosynthesis?", userAnswer: "The process of creating energy from sunlight", correctAnswer: "The process of creating energy from sunlight" }
        ]
    }
  ]);

  useEffect(() => {
    const analyze = async () => {
      if (quizHistory.length === 0) {
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const result = await analyzeMistakes({ quizHistory });
        setAnalysis(result);
      } catch (e) {
        setError('Failed to analyze mistakes. Please try again later.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    analyze();
  }, [quizHistory]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <h2 className="mt-6 text-xl font-semibold">Analyzing Your Quizzes...</h2>
        <p className="mt-2 text-center text-muted-foreground">
          Our AI is looking for patterns in your recent quiz performance.
        </p>
      </div>
    );
  }
  
  if (error) {
     return (
        <div className="flex h-full min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-destructive p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
            <h2 className="mt-6 text-xl font-semibold">An Error Occurred</h2>
            <p className="mt-2 text-center text-muted-foreground">{error}</p>
        </div>
    );
  }
  
  if (!analysis) {
     return (
        <div className="flex h-full min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <Lightbulb className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">No Quizzes to Analyze</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Complete some quizzes first, and your AI-powered mistake analysis will appear here.
            </p>
        </div>
    );
  }

  return (
     <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BrainCircuit className="h-8 w-8 text-primary" />
            AI-Powered Mistake Analysis
          </CardTitle>
          <CardDescription>
            Here's a breakdown of your recent quiz performance to help you improve.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Common Themes in Mistakes</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {analysis.commonThemes.map((theme, index) => (
                        <Badge key={index} variant="secondary" className="text-base px-3 py-1">{theme}</Badge>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Key Concepts to Revisit</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {analysis.conceptsToRevisit.map((concept, index) => (
                        <li key={index}>{concept}</li>
                      ))}
                    </ul>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Actionable Study Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {analysis.studySuggestions.map((suggestion, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">{suggestion.suggestion}</AccordionTrigger>
                            <AccordionContent>
                                <p className="font-semibold mb-2">How to implement:</p>
                                <p className="text-muted-foreground">{suggestion.implementation}</p>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
    </div>
  );
}
