import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'customer';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem('user');
      
      // 1. เช็คให้ชัวร์ว่าไม่ใช่ string ขยะที่เขียนว่า "undefined" หรือ "null"
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          // 2. ลองแปลงเป็น JSON
          setUser(JSON.parse(storedUser));
        } catch (error) {
          // 3. ถ้าแปลงแล้วพัง (แปลว่ามีขยะค้างในเครื่อง) ให้เตะทิ้งทันที! แอปจะได้ไม่จอขาว
          console.error("Failed to parse user data from localStorage", error);
          localStorage.removeItem('user'); 
        }
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);


  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
