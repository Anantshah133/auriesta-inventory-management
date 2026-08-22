import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  Factory,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/auriesta-logo-without-bg.png';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/products', icon: <Package className="w-5 h-5" />, label: 'Products' },
  { to: '/categories', icon: <Tag className="w-5 h-5" />, label: 'Categories' },
  { to: '/manufacturers', icon: <Factory className="w-5 h-5" />, label: 'Manufacturers' },
];

// Page title from path
function usePageTitle() {
  const location = useLocation();
  const path = location.pathname;
  if (path.startsWith('/products/add')) return 'Add Product';
  if (path.match(/\/products\/\d+\/edit/)) return 'Edit Product';
  if (path === '/products') return 'Products';
  if (path.startsWith('/categories/add')) return 'Add Category';
  if (path === '/categories') return 'Categories';
  if (path.startsWith('/manufacturers/add')) return 'Add Manufacturer';
  if (path === '/manufacturers') return 'Manufacturers';
  return 'Dashboard';
}

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const pageTitle = usePageTitle();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Breadcrumb segments
  const segments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label =
      seg === 'add' ? 'Add' :
      /^\d+$/.test(seg) ? '#' + seg :
      seg === 'edit' ? 'Edit' :
      seg.charAt(0).toUpperCase() + seg.slice(1);
    return { label, path };
  });

  return (
    <div className="sidebar-layout">
      {/* ── SIDEBAR OVERLAY (mobile) ── */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay sidebar-overlay-visible fixed inset-0 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <img
            src={logo}
            alt="Auriesta"
            className="h-8 w-auto object-contain flex-shrink-0"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-white font-bold text-sm leading-tight truncate">Auriesta</h1>
            <p className="text-white/50 text-[10px] truncate">Inventory management</p>
          </div>
          {/* Mobile close button */}
          <button
            className="ml-auto text-white/70 hover:text-white md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <p className="px-6 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">
            Main Menu
          </p>
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'nav-item-active' : ''}`
                  }
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-30" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom: User info + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">AD</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">Admin</p>
              <p className="text-white/50 text-[10px] truncate">admin@auriesta.in</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="nav-item w-full text-red-300 hover:text-red-200 hover:bg-red-900/30"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="flex items-center h-16 px-6 gap-4">
            {/* Hamburger (mobile) */}
            <button
              className="md:hidden text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page title + breadcrumb */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-gray-900 truncate">{pageTitle}</h2>
              {breadcrumbs.length > 1 && (
                <nav className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  {breadcrumbs.map((crumb, i) => (
                    <React.Fragment key={crumb.path}>
                      {i > 0 && <ChevronRight className="w-3 h-3" />}
                      <span className={i === breadcrumbs.length - 1 ? 'text-gray-600' : ''}>
                        {crumb.label}
                      </span>
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </button>
              <div className="w-8 h-8 rounded-full bg-[#07393b] flex items-center justify-center">
                <span className="text-white text-xs font-semibold">AD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
