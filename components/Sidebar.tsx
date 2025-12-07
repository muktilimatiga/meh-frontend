import * as React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
    LayoutDashboard,
    Wifi,
    Database,
    FileText,
    LayoutTemplate,
    ChevronRight,
    Settings,
    PenTool,
    Workflow,
    ClipboardList,
    Cast
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';

export const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
        { label: 'Broadband', icon: Wifi, to: '/broadband' },
        { label: 'Database', icon: Database, to: '/database' },
        { label: 'Log Komplain', icon: ClipboardList, to: '/log-komplain' },
        { label: 'Remotes', icon: Cast, to: '/remotes' },
        { label: 'System Logs', icon: FileText, to: '/logs' },
        { label: 'Templates', icon: LayoutTemplate, to: '/template' },
    ];

    const toolsItems = [
        { label: 'Excalidraw', icon: PenTool, to: '/excalidraw' },
        { label: 'React Flow', icon: Workflow, to: '/reactflow' },
    ];

    return (
        <aside className="bg-card border-r border-border h-full flex flex-col w-[60px] z-30 items-center py-4">
            {/* Top Header Icon */}
            <div className="h-12 w-full flex items-center justify-center mb-4 border-b border-border/50 pb-4">
                 <ChevronRight className="text-muted-foreground" size={20} />
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 w-full px-2 custom-scrollbar items-center">
                {navItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 group",
                            location.pathname === item.to
                                ? "bg-secondary text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                        title={item.label}
                    >
                        <item.icon size={20} strokeWidth={1.5} />
                    </Link>
                ))}

                <div className="w-8 h-[1px] bg-border/50 my-2" />

                {toolsItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 group",
                            location.pathname === item.to
                                ? "bg-secondary text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                        title={item.label}
                    >
                         <item.icon size={20} strokeWidth={1.5} />
                    </Link>
                ))}
            </div>

            <div className="p-2 mt-auto w-full flex justify-center border-t border-border/50 pt-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground w-10 h-10 rounded-xl">
                    <Settings size={20} strokeWidth={1.5} />
                </Button>
            </div>
        </aside>
    );
};
