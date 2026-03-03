import { GoogleGenAI, Type } from "@google/genai";

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

  const prompt = `
    Analyze the following customer support ${type} transcript and provide a quality audit.
    
    Metrics to score (0-100):
    1. Empathy: How well did the agent understand and validate the customer's feelings?
    2. Resolution: Did the agent solve the problem or provide a clear path forward?
    3. Compliance: Did the agent follow standard protocols (greeting, privacy check, closing)?
    
    Identify specific compliance violations. For each violation, specify:
    - type: A short name for the violation
    - description: A detailed explanation
    - severity: 'Critical', 'Warning', or 'Info'
    - transcript_line_index: The 0-based index of the line in the transcript where this violation occurred or is most relevant.
    
    Transcript:
    """
    ${transcript}
    """
  `;

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
        text: `Transcribe this customer support call audio accurately. 
      
      TASK: Perform ADVANCED SPEAKER DIARIZATION. 
      Analyze the acoustic subpopulations and vocal signatures to distinguish speakers.
      
      FORMAT: Each line MUST follow this EXACT format:
      [MM:SS] Speaker Name (Confidence%): Message
      
      EXAMPLES:
      [00:05] Agent (98%): Thank you for calling tech support.
      [00:12] Customer (85%): My internet is down again.
      
      HEURISTICS for identification:
      - "Agent": Look for standard greetings, professional tone, and process-oriented speech.
      - "Customer": Look for the person stating the problem or providing details.
      - If names are explicitly mentioned, use them.
      
      CRITICAL:
      1. Ensure timestamps are accurate.
      2. Provide a confidence percentage for each attribution based on the clarity of the vocal signature.
      
      Provide ONLY the transcript text in the specified format.` }
    ]
  });

  return response.text || "";
}
