import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

interface AuthContextType {
  isAdmin: boolean;
  isLoginModalOpen: boolean;
  isDashboardOpen: boolean;
  activeDashTab: string;
  toast: { message: string; visible: boolean };
  showToast: (message: string) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openDashboard: (tab?: string) => void;
  closeDashboard: () => void;
  setActiveDashTab: (tab: string) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  triggerAdminAction: (actionFn: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [activeDashTab, setActiveDashTab] = useState('overview');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 3200);
  };

  const checkAuthStatus = async () => {
    try {
      const res = await api.get<{ isAuthenticated: boolean }>('/auth/status');
      if (res.data.isAuthenticated) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    // NO hidden keyboard shortcuts (Ctrl+Shift+A/L removed)
  }, []);

  const triggerAdminAction = (actionFn: () => void) => {
    if (isAdmin) {
      actionFn();
    } else {
      setPendingAction(() => actionFn);
      setIsLoginModalOpen(true);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post<{ success: boolean; message?: string }>('/auth/login', { email, password });
      if (res.data.success) {
        setIsAdmin(true);
        setIsLoginModalOpen(false);
        showToast('✓ Login successful');

        // Automatically execute the originally requested action
        if (pendingAction) {
          setTimeout(() => {
            pendingAction();
            setPendingAction(null);
          }, 150);
        }
        return { success: true };
      } else {
        const errorMsg = res.data.message || 'Invalid email or password.';
        showToast('✗ ' + errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      showToast('✗ ' + msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdmin(false);
      setIsDashboardOpen(false);
      showToast('✓ Logged out successfully');
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setPendingAction(null);
  };

  const openDashboard = (tab: string = 'overview') => {
    triggerAdminAction(() => {
      setActiveDashTab(tab);
      setIsDashboardOpen(true);
    });
  };

  const closeDashboard = () => setIsDashboardOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        isLoginModalOpen,
        isDashboardOpen,
        activeDashTab,
        toast,
        showToast,
        openLoginModal,
        closeLoginModal,
        openDashboard,
        closeDashboard,
        setActiveDashTab,
        login,
        logout,
        triggerAdminAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
