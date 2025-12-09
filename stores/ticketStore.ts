import { create } from 'zustand';
import { Customer, Ticket } from '@/types'
import { CustomerService } from '@/services/external';

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
  selectedUser: Customer | null;
  formData: TicketFormData;
  searchQuery: string;
  searchResults: Customer[];
  isSearching: boolean;

  // Actions
  setStep: (step: number) => void;
  setSearchQuery: (query: string) => void;
  searchCustomers: (query: string) => Promise<void>;
  selectUser: (user: Customer) => void;
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
      // Use the real API service to find customers/invoices
      const { data, error } = await CustomerService.getInvoices(query);

      if (error) throw new Error(error);

      // Map the API response to the Customer format expected by the store
      // The API returns CustomerwithInvoices[], which extends Customer
      // We might need to adapt fields slightly depending on what the UI expects
      const mappedResults: Customer[] = (data || []).map(item => ({
        _id: item.id || item.user_pppoe || `fiber-${Math.random()}`,
        get id() {
          return this._id;
        },
        set id(value) {
          this._id = value;
        },
        name: item.name || 'Unknown',
        user_pppoe: item.user_pppoe,
        // Preserve other properties if they exist on the response but aren't in the Customer interface explicitly
        // (This relies on the fact that the object spreads are likely used in the UI)
        ...item
      }));

      set({ searchResults: mappedResults, isSearching: false });
    } catch (error) {
      console.error('Search failed:', error);
      set({ searchResults: [], isSearching: false });
    }
  },

  selectUser: (user: any) => {
    // Generate a random ticket ref for demo purposes if not provided
    // In a real app, this might come from the backend on creation
    const randomRef = `TN${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;

    set({
      selectedUser: user,
      step: 2,
      formData: {
        ...INITIAL_FORM_DATA,
        name: user.name?.toUpperCase() || '',
        // Attempt to find address from various possible fields in the API response
        address: user.address || user.alamat || '',
        contact: '', 
        noInternet: user.user_pppoe || user.sn || user.id || '', 
        ticketRef: randomRef,
      }
    });
  },

  updateFormData: (updates) => set((state) => ({
    formData: { ...state.formData, ...updates }
  })),

  initializeFromTicket: (ticket: Ticket) => {

    set({
      step: 2, // Skip search
      selectedUser: null, // We don't have the full customer object unless we fetch it
      formData: {
        ...INITIAL_FORM_DATA,
        // We use the ticket title as description or name if suitable,
        // but really we should probably clear these if the ticket doesn't have them.
        name: '', // We don't know the customer name just from the Ticket type in types.ts (it has title, status, etc)
        address: '',
        contact: '',
        noInternet: '', // Ticket might need a 'customer_id' or 'sn' field to populate this
        ticketRef: ticket.id,
        priority: (ticket.priority || 'low').charAt(0).toUpperCase() + (ticket.priority || 'low').slice(1),
        type: 'Technical',
        description: ticket.title || ''
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