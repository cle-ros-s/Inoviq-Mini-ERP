import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, Search, Bell, User, LogOut, Settings, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { getCollection } from '../../data/storage.js';

function useGlobalSearch(query) {
  const [results, setResults] = useState({});

  useEffect(() => {
    if (!query || query.trim().length < 2) { setResults({}); return; }
    const q = query.toLowerCase().trim();

    const products = getCollection('products').filter(p =>
      p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
    ).slice(0, 4);

    const salesOrders = getCollection('salesOrders').filter(o =>
      o.id?.toLowerCase().includes(q)
    ).slice(0, 4);

    const purchaseOrders = getCollection('purchaseOrders').filter(o =>
      o.id?.toLowerCase().includes(q)
    ).slice(0, 4);

    const manufacturingOrders = getCollection('manufacturingOrders').filter(o =>
      o.id?.toLowerCase().includes(q)
    ).slice(0, 4);

    const boms = getCollection('boms').filter(b => {
      const p = getCollection('products').find(pr => pr.id === b.productId);
      return b.id?.toLowerCase().includes(q) || p?.name?.toLowerCase().includes(q);
    }).slice(0, 4);

    const customers = getCollection('customers').filter(c =>
      c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    ).slice(0, 4);

    const vendors = getCollection('vendors').filter(v =>
      v.name?.toLowerCase().includes(q) || v.email?.toLowerCase().includes(q)
    ).slice(0, 4);

    const next = {};
    if (products.length) next.Products = products.map(p => ({ id: p.id, label: p.name, sub: p.sku, path: `/products/${p.id}` }));
    if (salesOrders.length) next['Sales Orders'] = salesOrders.map(o => ({ id: o.id, label: o.id, sub: o.customerId, path: `/sales/${o.id}` }));
    if (purchaseOrders.length) next['Purchase Orders'] = purchaseOrders.map(o => ({ id: o.id, label: o.id, path: `/purchase/${o.id}` }));
    if (manufacturingOrders.length) next['Manufacturing Orders'] = manufacturingOrders.map(o => ({ id: o.id, label: o.id, path: `/manufacturing/${o.id}` }));
    if (boms.length) next['Bills of Materials'] = boms.map(b => ({ id: b.id, label: b.id, path: `/bom/${b.id}` }));
    if (customers.length) next.Customers = customers.map(c => ({ id: c.id, label: c.name, sub: c.email, path: `/sales` }));
    if (vendors.length) next.Vendors = vendors.map(v => ({ id: v.id, label: v.name, sub: v.email, path: `/purchase` }));
    setResults(next);
  }, [query]);

  return results;
}

export default function Header({ onMenuClick, onMobileMenuClick }) {
  const { currentUser, logout } = useAuth();
  const { notifications, unreadCount, isOpen, togglePanel, closePanel, markAllRead } = useNotifications();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchResults = useGlobalSearch(searchQuery);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  const hasResults = Object.keys(searchResults).length > 0;

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) closePanel();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [closePanel]);

  // Keyboard shortcut: '/' focuses search
  useEffect(() => {
    function handleKey(e) {
      if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
        setShowSearch(true);
      }
      if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchResult = (path) => {
    navigate(path);
    setShowSearch(false);
    setSearchQuery('');
  };

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleBadgeMap = {
    admin: 'Administrator', sales: 'Sales', purchase: 'Purchase',
    manufacturing: 'Manufacturing', inventory: 'Inventory Mgr', owner: 'Owner',
  };

  return (
    <header className="header">
      {/* Left */}
      <div className="header__left">
        <span className="header__brand">Shiv Furniture Works</span>
      </div>

      {/* Center: Search removed as per user request */}
      <div className="header__search-wrapper" style={{ display: 'none' }}>
      </div>

      {/* Right */}
      <div className="header__right">
        {/* Notification Bell */}
        <div className="header__notif-wrapper" ref={notifRef}>
          <button
            className="header__icon-btn"
            onClick={togglePanel}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="header__notif-badge" aria-hidden="true">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="notif-panel" role="dialog" aria-label="Notifications">
              <div className="notif-panel__header">
                <span className="notif-panel__title">Notifications</span>
                {unreadCount > 0 && (
                  <button className="notif-panel__mark-all" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-panel__body">
                {notifications.length === 0 ? (
                  <div className="notif-panel__empty">No notifications</div>
                ) : (
                  notifications.slice(0, 15).map(n => (
                    <div key={n.id} className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`}>
                      <div className="notif-item__title">{n.title}</div>
                      <div className="notif-item__message">{n.message}</div>
                      <div className="notif-item__time">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="header__user-wrapper" ref={userMenuRef}>
          <button
            className="header__user-btn"
            onClick={() => setShowUserMenu(s => !s)}
            aria-label="User menu"
            aria-expanded={showUserMenu}
          >
            <div className="header__avatar" aria-hidden="true">{userInitials}</div>
            <ChevronDown size={14} />
          </button>

          {showUserMenu && (
            <div className="user-menu" role="menu">
              <div className="user-menu__header">
                <div className="user-menu__name">{currentUser?.name}</div>
                <div className="user-menu__email">{currentUser?.email}</div>
                <span className="user-menu__role-badge">{roleBadgeMap[currentUser?.role]}</span>
              </div>
              <div className="user-menu__divider" />
              <button className="user-menu__item" role="menuitem" onClick={() => { navigate('/settings'); setShowUserMenu(false); }}>
                <Settings size={14} /> Settings & Security
              </button>
              <div className="user-menu__divider" />
              <button className="user-menu__item user-menu__item--danger" role="menuitem" onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
