import { GoogleGenAI, Schema, Type } from "@google/genai";
import { WikiPage } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Construct a context string from the provided wiki data version
const getContextString = (data: WikiPage[]): string => {
  return data.map(page => `
    ---
    ID: ${page.id}
    Title: ${page.title} (Section: ${page.section})
    Content: ${page.content}
    ${page.packetTable ? `Packet Structure: ${JSON.stringify(page.packetTable.fields)}` : ''}
    ${page.extraTable ? `Data Table: ${JSON.stringify(page.extraTable.rows)}` : ''}
    ---
  `).join('\n');
};

export interface AISearchResponse {
  answer: string;
  relevantSectionId?: string | null;
}

export const searchWiki = async (query: string, wikiData: WikiPage[]): Promise<AISearchResponse> => {
  if (!apiKey) {
    return { answer: "API Key is missing. Please configure the environment." };
  }

  const context = getContextString(wikiData);

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      answer: {
        type: Type.STRING,
        description: "The answer to the user's question based on the context."
      },
      relevantSectionId: {
        type: Type.STRING,
        description: "The ID of the wiki section most relevant to the answer, or null if none."
      }
    },
    required: ["answer"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: `You are an expert technical assistant for the "AirVibe LoRa Communication Protocol". 
        Use the provided context to answer the user's question. 
        
        Rules:
        1. **NLP & Intent:** Understand synonyms (e.g., "TWF" = "Time Waveform", "OTA" = "Upgrade", "RMS" = "Root Mean Square"). Infer the user's technical intent even if phrased casually.
        2. **Strict Context:** Only use information from the provided context. If the answer is not in the context, say "I don't know based on the current documentation version." and ask for clarification.
        3. **External Knowledge:** You may check "machinesaver.com" or "library.machinesaver.com" for general knowledge if the context implies it, but prioritize the provided text.
        4. **Conciseness:** Be concise and technical. 
        5. **Linking:** Identify the single most relevant 'ID' from the context blocks that corresponds to your answer. Return it in the 'relevantSectionId' field.
        
        Context Data:
        ${context}`
      },
      contents: [
        { role: 'user', parts: [{ text: query }] }
      ]
    });

    const text = response.text;
    if (!text) return { answer: "No response generated." };

    try {
      const json = JSON.parse(text);
      return {
        answer: json.answer,
        relevantSectionId: json.relevantSectionId
      };
    } catch (e) {
      // Fallback if model doesn't return valid JSON for some reason
      return { answer: text, relevantSectionId: null };
    }

  } catch (error) {
    console.error("Gemini Search Error:", error);
    return { answer: "An error occurred while searching. Please try again." };
  }
};