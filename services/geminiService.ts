import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL } from '../constants';

// Initialize the API client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const askGemini = async (prompt: string): Promise<string> => {
    if (!apiKey) {
        return "API Key is missing. Please check your configuration.";
    }

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful desktop assistant. Keep answers concise, clear, and plain text. Do not use markdown formatting extensively unless requested.",
            }
        });

        return response.text || "I couldn't generate a response.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, I encountered an error while processing your request.";
    }
};
