import { Outlet } from 'react-router-dom';
import { HiShieldCheck } from 'react-icons/hi2';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-ocean-50/30 to-surface-50 relative overflow-hidden">
      {/* Subtle background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-ocean-100/40 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-ocean-200/25 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-ocean-50/30 blur-[150px]" />
      </div>

      {/* Top brand bar */}
      <header className="relative z-10 flex items-center justify-center py-8 px-4">
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center shadow-lg shadow-ocean-600/20 group-hover:shadow-ocean-600/30 transition-shadow duration-300">
            <HiShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-heading font-bold tracking-wide text-ocean-950">
              JENOVATE
            </span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] -mt-0.5">
              Verification System
            </span>
          </div>
        </div>
      </header>

      {/* Centered content area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {children || <Outlet />}
        </div>
      </main>

      {/* Bottom footer */}
      <footer className="relative z-10 py-4 px-4 text-center">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Jenovate Verification System &mdash; Secure. Reliable. Trusted.
        </p>
      </footer>
    </div>
  );
}
