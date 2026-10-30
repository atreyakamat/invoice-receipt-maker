import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';
// The package entry point runs a self-test on import; the lib file is the parser itself.
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { config } from '../config';

const tessCache = process.env.TESSDATA_DIR || path.join(config.dataDir, 'tessdata');
fs.mkdirSync(tessCache, { recursive: true });

export interface OcrOutput {
  text: string;
  confidence: number;
  pageCount: number;
}

/** Text-based PDFs are read directly; images go through Tesseract. */
export const extractText = async (filePath: string, mimeType: string): Promise<OcrOutput> => {
  if (mimeType === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf')) {
    try {
      const parsed = await pdfParse(fs.readFileSync(filePath));
      const text = parsed.text.trim();
      return { text, confidence: text.length > 20 ? 99 : 0, pageCount: parsed.numpages || 1 };
    } catch (error) {
      // Damaged or unusual PDFs still go to review for manual entry.
      console.warn(`Could not read PDF text from ${path.basename(filePath)}:`, error instanceof Error ? error.message : error);
      return { text: '', confidence: 0, pageCount: 1 };
    }
  }

  const { data } = await Tesseract.recognize(filePath, 'eng', { cachePath: tessCache });
  return { text: data.text.trim(), confidence: Math.round(data.confidence), pageCount: 1 };
};
