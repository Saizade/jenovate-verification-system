import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HiBars3,
  HiMagnifyingGlass,
  HiBell,
  HiOutlineUser,
  HiOutlineArrowRightOnRectangle,
  HiChevronRight,
  HiXMark,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/students': 'Students',
  '/admin/data': 'Data',
  '/admin/batches': 'Batches',
  '/admin/submissions': 'Employee Entries',
  '/admin/fraud-reports': 'Fraud Reports',
  '/admin/analytics': 'Analytics',
  '/admin/employees': 'Manage Employees',
  '/employee/dashboard': 'Dashboard',
  '/employee/submissions': 'My Submissions',
};

function getBreadcrumb(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [];

  const crumbs = [];
  const roleLabel = segments[0] === 'admin' ? 'Admin' : 'Employee';
  crumbs.push({ label: roleLabel, path: `/${segments[0]}/dashboard` });

  const pageTitle = pageTitles[pathname];
  if (pageTitle && pageTitle !== 'Dashboard') {
    crumbs.push({ label: pageTitle, path: pathname });
  }

  return crumbs;
}

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';
  const breadcrumbs = getBreadcrumb(location.pathname);
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-surface-200/80">
      <div className="flex items-center justify-between h-[60px] px-4 sm:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:text-ocean-950 hover:bg-surface-100 transition-colors duration-150"
            id="mobile-menu-button"
          >
            <HiBars3 className="w-5 h-5" />
          </button>

          {/* Page title + breadcrumb */}
          <div className="flex flex-col">
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.path} className="flex items-center gap-1.5">
                  {index > 0 && <HiChevronRight className="w-3 h-3" />}
                  <Link
                    to={crumb.path}
                    className="hover:text-ocean-600 transition-colors duration-150"
                  >
                    {crumb.label}
                  </Link>
                </span>
              ))}
            </div>

            <h1 className="text-lg font-heading font-bold text-ocean-950 leading-tight">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search input */}
          <div
            className={`
              relative hidden sm:flex items-center transition-all duration-200
              ${isSearchFocused ? 'w-60' : 'w-44'}
            `}
          >
            <HiMagnifyingGlass className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-9 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm text-ocean-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-100 focus:border-ocean-400 focus:bg-white transition-all duration-200"
              id="header-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <HiXMark className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Notification bell */}
          <button
            className="relative p-2 rounded-lg text-gray-500 hover:text-ocean-950 hover:bg-surface-100 transition-colors duration-150"
            id="notification-bell"
            title="Notifications"
          >
            <HiBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* User avatar dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-100 transition-colors duration-150"
              id="user-avatar-dropdown-trigger"
            >
              <div
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold
                  ${user?.role === 'admin' ? 'bg-ocean-600' : 'bg-emerald-600'}
                `}
              >
                {userInitial}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {user?.name || 'User'}
              </span>
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-elevated border border-surface-200 overflow-hidden animate-[scaleIn_0.15s_ease-out] origin-top-right z-50">
                {/* User info header */}
                <div className="px-4 py-3 bg-surface-50 border-b border-surface-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold
                        ${user?.role === 'admin' ? 'bg-ocean-600' : 'bg-emerald-600'}
                      `}
                    >
                      {userInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ocean-950 truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsProfileOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-surface-50 hover:text-ocean-950 transition-colors duration-100"
                    id="dropdown-profile-link"
                  >
                    <HiOutlineUser className="w-4 h-4 text-gray-400" />
                    Profile
                  </button>
                </div>

                <div className="border-t border-surface-100" />

                {/* Logout */}
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-100"
                    id="dropdown-logout-button"
                  >
                    <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isProfileOpen && (
        <Modal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          title="Profile Details"
          size="sm"
        >
          <div className="space-y-6 py-2">
            <div className="flex flex-col items-center text-center">
              <div
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-black mb-3
                  ${user?.role === 'admin' ? 'bg-ocean-600' : 'bg-emerald-600'}
                `}
              >
                {userInitial}
              </div>
              <h3 className="text-lg font-heading font-bold text-gray-900 leading-snug">{user?.name || 'User'}</h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{user?.email || 'user@example.com'}</p>
            </div>

            <div className="bg-surface-50 rounded-xl p-4 border border-surface-200 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">User Role</span>
                {user?.role === 'admin' ? (
                  <Badge variant="info">Administrator</Badge>
                ) : (
                  <Badge variant="neutral">Coordinator</Badge>
                )}
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Account Status</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Platform Access</span>
                <span className="text-gray-700 font-semibold">Enabled</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-surface-100">
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="px-4 py-2 bg-ocean-600 text-white rounded-lg text-xs font-semibold hover:bg-ocean-700 transition-colors duration-150"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </header>
  );
}
