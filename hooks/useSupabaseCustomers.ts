import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { toast } from 'sonner';

export const useSupabaseCustomers = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);

      // Check if Supabase is configured
      if (!supabase || (supabase['supabaseUrl'] && supabase['supabaseUrl'].includes('placeholder'))) {
         setLoading(false);
         // Optionally set mock data here if needed for testing without real backend
         return;
      }

      try {
        let query = supabase.from('data_fiber').select('*');

        // Apply server-side search if term exists
        if (searchTerm && searchTerm.length > 1) {
            // Search across relevant columns: name, user_pppoe, alamat, onu_sn
            query = query.or(`name.ilike.%${searchTerm}%,user_pppoe.ilike.%${searchTerm}%,alamat.ilike.%${searchTerm}%,onu_sn.ilike.%${searchTerm}%`);
        }

        // Fetch up to 100 rows (or search results)
        const { data: rows, error } = await query.limit(100);

        if (error) throw error;

        // Map data_fiber rows to a structure compatible with User type but preserving extra fields
        const mapped = (rows || []).map((row: any) => ({
          ...row,
          // Mandatory User type fields
          id: row.user_pppoe || row.id || `fiber-${Math.random()}`,
          name: row.name || 'Unknown',
          email: row.user_pppoe || 'No PPPoE', // Display PPPoE as main identifier
          role: 'user',
          // Specific fields from data_fiber
          address: row.alamat,
          olt: row.olt_name,
          port: row.olt_port,
          sn: row.onu_sn,
          packet: row.paket || row.packet
        }));

        setData(mapped);
      } catch (err: any) {
        console.error("Failed to fetch customers from data_fiber", err);
        toast.error("Failed to load customers", { description: err.message });
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
        fetchCustomers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return { data, loading, searchTerm, setSearchTerm };
};