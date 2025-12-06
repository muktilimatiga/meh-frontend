import * as React from 'react';
import { ArrowLeft, RefreshCw, Database as DbIcon, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useSupabaseTableData } from '../hooks/useSupabaseTableData';
import { EnhancedTable, ColumnDef } from '../components/ui/EnhancedTable';
import { Header } from '../components/Header';
import { AIResponseCard } from '../components/AIResponseCard';
import { MOCK_USER } from '../constants';

interface DatabasePageProps {
    onBack: () => void;
}

export const DatabasePage: React.FC<DatabasePageProps> = ({ onBack }) => {
    const [tableName, setTableName] = React.useState('log_komplain');
    const { data, loading, refetch } = useSupabaseTableData(tableName);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [aiResponse, setAiResponse] = React.useState<string | null>(null);

    // Dynamically generate columns based on first row of data
    const columns = React.useMemo<ColumnDef<any>[]>(() => {
        if (!data || data.length === 0) return [];
        
        const firstRow = data[0];
        // Take first 6 keys for display
        return Object.keys(firstRow).slice(0, 6).map(key => ({
            header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            accessorKey: key,
            cell: (info) => {
                const val = info.getValue();
                if (typeof val === 'object') return JSON.stringify(val);
                return String(val);
            }
        }));
    }, [data]);

    return (
        <div className="flex flex-col h-screen bg-background font-sans text-foreground">
            <Header 
                user={MOCK_USER} 
                onSearch={() => {}} 
                onAIResult={setAiResponse} 
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                {aiResponse && (
                    <div className="p-4 border-b border-border bg-muted/20">
                        <AIResponseCard response={aiResponse} onClose={() => setAiResponse(null)} />
                    </div>
                )}

                <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <DbIcon className="h-5 w-5 text-blue-500" />
                                Database Manager
                            </h1>
                            <p className="text-xs text-muted-foreground">View and manage system tables</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select 
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                        >
                            <option value="log_komplain">Tickets (log_komplain)</option>
                            <option value="data_fiber">Customers (data_fiber)</option>
                            <option value="snmp_devices">Devices (snmp_devices)</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <Button variant="outline" size="sm" onClick={refetch}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </Button>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Filter local results..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                        {loading ? (
                            <div className="p-12 flex justify-center text-muted-foreground">Loading data...</div>
                        ) : (
                            <EnhancedTable 
                                data={data.filter(item => JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()))}
                                columns={columns} 
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};