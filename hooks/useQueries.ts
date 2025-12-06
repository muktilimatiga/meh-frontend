import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, User, TicketLog, DashboardStats, TrafficData, Device, SystemLog } from '../types';

// --- Query Keys ---
export const queryKeys = {
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    traffic: ['dashboard', 'traffic'] as const,
    distribution: ['dashboard', 'distribution'] as const,
  },
  logs: {
    all: ['system-logs'] as const,
  }
};

// --- System Log Hooks ---
export const useSystemLogs = () => {
  return useQuery({
    queryKey: queryKeys.logs.all,
    queryFn: async () => {
        // Fallback to mock logs
        return [
            { id: 'log-1', level: 'info', message: 'System started', timestamp: Date.now() },
            { id: 'log-2', level: 'warning', message: 'High memory usage', timestamp: Date.now() - 50000 }
        ] as SystemLog[];
    },
    refetchInterval: 10000, 
  });
};

export const useLogActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (log: Partial<SystemLog>) => {
        console.log("Logging activity:", log);
        return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logs.all });
    },
  });
};