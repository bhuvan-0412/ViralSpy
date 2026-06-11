import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

/**
 * Returns a configured GoogleGenerativeAI client or null if the API key is missing/placeholder.
 */
export const gemini = apiKey && !apiKey.includes('placeholder') ? new GoogleGenerativeAI(apiKey) : null;

export const isGeminiConfigured = (): boolean => !!apiKey && !apiKey.includes('placeholder');
