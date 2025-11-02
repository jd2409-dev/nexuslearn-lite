"use client";

import { useState } from 'react';
import { Loader2, Sparkles, Star, Clipboard, Check, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { gradeEssay, GradeEssayOutput } from '@/ai/flows/essay-grader-flow';
import { Badge } from '@/components/ui/badge';

export default function EssayGraderPage() {
  const [essay, setEssay] = useState('');
  const [result, setResult] = useState<GradeEssayOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGradeEssay = async () => {
    if (!essay.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const response = await gradeEssay({ essay });
      setResult(response);
    } catch (error) {
      console.error('Error grading essay:', error);
      // You could show a toast or an error message here
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyFeedback = () => {
    if (!result) return;
    const feedbackText = `
Grade: ${result.grade}

AI Detection: ${result.aiDetection.isLikelyAiGenerated ? 'Likely AI-Generated' : 'Likely Human-Written'}
Explanation: ${result.aiDetection.explanation}

Strengths:
${result.strengths.map(s => `- ${s}`).join('\n')}

Areas for Improvement:
${result.areasForImprovement.map(a => `- ${a}`).join('\n')}

Detailed Feedback:
${result.detailedFeedback}

Revised Essay Suggestion:
${result.revisedEssay}
    `;
    navigator.clipboard.writeText(feedbackText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary" />
                <span>AI Essay Grader</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your essay here..."
                className="min-h-[400px] text-base"
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                disabled={isLoading}
              />
              <Button
                onClick={handleGradeEssay}
                disabled={isLoading || !essay.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Grade My Essay
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                  <Star className="text-primary" />
                  <span>Feedback</span>
                </div>
                 {result && (
                  <Button variant="ghost" size="icon" onClick={handleCopyFeedback}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">
                    Your essay is being graded...
                  </p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg">Overall Grade: {result.grade}</h3>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-secondary/50">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        {result.aiDetection.isLikelyAiGenerated ? (
                            <ShieldAlert className="h-5 w-5 text-destructive" />
                        ) : (
                            <ShieldCheck className="h-5 w-5 text-green-600" />
                        )}
                       AI Content Analysis
                    </h3>
                    <Badge variant={result.aiDetection.isLikelyAiGenerated ? 'destructive' : 'secondary'}>
                        {result.aiDetection.isLikelyAiGenerated ? 'Likely AI-Generated' : 'Likely Human-Written'}
                    </Badge>
                    <p className="text-muted-foreground text-sm mt-2">{result.aiDetection.explanation}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Strengths</h3>
                    <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-400">
                      {result.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Areas for Improvement</h3>
                    <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-400">
                      {result.areasForImprovement.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                   <div>
                    <h3 className="font-semibold text-lg mb-2">Detailed Feedback</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.detailedFeedback}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Revised Essay Suggestion</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap p-4 border rounded-md bg-secondary/50">
                      {result.revisedEssay}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <Star className="h-16 w-16 text-muted-foreground" />
                  <h2 className="mt-6 text-xl font-semibold">
                    Your feedback will appear here
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Paste your essay and click "Grade My Essay" to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
