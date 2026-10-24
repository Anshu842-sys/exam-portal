import React, { useState } from 'react';
import { Database, ShieldCheck, Settings, CheckCircle2, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getStoredSupabaseConfig, saveSupabaseConfig } from '../../lib/supabase';
import { db } from '../../lib/databaseService';
import { Modal } from './Modal';
import { Button } from './Button';
import { FormInput } from './FormInput';

export const ConnectionBadge: React.FC = () => {
  const { isDemoMode, supabaseConnected, checkConnection } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState(() => getStoredSupabaseConfig().url);
  const [key, setKey] = useState(() => getStoredSupabaseConfig().key);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestStatus(null);
    saveSupabaseConfig(url, key);
    const connected = await checkConnection();
    setIsTesting(false);
    if (connected) {
      setTestStatus('Successfully connected to Supabase PostgreSQL!');
      setTimeout(() => setIsModalOpen(false), 1200);
    } else {
      setTestStatus('Saved configuration. Could not connect yet (verify table schemas).');
    }
  };

  const handleReset = () => {
    if (confirm('Reset examination database to pristine seed demo data?')) {
      db.resetToDefault();
      window.location.reload();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono transition-all duration-200 border bg-slate-900/80 hover:bg-slate-800"
        title="Database Engine Status"
      >
        <div className="relative flex items-center justify-center">
          <span
            className={`w-2 h-2 rounded-full ${
              supabaseConnected ? 'bg-emerald-400' : 'bg-cyan-400'
            }`}
          />
          <span
            className={`absolute w-3 h-3 rounded-full opacity-75 animate-ping ${
              supabaseConnected ? 'bg-emerald-400' : 'bg-cyan-400'
            }`}
          />
        </div>
        <span className="text-slate-300">
          {supabaseConnected ? 'Supabase Live' : 'PostgreSQL Local'}
        </span>
        <Settings className="w-3.5 h-3.5 text-slate-400" />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Database & Storage Architecture"
        subtitle="Supabase PostgreSQL client configuration & demo state"
        maxWidth="lg"
      >
        <div className="space-y-5 text-xs text-slate-300">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start gap-3">
            <Database className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-100">
                Current Status:{' '}
                <span className={supabaseConnected ? 'text-emerald-400' : 'text-cyan-400'}>
                  {supabaseConnected ? 'Connected to Supabase PostgreSQL' : 'Local Reactive PostgreSQL Simulation'}
                </span>
              </p>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                The application runs seamlessly with full relational integrity, foreign keys, and constraints. When valid Supabase credentials are provided, queries execute against live PostgreSQL.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <FormInput
              label="Supabase Project URL"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://xyzproject.supabase.co"
              helperText="Set via VITE_SUPABASE_URL in .env or configure here"
            />
            <FormInput
              label="Supabase Anon Public API Key"
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              helperText="Set via VITE_SUPABASE_ANON_KEY in .env"
            />

            {testStatus && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  testStatus.includes('Successfully')
                    ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
                    : 'border-amber-800 bg-amber-950/40 text-amber-300'
                }`}
              >
                {testStatus.includes('Successfully') ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{testStatus}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={handleReset}
                className="text-slate-400 hover:text-rose-400"
              >
                Reset Demo Data
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                <Button type="submit" variant="cyan" size="sm" isLoading={isTesting}>
                  Save & Connect
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};
