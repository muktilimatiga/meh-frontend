
import * as React from 'react';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Ticket as TicketIcon, Search, Users, Shield, Globe } from 'lucide-react';
import { useAppStore } from '../store'
import { Command, CommandInput, CommandList, CommandItem } from './ui';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from '@tanstack/react-router';

interface SearchResultItem {
    id: string;
    title: string;
    subtitle?: string;
    type: 'page' | 'ticket' | 'customer' | 'user';
    to?: string; // For pages
    meta?: any;
}

interface SearchResults {
    pages: SearchResultItem[];
    tickets: SearchResultItem[];
    customers: SearchResultItem[];
    users: SearchResultItem[];
}

export const GlobalSearch = () => {
    const { isSearchOpen, setSearchOpen } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchQuery.length > 1) {
                setLoading(true);
                try {
                    // 1. Static Pages Search
                    const staticPages: SearchResultItem[] = [
                        { title: 'Dashboard', to: '/', type: 'page', id: 'p1' },
                        { title: 'Broadband', to: '/broadband', type: 'page', id: 'p2' },
                        { title: 'Database', to: '/database', type: 'page', id: 'p3' },
                        { title: 'System Logs', to: '/logs', type: 'page', id: 'p4' },
                        { title: 'Templates', to: '/template', type: 'page', id: 'p5' },
                        { title: 'Excalidraw', to: '/excalidraw', type: 'page', id: 'p6' },
                        { title: 'React Flow', to: '/reactflow', type: 'page', id: 'p7' }
                    ];
                    const pages = staticPages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

                    // 2. Tickets Search (log_komplain)
                    const { data: ticketData } = await supabase
                        .from('log_komplain')
                        .select('id, tiket, kendala, status')
                        .or(`kendala.ilike.%${searchQuery}%,nama.ilike.%${searchQuery}%,tiket.ilike.%${searchQuery}%`)
                        .limit(5);

                    const tickets: SearchResultItem[] = (ticketData || []).map((t: any) => ({
                        id: t.tiket || t.id.toString(),
                        title: t.kendala || 'No Subject',
                        subtitle: t.tiket ? `Ticket #${t.tiket}` : `ID: ${t.id}`,
                        type: 'ticket',
                        meta: { status: t.status }
                    }));

                    // 3. Customers Search (data_fiber)
                    const { data: customerData } = await supabase
                        .from('data_fiber')
                        .select('user_pppoe, name, alamat')
                        .or(`name.ilike.%${searchQuery}%,user_pppoe.ilike.%${searchQuery}%,alamat.ilike.%${searchQuery}%`)
                        .limit(5);

                    const customers: SearchResultItem[] = (customerData || []).map((c: any) => ({
                        id: c.user_pppoe || Math.random().toString(),
                        title: c.name || 'Unknown',
                        subtitle: c.user_pppoe || c.alamat,
                        type: 'customer'
                    }));

                    // 4. System Users Search (users)
                    // Note: Handle case where 'users' table might not exist or return error gracefully
                    let users: SearchResultItem[] = [];
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('id, username, full_name, role')
                        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
                        .limit(3);

                    if (!userError && userData) {
                        users = userData.map((u: any) => ({
                            id: u.id.toString(),
                            title: u.full_name || u.username,
                            subtitle: u.role,
                            type: 'user'
                        }));
                    }

                    setSearchResults({ pages, tickets, customers, users });
                } catch (error) {
                    console.error("Global search failed:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setSearchResults(null);
            }
        }, 400); // 400ms debounce

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const handleSelect = (item: SearchResultItem) => {
        setSearchOpen(false);
        setSearchQuery('');

        if (item.type === 'page' && item.to) {
            navigate({ to: item.to });
        } else if (item.type === 'ticket') {
            // In a real app, navigate to ticket detail
            console.log(`Opening ticket ${item.id}`);
            // For now, just log the action as there's no dedicated tickets page
        } else if (item.type === 'customer') {
            // For now, just log the action as there's no dedicated customers page
            console.log(`Opening customer ${item.id}`);
        }
    };

    if (!isSearchOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSearchOpen(false)} />
            <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[100] rounded-3xl shadow-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#121214] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <Command className="h-full bg-transparent">
                    <div className="flex items-center border-b border-slate-100 dark:border-white/10 px-4">
                        <Search className="mr-3 h-5 w-5 shrink-0 opacity-50" />
                        <input
                            placeholder="Search database (tickets, customers, users)..."
                            autoFocus
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex h-14 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-50 dark:placeholder:text-slate-500"
                        />
                        {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />}
                    </div>

                    <CommandList className="max-h-[500px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                        {!searchQuery && (
                            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                                <p>Type to search across entire Nexus database.</p>
                                <div className="mt-4 flex justify-center gap-2">
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded text-xs">Tickets</span>
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded text-xs">Customers</span>
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded text-xs">System</span>
                                </div>
                            </div>
                        )}

                        {searchResults && (
                            <>
                                {/* Pages */}
                                {searchResults.pages.length > 0 && (
                                    <div className="mb-2">
                                        <p className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">Navigation</p>
                                        {searchResults.pages.map((item) => (
                                            <CommandItem key={item.id} onClick={() => handleSelect(item)} className="rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <LayoutDashboard className="h-4 w-4 text-slate-400" />
                                                    <span>{item.title}</span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </div>
                                )}

                                {/* Tickets */}
                                {searchResults.tickets.length > 0 && (
                                    <div className="mb-2">
                                        <p className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">Tickets</p>
                                        {searchResults.tickets.map((item) => (
                                            <CommandItem key={item.id} onClick={() => handleSelect(item)} className="rounded-xl">
                                                <div className="flex items-center gap-3 w-full">
                                                    <TicketIcon className="h-4 w-4 text-indigo-500" />
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="truncate font-medium">{item.title}</span>
                                                        <span className="text-xs text-slate-400 truncate">{item.subtitle}</span>
                                                    </div>
                                                    {item.meta?.status && (
                                                        <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded capitalize text-slate-500">
                                                            {item.meta.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </div>
                                )}

                                {/* Customers */}
                                {searchResults.customers.length > 0 && (
                                    <div className="mb-2">
                                        <p className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">Customers (Fiber)</p>
                                        {searchResults.customers.map((item) => (
                                            <CommandItem key={item.id} onClick={() => handleSelect(item)} className="rounded-xl">
                                                <div className="flex items-center gap-3 w-full">
                                                    <Globe className="h-4 w-4 text-emerald-500" />
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="truncate font-medium">{item.title}</span>
                                                        <span className="text-xs text-slate-400 truncate">{item.subtitle}</span>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </div>
                                )}

                                {/* Users */}
                                {searchResults.users.length > 0 && (
                                    <div className="mb-2">
                                        <p className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">System Users</p>
                                        {searchResults.users.map((item) => (
                                            <CommandItem key={item.id} onClick={() => handleSelect(item)} className="rounded-xl">
                                                <div className="flex items-center gap-3 w-full">
                                                    <Shield className="h-4 w-4 text-amber-500" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{item.title}</span>
                                                        <span className="text-xs text-slate-400">{item.subtitle}</span>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </div>
                                )}

                                {/* Empty State */}
                                {Object.values(searchResults).every((arr: any) => arr.length === 0) && (
                                    <div className="py-6 text-center text-sm text-slate-500">
                                        No results found for "{searchQuery}".
                                    </div>
                                )}
                            </>
                        )}
                    </CommandList>
                </Command>
            </div>
        </>
    );
};
