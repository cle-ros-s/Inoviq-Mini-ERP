import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const UIContext = createContext(null);

let toastIdCounter = 0;

export function UIProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [theme] = useState('light');

  const toggleSidebar = useCallback(() => setSidebarCollapsed(c => !c), []);
  const toggleMobileSidebar = useCallback(() => setSidebarMobileOpen(o => !o), []);
  const closeMobileSidebar = useCallback(() => setSidebarMobileOpen(false), []);

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev.slice(-4), { id, type, message, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration + 300);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => addToast({ type: 'success', message, duration }), [addToast]);
  const showError = useCallback((message, duration) => addToast({ type: 'error', message, duration }), [addToast]);
  const showWarning = useCallback((message, duration) => addToast({ type: 'warning', message, duration }), [addToast]);
  const showInfo = useCallback((message, duration) => addToast({ type: 'info', message, duration }), [addToast]);

  return (
    <UIContext.Provider value={{
      sidebarCollapsed, toggleSidebar,
      sidebarMobileOpen, toggleMobileSidebar, closeMobileSidebar,
      toasts, addToast, removeToast,
      showSuccess, showError, showWarning, showInfo,
      theme,
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
