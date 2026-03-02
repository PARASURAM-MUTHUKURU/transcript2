import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  MessageSquare,
  Phone,
  LayoutDashboard,
  Users,
  History,
  Bell,
  FileAudio,
  Upload,
  Target,
  BookOpen
} from 'lucide-react';
import { auditTranscript, transcribeAudio } from './services/geminiService';
import { Agent, Audit, Analytics } from './types';

// Components
import { NavItem } from './components/NavItem';
import { CallHistorySidebar } from './components/CallHistorySidebar';
import { AuditSidebar } from './components/AuditSidebar';
import { TranscriptView } from './components/TranscriptView';
import { AuditModal } from './components/AuditModal';
import { ReportsView } from './components/ReportsView';
// import { PolicyView } from './components/PolicyView';
import { RAGSearch } from './components/RAGSearch';
import { AgentsDashboard } from './components/AgentsDashboard';
import { LandingPage } from './components/LandingPage';
import { ThemeProvider, ThemeToggle } from './components/ThemeToggle';
import { ToastProvider, useToast } from './components/Toasts';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { showToast } = useToast();
  const [view, setView] = useState<'landing' | 'dashboard' | 'audits' | 'agents' | 'reports' | 'knowledge'>('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);

  // New Audit State
  const [isAuditing, setIsAuditing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);
  const [newAuditData, setNewAuditData] = useState({
    agentId: '',
    transcript: '',
    type: 'call' as 'chat' | 'call',
    audioData: '',
    mimeType: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agentsRes, auditsRes, analyticsRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/audits'),
        fetch('/api/analytics')
      ]);
      const agentsData = await agentsRes.json();
      const auditsData = await auditsRes.json();
      const analyticsData = await analyticsRes.json();

      const parsedAudits = auditsData.map((a: any) => ({
        ...a,
        violations: typeof a.violations === 'string' ? JSON.parse(a.violations) : a.violations
      }));

      setAgents(agentsData);
      setAudits(parsedAudits);
      setAnalytics(analyticsData);

      if (parsedAudits.length > 0 && !selectedAudit) {
        setSelectedAudit(parsedAudits[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    if (!newAuditData.agentId || !newAuditData.transcript) return;
    setIsAuditing(true);
    try {
      const result = await auditTranscript(newAuditData.transcript, newAuditData.type);
      const auditPayload = {
        agent_id: parseInt(newAuditData.agentId),
        transcript: newAuditData.transcript,
        type: newAuditData.type,
        audio_data: newAuditData.audioData,
        mime_type: newAuditData.mimeType,
        ...result,
        suggestions: result.suggestions
      };

      const saveRes = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditPayload)
      });

      await saveRes.json();
      await fetchData();
      setShowNewAuditModal(false);
      setNewAuditData({ agentId: '', transcript: '', type: 'call', audioData: '', mimeType: '' });
      showToast('Audit completed successfully!', 'success');
    } catch (error) {
      console.error("Audit failed:", error);
      showToast('Audit failed. Please try again.', 'error');
    } finally {
      setIsAuditing(false);
    }
  };


  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;
      const text = await transcribeAudio(base64Data, file.type);
      setNewAuditData(prev => ({
        ...prev,
        transcript: text,
        type: 'call',
        audioData: base64Data,
        mimeType: file.type
      }));
      showToast('Transcription completed!', 'success');
    } catch (error) {
      console.error('Transcription error:', error);
      showToast('Transcription failed.', 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-zinc-100 flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 border-b border-brand-border bg-brand-surface flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setView('landing')}>
            <div className="bg-brand-accent p-1.5 rounded-lg shadow-[0_0_15px_rgba(242,125,38,0.3)]">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight">AuditAI</h1>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {view !== 'landing' && (
              <>
                <NavItem icon={MessageSquare} label="Transcript Review" active={view === 'audits'} onClick={() => setView('audits')} />
                <NavItem icon={BookOpen} label="Knowledge Base" active={view === 'knowledge'} onClick={() => setView('knowledge')} />
                <NavItem icon={Users} label="Agents" active={view === 'agents'} onClick={() => setView('agents')} />
                <NavItem icon={History} label="Reports" active={view === 'reports'} onClick={() => setView('reports')} />
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-red text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-brand-surface">
              3
            </span>
          </button>
          <ThemeToggle />
          <div className="w-8 h-8 rounded-lg bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-brand-accent font-bold text-xs">
            SQ
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {view === 'landing' ? (
          <LandingPage onGetStarted={() => setView('audits')} />
        ) : view === 'audits' ? (
          <>
            <CallHistorySidebar
              audits={audits}
              selectedAudit={selectedAudit}
              setSelectedAudit={setSelectedAudit}
              setShowNewAuditModal={setShowNewAuditModal}
              collapsed={sidebarCollapsed}
              setCollapsed={setSidebarCollapsed}
              loading={loading}
            />

            {/* Right Side: Information (Audit Details + Transcript) */}
            <section className="flex-1 flex overflow-hidden">
              {selectedAudit ? (
                <>
                  <AuditSidebar selectedAudit={selectedAudit} />
                  <TranscriptView
                    selectedAudit={selectedAudit}
                    onUploadClick={() => setShowNewAuditModal(true)}
                  />
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-6">
                  <div className="p-8 bg-brand-surface rounded-full border border-brand-border shadow-xl">
                    <FileAudio size={64} className="opacity-20" />
                  </div>
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <p className="font-display font-bold text-lg text-zinc-400">No Recording Selected</p>
                      <p className="text-sm text-zinc-600">Select a call from the history or upload a new one</p>
                    </div>
                    <button
                      onClick={() => setShowNewAuditModal(true)}
                      className="px-6 py-2.5 bg-brand-accent text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-brand-accent/90 transition-all flex items-center gap-2 mx-auto"
                    >
                      <Upload size={16} />
                      Upload Audio
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        ) : view === 'reports' ? (
          <ReportsView analytics={analytics} audits={audits} />
        ) : view === 'knowledge' ? (
          <RAGSearch />
        ) : view === 'agents' ? (
          <AgentsDashboard analytics={analytics} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            <p className="font-display font-bold text-lg">Coming Soon: {view.charAt(0).toUpperCase() + view.slice(1)} View</p>
          </div>
        )}
      </main>

      <AuditModal
        show={showNewAuditModal}
        onClose={() => setShowNewAuditModal(false)}
        agents={agents}
        newAuditData={newAuditData}
        setNewAuditData={setNewAuditData}
        handleAudioUpload={handleAudioUpload}
        handleRunAudit={handleRunAudit}
        isTranscribing={isTranscribing}
        isAuditing={isAuditing}
      />
    </div>
  );
}
