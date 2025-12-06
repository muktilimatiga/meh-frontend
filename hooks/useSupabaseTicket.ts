
import * as React from 'react';
import { supabase } from '../lib/supabaseClient';
import { Ticket } from '../types';

export const useSupabaseTickets = () => {
  const [data, setData] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refetchIndex, setRefetchIndex] = React.useState(0);

  const refetch = () => setRefetchIndex((prev) => prev + 1);

  React.useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      
      if (!supabase || (supabase['supabaseUrl'] && supabase['supabaseUrl'].includes('placeholder'))) {
         setLoading(false);
         return; 
      }

      try {
        const { data: rows, error } = await supabase
          .from('log_komplain')
          .select('*')
          .order('id', { ascending: false })
          .limit(100);

        if (error) throw error;

        const mapped: Ticket[] = (rows || []).map((row: any) => ({
          id: row.tiket ? String(row.tiket) : (row.id ? String(row.id) : `tmp-${Math.random()}`),
          title: row.kendala || 'No Subject',
          status: mapDbStatusToUi(row.status),
          priority: 'medium',
          assigneeId: row.nama || null,
          createdAt: row.tanggal ? new Date(row.tanggal).toISOString() : new Date().toISOString(),
        }));

        setData(mapped);
      } catch (err) {
        console.error("Failed to fetch tickets page data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [refetchIndex]);

  return { data, loading, refetch };
};

const mapDbStatusToUi = (status: string): Ticket['status'] => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'open') return 'open';
    if (s === 'proses') return 'in_progress';
    if (s === 'fwd teknis') return 'in_progress';
    if (s === 'done') return 'resolved';
    if (s === 'done/fwd') return 'closed';
    return 'open';
};
