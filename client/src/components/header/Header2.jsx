import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiBookOpen, FiBriefcase, FiHome, FiInfo, FiLogOut, FiMail, FiSettings, FiUser } from 'react-icons/fi';
import LanguageSwitcher from '../languageSwitcher/LanguageSwitcher';
import NotificationBell from '../notifications/NotificationBell';
import ConfirmLogoutModal from '../dashboard/ConfirmLogoutModal';
import { getDashboardHome, getProfilePath, getSettingsPath } from '../dashboard/dashboardNavigation';
import useLogout from '../../hooks/useLogout';
import UserAvatar from '../ui/UserAvatar';

import { useTranslation } from 'react-i18next';

const linkClass = (isActive) =>
  `px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
    isActive
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
      : 'text-gray-700 hover:text-white hover:bg-gray-800'
  }`;

export default function Header2() {
  const { t } = useTranslation();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const { logout, isLoggingOut } = useLogout();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileMenuRef = useRef(null);

  const navLinks = [
    { to: '/', labelKey: 'nav.home', icon: <FiHome /> },
    { to: '/about', labelKey: 'nav.about', icon: <FiInfo /> },
    { to: '/jobs', labelKey: 'nav.jobs', icon: <FiBriefcase /> },
    { to: '/blogs', labelKey: 'nav.blogs', icon: <FiBookOpen /> },
    { to: '/contact', labelKey: 'nav.contact', icon: <FiMail /> },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname, location.search]);

  const requestLogout = () => {
    setProfileMenuOpen(false);
    setMenuOpen(false);
    setLogoutOpen(true);
  };

  const username = user?.username || user?.fullName || user?.email?.split('@')[0] || 'User';
  const userNavLinks = user
    ? [
        { to: getDashboardHome(user.role), labelKey: 'common.dashboard', icon: <FiHome /> },
        { to: getProfilePath(user.role), labelKey: 'common.profile', icon: <FiUser /> },
        { to: getSettingsPath(user.role), labelKey: 'settings.title', icon: <FiSettings /> }
      ]
    : [];

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-200 ${
        scrolled ? 'bg-white/90 backdrop-blur-md border-gray-200 shadow-sm' : 'bg-white border-transparent'
      }`}
    >
      <nav className="mx-auto w-full max-w-[1400px] px-3 sm:px-4 lg:px-6 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => linkClass(isActive)}>
                <span className="text-base">{link.icon}</span>
                {t(link.labelKey)}
              </NavLink>
              
            ))}
             <LanguageSwitcher compact />
          </div>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {user && (
              <div className="rounded-lg border border-gray-200 bg-white">
                <NotificationBell />
              </div>
            )}

           

            {user ? (
              <div className="relative hidden md:block" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-3 px-2.5 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all"
                >
                  <UserAvatar user={user} className="h-8 w-8 text-sm" />
                  <span className="text-sm font-medium text-gray-700 hidden lg:block">{username}</span>
                </button>

                {profileMenuOpen && (
                  <div
                    className="absolute mt-2 w-[min(16rem,calc(100vw-1rem))] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fadeIn"
                    style={{ insetInlineEnd: 0 }}
                  >
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <p className="font-semibold truncate">{username}</p>
                      <p className="text-sm text-blue-100 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      {userNavLinks.map((link) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                          {link.icon}
                          <span>{t(link.labelKey)}</span>
                        </NavLink>
                      ))}
                      <button
                        onClick={requestLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <FiLogOut />
                        <span>{t('common.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <NavLink to="/login" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                  {t('nav.login')}
                </NavLink>
                <NavLink to="/register" className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg">
                  {t('nav.register')}
                </NavLink>
              </div>
            )}

            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={t('nav.toggleNavigation')}
            >
              {menuOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        <div
          aria-hidden={!menuOpen}
          className={`md:hidden fixed inset-x-0 top-[3.5rem] bottom-0 z-50 bg-gray-900/95 backdrop-blur-sm transition-all duration-300 ${
            menuOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
          }`}
        >
          <div className="h-full overflow-y-auto px-4 py-5 pb-20">
            {user && (
              <div className="mb-5 p-4 rounded-xl bg-white/10 border border-white/20">
                <p className="text-white font-semibold truncate">{username}</p>
                <p className="text-blue-100 text-sm truncate">{user.email}</p>
              </div>
            )}

            <div className="space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive ? 'bg-blue-600 text-white' : 'text-gray-100 hover:bg-white/10'
                    }`
                  }
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{t(link.labelKey)}</span>
                </NavLink>
              ))}
            </div>

            <div className="mt-4">
              <LanguageSwitcher compact />
            </div>

            {user ? (
              <div className="mt-6 space-y-1 border-t border-white/20 pt-4">
                {userNavLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-100 rounded-lg hover:bg-white/10"
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{t(link.labelKey)}</span>
                  </NavLink>
                ))}
                <button
                  onClick={requestLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/20"
                >
                  <FiLogOut className="text-lg" />
                        <span>{t('common.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <NavLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center px-4 py-3 rounded-lg bg-blue-600 text-white font-medium"
                >
                  {t('nav.login')}
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center px-4 py-3 rounded-lg border border-white/30 text-white font-medium"
                >
                  {t('nav.register')}
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
      <ConfirmLogoutModal
        isOpen={logoutOpen}
        isLoggingOut={isLoggingOut}
        onClose={() => setLogoutOpen(false)}
        onConfirm={logout}
      />
    </header>
  );
}
