import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LogMetro } from '@/types';

export const useSupabaseLogMetro = () => {
    const [data, setData] = React.useState<LogMetro[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refetchIndex, setRefetchIndex] = React.useState(0);

    const refetch = () => setRefetchIndex((prev) => prev + 1);

    React.useEffect(() => {
        const fetchLogMetro = async () => {
            setLoading(true);

            if (!supabase || (supabase['supabaseUrl'] && supabase['supabaseUrl'].includes('placeholder'))) {
                setLoading(false);
                return;
            }

            try {
                const { data: rows, error } = await supabase
                    .from('log_metro')
                    .select('*')
                    .order('id', { ascending: false })
                    .limit(100);

                if (error) throw error;

                const mapped: LogMetro[] = (rows || []).map((row: any) => ({
                    id: row.id ? String(row.id) : (row.id ? String(row.id) : `tmp-${Math.random()}`),
                    service_name: row.service_name || 'No Service Name',
                    month_sheet: row.month_sheet || 'No Month Sheet',
                    no_ref: row.no_ref || 0,
                    description: row.description || 'No Description',
                    start_time: row.start_time ? new Date(row.start_time).toISOString() : new Date().toISOString(),
                    finish_time: row.finish_time ? new Date(row.finish_time).toISOString() : new Date().toISOString(),
                    downtime_duration: row.downtime_duration || 0,
                    downtime_minutes: row.downtime_minutes || 0,
                    problem_detail: row.problem_detail || 'No Problem Detail',
                    action_taken: row.action_taken || 'No Action Taken',
                }));

                setData(mapped);
            } catch (err) {
                console.error("Failed to fetch log metro data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogMetro();
    }, [refetchIndex]);

    return { data, loading, refetch };
}
