import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User as UserIcon, Loader2, Sparkles, Sun, Moon, CheckCheck, Trash2, Command, ChevronRight, Home, Slash } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { AISearchStatus } from '../types';
import { askGemini } from '../services/geminiService';
import { useNotification } from '../hooks/useNotification';
import { useAppStore } from '../store';
import { useLocation, Link, useRouter } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Avatar } from './ui/Avatar';

export const Header: React.FC = () => {
    const { user, setGlobalSearchQuery, setAiResponse, toggleTheme, theme } = useAppStore();
    const [query, setQuery] = useState('');
    const [aiStatus, setAiStatus] = useState<AISearchStatus>(AISearchStatus.IDLE);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
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

    // Keyboard shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setShowNotifications(false);
                inputRef.current?.blur();
            }
        };
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

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

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setGlobalSearchQuery(query);
        }, 150);
        return () => clearTimeout(timer);
    }, [query, setGlobalSearchQuery]);

    // --- Handlers ---

    const handleAskAI = async () => {
        if (!query.trim()) return;

        setAiStatus(AISearchStatus.LOADING);
        setAiResponse(null);

        const answer = await askGemini(query);
        setAiResponse(answer);
        setAiStatus(AISearchStatus.SUCCESS);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleAskAI();
        }
    };

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
        <header className="sticky top-4 z-40 px-4 mb-2">
            <div className={cn(
                "mx-auto h-16 rounded-2xl flex items-center justify-between gap-4 px-4 transition-all duration-300",
                "bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-lg shadow-black/5 dark:shadow-black/20"
            )}>

                {/* Left: Branding & Breadcrumbs */}
                <div className="flex items-center gap-6">
                    {/* Breadcrumbs */}
                    <nav className="hidden md:flex items-center text-sm font-medium text-muted-foreground">
                        {breadcrumbs.map((item, index) => (
                            <React.Fragment key={item.path}>
                                {index > 0 && (
                                    <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/40" />
                                )}
                                <Link
                                    to={item.path}
                                    className={cn(
                                        "hover:text-foreground transition-colors flex items-center gap-2",
                                        index === breadcrumbs.length - 1 && "text-foreground font-semibold"
                                    )}
                                >
                                    {index === 0 && <Home className="h-3.5 w-3.5" />}
                                    {item.label}
                                </Link>
                            </React.Fragment>
                        ))}
                    </nav>
                </div>

                {/* Center: Command Search */}
                <div className={cn(
                    "flex-1 max-w-xl relative group transition-all duration-300",
                    isFocused ? "scale-[1.02]" : ""
                )}>
                    <div className={cn(
                        "relative flex items-center h-10 w-full rounded-xl overflow-hidden transition-all duration-200",
                        "bg-slate-100/50 dark:bg-white/5 border border-transparent",
                        isFocused && "bg-white dark:bg-black border-primary/20 ring-4 ring-primary/5 shadow-xl shadow-primary/5"
                    )}>
                        <div className="pl-3 text-muted-foreground">
                            <Search size={16} />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type to search or ask AI..."
                            className="flex-1 bg-transparent border-none outline-none px-3 text-sm placeholder:text-muted-foreground/60 h-full"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={handleKeyDown}
                        />
                        <div className="pr-2 flex items-center gap-2">
                            {query ? (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleAskAI}
                                    className="h-7 px-2 text-xs bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:text-indigo-400 hover:text-indigo-500"
                                >
                                    {aiStatus === AISearchStatus.LOADING ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                    Ask
                                </Button>
                            ) : (
                                <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/50 bg-background/50 text-[10px] text-muted-foreground font-mono">
                                    <span className="text-xs">⌘</span>K
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400"
                    >
                        {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                    </Button>

                    <div className="relative" ref={notificationRef}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 relative"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-black"></span>
                            )}
                        </Button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-4 w-80 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
                                    <h3 className="font-semibold text-sm">Notifications</h3>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={markAllAsRead}>
                                            <CheckCheck size={14} className="text-muted-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearAll}>
                                            <Trash2 size={14} className="text-muted-foreground" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground text-xs">
                                            No new notifications
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {notifications.map((n) => (
                                                <div key={n.id} className={cn(
                                                    "p-3 rounded-xl transition-colors flex items-start gap-3 relative group",
                                                    n.read ? "hover:bg-slate-50 dark:hover:bg-white/5" : "bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                )}>
                                                    <div className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0",
                                                        n.type === 'error' ? 'bg-red-500' :
                                                            n.type === 'success' ? 'bg-emerald-500' :
                                                                n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                                    )} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium leading-none text-foreground">{n.title}</div>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                                                        <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-medium">
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

                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10 mx-1"></div>

                    <button className="group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-all outline-none focus:ring-2 focus:ring-primary/20">
                        <Avatar
                            src={user?.avatarUrl}
                            fallback={user?.name?.charAt(0) || 'U'}
                            className="h-8 w-8 border border-slate-200 dark:border-white/10"
                        />
                        <div className="hidden sm:flex flex-col text-left">
                            <span className="text-xs font-semibold leading-none group-hover:text-primary transition-colors">{user?.name?.split(' ')[0] || 'Guest'}</span>
                            <span className="text-[10px] text-muted-foreground">Admin</span>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};