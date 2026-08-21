import React from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { ErpDataProvider } from './context/ErpDataContext.jsx';
import { UIProvider } from './context/UIContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import AppRouter from './routes/router.jsx';
import ToastContainer from './components/ui/ToastContainer.jsx';
import './styles/tokens.css';
import './styles/global.css';
import './styles/utilities.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/layout.css';

function AppProviders({ children }) {
  return (
    <UIProvider>
      <ErpDataProvider>
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </ErpDataProvider>
    </UIProvider>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
      <ToastContainer />
    </AppProviders>
  );
}
