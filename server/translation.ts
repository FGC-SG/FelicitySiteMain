import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface TranslationRequest {
  title: string;
  description: string;
  content?: string;
  tags?: string;
}

interface TranslationResponse {
  title: string;
  description: string;
  content?: string;
  tags?: string;
}

export async function translateToJapanese(
  text: TranslationRequest
): Promise<TranslationResponse> {
  try {
    const prompt = `Please translate the following English news article content to Japanese. Maintain the professional tone and financial terminology accuracy. Return the translation in JSON format with the same structure.

Input:
${JSON.stringify(text, null, 2)}

Please provide a natural, professional Japanese translation that would be appropriate for a financial services company's website. For financial terms, use appropriate Japanese business terminology.`;

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a professional translator specializing in financial and business content. Translate English to Japanese while maintaining professional terminology and tone. Always respond with valid JSON in the exact same structure as the input."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent translations
    });

    const translatedContent = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: translatedContent.title || text.title,
      description: translatedContent.description || text.description,
      content: translatedContent.content || text.content,
      tags: translatedContent.tags || text.tags,
    };
  } catch (error) {
    console.error("Translation error:", error);
    // Return original content if translation fails
    return text;
  }
}

export async function translateNewsArticle(article: any): Promise<any> {
  const translationRequest: TranslationRequest = {
    title: article.title,
    description: article.description,
    content: article.content,
    tags: article.tags,
  };

  const translation = await translateToJapanese(translationRequest);

  return {
    ...article,
    id: `${article.id}_ja`, // Create unique ID for Japanese version
    language: 'ja',
    title: translation.title,
    description: translation.description,
    content: translation.content,
    tags: translation.tags,
    originalId: article.id, // Keep reference to original article
  };
}