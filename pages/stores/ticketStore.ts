
import { create } from 'zustand';
import { User, Ticket } from '@/types'
import { supabase } from '@/lib/supabaseClient';

interface TicketFormData {
  name: string;
  address: string;
  contact: string;
  noInternet: string; // ID
  ticketRef: string;
  priority: string;
  type: string;
  description: string;
}

const INITIAL_FORM_DATA: TicketFormData = {
  name: '',
  address: '',
  contact: '',
  noInternet: '',
  ticketRef: '',
  priority: '',
  type: '',
  description: ''
};

interface TicketStore {
  // State
  step: number;
  selectedUser: User | null;
  formData: TicketFormData;
  searchQuery: string;
  searchResults: User[];
  isSearching: boolean;

  // Actions
  setStep: (step: number) => void;
  setSearchQuery: (query: string) => void;
  searchCustomers: (query: string) => Promise<void>;
  selectUser: (user: User) => void;
  updateFormData: (updates: Partial<TicketFormData>) => void;

  // Initialize from existing ticket (for Process/Edit modals)
  initializeFromTicket: (ticket: Ticket) => void;

  // Reset
  reset: () => void;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  step: 1,
  selectedUser: null,
  formData: INITIAL_FORM_DATA,
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  setStep: (step) => set({ step }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  searchCustomers: async (query: string) => {
    if (query.length <= 1) {
      set({ searchResults: [], isSearching: false });
      return;
    }

    set({ isSearching: true });
    try {
      const { data, error } = await supabase
        .from('data_fiber')
        .select('*')
        .or(`name.ilike.%${query}%,user_pppoe.ilike.%${query}%,alamat.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      const mappedResults: any[] = (data || []).map(row => ({
        id: row.user_pppoe || `fiber-${Math.random()}`, // Use PPPoE as stable ID if possible
        name: row.name || 'Unknown',
        email: row.user_pppoe || '', // Use PPPoE as email/identifier
        role: 'user',
        avatarUrl: undefined,
        // Extra fields for form population
        _address: row.alamat,
        _pppoe: row.user_pppoe,
        _sn: row.onu_sn
      }));

      set({ searchResults: mappedResults, isSearching: false });
    } catch (error) {
      console.error('Search failed:', error);
      set({ searchResults: [], isSearching: false });
    }
  },

  selectUser: (user: any) => {
    // Generate a random ticket ref for demo purposes
    const randomRef = `TN${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;

    set({
      selectedUser: user,
      step: 2,
      formData: {
        ...INITIAL_FORM_DATA,
        name: user.name.toUpperCase(),
        address: user._address || '',
        contact: '', // Data fiber usually doesn't have phone, leave blank for manual entry
        noInternet: user._pppoe || user._sn || '', // Prefer PPPoE, fallback to SN
        ticketRef: randomRef,
      }
    });
  },

  updateFormData: (updates) => set((state) => ({
    formData: { ...state.formData, ...updates }
  })),

  initializeFromTicket: (ticket) => {
    // Create a mock user context based on ticket assignee or generic
    const mockUser: User = {
      id: 'u-temp',
      name: 'ALEX CARTER', // In real app, fetch from ticket.userId
      email: 'alex@nexus.com',
      role: 'user',
      avatarUrl: 'https://i.pravatar.cc/150?u=alex',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    };

    set({
      step: 2, // Skip search
      selectedUser: mockUser,
      formData: {
        name: mockUser.name,
        address: '123 FIBER OPTIC LANE, TECH CITY, NY 10001',
        contact: '+1 555 019 2834',
        noInternet: 'ONT-8293-X2',
        ticketRef: ticket.id,
        priority: ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1),
        type: 'Technical',
        description: ticket.title + ' - Investigating reported latency issues.'
      }
    });
  },

  reset: () => set({
    step: 1,
    selectedUser: null,
    formData: INITIAL_FORM_DATA,
    searchQuery: '',
    searchResults: [],
    isSearching: false
  })
}));