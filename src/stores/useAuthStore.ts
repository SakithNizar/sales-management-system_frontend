import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '../api/api';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'salesman';
  name: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  addSalesman: (salesman: Omit<User, 'id' | 'role'> & { password: string }) => void;
  updateProfile: (updates: Partial<User> & { newPassword?: string }) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const defaultUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          password: 'admin123',
          name: 'Admin User',
          role: 'admin',
          phone: '+94710000000',
        },
        {
          id: '2',
          username: 'salesman',
          password: 'salesman123',
          name: 'John Salesman',
          role: 'salesman',
          phone: '+94711111111',
        },
      ];

      return {
        user: null,
        users: defaultUsers,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        register: async (userData) => {
          set({ isLoading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 500));

          const { users } = get();
          const existingUser = users.find((u) => u.username === userData.username);
          
          if (existingUser) {
            set({ error: 'Username already exists', isLoading: false });
            return false;
          }

          const newUser: User = {
            ...userData,
            id: Date.now().toString(),
            role: 'admin',
          };

          set((state) => ({
            users: [...state.users, newUser],
            user: { ...newUser, password: undefined },
            isAuthenticated: true,
            isLoading: false,
          }));
          return true;
        },

        login: async (username: string, password: string) => {
          set({ isLoading: true, error: null });

          try {
            // Try to authenticate with backend API
            const response = await apiRequest('/auth/login', {
              method: 'POST',
              body: JSON.stringify({ username, password }),
            });

            if (response && response.user) {
              const { password: _, ...userWithoutPassword } = response.user;
              set({ user: userWithoutPassword, isAuthenticated: true, isLoading: false });
              
              // Store token if provided by backend
              if (response.token) {
                localStorage.setItem('auth_token', response.token);
              }
              return true;
            }
            throw new Error('Invalid response from server');
          } catch (error) {
            // Fallback to mock authentication for development
            await new Promise((resolve) => setTimeout(resolve, 500));
            
            const { users } = get();
            const foundUser = users.find(
              (u) => u.username === username && u.password === password
            );

            if (foundUser) {
              const { password: _, ...userWithoutPassword } = foundUser;
              set({ user: userWithoutPassword, isAuthenticated: true, isLoading: false });
              return true;
            } else {
              set({ error: 'Invalid username or password', isLoading: false });
              return false;
            }
          }
        },

        addSalesman: (salesman) => {
          const newSalesman: User = {
            ...salesman,
            id: Date.now().toString(),
            role: 'salesman',
          };
          set((state) => ({ users: [...state.users, newSalesman] }));
        },

        updateProfile: async (updates) => {
          set({ isLoading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 500));

          const { user, users } = get();
          if (!user) {
            set({ error: 'Not logged in', isLoading: false });
            return false;
          }

          // Check if new username already exists (if changing username)
          if (updates.username && updates.username !== user.username) {
            const existingUser = users.find((u) => u.username === updates.username && u.id !== user.id);
            if (existingUser) {
              set({ error: 'Username already taken', isLoading: false });
              return false;
            }
          }

          // Update user in users array
          const updatedUsers = users.map((u) => {
            if (u.id === user.id) {
              return {
                ...u,
                name: updates.name || u.name,
                username: updates.username || u.username,
                phone: updates.phone || u.phone,
                password: updates.newPassword || u.password,
              };
            }
            return u;
          });

          // Update current user session
          const updatedUser = {
            ...user,
            name: updates.name || user.name,
            username: updates.username || user.username,
            phone: updates.phone || user.phone,
          };

          set({ users: updatedUsers, user: updatedUser, isLoading: false });
          return true;
        },

        logout: () => {
          localStorage.removeItem('auth_token');
          set({ user: null, isAuthenticated: false, error: null });
        },

        clearError: () => set({ error: null }),
      };
    },
    {
      name: 'ceylon-dairy-auth',
      partialize: (state) => ({
        user: state.user,
        users: state.users && state.users.length > 0 ? state.users : [
          {
            id: '1',
            username: 'admin',
            password: 'admin123',
            name: 'Admin User',
            role: 'admin',
            phone: '+94710000000',
          },
          {
            id: '2',
            username: 'salesman',
            password: 'salesman123',
            name: 'John Salesman',
            role: 'salesman',
            phone: '+94711111111',
          },
        ],
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
