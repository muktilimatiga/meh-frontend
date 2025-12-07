import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, CheckCheck, Trash2, ChevronRight, Home } from 'lucide-react';
import { Button } from './ui/Button';
import { useNotification } from '../hooks/useNotification';
import { useAppStore } from '../store';
import { useLocation, Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Avatar } from './ui/Avatar';

export const Header: React.FC = () => {
    const { user, toggleTheme, theme, setSearchOpen } = useAppStore();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const { unreadCount, notifications, markAllAsRead, clearAll } = useNotification();
    const isDarkMode = theme === 'dark';

    // --- Effects ---

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode, theme]);

    // Close notification dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Breadcrumbs Logic ---
    const getBreadcrumbs = () => {
        const path = location.pathname;
        if (path === '/') return [{ label: 'Dashboard', path: '/' }];

        const parts = path.split('/').filter(Boolean);
        return [
            { label: 'Home', path: '/' },
            ...parts.map((part, index) => {
                const to = `/${parts.slice(0, index + 1).join('/')}`;
                return {
                    label: part.charAt(0).toUpperCase() + part.slice(1),
                    path: to
                };
            })
        ];
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <header className="sticky top-0 z-40 px-6 py-4 mb-4">
            <div className="flex items-center justify-between w-full">

                {/* Left: Breadcrumbs */}
                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex items-center text-sm font-medium text-muted-foreground">
                        {breadcrumbs.map((item, index) => (
                            <React.Fragment key={item.path}>
                                {index > 0 && (
                                    <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/40" />
                                )}
                                <Link
                                    to={item.path}
                                    className={cn(
                                        "hover:text-foreground transition-colors flex items-center gap-2",
                                        index === breadcrumbs.length - 1 && "text-foreground font-semibold"
                                    )}
                                >
                                    {index === 0 && <Home className="h-4 w-4" />}
                                    {item.label}
                                </Link>
                            </React.Fragment>
                        ))}
                    </nav>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 pl-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSearchOpen(true)}
                        className="rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground h-10 w-10 transition-colors"
                    >
                        <Search size={20} />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground h-10 w-10 transition-colors"
                    >
                        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </Button>

                    <div className="relative" ref={notificationRef}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground relative h-10 w-10 transition-colors"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background"></span>
                            )}
                        </Button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-4 w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                <div className="flex items-center justify-between p-4 border-b border-border">
                                    <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg" onClick={markAllAsRead}>
                                            <CheckCheck size={16} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg" onClick={clearAll}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                                    {notifications.length === 0 ? (
                                        <div className="p-12 text-center text-muted-foreground text-sm">
                                            No new notifications
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {notifications.map((n) => (
                                                <div key={n.id} className={cn(
                                                    "p-3 rounded-xl transition-colors flex items-start gap-3 relative group",
                                                    n.read ? "hover:bg-muted/50" : "bg-muted/30 hover:bg-muted/50"
                                                )}>
                                                    <div className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0",
                                                        n.type === 'error' ? 'bg-red-500' :
                                                            n.type === 'success' ? 'bg-emerald-500' :
                                                                n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                                    )} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium leading-none text-foreground">{n.title}</div>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                                                        <p className="text-[10px] text-muted-foreground/60 mt-2 font-medium">
                                                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-8 w-[1px] bg-border mx-2"></div>

                    <button className="group flex items-center gap-3 pl-2 pr-2 py-1.5 rounded-xl hover:bg-muted/50 transition-all outline-none">
                        <Avatar
                            src={user?.avatarUrl}
                            fallback={user?.name?.charAt(0) || 'U'}
                            className="h-9 w-9 border border-border bg-muted text-muted-foreground"
                        />
                        <div className="hidden sm:flex flex-col text-left">
                            <span className="text-sm font-medium leading-none text-foreground group-hover:text-primary transition-colors">{user?.name?.split(' ')[0] || 'Alex'}</span>
                            <span className="text-[11px] text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">Admin</span>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};