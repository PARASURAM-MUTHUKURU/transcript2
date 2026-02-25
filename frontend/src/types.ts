import { AuditResult } from './services/geminiService';

export interface Agent {
  id: number;
  name: string;
}

export interface Audit extends AuditResult {
  id: number;
  agent_id: number;
  agent_name: string;
  transcript: string;
  type: 'chat' | 'call';
  audio_data?: string; // Base64 audio data
  mime_type?: string;
  created_at: string;
  duration?: string;
}

export interface Analytics {
  stats: { agent_name: string; avg_score: number; total_audits: number }[];
  trend: { date: string; avg_score: number }[];
}
