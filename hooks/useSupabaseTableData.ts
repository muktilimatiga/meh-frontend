import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export const useSupabaseTableData = (tableName: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = () => setRefetchIndex(prev => prev + 1);

  useEffect(() => {
    const fetchData = async () => {
      if (!tableName) return;
      
      setLoading(true);
      try {
        const { data: rows, error: err } = await supabase
          .from(tableName)
          .select('*')
          .limit(100);

        if (err) throw err;

        const safeRows = (rows || []).map((row, index) => {
            const uniqueId = 
                row.id || 
                row.tiket || 
                row.user_pppoe || 
                (row.olt_name && row.interface ? `${row.olt_name}-${row.interface}` : null) ||
                row.name || 
                `row-${index}`;
            
            return { ...row, id: uniqueId };
        });

        setData(safeRows);
      } catch (err: any) {
        console.error(`Error fetching data for ${tableName}:`, err);
        setError(err.message);
        toast.error(`Could not load ${tableName}`, { description: err.message });
        
        // Fallback mock data for demo if connection fails
        if (tableName === 'log_komplain') {
            setData([
                { id: '1', tiket: 'T-100', kendala: 'No Internet', status: 'open', nama: 'User A' },
                { id: '2', tiket: 'T-101', kendala: 'Slow Connection', status: 'done', nama: 'User B' },
            ]);
        } else {
            setData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, refetchIndex]);

  return { data, loading, error, refetch };
};