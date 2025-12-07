import * as React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
    LayoutDashboard,
    Wifi,
    Database,
    FileText,
    LayoutTemplate,
    ChevronLeft,
    ChevronRight,
    Settings,
    PenTool,
    Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import { useAppStore } from '../store';
import { Tooltip } from './ui/Tooltip';

export const Sidebar = () => {
    const { isSidebarCollapsed, toggleSidebar } = useAppStore();
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
        { label: 'Broadband', icon: Wifi, to: '/broadband' },
        { label: 'Database', icon: Database, to: '/database' },
        { label: 'System Logs', icon: FileText, to: '/logs' },
        { label: 'Templates', icon: LayoutTemplate, to: '/template' },
    ];

    const toolsItems = [
        { label: 'Excalidraw', icon: PenTool, to: '/excalidraw' },
        { label: 'React Flow', icon: Workflow, to: '/reactflow' },
    ];

    return (
        <aside
            className={cn(
                "bg-card border-r border-border h-full flex flex-col transition-all duration-300 z-30",
                isSidebarCollapsed ? "w-[60px]" : "w-64"
            )}
        >
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                {!isSidebarCollapsed && (
                    <div className="flex items-center gap-2 font-bold text-xl text-primary animate-in fade-in duration-300">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">N</div>
                        <span>Nexus</span>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className={cn("text-muted-foreground hover:bg-muted", isSidebarCollapsed && "mx-auto")}
                >
                    {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-2 custom-scrollbar">
                <div className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:block">
                    {!isSidebarCollapsed && "Main Menu"}
                </div>

                {navItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                            location.pathname === item.to
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        <item.icon size={20} className={cn("shrink-0", location.pathname === item.to ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                        {!isSidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                ))}

                <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:block">
                    {!isSidebarCollapsed && "Tools"}
                </div>

                {toolsItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                            location.pathname === item.to
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        <item.icon size={20} className={cn("shrink-0", location.pathname === item.to ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                        {!isSidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </div>

            <div className="p-2 border-t border-border">
                <Button variant="ghost" className={cn("w-full justify-start text-muted-foreground hover:text-foreground", isSidebarCollapsed && "justify-center px-0")}>
                    <Settings size={20} className="shrink-0" />
                    {!isSidebarCollapsed && <span className="ml-3">Settings</span>}
                </Button>
            </div>
        </aside>
    );
};
