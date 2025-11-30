
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, Upload, FileText, Play, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  pdf: z.instanceof(FileList).refine(files => files.length > 0, 'A PDF file is required.'),
  length: z.enum(['short', 'medium', 'long']),
  tone: z.enum(['formal', 'casual', 'explainer']),
});

type FormValues = z.infer<typeof formSchema>;

type PodcastJob = {
    id: string;
    status: 'queued' | 'extracting_text' | 'generating_script' | 'generating_audio' | 'completed' | 'error';
    audioUrl?: string;
    transcript?: string;
    errorMessage?: string;
};

const statusMap = {
    queued: { text: "In Queue", progress: 10 },
    extracting_text: { text: "Extracting Text from PDF...", progress: 25 },
    generating_script: { text: "AI is Writing the Script...", progress: 50 },
    generating_audio: { text: "Generating Podcast Audio...", progress: 80 },
    completed: { text: "Podcast Ready!", progress: 100 },
    error: { text: "An Error Occurred", progress: 100 },
};

export default function PdfToPodcastPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [jobId, setJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobDocRef = useMemoFirebase(() =>
    jobId && user ? doc(firestore, `users/${user.uid}/podcastJobs/${jobId}`) : null
  , [firestore, user, jobId]);

  const { data: job, isLoading: isJobLoading } = useDoc<PodcastJob>(jobDocRef);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { length: 'medium', tone: 'casual' },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in.' });
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', values.pdf[0]);
    formData.append('length', values.length);
    formData.append('tone', values.tone);
    formData.append('userId', user.uid);
    
    const idToken = await user.getIdToken();

    try {
      const response = await fetch('/api/podcast-jobs', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start podcast job.');
      }

      const { id } = await response.json();
      setJobId(id);
      toast({ title: 'Podcast job started!', description: 'Your PDF is being processed.' });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setJobId(null);
  }

  if (jobId && (isJobLoading || (job && job.status !== 'completed' && job.status !== 'error'))) {
    const statusInfo = job ? statusMap[job.status] : statusMap.queued;
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Processing Your Podcast</CardTitle>
          <CardDescription>Please wait while we generate your audio.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <Progress value={statusInfo.progress} className="w-full my-4" />
          <p className="text-muted-foreground">{statusInfo.text}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (job && job.status === 'completed') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500"/> Podcast Ready!</CardTitle>
          <CardDescription>Your podcast has been successfully generated.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {job.audioUrl && (
                <div>
                    <Label>Listen Now</Label>
                    <audio controls src={job.audioUrl} className="w-full mt-2">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
            {job.transcript && (
                <Accordion type="single" collapsible>
                    <AccordionItem value="transcript">
                        <AccordionTrigger>View Transcript</AccordionTrigger>
                        <AccordionContent className="whitespace-pre-wrap text-sm text-muted-foreground max-h-60 overflow-y-auto">
                            {job.transcript}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </CardContent>
        <CardFooter>
            <Button onClick={resetForm} className="w-full">Create Another Podcast</Button>
        </CardFooter>
      </Card>
    )
  }

  if (job && job.status === 'error') {
     return (
        <Card className="w-full max-w-2xl mx-auto border-destructive">
            <CardHeader>
                <CardTitle>Job Failed</CardTitle>
                <CardDescription>Something went wrong while generating your podcast.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-destructive-foreground bg-destructive p-4 rounded-md">{job.errorMessage || "An unknown error occurred."}</p>
            </CardContent>
             <CardFooter>
                <Button onClick={resetForm} className="w-full">Try Again</Button>
            </CardFooter>
        </Card>
     )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="text-primary" />
          PDF to Podcast Generator
        </CardTitle>
        <CardDescription>
          Upload a PDF and our AI will turn it into a conversational podcast episode.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">PDF Document</Label>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF (MAX. 20MB)</p>
                    </div>
                    <input id="pdf-upload" type="file" className="hidden" accept=".pdf" {...form.register('pdf')} />
                </label>
            </div>
             {form.watch('pdf')?.[0]?.name && <p className="text-sm text-muted-foreground flex items-center gap-2 pt-2"><FileText className="h-4 w-4"/> {form.watch('pdf')?.[0]?.name}</p>}
             {form.formState.errors.pdf && <p className="text-sm font-medium text-destructive">{form.formState.errors.pdf.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Podcast Length</Label>
                <Select onValueChange={(value) => form.setValue('length', value as any)} defaultValue={form.getValues('length')}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="short">Short (5-8 min)</SelectItem>
                        <SelectItem value="medium">Medium (10-15 min)</SelectItem>
                        <SelectItem value="long">Long (20+ min)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label>Podcast Tone</Label>
                <Select onValueChange={(value) => form.setValue('tone', value as any)} defaultValue={form.getValues('tone')}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="casual">Casual & Conversational</SelectItem>
                        <SelectItem value="explainer">Student-Friendly Explainer</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
             {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mic className="mr-2 h-4 w-4" />
            )}
            Generate Podcast
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
