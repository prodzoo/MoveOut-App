
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

// Always use named parameter and process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeItem = async (
  photos: string[], 
  description: string
): Promise<AIAnalysisResult> => {
  // Use gemini-3-pro-preview for high-quality multimodal analysis and complex reasoning tasks
  const model = 'gemini-3-pro-preview';

  const photoParts = photos.map(photo => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: photo.split(',')[1] // extract base64 data from data URL
    }
  }));

  const prompt = `
    Analyze this moving sale item based on the provided photos and user description. 
    User input: "${description}"

    Tasks:
    1. Identify the item and its main features.
    2. Assess the condition (new, like new, very good, good, fair).
    3. If an Amazon or product link is provided in the description, try to incorporate technical specs if possible from the URL text.
    4. Generate a catchy professional title.
    5. Suggest a fair market price based on condition and description (number only).
    6. Write an enhanced, professional, and persuasive description.
    7. Generate specific content for Facebook Marketplace (with hashtags), Craigslist (local details), and WhatsApp (concise).

    Return ONLY a JSON object matching the requested schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [...photoParts, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            condition: { type: Type.STRING },
            suggestedPrice: { type: Type.NUMBER },
            enhancedDescription: { type: Type.STRING },
            facebookContent: { type: Type.STRING },
            craigslistContent: { type: Type.STRING },
            whatsappContent: { type: Type.STRING }
          },
          required: ["title", "category", "condition", "suggestedPrice", "enhancedDescription", "facebookContent", "craigslistContent", "whatsappContent"]
        }
      }
    });

    // response.text is a property that returns the string output directly
    const text = response.text || '{}';
    const result = JSON.parse(text) as AIAnalysisResult;
    return result;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    // Fallback logic for graceful failure
    return {
      title: "New Item",
      category: "Other",
      condition: "Good",
      suggestedPrice: 20,
      enhancedDescription: description || "No description provided.",
      facebookContent: `${description}\n\n#MovingSale #Local`,
      craigslistContent: `${description}\n\nPickup only. Cash preferred.`,
      whatsappContent: `Moving Sale! Check this out: ${description}`
    };
  }
};
