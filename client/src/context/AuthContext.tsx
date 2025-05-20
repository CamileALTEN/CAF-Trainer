import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
    
      /* ────────────── types ────────────── */
      export interface IUser {
        id:         string;
        username:   string;
        role:       'admin' | 'manager' | 'caf' | 'user';  // ← manager
        site?:      string;
        managerId?: string;
      }
    
    
interface AuthContextType {
  user: IUser | null;
  login: (u: string, p: string, c?: string) => Promise<{ ok: boolean; msg?: string; needCode?: boolean }>;
  logout: () => void;
}
    
      /* ────────────── contexte ────────────── */
      const AuthContext = createContext<AuthContextType | null>(null);
    
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(() => {
    const saved = sessionStorage.getItem('caf-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('caf-token');
  });

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);
    
  const login = async (username: string, password: string, code?: string) => {
    try {
      const res = await axios.post('/api/auth/login', { username, password, code });
      const { token: tok, user: usr } = res.data;
      setUser(usr);
      setToken(tok);
      sessionStorage.setItem('caf-user', JSON.stringify(usr));
      sessionStorage.setItem('caf-token', tok);
      axios.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
      return { ok: true } as const;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erreur réseau';
      return { ok: false, msg, needCode: msg === 'Code 2FA requis' } as const;
    }
  };
    
  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('caf-user');
    sessionStorage.removeItem('caf-token');
    delete axios.defaults.headers.common['Authorization'];
  };
    
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
    
      /**
       * Hook protégé : lève une erreur claire si utilisé hors provider
       */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() doit être appelé à l’intérieur de <AuthProvider>');
  }
  return ctx;
}
