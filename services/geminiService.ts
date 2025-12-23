
import { GoogleGenAI, Modality, Chat, GenerateContentResponse } from "@google/genai";
import { ANALYSIS_SYSTEM_PROMPT } from "../constants";
import { AnalysisResult, Message } from "../types";

// Always initialize the client using the named parameter as required by the SDK.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Analyzes a narrative using the Tri-Lens Protocol.
 * Upgraded to gemini-3-pro-preview for advanced reasoning and exhaustive atomization.
 */
export const analyzeNarrative = async (text: string): Promise<AnalysisResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: text,
    config: {
      systemInstruction: ANALYSIS_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      // Removed tools: [{ googleSearch: {} }] to ensure JSON parsing reliability.
      // Per SDK guidelines, response.text might not be valid JSON when using googleSearch.
    },
  });

  // Access the generated string directly via the .text property (not a method call).
  const resultText = response.text || '{}';
  try {
    return JSON.parse(resultText);
  } catch (e) {
    console.error("Failed to parse AI response:", resultText);
    throw new Error("Invalid intelligence report format.");
  }
};

/**
 * Handles suspect interrogations using a stateful chat session.
 * Employs gemini-3-flash-preview for efficient real-time conversational tasks.
 */
export const getSuspectResponse = async (systemInstruction: string, history: Message[], message: string): Promise<string> => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction },
    // Initialize history to maintain conversation context.
    history: history.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }))
  });

  const response = await chat.sendMessage({ message });
  // Access generated text directly from the response object.
  return response.text || '';
};

// Implement manual base64 decoding as per SDK guidelines for handling raw streams.
export const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Implement manual base64 encoding as per SDK guidelines for streaming inputs.
export const encodeBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Specialized raw PCM audio decoding for Live API streams to bypass native AudioContext limitations with raw headers.
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
