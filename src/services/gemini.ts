import { GoogleGenAI, Type } from "@google/genai";
import { MarketAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getMarketAnalysis(): Promise<MarketAnalysis> {
  const prompt = `Analyze the current stock and crypto markets for today (${new Date().toLocaleDateString()}). 
  Provide a comprehensive analysis including:
  1. A general market summary.
  2. Specific buy/sell recommendations with target prices, stop losses, and timing suggestions.
  3. Categorize recommendations by budget: Low (<$1000), Medium ($1000-$10000), High (>$10000).
  4. Identify high volatility options for aggressive traders.
  5. Identify "Safe Mode" options (fixed-term style, secure returns like bonds, ETFs, or stablecoins).
  
  Return the data in a structured JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                asset: { type: Type.STRING },
                symbol: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["buy", "sell", "hold"] },
                reason: { type: Type.STRING },
                targetPrice: { type: Type.NUMBER },
                stopLoss: { type: Type.NUMBER },
                timeframe: { type: Type.STRING },
                riskLevel: { type: Type.STRING, enum: ["low", "medium", "high"] },
                budgetCategory: { type: Type.STRING, enum: ["low", "medium", "high"] }
              },
              required: ["asset", "symbol", "type", "reason", "targetPrice", "stopLoss", "timeframe", "riskLevel", "budgetCategory"]
            }
          },
          topGainers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                name: { type: Type.STRING },
                price: { type: Type.NUMBER },
                change: { type: Type.NUMBER },
                type: { type: Type.STRING, enum: ["stock", "crypto"] },
                volatility: { type: Type.STRING, enum: ["low", "medium", "high"] }
              }
            }
          },
          highVolatility: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                name: { type: Type.STRING },
                price: { type: Type.NUMBER },
                change: { type: Type.NUMBER },
                type: { type: Type.STRING, enum: ["stock", "crypto"] },
                volatility: { type: Type.STRING, enum: ["low", "medium", "high"] }
              }
            }
          },
          safeOptions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                name: { type: Type.STRING },
                price: { type: Type.NUMBER },
                change: { type: Type.NUMBER },
                type: { type: Type.STRING, enum: ["stock", "crypto"] },
                volatility: { type: Type.STRING, enum: ["low", "medium", "high"] }
              }
            }
          }
        },
        required: ["summary", "recommendations", "topGainers", "highVolatility", "safeOptions"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as MarketAnalysis;
  } catch (e) {
    console.error("Failed to parse market analysis:", e);
    throw new Error("Failed to fetch market analysis");
  }
}
