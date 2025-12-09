import * as React from 'react';
import {
    Plus,
    Wifi,
    Database,
    FileText,
    LayoutTemplate,
    FileCog,
    Layers,
    Ticket,
    Network,
    PenTool,
    Workflow,
    CircleDashed,
    MoveRight,
    Settings as SettingsIcon
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
// Header is now in MainLayout
import { AppGrid } from '@/components/AppGrid'
import { AIResponseCard } from '@/components/AIResponseCard'
import { GlobalSearch } from '@/components/GlobalSearch'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { AppIcon } from '@/types'
import { MOCK_USER } from '@/constants'
import { useAppStore } from '@/store';
import { CreateTicketModal } from './components/ticket-modal';
import { ConfigModal } from './components/config-modal'

// Apps list matching requirements
const INITIAL_APPS: AppIcon[] = [
    {
        id: 'add',
        name: 'Add New',
        icon: Plus,
        color: 'var(--primary)',
        description: 'Install app'
    },
    {
        id: '/broadband',
        name: 'Broadband',
        icon: Wifi,
        color: 'var(--chart-1)',
        description: 'Network status'
    },
    {
        id: '/database',
        name: 'Database',
        icon: Database,
        color: 'var(--chart-2)',
        description: 'Data management'
    },
    {
        id: '/logs',
        name: 'Logs',
        icon: FileText,
        color: 'var(--chart-3)',
        description: 'System logs'
    },
    {
        id: '/template',
        name: 'Template',
        icon: LayoutTemplate,
        color: 'var(--chart-4)',
        description: 'Layouts'
    },
    {
        id: 'empty',
        name: 'Empty Slot',
        icon: CircleDashed,
        color: 'var(--muted-foreground)',
        description: 'Available space'
    },
];

export const DashboardPage: React.FC = () => {
    // Global state from store
    const { globalSearchQuery, aiResponse, setAiResponse, toggleSearch } = useAppStore();

    // Local UI state
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [isTopologyModalOpen, setIsTopologyModalOpen] = React.useState(false);
    const [launchingAppId, setLaunchingAppId] = React.useState<string | null>(null);

    // Business Modals State
    const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);
    const [configModalType, setConfigModalType] = React.useState<'basic' | 'bridge' | null>(null);

    const navigate = useNavigate();

    // Add keyboard shortcut for global search
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggleSearch();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [toggleSearch]);

    // Filter apps based on global search query
    const filteredApps = React.useMemo(() => {
        if (!globalSearchQuery) return INITIAL_APPS;
        const lowerQuery = globalSearchQuery.toLowerCase();
        return INITIAL_APPS.filter(app =>
            app.name.toLowerCase().includes(lowerQuery) ||
            app.description.toLowerCase().includes(lowerQuery)
        );
    }, [globalSearchQuery]);

    const handleAppClick = (appId: string) => {
        if (appId === 'add') {
            setIsAddModalOpen(true);
        } else if (appId === 'empty') {
            setIsTopologyModalOpen(true);
        } else {
            // Start launching effect
            setLaunchingAppId(appId);

            // Simulate loading delay then navigate
            setTimeout(() => {
                setLaunchingAppId(null);
                navigate({ to: appId });
            }, 800);
        }
    };

    const handleTopologySelect = (type: 'excalidraw' | 'reactflow') => {
        setIsTopologyModalOpen(false);
        navigate({ to: type === 'excalidraw' ? '/excalidraw' : '/reactflow' });
    };

    return (
        <main className="container mx-auto px-4 py-8 max-w-7xl">


            {/* AI Response Area */}
            {aiResponse && (
                <AIResponseCard
                    response={aiResponse}
                    onClose={() => setAiResponse(null)}
                />
            )}

            {/* App Grid Container */}
            <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8 min-h-[500px]">
                {/* Inner content area */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-semibold text-foreground">Installed Applications</h2>
                    <span className="text-xs font-medium px-2.5 py-1 bg-muted rounded-full text-muted-foreground border border-border/50">
                        {filteredApps.length} Apps
                    </span>
                </div>

                <AppGrid
                    apps={filteredApps}
                    onAppClick={handleAppClick}
                    launchingAppId={launchingAppId}
                />
            </div>

            {/* Add New Item Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Item"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Button
                        variant="outline"
                        className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                        onClick={() => {
                            setIsAddModalOpen(false);
                            setConfigModalType('basic');
                        }}
                    >
                        <FileCog className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">New Config</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all group">
                        <Layers className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">New Config Batch</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                        onClick={() => {
                            setIsAddModalOpen(false);
                            setIsTicketModalOpen(true);
                        }}
                    >
                        <Ticket className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">New Ticket</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                        onClick={() => {
                            setIsAddModalOpen(false);
                            setConfigModalType('bridge');
                        }}
                    >
                        <Network className="h-6 w-6 text-orange-500 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Config Bridge</span>
                    </Button>
                </div>
            </Modal>



            {/* Topology Selection Modal */}
            <Modal
                isOpen={isTopologyModalOpen}
                onClose={() => setIsTopologyModalOpen(false)}
                title="Select Topology Tool"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground mb-2">
                        Choose the environment that best fits your current task.
                    </p>

                    <button
                        className="relative w-full flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:bg-accent/50 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group text-left"
                        onClick={() => handleTopologySelect('excalidraw')}
                    >
                        <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 dark:bg-violet-900/30 dark:text-violet-300 shadow-sm">
                            <PenTool size={26} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-foreground text-base">Excalidraw</h3>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full dark:bg-violet-900/40 dark:text-violet-200 dark:border-violet-800">
                                    Creative
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed pr-6">
                                Best for free-form whiteboarding, sketching diagrams, and brainstorming sessions.
                            </p>
                        </div>
                        <MoveRight className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" size={20} />
                    </button>

                    <button
                        className="relative w-full flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:bg-accent/50 hover:border-pink-300 dark:hover:border-pink-700 transition-all cursor-pointer group text-left"
                        onClick={() => handleTopologySelect('reactflow')}
                    >
                        <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 dark:bg-pink-900/30 dark:text-pink-300 shadow-sm">
                            <Workflow size={26} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-foreground text-base">React Flow</h3>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full dark:bg-pink-900/40 dark:text-pink-200 dark:border-pink-800">
                                    Structured
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed pr-6">
                                Best for building logic flows, data pipelines, and connected node graphs.
                            </p>
                        </div>
                        <MoveRight className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" size={20} />
                    </button>
                </div>
            </Modal>

            {/* Global Search Component */}
            <GlobalSearch />

            {/* Business Modals */}
            <CreateTicketModal
                isOpen={isTicketModalOpen}
                onClose={() => setIsTicketModalOpen(false)}
            />

            <ConfigModal
                isOpen={!!configModalType}
                onClose={() => setConfigModalType(null)}
                type={configModalType || 'basic'}
            />
        </main>
    );
};