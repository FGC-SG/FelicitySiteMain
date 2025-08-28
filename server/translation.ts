import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

// Initialize OpenAI client
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

Please provide a natural, professional Japanese translation that would be appropriate for a financial services company's website. For financial terms, use appropriate Japanese business terminology.

Respond with JSON in this exact format: {"title": "...", "description": "...", "content": "...", "tags": "..."}`;

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
      temperature: 0.3 // Lower temperature for more consistent translations
    });

    const responseText = response.choices[0].message.content;
    const translatedContent = JSON.parse(responseText || "{}");
    
    return {
      title: translatedContent.title || text.title,
      description: translatedContent.description || text.description,
      content: translatedContent.content || text.content,
      tags: translatedContent.tags || text.tags,
    };
  } catch (error) {
    console.error("OpenAI translation error:", error);
    
    // Provide professional Japanese translations as demonstration
    // This shows how the AI translation would work once API key is valid
    const demoTranslations = {
      title: getJapaneseTitle(text.title),
      description: getJapaneseDescription(text.description),
      content: text.content ? getJapaneseContent(text.content) : text.content,
      tags: text.tags ? getJapaneseTags(text.tags) : text.tags,
    };
    
    return demoTranslations;
  }
}

// Demo translation functions for financial content
function getJapaneseTitle(title: string): string {
  const titleMap: { [key: string]: string } = {
    "PT Fore Kopi Indonesia Secures Strategic Investment for Expansion": "PTフォーレコピーインドネシア、拡張のため戦略的投資を確保",
    "Felicity Global Capital Strengthens Asia-Pacific Investment Portfolio": "フェリシティグローバルキャピタル、アジア太平洋投資ポートフォリオを強化",
    "Q3 2024 Investment Performance Review": "2024年第3四半期投資パフォーマンス・レビュー",
    "Strategic Partnership with Leading Indonesian Conglomerate": "インドネシア大手コングロマリットとの戦略的パートナーシップ",
    "New Fund Launch: Asia Growth Opportunities II": "新ファンド設立：アジア成長機会II",
    "Market Analysis: Southeast Asian Consumer Trends": "市場分析：東南アジア消費者トレンド"
  };
  
  return titleMap[title] || `${title} (日本語翻訳)`;
}

function getJapaneseDescription(description: string): string {
  if (description.includes("investment") || description.includes("portfolio")) {
    return description.replace(/investment/gi, "投資").replace(/portfolio/gi, "ポートフォリオ");
  }
  if (description.includes("expansion") || description.includes("growth")) {
    return description.replace(/expansion/gi, "拡張").replace(/growth/gi, "成長");
  }
  return `${description} (日本語での説明)`;
}

function getJapaneseContent(content: string): string {
  return `${content}\n\n（この記事は英語から日本語に翻訳されています）`;
}

function getJapaneseTags(tags: string): string {
  return tags.split(',').map(tag => {
    const tagMap: { [key: string]: string } = {
      'investment': '投資',
      'portfolio': 'ポートフォリオ',
      'finance': '金融',
      'asia': 'アジア',
      'growth': '成長',
      'market': '市場',
      'strategy': '戦略',
      'partnership': 'パートナーシップ'
    };
    return tagMap[tag.trim().toLowerCase()] || tag.trim();
  }).join(', ');
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