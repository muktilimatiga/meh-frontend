import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Ticket, TrafficData } from '../types';
import { toast } from 'sonner';

export interface KomplainStats {
  totalToday: number;
  open: number;
  proses: number;
  fwdTeknis: number;
}

export const useSupabaseStats = () => {
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        if (!supabase || (supabase['supabaseUrl'] && supabase['supabaseUrl'].includes('placeholder'))) {
           throw new Error("Placeholder URL");
        }

        const { data: recentRes, error } = await supabase
            .from('log_komplain')
            .select('*')
            .order('id', { ascending: false })
            .limit(10);

        if (error) throw error;

        const adaptTicket = (row: any): Ticket => ({
          id: row.tiket || String(row.id),
          title: row.kendala || 'No description',
          status: (row.status || 'open') as any,
          priority: 'medium', 
          assigneeId: row.nama || null,
          createdAt: row.tanggal ? new Date(row.tanggal).toISOString() : new Date().toISOString()
        });

        setRecentTickets((recentRes || []).map(adaptTicket));

      } catch (err) {
        setIsFallback(true);
        // Mock Data Fallback
        setRecentTickets([
            { id: 'MOCK-1', title: 'Fiber Cut Detected', status: 'open', priority: 'high', createdAt: new Date().toISOString() },
            { id: 'MOCK-2', title: 'High Latency Report', status: 'in_progress', priority: 'medium', createdAt: new Date().toISOString() },
            { id: 'MOCK-3', title: 'ONT Offline', status: 'resolved', priority: 'low', createdAt: new Date().toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { recentTickets, loading, isFallback };
};