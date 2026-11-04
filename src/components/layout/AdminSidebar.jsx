import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import {
  FileText,
  LayoutGrid,
  Users,
  ImageIcon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Newspaper,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Logout from '@/components/layout/Logout';

export const NAV_ITEMS = [
  {
    label: 'Categories',
    to: '/admin/categories',
    icon: LayoutGrid,
  },
  {
    label: 'News',
    to: '/admin/news',
    icon: FileText,
  },
  {
    label: 'Team',
    to: '/admin/team',
    icon: Users,
    superAdminOnly: true,
  },
  {
    label: 'Banner',
    to: '/admin/banners',
    icon: ImageIcon,
  },
];

function getStoredAdmin() {
  try {
    const stored = localStorage.getItem('adminUser');

    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function isSuperAdmin() {
  const admin = getStoredAdmin();

  return String(admin?.role || '').toLowerCase() === 'super_admin';
}

export default function AdminSidebar({ user, onNavigate }) {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const storedAdmin = getStoredAdmin();
  const currentUser = user || storedAdmin;

  const userName = currentUser?.name || 'Admin';
  const userRole = currentUser?.role || 'admin';

  const superAdmin = String(userRole).toLowerCase() === 'super_admin';

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.superAdminOnly || superAdmin);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('adminUser');

    setMobileMenuOpen(false);

    onNavigate?.();

    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const renderNavItem = (item, mobile = false) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={mobile ? closeMobileMenu : undefined}
        className={({ isActive }) =>
          [
            'group flex items-center gap-3 rounded-xl font-medium transition-all duration-200',
            mobile ? 'px-3 py-3 text-sm' : 'relative px-4 py-3 text-sm',
            isActive
              ? 'bg-white text-[#2168CD] shadow-sm'
              : 'text-white/80 hover:bg-white/10 hover:text-white',
          ].join(' ')
        }>
        {({ isActive }) => (
          <>
            <Icon
              className={`size-5 shrink-0 ${
                isActive ? 'text-[#2168CD]' : 'text-white/80 group-hover:text-white'
              }`}
            />

            <span>{item.label}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="
          fixed left-0 top-0 z-50 hidden h-screen w-[250px]
          flex-col overflow-hidden bg-[#2168CD]
          font-['Manrope',sans-serif] text-white
          xl:flex 2xl:w-[270px]
        ">
        {/* Desktop Header */}
        <div
          className="
            shrink-0 border-b border-white/15
            px-5 py-6 2xl:px-6 2xl:py-7
          ">
          <h1
            className="
              font-['Mukta',sans-serif]
              text-[25px] font-semibold leading-none
              tracking-tight 2xl:text-[30px]
            ">
            मनरा शिस्वा खबर
          </h1>

          <div className="mt-3 flex flex-col items-start gap-2">
            <span className="text-[13px] font-medium text-white/80 2xl:text-[15px]">
              Editor Panel
            </span>

            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#FFE797]" />

              <Badge
                variant="secondary"
                className="
                  rounded-full border-0 bg-[#FFE797]
                  px-2.5 py-1 text-[10px] font-semibold
                  text-[#635400] hover:bg-[#FFE797]
                  2xl:px-3 2xl:text-xs
                ">
                {superAdmin ? 'Super Admin' : 'Admin'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <nav
            aria-label="Admin navigation"
            className="
              flex flex-col gap-1.5 px-4 py-5
              2xl:gap-2 2xl:px-5 2xl:py-7
            ">
            {visibleNavItems.map((item) => renderNavItem(item))}
          </nav>
        </div>

        {/* Desktop User / Logout */}
        <div
          className="
            shrink-0 border-t border-white/15
            bg-[#2168CD] px-4 py-4
            2xl:px-5 2xl:py-5
          ">
          <div className="flex items-center gap-3">
            <Avatar
              className="
                size-10 shrink-0 border
                border-white/20 bg-white
                2xl:size-11
              ">
              <AvatarFallback
                className="
                  bg-white text-base font-bold
                  text-[#1D4ED8] 2xl:text-lg
                ">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold 2xl:text-sm">{userName}</p>

              <Button
                type="button"
                variant="ghost"
                onClick={handleLogout}
                className="
                  mt-1 h-auto w-fit gap-1 p-0
                  text-[11px] font-medium text-white/75
                  hover:bg-transparent hover:text-white
                  2xl:text-xs
                ">
                <LogOut className="size-3.5 2xl:size-4" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div
        className="
          sticky top-0 z-30 flex h-16 items-center
          justify-between border-b border-slate-200
          bg-white/95 px-4 backdrop-blur
          sm:px-5 xl:hidden
        ">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open admin menu"
          className="
            flex size-10 items-center justify-center
            rounded-xl border border-slate-200
            bg-white text-slate-700 shadow-sm
            transition hover:bg-slate-50
            active:scale-95
          ">
          <Menu className="size-5" />
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <ShieldCheck className="size-5 shrink-0 text-[#2168CD]" />

          <span className="truncate text-sm font-semibold text-slate-800 sm:text-base">
            {superAdmin ? 'Super Admin' : 'Admin'}
          </span>
        </div>

        <div className="size-10" />
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={closeMobileMenu}
          className="
            fixed inset-0 z-40
            bg-slate-950/45
            backdrop-blur-[2px]
            xl:hidden
          "
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[280px] max-w-[85vw]
          flex-col overflow-hidden
          bg-[#2168CD]
          font-['Manrope',sans-serif]
          text-white shadow-2xl
          transition-transform duration-300 ease-out
          xl:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
        {/* Mobile Header */}
        <div
          className="
            flex h-16 shrink-0 items-center
            justify-between border-b border-white/15
            px-4 sm:px-5
          ">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="
                flex size-9 shrink-0
                items-center justify-center
                rounded-xl bg-white
                text-[#2168CD]
              ">
              <Newspaper className="size-5" />
            </div>

            <div className="min-w-0">
              <span className="block truncate font-bold text-white">Admin</span>

              <span className="block text-[11px] text-white/70">
                {superAdmin ? 'Super Admin' : 'Administrator'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close admin menu"
            className="
              flex size-9 shrink-0
              items-center justify-center
              rounded-lg text-white/80
              transition hover:bg-white/10
              hover:text-white
              active:scale-95
            ">
            <X className="size-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav
          aria-label="Admin navigation"
          className="
            min-h-0 flex-1
            overflow-y-auto
            overscroll-contain
            p-3 sm:p-4
          ">
          <div className="space-y-1">
            {visibleNavItems.map((item) => renderNavItem(item, true))}
          </div>
        </nav>

        {/* Mobile Logout Section */}
        <div
          className="
            shrink-0 border-t border-white/20
            bg-[#2168CD] p-4 sm:p-5
          ">
          <div className="flex items-center gap-3">
            <Avatar
              className="
                size-10 shrink-0
                border border-white/20
                bg-white
              ">
              <AvatarFallback
                className="
                  bg-white font-bold
                  text-[#2168CD]
                ">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{userName}</p>

              <p className="truncate text-[11px] text-white/65">
                {superAdmin ? 'Super Administrator' : 'Administrator'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="
              mt-4 flex w-full
              items-center justify-center
              gap-2 rounded-xl
              border border-white/20
              bg-white/10
              px-4 py-2.5
              text-sm font-medium text-white
              transition hover:bg-white/20
              active:scale-[0.98]
            ">
            <Logout />
          </button>
        </div>
      </aside>
    </>
  );
}
