import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-collapse sidebar on medium screens
  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width < 1024) {
        setIsMobileOpen(false);
      }
      if (width < 1280 && width >= 1024) {
        setIsCollapsed(true);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const toggleMobile = () => setIsMobileOpen((prev) => !prev);

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        isOpen={isMobileOpen}
        onToggle={toggleMobile}
      />

      {/* Main content area */}
      <div
        className={`
          flex flex-col min-h-screen transition-all duration-300 ease-in-out
          lg:ml-${isCollapsed ? '20' : '64'}
        `}
        style={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024
            ? isCollapsed ? '5rem' : '16rem'
            : '0',
        }}
      >
        {/* Header */}
        <Header onMenuClick={toggleMobile} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 px-6 py-4 border-t border-surface-200 bg-white/50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <p>&copy; {new Date().getFullYear()} Jenovate Verification System. All rights reserved.</p>
            <p>v1.0.0</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
