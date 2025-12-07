import * as React from 'react';
import { ArrowLeft, RefreshCw, FileText, AlertTriangle, Info, CheckCircle, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useSystemLogs } from '../hooks/useSystemLogs'; // New hook
import { Badge } from '../components/ui/Badge';
import { EnhancedTable, ColumnDef } from '../components/ui/EnhancedTable';
import { AIResponseCard } from '../components/AIResponseCard';
import { MOCK_USER } from '../constants';
import { useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../store';

export const LogsPage: React.FC = () => {
    const navigate = useNavigate();
    const onBack = () => navigate({ to: '/' });
    const { setAiResponse, aiResponse, globalSearchQuery } = useAppStore();
    const { logs, loading, isFallback } = useSystemLogs();

    const filteredLogs = React.useMemo(() => {
        if (!globalSearchQuery) return logs;
        const lower = globalSearchQuery.toLowerCase();
        return logs.filter(log =>
            log.message.toLowerCase().includes(lower) ||
            log.source.toLowerCase().includes(lower) ||
            log.level.toLowerCase().includes(lower)
        );
    }, [logs, globalSearchQuery]);

    const columns: ColumnDef<any>[] = [
        {
            header: 'Level',
            accessorKey: 'level',
            cell: ({ row }) => {
                const level = row.getValue('level') as string;
                return (
                    <div className="flex items-center gap-2">
                        {level === 'error' ? <AlertTriangle className="text-red-500 h-4 w-4" /> :
                            level === 'warning' ? <AlertTriangle className="text-amber-500 h-4 w-4" /> :
                                <Info className="text-blue-500 h-4 w-4" />}
                        <span className={`capitalize font-medium ${level === 'error' ? 'text-red-700 dark:text-red-400' :
                            level === 'warning' ? 'text-amber-700 dark:text-amber-400' :
                                'text-blue-700 dark:text-blue-400'
                            }`}>{level}</span>
                    </div>
                );
            }
        },
        {
            header: 'Message',
            accessorKey: 'message',
            cell: ({ row }) => (
                <span className="font-medium text-slate-700 dark:text-slate-200">
                    {row.getValue('message')}
                </span>
            )
        },
        {
            header: 'Source',
            accessorKey: 'source',
            cell: ({ row }) => (
                <Badge variant="outline" className="font-mono text-xs">
                    {row.getValue('source') || 'system'}
                </Badge>
            )
        },
        {
            header: 'Timestamp',
            accessorKey: 'timestamp',
            cell: ({ row }) => (
                <span className="text-xs text-slate-500 font-mono">
                    {new Date(row.getValue('timestamp')).toLocaleString()}
                </span>
            )
        }
    ];

    return (
        <div className="flex flex-col h-full bg-background font-sans text-foreground animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <FileText className="h-5 w-5 text-orange-500" />
                            System Logs
                        </h1>
                        <p className="text-xs text-muted-foreground">Monitor system activity, errors, and warnings</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {isFallback && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3 text-amber-800 dark:text-amber-200 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Running in offline mode. Displaying generated sample data.</span>
                    </div>
                )}

                <EnhancedTable
                    data={logs}
                    columns={columns}
                    searchKey="message"
                />
            </div>
        </div>
    );
};