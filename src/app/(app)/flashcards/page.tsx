
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateFlashcards, getPdfText, FlashcardOutput } from '@/ai/flows/flashcard-generator-flow';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Upload, FileText, ArrowRight, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  topic: z.string().min(3, 'Topic is required.'),
  source: z.enum(['text', 'pdf']),
  text: z.string().optional(),
  pdf: z.instanceof(FileList).optional(),
}).refine(data => {
    if (data.source === 'text') return !!data.text && data.text.length > 10;
    if (data.source === 'pdf') return !!data.pdf && data.pdf.length > 0;
    return false;
}, {
    message: "Please provide content for the selected source.",
    path: ['text'],
});

type FormValues = z.infer<typeof formSchema>;

type Flashcard = {
    question: string;
    answer: string;
};

const FlashcardViewer = ({ card, isFlipped, onClick }: { card: Flashcard, isFlipped: boolean, onClick: () => void }) => {
    return (
        <div 
            className="w-full h-64 border rounded-lg p-6 flex items-center justify-center text-center cursor-pointer transition-transform duration-500"
            style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            onClick={onClick}
        >
            <div className="absolute w-full h-full backface-hidden flex items-center justify-center">
                <p className="text-xl font-semibold">{card.question}</p>
            </div>
            <div className="absolute w-full h-full backface-hidden flex items-center justify-center" style={{ transform: 'rotateY(180deg)' }}>
                <p className="text-lg">{card.answer}</p>
            </div>
        </div>
    );
};


export default function FlashcardsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FlashcardOutput | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sourceType, setSourceType] = useState('text');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: '', source: 'text' },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);

    let text = values.text || '';
    if (values.source === 'pdf' && values.pdf && values.pdf.length > 0) {
        const file = values.pdf[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            const pdfDataUri = e.target?.result as string;
            try {
                const extractedText = await getPdfText(pdfDataUri);
                generate(extractedText);
            } catch (error) {
                handleError(error);
            }
        };
        reader.onerror = () => handleError(new Error("Failed to read PDF file."));
        reader.readAsDataURL(file);
    } else {
        generate(text);
    }
  };

  const generate = async (text: string) => {
      try {
        const flashcardResult = await generateFlashcards({ text });
        setResult(flashcardResult);
        setCurrentCardIndex(0);
        setIsFlipped(false);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
  }

  const handleError = (error: any) => {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to generate flashcards.' });
      setIsLoading(false);
  }
  
  const handleSave = async () => {
    if (!user || !firestore || !result || !form.getValues('topic')) return;

    try {
        const flashcardSetsCollection = collection(firestore, `users/${user.uid}/flashcardSets`);
        await addDoc(flashcardSetsCollection, {
            userId: user.uid,
            topic: form.getValues('topic'),
            cards: result.cards,
            createdAt: serverTimestamp(),
        });
        toast({ title: "Success!", description: "Flashcard set saved successfully." });
    } catch (error) {
        handleError(error);
    }
  };


  return (
    <div className="grid md:grid-cols-2 gap-8 container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Flashcards</CardTitle>
          <CardDescription>Create a new set of flashcards from text or a PDF.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input id="topic" placeholder="e.g., Cellular Respiration" {...form.register('topic')} />
                    {form.formState.errors.topic && <p className="text-sm font-medium text-destructive">{form.formState.errors.topic.message}</p>}
                </div>

                <Tabs defaultValue="text" className="w-full" onValueChange={(value) => form.setValue('source', value as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="text">Paste Text</TabsTrigger>
                        <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className="mt-4">
                        <Textarea placeholder="Paste your notes here..." {...form.register('text')} className="h-48" />
                    </TabsContent>
                    <TabsContent value="pdf" className="mt-4">
                         <div className="flex items-center justify-center w-full">
                            <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                </div>
                                <input id="pdf-upload" type="file" className="hidden" accept=".pdf" {...form.register('pdf')} />
                            </label>
                        </div>
                        {form.watch('pdf')?.[0]?.name && <p className="text-sm text-muted-foreground flex items-center gap-2 pt-2"><FileText className="h-4 w-4"/> {form.watch('pdf')?.[0]?.name}</p>}
                    </TabsContent>
                </Tabs>
                {form.formState.errors.text && <p className="text-sm font-medium text-destructive">{form.formState.errors.text.message}</p>}

                 <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate Flashcards
                </Button>
            </form>
        </CardContent>
      </Card>
      
      <div className="w-full">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-dashed p-8 text-center h-full">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h2 className="mt-6 text-xl font-semibold">AI is creating your flashcards...</h2>
            </div>
        ) : result && result.cards.length > 0 ? (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{form.getValues('topic')}</CardTitle>
                        <CardDescription>Card {currentCardIndex + 1} of {result.cards.length}</CardDescription>
                    </div>
                    <Button onClick={handleSave} size="sm"><Save className="mr-2 h-4 w-4"/> Save Set</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FlashcardViewer 
                        card={result.cards[currentCardIndex]} 
                        isFlipped={isFlipped}
                        onClick={() => setIsFlipped(!isFlipped)}
                    />
                    <div className="flex items-center justify-center gap-4">
                        <Button 
                            variant="outline"
                            onClick={() => {
                                setCurrentCardIndex(p => Math.max(0, p - 1));
                                setIsFlipped(false);
                            }} 
                            disabled={currentCardIndex === 0}
                        >
                            Previous
                        </Button>
                        <Button 
                            onClick={() => {
                                setCurrentCardIndex(p => Math.min(result.cards.length - 1, p + 1));
                                setIsFlipped(false);
                            }}
                            disabled={currentCardIndex === result.cards.length - 1}
                        >
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        ) : (
             <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center h-full">
                <Sparkles className="h-16 w-16 text-muted-foreground" />
                <h2 className="mt-6 text-xl font-semibold">Your flashcards will appear here</h2>
                <p className="mt-2 text-center text-muted-foreground">Provide some text or a PDF to get started.</p>
            </div>
        )}
      </div>
    </div>
  );
}

    