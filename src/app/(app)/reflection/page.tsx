"use client";

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { analyzeMistakes, MistakeAnalysis } from '@/ai/flows/mistake-analyzer-flow';

import { Loader2, Lightbulb, AlertTriangle, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type QuizQuestionAttempt = {
    question: string;
    userAnswer: string;
    correctAnswer: string;
};

type QuizAttempt = {
  id: string;
  topic: string;
  score: number;
  totalQuestions: number;
  questions: QuizQuestionAttempt[];
};

export default function ReflectionPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [analysis, setAnalysis] = useState<MistakeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quizAttemptsRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/quizAttempts`) : null),
    [firestore, user]
  );
  
  const quizAttemptsQuery = useMemoFirebase(
      () => (quizAttemptsRef ? query(quizAttemptsRef, orderBy("createdAt", "desc"), limit(10)) : null),
      [quizAttemptsRef]
  );

  const { data: quizHistory, isLoading: isLoadingHistory } = useCollection<Omit<QuizAttempt, 'id'>>(quizAttemptsQuery);

  useEffect(() => {
    if (isLoadingHistory) {
        setIsAnalyzing(true);
        return;
    }
    
    const analyze = async () => {
      if (!quizHistory || quizHistory.length === 0) {
        setIsAnalyzing(false);
        setAnalysis(null);
        return;
      }
      
      setIsAnalyzing(true);
      setError(null);
      try {
        const result = await analyzeMistakes({ quizHistory });
        setAnalysis(result);
      } catch (e) {
        setError('Failed to analyze mistakes. Please try again later.');
        console.error(e);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyze();
  }, [quizHistory, isLoadingHistory]);

  if (isAnalyzing || isLoadingHistory) {
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
  
  if (!analysis || analysis.commonThemes.length === 0) {
     return (
        <div className="flex h-full min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <Lightbulb className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">No Mistakes to Analyze</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Great job! We couldn't find any recent mistakes. Complete more quizzes, and your AI-powered analysis will appear here if you make any errors.
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
