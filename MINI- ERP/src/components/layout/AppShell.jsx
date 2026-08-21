import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { useUI } from '../../context/UIContext.jsx';

export default function AppShell() {
  const { sidebarCollapsed, sidebarMobileOpen, toggleSidebar, toggleMobileSidebar, closeMobileSidebar } = useUI();

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        closeMobileSidebar();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMobileSidebar]);

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-wrapper ${sidebarCollapsed ? 'sidebar-wrapper--collapsed' : ''} ${sidebarMobileOpen ? 'sidebar-wrapper--mobile-open' : ''}`}>
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Main area */}
      <div className="main-area">
        <Header onMenuClick={toggleSidebar} onMobileMenuClick={toggleMobileSidebar} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
