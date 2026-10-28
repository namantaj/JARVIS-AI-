import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import Dashboard from './pages/Dashboard';
import ResearchExecution from './pages/ResearchExecution';
import History from './pages/History';
import SavedReports from './pages/SavedReports';
import Settings from './pages/Settings';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Compute title based on active path
  const getTitleForRoute = (pathname) => {
    if (pathname === '/') return 'AI Research Workspace';
    if (pathname.startsWith('/research')) return 'Research Execution & Pipeline';
    if (pathname === '/history') return 'Research History';
    if (pathname === '/saved') return 'Saved Reports';
    if (pathname === '/settings') return 'System Settings';
    return 'AI Research Workspace';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#07090E]">
      {/* Sidebar */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          title={getTitleForRoute(location.pathname)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/research/:id" element={<ResearchExecution />} />
            <Route path="/history" element={<History />} />
            <Route path="/saved" element={<SavedReports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
