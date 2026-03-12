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

import { fetchWithAuth } from '../lib/api';

export async function auditTranscript(transcript: string, type: 'chat' | 'call'): Promise<AuditResult> {
  const response = await fetchWithAuth('/api/ai/audit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcript, type }),
  });

  if (!response.ok) {
    throw new Error('Failed to audit transcript directly from backend');
  }

  const data = await response.json();

  if (data.error) {
    // Check if the backend returned a custom error wrapped in JSON
    throw new Error(data.error);
  }

  return data;
}

export async function transcribeAudio(base64Data: string, mimeType: string): Promise<string> {
  // We send the base64 string to the backend to keep the Gemini API key secure
  const response = await fetchWithAuth('/api/ai/transcribe', {
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
    throw new Error('Failed to transcribe audio from backend');
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.transcript || "";
}
