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

// --- Ticket Logs Hooks ---
export const useTicketLogs = (ticketId?: string) => {
  return useQuery({
    queryKey: ['ticket-logs', ticketId],
    queryFn: async () => {
      if (!ticketId) return [];
      
      // Fallback to mock logs
      return [
        {
          id: 'log-1',
          ticketId,
          message: 'Ticket created',
          createdAt: new Date().toISOString(),
          userName: 'System'
        },
        {
          id: 'log-2',
          ticketId,
          message: 'Ticket assigned to support team',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          userName: 'Admin'
        }
      ] as Array<{
        id: string;
        ticketId: string;
        message: string;
        createdAt: string;
        userName: string;
      }>;
    },
    enabled: !!ticketId,
  });
};