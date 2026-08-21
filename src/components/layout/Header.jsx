import React, { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, Settings, ChevronDown, AlertTriangle, ArrowRight, Package, ShoppingCart, CheckSquare, Truck, DollarSign, FileText, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import logoImg from '../../logo.png';

const MODULE_STYLE_MAP = {
  INVENTORY: { bg: '#FEF2F2', text: '#991B1B', border: '#FCA5A5', icon: Package },
  SALES: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', icon: ShoppingCart },
  QUALITY: { bg: '#F3E8FF', text: '#6B21A8', border: '#D8B4FE', icon: CheckSquare },
  LOGISTICS: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', icon: Truck },
  FINANCE: { bg: '#FFF1F2', text: '#9F1239', border: '#FECDD3', icon: DollarSign },
  PROCUREMENT: { bg: '#F5F5F4', text: '#44403C', border: '#E7E5E4', icon: FileText },
  SECURITY: { bg: '#F1F5F9', text: '#334155', border: '#CBD5E1', icon: ShieldAlert },
  SYSTEM: { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', icon: AlertTriangle }
};

export default function Header({ onMenuClick, onMobileMenuClick }) {
  const { currentUser, logout } = useAuth();
  const { notifications, unreadCount, isOpen, readIds, togglePanel, closePanel, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        closePanel();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [closePanel]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationNavigate = (e, targetPath, notificationId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (notificationId) {
      markRead(notificationId);
    }
    closePanel();
    if (targetPath) {
      navigate(targetPath);
    }
  };

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleBadgeMap = {
    administrator: 'Administrator', admin: 'Administrator', sales: 'Sales Executive', purchase: 'Purchase Manager',
    manufacturing: 'Production Manager', inventory: 'Inventory Manager', quality: 'Quality Manager', delivery: 'Delivery Manager', finance: 'Accounts & Finance', owner: 'Business Owner',
  };

  return (
    <header className="header">
      {/* Left Branding */}
      <div className="header__left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={logoImg} alt="Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
        <span className="header__brand" style={{ fontWeight: 700, fontSize: '15px' }}>Shiv Furniture Works</span>
      </div>

      {/* Right User Actions */}
      <div className="header__right">
        {/* Notification Bell */}
        <div className="header__notif-wrapper" ref={notifRef} style={{ position: 'relative' }}>
          <button
            className="header__icon-btn"
            onClick={togglePanel}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="header__notif-badge" aria-hidden="true" style={{
                position: 'absolute',
                top: '1px',
                right: '1px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 800,
                borderRadius: '10px',
                padding: '2px 5px',
                lineHeight: '1',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.4)'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="notif-panel" role="dialog" aria-label="Notifications & Action Alerts" style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 10px)',
              width: '440px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.18), 0 0 1px rgba(0,0,0,0.1)',
              border: '1px solid #E2E8F0',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              {/* Dropdown Header */}
              <div style={{
                padding: '16px 20px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} style={{ color: '#F59E0B' }} />
                  <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.01em' }}>
                    Notifications & Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span style={{
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      borderRadius: '12px',
                      padding: '2px 8px'
                    }}>
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllRead()}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#E2E8F0',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Mark All Read
                  </button>
                )}
              </div>

              {/* Notification List Container */}
              <div style={{ maxHeight: '420px', overflowY: 'auto', backgroundColor: '#F8FAFC' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '36px 24px', textAlign: 'center', color: '#94A3B8' }}>
                    <AlertTriangle size={32} style={{ margin: '0 auto 10px auto', opacity: 0.5, color: '#CBD5E1' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>No Active Notifications</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>All system requirements and operational alerts are up to date.</div>
                  </div>
                ) : (
                  notifications.slice(0, 15).map(n => {
                    const isUnread = !readIds.has(n.id) && !n.isRead;
                    const styleConfig = MODULE_STYLE_MAP[n.module || 'SYSTEM'] || MODULE_STYLE_MAP.SYSTEM;
                    const IconComp = styleConfig.icon;

                    return (
                      <div
                        key={n.id}
                        onClick={(e) => handleNotificationNavigate(e, n.path, n.id)}
                        style={{
                          padding: '14px 18px',
                          borderBottom: '1px solid #E2E8F0',
                          backgroundColor: isUnread ? '#FFFFFF' : '#F8FAFC',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          position: 'relative'
                        }}
                      >
                        {/* Unread Glow Dot */}
                        {isUnread && (
                          <div style={{
                            position: 'absolute',
                            left: '6px',
                            top: '18px',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#3B82F6'
                          }} />
                        )}

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          {/* Module Icon Container */}
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            backgroundColor: styleConfig.bg,
                            border: `1px solid ${styleConfig.border}`,
                            color: styleConfig.text,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <IconComp size={18} />
                          </div>

                          {/* Content Details */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: styleConfig.bg,
                                color: styleConfig.text,
                                border: `1px solid ${styleConfig.border}`,
                                letterSpacing: '0.04em'
                              }}>
                                {n.module || 'ALERT'}
                              </span>

                              <span style={{ fontSize: '11px', color: '#94A3B8' }}>Live Alert</span>
                            </div>

                            <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', marginBottom: '4px', lineHeight: 1.3 }}>
                              {n.title}
                            </div>

                            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.45, marginBottom: '8px' }}>
                              {n.message}
                            </div>

                            {/* Clickable Open Module Action Button */}
                            <button
                              type="button"
                              onClick={(e) => handleNotificationNavigate(e, n.path, n.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 12px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                borderRadius: '6px',
                                border: '1px solid var(--color-primary-dark, #8B5E3C)',
                                backgroundColor: 'rgba(139, 94, 60, 0.08)',
                                color: 'var(--color-primary-dark, #8B5E3C)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>{n.actionText || 'Open Module →'}</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
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
                <span className="user-menu__role-badge">
                  {roleBadgeMap[(currentUser?.role || '').toLowerCase()] || currentUser?.role || 'User'}
                </span>
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
