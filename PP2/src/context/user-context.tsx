import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { fetchWithAuthRetry } from '@/utils/fetchWithAuthRetry';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data on mount if tokens are present
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      // Fetch the current user's data from the server
      fetchWithAuthRetry('/api/users/profile', { method: "GET" })
        .then((res) => {
          if (!res.ok) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            throw new Error('Failed to fetch user data');
          }
          return res.json();
        })
        .then((data) => {
          console.log('User data:', data);
          if (data) {
            setUser(data);
          } else {
            setUser(null);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch user data:', err);
          setUser(null);
        });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};