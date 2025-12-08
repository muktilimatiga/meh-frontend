import { useQuery, useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/external';

// --- Customer Hooks ---
// Customer Invoices
export function useCustomerInvoices(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["customerInvoices", query],
    queryFn: async () => {
      const res = await ApiService.customer.getInvoices(query);
      return res;
    },
    enabled,
  });
}

export function useGetCustomerPSBData() {
  return useQuery({
    queryKey: ["customerPSBData"],
    queryFn: async () => {
      const res = await ApiService.customer.getPSBData();
      return res;
    },
  });
}

// --- Ticket Hooks ---
export function useCreateAndProccesTicket(payload: Parameters<typeof ApiService.ticket.createAndProcess>[0]) {
  return useMutation({
    mutationFn: async () => {
      const res = await ApiService.ticket.createAndProcess(payload);
      return res;
    },
  });
}

export function useForwardTicket(payload: Parameters<typeof ApiService.ticket.forward>[0]) {
  return useMutation({
    mutationFn: async () => {
      const res = await ApiService.ticket.forward(payload);
      return res;
    },
  });
}

export function useCloseTicket(payload: Parameters<typeof ApiService.ticket.close>[0]) {
  return useMutation({
    mutationFn: async () => {
      const res = await ApiService.ticket.close(payload);
      return res;
    },
  });
}

// Config Hooks
// Config Options OLT, Modem Type, Package
export function useConfigOptions() {
  return useQuery({
    queryKey: ["configOptions"],
    queryFn: async () => {
      const res = await ApiService.config.getOptions();
      return res;
    },
  });
}

// Deteck SN
export function useConfigDetectUnconfiguredOnts(oltName: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await ApiService.config.detectUnconfiguredOnts(oltName);
      return res;
    },
  });
}

// Run Configuration
export function useConfigRunConfiguration(oltName: string, payload: Parameters<typeof ApiService.config.runConfiguration>[1]) {
  return useMutation({
    mutationFn: async () => {
      const res = await ApiService.config.runConfiguration(oltName, payload);
      return res;
    },
  });
}

