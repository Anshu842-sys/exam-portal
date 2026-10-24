import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User as UserIcon,
  ShieldAlert,
  ArrowRight,
  Database,
  Sparkles,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';
import { ConnectionBadge } from '../../components/common/ConnectionBadge';

interface LoginPageProps {
  onSuccess?: (role: string) => void;
  onLoginSuccess?: () => void;
  sessionExpired?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onLoginSuccess, sessionExpired }) => {
  const { login, isLoading, user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    const res = await login(username.trim(), password);
    if (res.success) {
      // Role redirection is triggered
    } else {
      setError(res.error || 'Invalid username or password.');
    }
  };

  const handleFillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Connection Badge */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ConnectionBadge />
      </div>

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 shadow-xl shadow-cyan-500/25 mb-2">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Exam Cell Management System
          </h1>
          <p className="text-xs text-slate-400">
            University Examination Scheduling, Marks Processing & Results Portal
          </p>
        </div>

        {/* Session Expired Notice if applicable */}
        {sessionExpired && (
          <div className="p-3 rounded-xl border border-amber-800 bg-amber-950/40 text-amber-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Your session has expired. Please sign in again to continue.</span>
          </div>
        )}

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-cyan-950/20 space-y-5">
          {error && (
            <div className="p-3 rounded-xl border border-rose-800/80 bg-rose-950/40 text-rose-300 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Username"
              icon={UserIcon}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. admin, faculty1, student1"
              required
              autoFocus
            />

            <FormInput
              label="Password"
              icon={Lock}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="cyan"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In to Exam Portal
            </Button>
          </form>

          {/* Quick Demo Credentials Selector */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin', 'admin123')}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-cyan-500/50 text-left transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">ADMIN</span>
                </div>
                <p className="text-[11px] font-mono text-slate-300">admin</p>
                <p className="text-[9px] text-slate-500 font-mono">admin123</p>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('faculty1', 'faculty123')}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-cyan-500/50 text-left transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">FACULTY</span>
                </div>
                <p className="text-[11px] font-mono text-slate-300">faculty1</p>
                <p className="text-[9px] text-slate-500 font-mono">faculty123</p>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('student1', 'student123')}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-cyan-500/50 text-left transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-teal-400 font-bold uppercase">STUDENT</span>
                </div>
                <p className="text-[11px] font-mono text-slate-300">student1</p>
                <p className="text-[9px] text-slate-500 font-mono">student123</p>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Academic Disclaimer Footer */}
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-3 text-[11px] text-slate-400 leading-relaxed text-center space-y-1">
          <p className="text-slate-300 font-medium">College Capstone Prototype Authentication System</p>
          <p>
            This demo authenticates directly against the PostgreSQL <code className="text-cyan-400">users</code> table with SHA-256 client verification and restricted user projections. Password hashes are never returned to the frontend.
          </p>
        </div>
      </div>
    </div>
  );
};
