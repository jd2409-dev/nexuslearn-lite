
import { NextResponse } from 'next/server';
import { auth, db, storage } from '@/firebase/server';
import { generatePdfPodcast } from '@/ai/flows/podcast-flow';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(token);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userId = decodedToken.uid;
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const length = formData.get('length') as string;
  const tone = formData.get('tone') as string;

  if (!file) {
    return NextResponse.json({ error: 'File is required.' }, { status: 400 });
  }

  // Validate file type and size
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are allowed.' }, { status: 400 });
  }
  if (file.size > 20 * 1024 * 1024) { // 20 MB
    return NextResponse.json({ error: 'File size cannot exceed 20MB.' }, { status: 400 });
  }

  const jobId = randomUUID();
  const pdfStoragePath = `pdfs/${userId}/${jobId}.pdf`;

  try {
    // Upload PDF to Firebase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    await storage.bucket().file(pdfStoragePath).save(buffer, {
      contentType: 'application/pdf',
    });
    
    const fileAsDataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Create job document in Firestore
    const jobRef = db.collection('users').doc(userId).collection('podcastJobs').doc(jobId);
    const jobData = {
      userId,
      status: 'queued',
      options: { length, tone },
      pdfStoragePath,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await jobRef.set(jobData);

    // Trigger the background processing flow (don't await)
    generatePdfPodcast({
      jobId,
      userId,
      pdfDataUri: fileAsDataUri,
      podcastLength: length as any,
      podcastTone: tone as any,
    });

    return NextResponse.json({ id: jobId, ...jobData });
  } catch (error) {
    console.error('Error creating podcast job:', error);
    const message = error instanceof Error ? error.message : "An internal server error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
