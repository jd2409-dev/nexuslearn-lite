"use server";
/**
 * @fileOverview A Genkit flow for converting a PDF into a conversational podcast.
 * This flow extracts text from a PDF, generates a script with two speakers,
 * and then synthesizes the script into audio.
 */

import { ai } from "@/ai/genkit";
import { z } from "zod";
import * as pdfParse from "pdf-parse";
import wav from "wav";
import {
  doc,
  updateDoc,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { initializeFirebase } from "@/firebase";

// Initialize Firebase Admin SDK for backend usage
const firebaseApp = initializeFirebase().firebaseApp;
const db = getFirestore(firebaseApp!);
const storage = getStorage(firebaseApp!);


// Input schema for the main flow
export const PdfToPodcastInputSchema = z.object({
  jobId: z.string(),
  userId: z.string(),
  pdfDataUri: z.string(),
  podcastLength: z.enum(["short", "medium", "long"]),
  podcastTone: z.enum(["formal", "casual", "explainer"]),
});
export type PdfToPodcastInput = z.infer<typeof PdfToPodcastInputSchema>;


const PodcastScriptSchema = z.object({
  title: z.string().describe("A catchy title for the podcast episode."),
  script: z
    .array(
      z.object({
        speaker: z.enum(["Speaker 1", "Speaker 2"]),
        dialogue: z.string(),
      })
    )
    .describe("The conversational script between two speakers."),
});

/**
 * Main exported function to trigger the PDF to Podcast conversion process.
 * This function is designed to be called from an API route and not block.
 * It initiates the flow and returns immediately.
 * @param input - The input data for the podcast generation.
 */
export async function generatePdfPodcast(input: PdfToPodcastInput) {
  // Do not await this call. Let it run in the background.
  pdfToPodcastFlow(input);
}


async function updateJobStatus(userId: string, jobId: string, data: any) {
  if (!userId || !jobId) return;
  const jobRef = doc(db, `users/${userId}/podcastJobs`, jobId);
  await updateDoc(jobRef, { ...data, updatedAt: serverTimestamp() });
}

// Main Genkit Flow
const pdfToPodcastFlow = ai.defineFlow(
  {
    name: "pdfToPodcastFlow",
    inputSchema: PdfToPodcastInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const { jobId, userId, pdfDataUri, podcastLength, podcastTone } = input;
    
    try {
      // 1. Extract Text from PDF
      await updateJobStatus(userId, jobId, { status: "extracting_text" });
      const pdfBuffer = Buffer.from(pdfDataUri.split(",")[1], "base64");
      const pdfData = await pdfParse(pdfBuffer);
      const rawText = pdfData.text;

      // Simple text cleaning
      const cleanedText = rawText.replace(/(\r\n|\n|\r){2,}/gm, "\n").trim();
      const truncatedText = cleanedText.slice(0, 30000); // Truncate to avoid exceeding model limits

      // 2. Generate Podcast Script
      await updateJobStatus(userId, jobId, { status: "generating_script" });
      const scriptPrompt = ai.definePrompt({
        name: "podcastScriptPrompt",
        model: "googleai/gemini-2.5-flash",
        output: { schema: PodcastScriptSchema },
        prompt: `You are a podcast scriptwriter. Your task is to convert the following document text into a conversational podcast script between two speakers: "Speaker 1" and "Speaker 2".

          **Instructions:**
          - Podcast Length: ${podcastLength} (short: 5-8 mins, medium: 10-15 mins, long: 20+ mins). Adjust segment count and depth accordingly.
          - Podcast Tone: ${podcastTone}.
          - Create a catchy title for the episode.
          - The script should have an introduction, several segments discussing the key points of the document, and a conclusion.
          - Make the conversation engaging and natural. DO NOT just read the document. Explain concepts, add context, and make it easy to understand.
          - Ensure the dialogue flows logically between the two speakers.

          **Document Text:**
          {{{text}}}
        `,
      });

      const { output: scriptOutput } = await scriptPrompt({ text: truncatedText });
      const { title, script } = scriptOutput!;

      const fullTranscript = script.map(line => `${line.speaker}: ${line.dialogue}`).join('\n');
      await updateJobStatus(userId, jobId, { transcript: fullTranscript, title });


      // 3. Generate Audio for each part of the script
      await updateJobStatus(userId, jobId, { status: "generating_audio" });
      const audioBuffers: Buffer[] = [];
      
      for (const line of script) {
        const { media } = await ai.generate({
          model: 'googleai/gemini-2.5-flash-preview-tts',
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                  { speaker: 'Speaker1', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } } },
                  { speaker: 'Speaker2', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Achernar' } } },
                ]
              }
            }
          },
          prompt: `${line.speaker}: ${line.dialogue}`,
        });

        if (media?.url) {
            const pcmData = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
            audioBuffers.push(pcmData);
        }
      }
      
      if (audioBuffers.length === 0) throw new Error("Audio generation failed, no buffers created.");

      // 4. Combine audio buffers into a single WAV file
      const combinedPcm = Buffer.concat(audioBuffers);
      const wavBase64 = await toWav(combinedPcm);
      const audioDataUrl = `data:audio/wav;base64,${wavBase64}`;
      
      // 5. Upload to Firebase Storage
      const audioPath = `podcasts/${userId}/${jobId}.wav`;
      const storageRef = ref(storage, audioPath);
      await uploadString(storageRef, audioDataUrl, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);

      // 6. Finalize Job
      await updateJobStatus(userId, jobId, {
        status: "completed",
        audioUrl: downloadUrl,
      });

    } catch (error) {
      console.error("Error in PDF to Podcast flow:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      await updateJobStatus(userId, jobId, {
        status: "error",
        errorMessage: errorMessage,
      });
    }
  }
);


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
