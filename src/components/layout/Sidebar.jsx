import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Truck, Factory,
  FileText, Warehouse, RefreshCw, ClipboardList, Users, Settings,
  LogOut, ChevronLeft, ChevronRight, Monitor, CheckSquare, MapPin, CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_SECTIONS = [
  {
    section: null,
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
    ]
  },
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Products', path: '/products', icon: Package, module: 'products', action: 'view' },
      { label: 'Sales', path: '/sales', icon: ShoppingCart, module: 'sales', action: 'view' },
      { label: 'Purchase', path: '/purchase', icon: Truck, module: 'purchase', action: 'view' },
      { label: 'Manufacturing', path: '/manufacturing', icon: Factory, module: 'manufacturing', action: 'view' },
      { label: 'Bill of Materials', path: '/bom', icon: FileText, module: 'bom', action: 'view' },
      { label: 'Inventory', path: '/inventory', icon: Warehouse, module: 'inventory', action: 'view' },
      { label: 'Procurement', path: '/procurement', icon: RefreshCw, module: 'procurement', action: 'view' },
      { label: 'Quality', path: '/quality', icon: CheckSquare, module: 'quality', action: 'view' },
      { label: 'Delivery', path: '/delivery', icon: MapPin, module: 'delivery', action: 'view' },
      { label: 'Finance & Invoices', path: '/finance', icon: CreditCard, module: 'finance', action: 'view' },
    ]
  },
  {
    section: 'ADMINISTRATION',
    items: [
      { label: 'Audit Logs', path: '/audit-logs', icon: ClipboardList, module: 'audit' },
      { label: 'Users', path: '/users', icon: Users, module: 'users' },
      { label: 'Settings', path: '/settings', icon: Settings, module: 'settings' },
    ]
  }
];

export default function Sidebar({ isCollapsed, onToggle }) {
  const { currentUser, hasPermission, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo / Brand */}
      <div className="sidebar__brand">
        {isCollapsed ? (
          <span className="sidebar__brand-icon">SFW</span>
        ) : (
          <div className="sidebar__brand-full">
            <span className="sidebar__brand-name">Shiv Furniture Works</span>
            <span className="sidebar__brand-sub">Mini ERP</span>
          </div>
        )}
        <button
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav" role="navigation" aria-label="Main navigation">
        {NAV_SECTIONS.map((section, si) => {
          const visibleItems = section.items.filter(item =>
            hasPermission(item.module, item.action || 'full')
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={si} className="sidebar__section">
              {section.section && !isCollapsed && (
                <div className="sidebar__section-label">{section.section}</div>
              )}
              {visibleItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar__link ${isActive ? 'sidebar__link--active' : ''} ${isCollapsed ? 'sidebar__link--collapsed' : ''}`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="sidebar__link-icon" />
                    {!isCollapsed && <span className="sidebar__link-label">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom: Demo Mode + Logout */}
      <div className="sidebar__footer">
        {!isCollapsed && (
          <div className="sidebar__demo-badge">
            <Monitor size={12} />
            <span>Demo Mode</span>
            <span className="sidebar__demo-sub">Local Browser Storage</span>
          </div>
        )}
        <button
          className={`sidebar__logout ${isCollapsed ? 'sidebar__logout--collapsed' : ''}`}
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
