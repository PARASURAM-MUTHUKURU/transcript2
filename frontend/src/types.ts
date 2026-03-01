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

export interface RecentAudit {
  id: number;
  overall_score: number;
  created_at: string;
  type: string;
}

export interface AgentAnalytics {
  trend: {
    date: string;
    avg_score: number;
    avg_empathy: number;
    avg_resolution: number;
    avg_compliance: number;
  }[];
  recent_audits: RecentAudit[];
}

export interface Analytics {
  stats: {
    agent_id: number;
    agent_name: string;
    avg_score: number;
    avg_empathy: number;
    avg_resolution: number;
    avg_compliance: number;
    total_audits: number
  }[];
  trend: {
    date: string;
    avg_score: number;
    avg_empathy: number;
    avg_resolution: number;
    avg_compliance: number;
  }[];
}
