
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateMindMap, getPdfText } from '@/ai/flows/mindmap-generator-flow';
import { type MindMapOutput } from '@/ai/schemas/mindmap-schemas';
import { useToast } from '@/hooks/use-toast';
import mermaid from 'mermaid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Upload, FileText, BrainCircuit, Save } from 'lucide-react';
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

const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chart && ref.current) {
      mermaid.initialize({ startOnLoad: false, theme: 'forest' });
      mermaid.run({
        nodes: [ref.current],
      });
    }
  }, [chart]);

  return <div ref={ref} className="mermaid">{chart}</div>;
};

export default function MindMapsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MindMapOutput | null>(null);

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
                generate(extractedText, values.topic);
            } catch (error) {
                handleError(error);
            }
        };
        reader.onerror = () => handleError(new Error("Failed to read PDF file."));
        reader.readAsDataURL(file);
    } else {
        generate(text, values.topic);
    }
  };

  const generate = async (text: string, topic: string) => {
      try {
        const mindMapResult = await generateMindMap({ text, topic });
        setResult(mindMapResult);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
  }

  const handleError = (error: any) => {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to generate mind map.' });
      setIsLoading(false);
  }
  
  const handleSave = async () => {
    if (!user || !firestore || !result || !form.getValues('topic')) return;

    try {
        const mindMapsCollection = collection(firestore, `users/${user.uid}/mindMaps`);
        await addDoc(mindMapsCollection, {
            userId: user.uid,
            topic: form.getValues('topic'),
            mapData: result.mapData,
            createdAt: serverTimestamp(),
        });
        toast({ title: "Success!", description: "Mind map saved successfully." });
    } catch (error) {
        handleError(error);
    }
  };


  return (
    <div className="grid md:grid-cols-2 gap-8 container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate a Mind Map</CardTitle>
          <CardDescription>Create a new mind map from text or a PDF to visualize concepts.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="topic">Central Topic</Label>
                    <Input id="topic" placeholder="e.g., The Solar System" {...form.register('topic')} />
                    {form.formState.errors.topic && <p className="text-sm font-medium text-destructive">{form.formState.errors.topic.message}</p>}
                </div>

                <Tabs defaultValue="text" className="w-full" onValueChange={(value) => form.setValue('source', value as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="text">Paste Text</TabsTrigger>
                        <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className="mt-4">
                        <Textarea placeholder="Paste your notes or an article here..." {...form.register('text')} className="h-48" />
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
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                    Generate Mind Map
                </Button>
            </form>
        </CardContent>
      </Card>
      
      <div className="w-full">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-dashed p-8 text-center h-full">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h2 className="mt-6 text-xl font-semibold">AI is building your mind map...</h2>
            </div>
        ) : result && result.mapData ? (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{form.getValues('topic')}</CardTitle>
                    <Button onClick={handleSave} size="sm"><Save className="mr-2 h-4 w-4"/> Save Map</Button>
                </CardHeader>
                <CardContent className="min-h-[400px] overflow-auto">
                    <Mermaid chart={result.mapData} />
                </CardContent>
            </Card>
        ) : (
             <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center h-full">
                <BrainCircuit className="h-16 w-16 text-muted-foreground" />
                <h2 className="mt-6 text-xl font-semibold">Your mind map will appear here</h2>
                <p className="mt-2 text-center text-muted-foreground">Provide some text or a PDF to get started.</p>
            </div>
        )}
      </div>
    </div>
  );
}
