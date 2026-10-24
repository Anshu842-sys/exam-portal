import React from 'react';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

interface UnauthorizedPageProps {
  onNavigateHome?: () => void;
  onGoBack?: () => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ onNavigateHome, onGoBack }) => {
  const { user } = useAuth();
  const handleReturn = onNavigateHome || onGoBack || (() => window.history.back());

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/30">
        <ShieldX className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-white">Access Denied (403 Unauthorized)</h2>
      <p className="text-xs text-slate-400 max-w-md leading-relaxed">
        Your authenticated account role (<span className="text-cyan-400 font-mono">{user?.role}</span>) does not possess clearance to inspect or modify this restricted Examination Cell module.
      </p>
      <Button variant="cyan" size="md" icon={ArrowLeft} onClick={handleReturn}>
        Return to Authorized Dashboard
      </Button>
    </div>
  );
};
