
import { create } from 'zustand';
import { User } from './types';

interface UserSettings {
  reducedMotion: boolean;
  compactMode: boolean;
  emailSecurity: boolean;
  emailTickets: boolean;
  emailMarketing: boolean;
  pushMentions: boolean;
  pushReminders: boolean;
  twoFactor: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  reducedMotion: false,
  compactMode: false,
  emailSecurity: true,
  emailTickets: true,
  emailMarketing: false,
  pushMentions: true,
  pushReminders: true,
  twoFactor: false,
};

interface AppState {
  // Sidebar State
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Session State
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;

  // Settings State
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;

  // Theme State
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // CLI Modal State
  isCliOpen: boolean;
  isCliMinimized: boolean;
  toggleCli: () => void;
  setIsCliMinimized: (minimized: boolean) => void;

  // Monitor Drawer State
  isMonitorOpen: boolean;
  toggleMonitor: () => void;

  // Global Search State
  isSearchOpen: boolean;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;

  // AI Chat State
  isAIChatOpen: boolean;
  toggleAIChat: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarCollapsed: true, // Default to collapsed/narrow view
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  
  user: {
    id: 'u1',
    name: 'Alex Carter',
    email: 'alex@nexus.com',
    role: 'admin',
    avatarUrl: 'https://i.pravatar.cc/150?u=alex',
  },
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  updateUser: (updates) => set((state) => ({ 
    user: state.user ? { ...state.user, ...updates } : null 
  })),

  settings: DEFAULT_SETTINGS,
  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates }
  })),

  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  isCliOpen: false,
  isCliMinimized: false,
  // When toggling, if we are opening, ensure we aren't minimized
  toggleCli: () => set((state) => ({ 
    isCliOpen: !state.isCliOpen,
    isCliMinimized: !state.isCliOpen ? false : state.isCliMinimized 
  })),
  setIsCliMinimized: (minimized) => set({ isCliMinimized: minimized }),

  isMonitorOpen: false,
  toggleMonitor: () => set((state) => ({ isMonitorOpen: !state.isMonitorOpen })),

  isSearchOpen: false,
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  setSearchOpen: (open) => set({ isSearchOpen: open }),

  isAIChatOpen: false,
  toggleAIChat: () => set((state) => ({ isAIChatOpen: !state.isAIChatOpen })),
}));
