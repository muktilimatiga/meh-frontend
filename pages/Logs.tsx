import * as React from 'react';
import { ArrowLeft, RefreshCw, FileText, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useSupabaseStats } from '../hooks/useSupabaseStats';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Header } from '../components/Header';
import { AIResponseCard } from '../components/AIResponseCard';
import { MOCK_USER } from '../constants';

interface LogsPageProps {
    onBack: () => void;
}

export const LogsPage: React.FC<LogsPageProps> = ({ onBack }) => {
    // Reusing the stats hook which fetches tickets as a proxy for 'logs' in this demo
    // In a real app, useSystemLogs() would be better
    const { recentTickets, loading, isFallback } = useSupabaseStats();
    const [aiResponse, setAiResponse] = React.useState<string | null>(null);

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
                                <FileText className="h-5 w-5 text-orange-500" />
                                System Logs
                            </h1>
                            <p className="text-xs text-muted-foreground">Activity and error tracking</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-auto">
                    {isFallback && (
                        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3 text-amber-800 dark:text-amber-200">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="text-sm font-medium">Viewing Mock Data - Backend connection unavailable</span>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {loading ? (
                            <div className="text-center py-10 text-muted-foreground">Loading logs...</div>
                        ) : (
                            recentTickets.map((ticket, i) => (
                                <Card key={ticket.id} className="border-l-4 border-l-blue-500">
                                    <CardContent className="p-4 flex items-start gap-4">
                                        <div className="mt-1">
                                            {ticket.status === 'open' ? <AlertTriangle className="text-orange-500" size={20} /> : 
                                            ticket.status === 'resolved' ? <CheckCircle className="text-green-500" size={20} /> :
                                            <Info className="text-blue-500" size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-sm">{ticket.title}</h3>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {new Date(ticket.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Ticket ID: {ticket.id} • Assigned: {ticket.assigneeId || 'Unassigned'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};