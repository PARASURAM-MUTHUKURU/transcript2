const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Violation {
  type: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Info';
  transcript_line_index: number;
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
  const response = await fetch(`${API_URL}/api/ai/audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcript, type }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Gemini Audit Error:", error);
    throw new Error("Failed to audit transcript");
  }

  return response.json();
}

export async function transcribeAudio(base64Data: string, mimeType: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/ai/transcribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      base64_data: base64Data,
      mime_type: mimeType
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Gemini Transcribe Error:", error);
    throw new Error("Failed to transcribe audio");
  }

  const data = await response.json();
  return data.transcript || "";
}
