import { create } from 'zustand';
import { User } from '../../types';

interface TicketFormData {
  name: string;
  address: string;
  contact: string;
  noInternet: string;
  ticketRef: string;
  priority: string;
  type: string;
  description: string;
}

interface TicketStore {
  // Form state
  step: number;
  searchQuery: string;
  searchResults: User[];
  selectedUser: User | null;
  formData: TicketFormData;
  isSearching: boolean;
  
  // Actions
  setStep: (step: number) => void;
  setSearchQuery: (query: string) => void;
  searchCustomers: (query: string) => void;
  selectUser: (user: User) => void;
  updateFormData: (updates: Partial<TicketFormData>) => void;
  initializeFromTicket: (ticket: any) => void;
  reset: () => void;
}

const initialFormData: TicketFormData = {
  name: '',
  address: '',
  contact: '',
  noInternet: '',
  ticketRef: '',
  priority: '',
  type: '',
  description: ''
};

export const useTicketStore = create<TicketStore>((set, get) => ({
  // Initial state
  step: 1,
  searchQuery: '',
  searchResults: [],
  selectedUser: null,
  formData: initialFormData,
  isSearching: false,
  
  // Actions
  setStep: (step) => set({ step }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  searchCustomers: async (query) => {
    if (query.length < 2) {
      set({ searchResults: [] });
      return;
    }
    
    set({ isSearching: true });
    
    try {
      // Mock search results - replace with actual API call
      const mockResults: User[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          address: '123 Main St'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'customer',
          address: '456 Oak Ave'
        }
      ].filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      
      // Simulate API delay
      setTimeout(() => {
        set({ searchResults: mockResults, isSearching: false });
      }, 300);
    } catch (error) {
      console.error('Error searching customers:', error);
      set({ searchResults: [], isSearching: false });
    }
  },
  
  selectUser: (user) => set({ 
    selectedUser: user,
    formData: {
      ...get().formData,
      name: user.name,
      address: user.address || '',
      contact: user.email
    }
  }),
  
  updateFormData: (updates) => set(state => ({
    formData: { ...state.formData, ...updates }
  })),
  
  initializeFromTicket: (ticket) => {
    set({
      formData: {
        name: ticket.customerName || '',
        address: ticket.address || '',
        contact: ticket.contact || '',
        noInternet: ticket.onuIndex || '',
        ticketRef: ticket.id || '',
        priority: ticket.priority || '',
        type: ticket.type || '',
        description: ticket.title || ''
      },
      selectedUser: ticket.customer || null
    });
  },
  
  reset: () => set({
    step: 1,
    searchQuery: '',
    searchResults: [],
    selectedUser: null,
    formData: initialFormData,
    isSearching: false
  })
}));