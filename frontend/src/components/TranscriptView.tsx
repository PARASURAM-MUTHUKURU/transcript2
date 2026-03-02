import React from 'react';
import { Clock, Calendar, Flag, Upload } from 'lucide-react';
import { Audit } from '../types';
import { cn } from '../lib/utils';

interface TranscriptViewProps {
  selectedAudit: Audit;
  onUploadClick?: () => void;
}

export const TranscriptView = ({ selectedAudit, onUploadClick }: TranscriptViewProps) => {
  const parseTranscript = (text: string) => {
    if (!text) return [];

    // Simple parsing logic for "Speaker: Message" format
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const match = line.match(/^(Agent|Customer|Sarah|User):\s*(.*)$/i);
      const speakerType = match
        ? (match[1].toLowerCase().includes('agent') || match[1].toLowerCase().includes('sarah') ? 'agent' : 'customer')
        : 'customer';

      // Find violations for this line index
      const lineViolations = selectedAudit.violations?.filter(v => v.transcript_line_index === index) || [];

      if (match) {
        return {
          speaker: speakerType,
          name: match[1],
          message: match[2],
          timestamp: `00:${(index * 12).toString().padStart(2, '0')}`, // Mock timestamps for now
          violations: lineViolations
        };
      }
      return {
        speaker: 'customer',
        name: 'System',
        message: line,
        timestamp: '--:--',
        violations: lineViolations
      };
    });
  };

  const transcriptData = parseTranscript(selectedAudit.transcript);
  const date = new Date(selectedAudit.created_at);

  return (
    <div className="flex-1 flex flex-col bg-brand-bg">
      <div className="h-16 border-b border-brand-border flex items-center justify-between px-8 bg-brand-surface/20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <h3 className="font-display font-bold text-lg text-text-primary">Call Transcript</h3>
          </div>

          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent rounded-lg border border-brand-accent/20 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <Upload size={12} />
            Upload Audio
          </button>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-text-secondary">
          <span className="flex items-center gap-1"><Clock size={12} /> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="flex items-center gap-1"><Calendar size={12} /> {date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="space-y-6 max-w-3xl mx-auto">
          {transcriptData.length > 0 ? (
            transcriptData.map((item, i) => (
              <div key={i} className={item.speaker === 'agent' ? "transcript-bubble-agent" : "transcript-bubble-customer"}>
                <div className="flex justify-between items-center mb-2">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    item.speaker === 'agent' ? "text-brand-accent" : "text-text-secondary"
                  )}>
                    {item.name}
                  </p>
                  <span className="text-[9px] font-mono text-text-secondary opacity-60">{item.timestamp}</span>
                </div>
                <p className="text-sm leading-relaxed text-text-primary">{item.message}</p>

                {item.violations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {item.violations.map((v, vi) => (
                      <div key={vi} className={cn(
                        "flex items-start gap-2 p-2 rounded-lg border text-[10px] font-medium",
                        v.severity === 'Critical'
                          ? "bg-brand-red/10 border-brand-red/20 text-brand-red"
                          : "bg-brand-accent/10 border-brand-accent/20 text-brand-accent"
                      )}>
                        <Flag size={12} className="mt-0.5 shrink-0" />
                        <div>
                          <span className="font-black uppercase mr-1">[{v.type}]</span>
                          {v.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-zinc-600 italic text-sm">
              No transcript content available for this audit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
