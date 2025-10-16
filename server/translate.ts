import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface TranslationRequest {
  text: string;
  sourceLanguage: 'en' | 'jp';
  targetLanguage: 'en' | 'jp';
}

export async function translateText(request: TranslationRequest): Promise<string> {
  const { text, sourceLanguage, targetLanguage } = request;
  
  if (!text || text.trim() === '') {
    return '';
  }

  const languageMap = {
    en: 'English',
    jp: 'Japanese'
  };

  const prompt = `Translate the following text from ${languageMap[sourceLanguage]} to ${languageMap[targetLanguage]}. 
Return ONLY the translated text without any explanations, notes, or additional formatting.

Text to translate:
${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
}
