import React, { useState, useRef, useEffect } from 'react';
import { Clock, Play, Pause, Settings, TrendingUp, Volume2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Audit } from '../types';
import { ScoreBar } from './ScoreBar';
import { Waveform } from './Waveform';

interface AuditSidebarProps {
  selectedAudit: Audit;
}

export const AuditSidebar = ({ selectedAudit }: AuditSidebarProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [selectedAudit.id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const audioSrc = selectedAudit.audio_data
    ? `data:${selectedAudit.mime_type || 'audio/mpeg'};base64,${selectedAudit.audio_data}`
    : null;

  return (
    <div className="w-[400px] flex flex-col bg-brand-surface overflow-y-auto border-l border-brand-border">
      {/* Audio Player Section */}
      <div className="p-8 border-b border-brand-border bg-brand-card/30">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Audio Recording</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-accent" />
            <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">Recorded Audit</span>
          </div>
        </div>

        <div className="bg-brand-bg border border-brand-border rounded-2xl p-6 space-y-6">
          {audioSrc && (
            <audio
              ref={audioRef}
              src={audioSrc}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />
          )}

          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <button className="text-text-secondary hover:text-text-primary transition-colors">
                <Volume2 size={20} />
              </button>
              <span className="text-[8px] font-black uppercase text-text-secondary opacity-60">Volume</span>
            </div>
            <button
              onClick={togglePlay}
              disabled={!audioSrc}
              className={cn(
                "w-14 h-14 bg-brand-accent rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(242,125,38,0.4)] hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100",
                !audioSrc && "bg-zinc-800 shadow-none"
              )}
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
            <div className="flex flex-col items-center gap-1">
              <button className="text-text-secondary hover:text-text-primary transition-colors">
                <Settings size={20} />
              </button>
              <span className="text-[8px] font-black uppercase text-text-secondary opacity-60">Speed</span>
            </div>
          </div>

          <div className="space-y-2">
            <Waveform progress={currentTime / (duration || 1)} isPlaying={isPlaying} />
            <div className="flex justify-between text-[10px] font-mono text-text-secondary opacity-70 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
        {!audioSrc && (
          <p className="text-[10px] text-zinc-600 text-center mt-4 italic">No audio file available for this audit</p>
        )}
      </div>

      {/* Audit Results Section */}
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-lg font-display font-bold tracking-tight text-text-primary">Audit Intelligence</h3>
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Powered by Gemini 3.1 Pro</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent font-black text-lg">
            {selectedAudit.overall_score}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Performance Metrics</p>
            <TrendingUp size={14} className="text-brand-green" />
          </div>
          <div className="space-y-5">
            <ScoreBar label="Empathy & Soft Skills" score={selectedAudit?.empathy_score ? Math.round(selectedAudit.empathy_score / 10) : 4} />
            <ScoreBar label="Compliance & Legal" score={selectedAudit?.compliance_score ? Math.round(selectedAudit.compliance_score / 10) : 5} />
            <ScoreBar label="Issue Resolution" score={selectedAudit?.resolution_score ? Math.round(selectedAudit.resolution_score / 10) : 7} />
            <ScoreBar label="Professionalism" score={8} />
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-brand-border">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Compliance Violations</p>
            <span className={cn(
              "text-[10px] font-black px-2 py-0.5 rounded",
              selectedAudit.violations.length > 0 ? "bg-brand-red/10 text-brand-red" : "bg-brand-green/10 text-brand-green"
            )}>
              {selectedAudit.violations.length} Detected
            </span>
          </div>

          <div className="space-y-3">
            {selectedAudit.violations.length > 0 ? (
              selectedAudit.violations.map((v, i) => (
                <div key={i} className="bg-brand-card border border-brand-border p-4 rounded-xl group hover:border-brand-accent/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-text-primary">{v.type}</p>
                    <span className={cn(
                      "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                      v.severity === 'Critical' ? "bg-brand-red/10 text-brand-red" : "bg-brand-accent/10 text-brand-accent"
                    )}>
                      {v.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">{v.description}</p>
                  <p className="text-[8px] text-text-secondary opacity-60 mt-2 font-mono uppercase tracking-tighter">Line {v.transcript_line_index + 1}</p>
                </div>
              ))
            ) : (
              <div className="bg-brand-green/5 border border-brand-green/10 p-4 rounded-xl text-center">
                <p className="text-[10px] text-brand-green font-bold uppercase tracking-widest">No violations found</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-brand-border">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Call Metadata</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-bg/50 p-3 rounded-xl border border-brand-border/50">
              <p className="text-[8px] font-black uppercase text-text-secondary opacity-60 mb-1">Agent ID</p>
              <p className="text-xs font-bold text-text-primary">#{selectedAudit.agent_id + 400}</p>
            </div>
            <div className="bg-brand-bg/50 p-3 rounded-xl border border-brand-border/50">
              <p className="text-[8px] font-black uppercase text-text-secondary opacity-60 mb-1">Duration</p>
              <p className="text-xs font-bold text-text-primary">{formatTime(duration)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
