import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HiShieldCheck,
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentList,
  HiOutlineCircleStack,
  HiOutlineExclamationTriangle,
  HiOutlineChartBarSquare,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineArrowRightOnRectangle,
  HiOutlineLink,
  HiXMark,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: HiOutlineHome },
  { label: 'Students', path: '/admin/students', icon: HiOutlineUsers },
  { label: 'Data', path: '/admin/data', icon: HiOutlineCircleStack },
  { label: 'Batches', path: '/admin/batches', icon: HiOutlineAcademicCap },
  { label: 'Employee Entries', path: '/admin/submissions', icon: HiOutlineClipboardDocumentList },
  { label: 'Fraud Reports', path: '/admin/fraud-reports', icon: HiOutlineExclamationTriangle },
  { label: 'Analytics', path: '/admin/analytics', icon: HiOutlineChartBarSquare },
  { label: 'Manage Employees', path: '/admin/employees', icon: HiOutlineUserGroup },
];

const employeeNavItems = [
  { label: 'Dashboard', path: '/employee/dashboard', icon: HiOutlineHome },
  { label: 'My Submissions', path: '/employee/submissions', icon: HiOutlineDocumentText },
];

const roleColors = {
  admin: 'bg-indigo-500',
  employee: 'bg-emerald-500',
};

const roleBadgeStyles = {
  admin: 'bg-indigo-500/20 text-indigo-300',
  employee: 'bg-emerald-500/20 text-emerald-300',
};

export default function Sidebar({ isCollapsed, onToggleCollapse, isOpen, onToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = user?.role === 'admin' ? adminNavItems : employeeNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-primary-950 border-r border-white/5
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 flex-shrink-0">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <HiShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span
              className={`
                text-lg font-bold tracking-wider text-beige-300
                transition-all duration-300 whitespace-nowrap
                ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
              `}
            >
              JENOVATE
            </span>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary-950 border border-white/10 items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all duration-200 shadow-lg z-10"
        >
          {isCollapsed ? (
            <HiOutlineChevronRight className="w-3.5 h-3.5" />
          ) : (
            <HiOutlineChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Close mobile sidebar on navigation
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 relative overflow-hidden
                  ${
                    isActive
                      ? 'bg-white/10 text-beige-300 border-l-[3px] border-beige-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
                  }
                `}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Active indicator glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
                )}

                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200
                    ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                  `}
                />

                <span
                  className={`
                    text-sm font-medium whitespace-nowrap transition-all duration-300
                    ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Share Registration Link (Employee only) */}
        {user?.role === 'employee' && (
          <div className={`flex-shrink-0 px-3 pb-2 ${isCollapsed ? 'px-2' : ''}`}>
            <button
              onClick={() => {
                const regUrl = `${window.location.origin}/student/register`;
                navigator.clipboard.writeText(regUrl).then(() => {
                  toast.success('Registration link copied to clipboard!');
                }).catch(() => {
                  // Fallback: select and copy
                  const textArea = document.createElement('textarea');
                  textArea.value = regUrl;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  toast.success('Registration link copied!');
                });
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20
                border border-indigo-500/20 hover:border-indigo-500/30
                transition-all duration-200 group
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Copy Student Registration Link' : undefined}
              id="copy-registration-link-btn"
            >
              <HiOutlineLink className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
              <span
                className={`
                  text-xs font-semibold whitespace-nowrap transition-all duration-300
                  ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}
                `}
              >
                Copy Registration Link
              </span>
            </button>
          </div>
        )}

        {/* User Info Section */}
        <div className="flex-shrink-0 border-t border-white/10 p-3">
          <div
            className={`
              flex items-center gap-3 p-2 rounded-xl bg-white/5
              transition-all duration-300
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            {/* Avatar */}
            <div
              className={`
                flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold
                ${roleColors[user?.role] || 'bg-gray-500'}
                shadow-lg
              `}
            >
              {userInitial}
            </div>

            {/* User details */}
            <div
              className={`
                flex-1 min-w-0 transition-all duration-300
                ${isCollapsed ? 'hidden' : 'block'}
              `}
            >
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'User'}
              </p>
              <span
                className={`
                  inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide
                  ${roleBadgeStyles[user?.role] || 'bg-gray-500/20 text-gray-300'}
                `}
              >
                {user?.role || 'user'}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className={`
                flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10
                transition-colors duration-200
                ${isCollapsed ? 'hidden' : 'block'}
              `}
              title="Logout"
            >
              <HiOutlineArrowRightOnRectangle className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Collapsed logout button */}
          {isCollapsed && (
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
              title="Logout"
            >
              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
