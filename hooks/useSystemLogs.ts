import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SystemLog } from '../types';
import { toast } from 'sonner';

export const useSystemLogs = () => {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFallback, setIsFallback] = useState(false);

    // Helper to generate mock logs
    const generateMockLogs = (): SystemLog[] => {
        return Array.from({ length: 20 }).map((_, i) => ({
            id: `log-${i}`,
            level: i % 5 === 0 ? 'error' : i % 3 === 0 ? 'warning' : 'info',
            message: i % 5 === 0 ? 'Database connection timeout' : i % 3 === 0 ? 'High memory usage detected' : 'User login successful',
            timestamp: Date.now() - (i * 1000 * 60 * 5), // scattered over time
            source: i % 2 === 0 ? 'auth-service' : 'database'
        }));
    };

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);

            try {
                if (!supabase || (supabase['supabaseUrl'] && supabase['supabaseUrl'].includes('placeholder'))) {
                    throw new Error("Placeholder URL");
                }

                const { data, error } = await supabase
                    .from('system_logs')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(50);

                if (error) throw error;

                // Adapt data if necessary, assuming DB cols match types
                const adaptedLogs: SystemLog[] = (data || []).map((row: any) => ({
                    id: row.id,
                    level: row.level,
                    message: row.message,
                    timestamp: new Date(row.timestamp).getTime(),
                    source: row.source
                }));

                setLogs(adaptedLogs);

            } catch (err) {
                if (!isFallback) {
                    console.warn("Using fallback/mock data for logs due to error or missing backend:", err);
                    setIsFallback(true);
                }
                setLogs(generateMockLogs());
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    return { logs, loading, isFallback };
};
