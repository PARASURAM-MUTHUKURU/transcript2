import { GoogleGenAI, Type } from "@google/genai";
import prompts from '../config/prompts.json';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

export interface Violation {
  type: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Info';
  transcript_line_index: number; // 0-based index of the line in the transcript
}

export interface AuditResult {
  empathy_score: number;
  resolution_score: number;
  compliance_score: number;
  overall_score: number;
  violations: Violation[];
  suggestions: string;
}

export async function auditTranscript(transcript: string, type: 'chat' | 'call'): Promise<AuditResult> {
  const model = "gemini-2.5-flash";

  const prompt = prompts.audit
    .replace('{type}', type)
    .replace('{transcript}', transcript);

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          empathy_score: { type: Type.INTEGER },
          resolution_score: { type: Type.INTEGER },
          compliance_score: { type: Type.INTEGER },
          overall_score: { type: Type.INTEGER },
          violations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['Critical', 'Warning', 'Info'] },
                transcript_line_index: { type: Type.INTEGER }
              },
              required: ["type", "description", "severity", "transcript_line_index"]
            }
          },
          suggestions: { type: Type.STRING }
        },
        required: ["empathy_score", "resolution_score", "compliance_score", "overall_score", "violations", "suggestions"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to audit transcript");
  }
}

export async function transcribeAudio(base64Data: string, mimeType: string): Promise<string> {
  const model = "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      },
      {
        text: prompts.transcribe
      }
    ]
  });

  return response.text || "";
}
