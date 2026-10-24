import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  currentPath?: string;
  onNavigate: (path: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, activePath, currentPath, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const resolvedPath = currentPath || activePath || '/';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        activePath={resolvedPath}
        onNavigate={onNavigate}
      />

      <div className="flex flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePath={resolvedPath}
          onNavigate={onNavigate}
        />

        <main className="flex-1 lg:pl-64 min-w-0 flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
