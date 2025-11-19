import { GoogleGenAI, Type, Content, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { ChatMessage, AnalysisResult } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const ai = getClient();
    
    const historyContent: Content[] = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text } as Part],
    }));

    const model = 'gemini-3-pro-preview';

    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
      history: historyContent
    });

    const result = await chat.sendMessage({
      message: newMessage
    });

    return result.text || "I processed the request but received no text response.";
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "Sorry, I encountered an error while processing your request. Please check your API key and connection.";
  }
};

export const analyzeData = async (dataInput: string): Promise<AnalysisResult> => {
  try {
    const ai = getClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following data snippet from PapaData platform and provide a JSON response with a summary, key insights (array of strings), sentiment (positive/negative/neutral), and a brief recommendation. 
      
      Data: ${dataInput}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyInsights: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            sentiment: { type: Type.STRING, enum: ["positive", "negative", "neutral"] },
            recommendation: { type: Type.STRING }
          },
          required: ["summary", "keyInsights", "sentiment"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback mock for demo if API fails
    return {
      summary: "Could not retrieve AI analysis at this moment.",
      keyInsights: ["Check network connection", "Verify API Key"],
      sentiment: "neutral",
      recommendation: "Retry later"
    };
  }
};