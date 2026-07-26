import { Outlet } from 'react-router-dom';
import { HiShieldCheck } from 'react-icons/hi2';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-surface-50 via-white to-beige-50 relative overflow-hidden">
      {/* Subtle background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-100/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-beige-200/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-50/20 blur-3xl" />
      </div>

      {/* Top brand bar */}
      <header className="relative z-10 flex items-center justify-center py-8 px-4">
        <div className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
            <HiShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-wider text-primary-950">
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
