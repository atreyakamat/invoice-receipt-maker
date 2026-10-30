import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Secrets come from the environment; otherwise they are generated once and kept in the data volume.
const loadSecrets = () => {
  const file = path.join(DATA_DIR, 'secrets.json');
  let stored: Record<string, string> = {};
  if (fs.existsSync(file)) stored = JSON.parse(fs.readFileSync(file, 'utf8'));

  const pick = (key: string) => process.env[key] || stored[key] || (stored[key] = crypto.randomBytes(48).toString('hex'));
  const secrets = { jwt: pick('JWT_SECRET'), refresh: pick('REFRESH_SECRET') };

  fs.writeFileSync(file, JSON.stringify(stored, null, 2), { mode: 0o600 });
  return secrets;
};

const secrets = loadSecrets();

export const config = {
  port: Number(process.env.PORT || 3000),
  isProduction: process.env.NODE_ENV === 'production',
  dataDir: DATA_DIR,
  uploadDir: UPLOAD_DIR,
  publicDir: path.resolve(process.env.PUBLIC_DIR || path.join(__dirname, '..', 'public')),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: secrets.jwt,
  refreshSecret: secrets.refresh,
  ai: {
    // Any OpenAI-compatible endpoint (OpenRouter, Gemini OpenAI endpoint, Ollama, ...).
    apiKey: process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || '',
    baseUrl: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
    model: process.env.AI_MODEL || 'google/gemini-2.5-flash',
  },
  ocrConcurrency: Number(process.env.OCR_CONCURRENCY || 2),
};
