
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client strictly following the naming parameter and env variable guidelines
// Use the API_KEY directly from process.env as required.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createChatSession = () => {
  const modelId = 'gemini-3-flash-preview'; 
  
  return ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: `You are "Tokyo Service Bot", a futuristic and helpful AI assistant for the store. 
      The store sells digital goods like Amazon Prime, Valorant Points, V-Bucks, PlayStation cards, and more.
      
      Your goal is to:
      1. Help customers find products based on their interests (Gaming, Streaming, etc.).
      2. Explain payment methods available in Egypt (Vodafone Cash, InstaPay, Fawry, Credit Card).
      3. Be concise, friendly, and use emojis (🌸, 🎮, 💳). 
      4. If asked about prices, give approximate estimates in Egyptian Pounds (EGP).
      5. Keep responses short (under 50 words) unless asked for details.
      6. Suggest using the "Wishlist" if the customer is undecided.

      LANGUAGE SUPPORT:
      - If the user speaks English, reply in English.
      - If the user speaks Arabic, reply in Arabic.
      
      Tone: Cyberpunk, Friendly, Helpful.
      `
    }
  });
};

export const sendMessageToGemini = async (chatSession: any, message: string): Promise<string> => {
  try {
    const result = await chatSession.sendMessage({ message });
    // The text property is a getter, not a method, as per guidelines.
    return result.text || "System rebooting... I couldn't process that.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection interrupted. Please try again later. 🤖";
  }
};
