import React, { useState, useEffect } from 'react';

// Base API configuration
const API_BASE_URL = 'http://localhost:8001';
const ENABLE_MOCK_FALLBACK = true;

// Generic API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

// Enhanced error handling for API responses
export class ApiError extends Error {
  public status: number;
  public response?: any;

  constructor(message: string, status: number, response?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

// --- Types definitions ---
export interface OnuTargetPayload {
  olt_name: string;
  interface: string;
}

export interface PortTargetPayload {
    olt_name: string;
    olt_port: string;
}

export interface NoOnuPayload extends PortTargetPayload {
    onu_id: number;
}

export interface RegistSnPayload extends OnuTargetPayload {
    sn: string;
}

export interface TicketCreateOnlyPayload {
    query: string;
    description: string;
}

export interface TicketCreateAndProcessPayload extends TicketCreateOnlyPayload {
    noc_username: string;
    noc_password: string;
}

export interface TicketProcessPayload {
    query: string;
    noc_username: string;
    noc_password: string;
}

export interface TicketClosePayload {
    query: string;
    close_reason: string;
    onu_sn: string;
    noc_username: string;
    noc_password: string;
}

export interface TicketForwardPayload {
    query: string;
    service_impact: string;
    root_cause: string;
    network_impact: string;
    recomended_action: string;
    onu_index: string;
    sn_modem: string;
    priority?: string;
    person_in_charge?: string;
    noc_username: string;
    noc_password: string;
}

export interface SearchPayload {
    query: string;
}

export interface ConfigurationRequest {
    sn: string;
    customer: any;
    modem_type: string;
    package: string;
    eth_locks: boolean[];
}

// Mock response handler
const getMockResponse = (endpoint: string): any => {
    return { status: 'success', message: 'Mock response' };
};

// Enhanced fetch function
async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
        throw new ApiError(`API Error: ${response.status}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (ENABLE_MOCK_FALLBACK) {
        console.warn(`External API (${url}) failed. Using Mock Data.`);
        await new Promise(resolve => setTimeout(resolve, 600));
        return getMockResponse(endpoint) as T;
    }
    throw error;
  }
}

export const ApiService = {
  customer: {
    getPSBData: () => fetchJson<any[]>('/customer/psb'),
    getInvoices: (query: string) => fetchJson<any[]>(`/customer/invoices?query=${encodeURIComponent(query)}`),
  },
  onu: {
    getCustomerDetails: (payload: any) => fetchJson<any>('/onu/detail-search', { method: 'POST', body: JSON.stringify(payload) }),
    getOnuState: (payload: any) => fetchJson<any>('/onu/onu-state', { method: 'POST', body: JSON.stringify(payload) }),
    getOnuRx: (payload: any) => fetchJson<any>('/onu/onu-rx', { method: 'POST', body: JSON.stringify(payload) }),
    rebootOnu: (payload: any) => fetchJson<any>('/onu/reboot-onu', { method: 'POST', body: JSON.stringify(payload) }),
    removeOnu: (payload: any) => fetchJson<any>('/onu/no-onu', { method: 'POST', body: JSON.stringify(payload) }),
    registerSn: (payload: any) => fetchJson<any>('/onu/regist-sn', { method: 'POST', body: JSON.stringify(payload) }),
  },
  ticket: {
    createOnly: (payload: any) => fetchJson<any>('/ticket/create', { method: 'POST', body: JSON.stringify(payload) }),
    createAndProcess: (payload: any) => fetchJson<any>('/ticket/create-and-process', { method: 'POST', body: JSON.stringify(payload) }),
    processOnly: (payload: any) => fetchJson<any>('/ticket/process', { method: 'POST', body: JSON.stringify(payload) }),
    close: (payload: any) => fetchJson<any>('/ticket/close', { method: 'POST', body: JSON.stringify(payload) }),
    forward: (payload: any) => fetchJson<any>('/ticket/forward', { method: 'POST', body: JSON.stringify(payload) }),
    search: (payload: any) => fetchJson<any>('/ticket/search', { method: 'POST', body: JSON.stringify(payload) }),
  },
  cli: {
    startTerminal: () => fetchJson<any>('/cli/start_terminal', { method: 'POST' }),
    stopTerminal: (port: number) => fetchJson<any>(`/cli/stop_terminal/${port}`, { method: 'POST' }),
    listRunningTerminals: () => fetchJson<any>('/cli/running_terminals'),
  },
  config: {
    getOptions: () => fetchJson<any>('/config/api/options'),
    detectUnconfiguredOnts: (oltName: string) => fetchJson<any[]>(`/config/api/olts/${oltName}/detect-onts`),
    runConfiguration: (oltName: string, request: any) => fetchJson<any>(`/config/api/olts/${oltName}/configure`, { method: 'POST', body: JSON.stringify(request) }),
  },
};

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

export const withErrorHandling = async <T>(
  operation: () => Promise<T>
): Promise<{ data?: T; error?: string }> => {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    return { error: handleApiError(error) };
  }
};

// React Hooks
export const createQueryHook = <T, P extends any[]>(queryFn: (...args: P) => Promise<T>) => {
  return (...args: P) => {
    const [state, setState] = useState<{ data?: T; loading: boolean; error?: string }>({ loading: true });
    
    useEffect(() => {
      let isMounted = true;
      const fetchData = async () => {
        try {
          setState({ loading: true });
          const result = await withErrorHandling(() => queryFn(...args));
          if (!isMounted) return;
          if (result.error) setState({ loading: false, error: result.error });
          else setState({ loading: false, data: result.data });
        } catch (error) {
          if (!isMounted) return;
          setState({ loading: false, error: handleApiError(error) });
        }
      };
      fetchData();
      return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, args);
    
    return state;
  };
};

export const useCustomerData = createQueryHook((query: string) => ApiService.customer.getInvoices(query));
export const useOnuDetails = createQueryHook((payload: any) => ApiService.onu.getCustomerDetails(payload));
export const useTerminalList = createQueryHook(() => ApiService.cli.listRunningTerminals());
export const useConfigOptions = createQueryHook(() => ApiService.config.getOptions());