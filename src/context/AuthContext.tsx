import React, { createContext, useState, useContext, useEffect } from 'react';

interface UserDetails {
  id: string;
  email: string;
  role: string;
  name: string;
  address: string;
  billingAddress: string;
  phoneNumber: string;
  location: string;
  vatNumber?: string;
}

interface AuthContextType {
  user: UserDetails | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserDetails: (details: Partial<UserDetails>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock API function
const mockApiCall = (endpoint: string, data: any): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (endpoint === '/register' || endpoint === '/login') {
        resolve({
          token: 'mock-token',
          user: {
            id: '1',
            email: data.email,
            role: 'user',
            name: 'John Doe',
            address: '123 Main St',
            billingAddress: '123 Main St',
            phoneNumber: '555-1234',
            location: 'New York, NY',
            vatNumber: '',
          }
        });
      } else if (endpoint === '/user') {
        resolve({ user: data });
      }
    }, 1000);
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDetails | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      mockApiCall('/user', { token })
        .then(response => setUser(response.user))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await mockApiCall('/login', { email, password });
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed');
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await mockApiCall('/register', { email, password });
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed');
      throw new Error('Registration failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUserDetails = async (details: Partial<UserDetails>) => {
    try {
      const updatedUser = { ...user, ...details };
      await mockApiCall('/user', updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update failed');
      throw new Error('Failed to update user details. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUserDetails }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};