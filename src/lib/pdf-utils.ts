
"use server";
import * as pdfParse from "pdf-parse";

/**
 * Converts PDF data URI to text.
 * @param pdfDataUri - The PDF file encoded as a data URI.
 * @returns The extracted text from the PDF.
 */
export async function getPdfText(pdfDataUri: string): Promise<string> {
    const pdfBuffer = Buffer.from(pdfDataUri.split(",")[1], "base64");
    const data = await pdfParse(pdfBuffer);
    return data.text;
}
