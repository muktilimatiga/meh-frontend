
import * as React from 'react';
import { useState, useEffect } from 'react';
import { ChevronLeft, Search, Lock, Unlock, X, RefreshCw, Cloud, Server, ChevronDown, List, User as UserIcon, MapPin, Phone, Hash, AlertCircle, FileText as FileTextIcon } from 'lucide-react';
import { ModalOverlay, Label, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Button, Badge, Avatar, Switch } from '@/components/ui'
import { cn } from '@/lib/utils';
import { Ticket, UnconfiguredOnt } from '@/types';
import { useTicketStore } from '../stores/ticketStore';
import { useTicketLogs } from '@/hooks/useQueries';
import { CustomerCard } from './CustomerCard';
import { supabase } from '@/lib/supabaseClient';
import { ConfigService } from '@/services/external';
import { toast } from 'sonner';

// --- Types ---
interface TicketFormData {
    name: string;
    address: string;
    contact: string;
    noInternet: string;
    ticketRef: string;
    priority: string;
    type: string;
    description: string;
}
interface User {
    name: string;
    role: string;
}
// --- Reusable Pure Components ---

interface TicketFormFieldsProps {
    data: TicketFormData;
    onChange?: (updates: Partial<TicketFormData>) => void;
    readOnly?: boolean;
}

const TicketFormFields = ({
    data,
    onChange,
    readOnly = false
}: TicketFormFieldsProps) => {

    // Helper to safely call onChange if provided
    const handleChange = (field: keyof TicketFormData, value: string) => {
        if (onChange) {
            onChange({ [field]: value });
        }
    };

    return (
        <div className="p-6 space-y-5">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={e => handleChange('name', e.target.value)}
                    className="bg-slate-50/50 dark:bg-zinc-800/50"
                    readOnly={readOnly}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Installation Address</Label>
                <Input
                    id="address"
                    value={data.address}
                    onChange={e => handleChange('address', e.target.value)}
                    className="bg-slate-50/50 dark:bg-zinc-800/50"
                    readOnly={readOnly}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input
                        id="contact"
                        value={data.contact}
                        onChange={e => handleChange('contact', e.target.value)}
                        className="bg-slate-50/50 dark:bg-zinc-800/50"
                        readOnly={readOnly}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="noInternet">No Internet ID</Label>
                    <Input
                        id="noInternet"
                        value={data.noInternet}
                        onChange={e => handleChange('noInternet', e.target.value)}
                        className="bg-slate-50/50 dark:bg-zinc-800/50"
                        readOnly={readOnly}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="ticketRef">Reference</Label>
                    <Input
                        id="ticketRef"
                        value={data.ticketRef}
                        readOnly
                        className="bg-slate-100 dark:bg-white/10 text-slate-500 cursor-not-allowed font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                        value={data.priority}
                        onValueChange={v => handleChange('priority', v)}
                        disabled={readOnly}
                    >
                        <SelectTrigger id="priority" className="bg-white dark:bg-zinc-800 dark:text-slate-200">
                            <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                        value={data.type}
                        onValueChange={v => handleChange('type', v)}
                        disabled={readOnly}
                    >
                        <SelectTrigger id="type" className="bg-white dark:bg-zinc-800 dark:text-slate-200">
                            <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Technical">Technical</SelectItem>
                            <SelectItem value="Billing">Billing</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Complaint">Complaint</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Problem Description</Label>
                <Textarea
                    id="description"
                    rows={4}
                    className="resize-none bg-slate-50/50 dark:bg-black/20 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Describe the customer's issue in detail..."
                    value={data.description}
                    onChange={e => handleChange('description', e.target.value)}
                    readOnly={readOnly}
                />
            </div>
        </div>
    );
};

// --- Create Ticket Modal (Zustand + Props) ---
export const CreateTicketModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const {
        step,
        setStep,
        searchQuery,
        setSearchQuery,
        searchResults,
        searchCustomers,
        selectUser,
        selectedUser,
        formData,
        updateFormData,
        reset,
        isSearching
    } = useTicketStore();

    useEffect(() => {
        if (isOpen) {
            reset();
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            searchCustomers(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleClose = () => {
        onClose();
        setTimeout(reset, 200);
    };

    return (
        // Open Ticket Modal
        <ModalOverlay isOpen={isOpen} onClose={handleClose} className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto">

                {step === 1 && (
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Create Open Ticket</h2>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-2 rounded-full flex-1 bg-indigo-600" />
                            <div className="h-2 rounded-full flex-1 bg-slate-200 dark:bg-white/10" />
                        </div>

                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="customer-search">Find Customer</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="customer-search"
                                        placeholder="Search by name, PPPoE or address..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="min-h-[200px] border border-slate-100 rounded-md p-2 dark:border-white/10">
                                {isSearching && (
                                    <div className="text-center py-8 text-xs text-slate-500">Searching...</div>
                                )}
                                {!isSearching && searchResults.length === 0 && searchQuery.length > 1 && (
                                    <p className="text-xs text-slate-500 text-center py-8">No customers found.</p>
                                )}
                                {!isSearching && searchResults.length === 0 && searchQuery.length <= 1 && (
                                    <p className="text-xs text-slate-500 text-center py-8">Start typing to search...</p>
                                )}
                                <div className="space-y-1">
                                    {searchResults.map(user => (
                                        <div
                                            key={user.id}
                                            onClick={() => selectUser(user)}
                                            className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded cursor-pointer transition-colors"
                                        >
                                            <Avatar fallback={user.name?.charAt(0) || '?'} className="h-8 w-8 text-xs" />
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{user.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email} {(user as any)._address ? `• ${(user as any)._address}` : ''}</p>
                                            </div>
                                            <Badge variant="outline" className="ml-auto text-[10px] whitespace-nowrap">{user.role}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && selectedUser && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <CustomerCard user={selectedUser} onChangeUser={() => setStep(1)} />
                        <TicketFormFields data={formData} onChange={updateFormData} />
                    </div>
                )}
            </div>

            {step === 2 && selectedUser && (
                <div className="flex justify-end gap-2 p-6 pt-4 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-zinc-900 sticky bottom-0 z-10 shadow-lg">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleClose} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none">Create Ticket</Button>
                </div>
            )}
        </ModalOverlay>
    );
};

// --- Process Action Modal (Zustand + Props) ---
export const ProcessActionModal = ({
    ticket,
    isOpen,
    onClose,
    onConfirm
}: {
    ticket: Ticket | null,
    isOpen: boolean,
    onClose: () => void,
    onConfirm: (id: string, action: 'in_progress' | 'closed', note: string) => void,
}) => {
    const { initializeFromTicket, selectedUser, formData, updateFormData, reset } = useTicketStore();

    useEffect(() => {
        if (isOpen && ticket) {
            initializeFromTicket(ticket);
        } else {
            reset();
        }
    }, [isOpen, ticket]);

    const handleClose = () => {
        onClose();
        setTimeout(reset, 200);
    };

    if (!ticket) return null;

    return (
        <ModalOverlay isOpen={isOpen} onClose={handleClose} hideCloseButton={true} className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white dark:bg-zinc-800">{ticket.id}</Badge>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Process Ticket</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8"><X className="h-4 w-4" /></Button>
                </div>

                {selectedUser && (
                    <CustomerCard user={selectedUser} />
                )}

                <TicketFormFields data={formData} onChange={updateFormData} />
            </div>

            <div className="flex justify-between items-center p-6 pt-4 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-zinc-900 sticky bottom-0 z-10 shadow-lg">
                <div className="flex gap-2">
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={() => onConfirm(ticket.id, 'in_progress', `Processed: ${formData.description}`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                    >
                        Update & Process
                    </Button>
                </div>
            </div>
        </ModalOverlay>
    );
};

// --- Close Ticket Modal (Read-Only Fields) ---
export const CloseTicketModal = ({
    ticket,
    isOpen,
    onClose,
    onConfirm
}: {
    ticket: Ticket | null,
    isOpen: boolean,
    onClose: () => void,
    onConfirm: (id: string, note: string) => void
}) => {
    const [actionClose, setActionClose] = useState('');
    const [viewData, setViewData] = useState<TicketFormData>({
        name: 'NURYANTI',
        address: 'DSN. KRAJAN, 02/03, NGENTRONG, CAMPURDARAT',
        description: ticket?.title || 'Mas minta tolong ganti kata sandi',
        contact: '',
        noInternet: 'gpon-onu_1/1/6:62',
        ticketRef: ticket?.id || '',
        priority: ticket?.priority || '',
        type: 'Technical'
    });

    useEffect(() => {
        if (ticket) {
            setViewData(prev => ({ ...prev, description: ticket.title, ticketRef: ticket.id, priority: ticket.priority }));
        }
    }, [ticket]);

    if (!ticket) return null;

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose} hideCloseButton={true} className="max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Close Ticket</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="h-4 w-4" /></Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Name</Label>
                    <Input value={viewData.name} readOnly className="bg-slate-50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Address</Label>
                    <Input value={viewData.address} readOnly className="bg-slate-50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Description</Label>
                        <Textarea value={viewData.description} readOnly className="bg-slate-50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-300 min-h-[80px] resize-none" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Last Action</Label>
                        <Textarea value="cek" readOnly className="bg-slate-50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-300 min-h-[80px] resize-none" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">ONU index</Label>
                        <Input value={viewData.noInternet} readOnly className="bg-slate-50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">ONU SN</Label>
                        <Input value="ZTEGA6DD7279" readOnly className="bg-slate-50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-300" />
                    </div>
                </div>

                <div className="space-y-2 pt-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Action Close</Label>
                    <Textarea
                        value={actionClose}
                        onChange={(e) => setActionClose(e.target.value)}
                        className="min-h-[100px] border-slate-300 dark:border-zinc-700"
                        placeholder="Detail resolution notes..."
                    />
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-zinc-900 flex justify-end gap-2 sticky bottom-0 z-10">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={() => onConfirm(ticket.id, actionClose)} className="bg-red-600 hover:bg-red-700 text-white dark:text-white">Submit & Close</Button>
            </div>
        </ModalOverlay>
    );
};

// --- Forward Ticket (Technician) Modal ---
export const ForwardTicketModal = ({
    ticket,
    isOpen,
    onClose,
    onConfirm
}: {
    ticket: Ticket | null,
    isOpen: boolean,
    onClose: () => void,
    onConfirm: (id: string, note: string) => void
}) => {
    const mockData = {
        name: 'AMINAH AGUSTINA',
        address: 'DSN DADAPAN RT 02/RW 02 DS BOYOLANGU KEC BOYOLANGU',
        description: ticket?.title || 'minta memperpendek jaringan',
        lastAction: 'cek',
        onuIndex: 'gpon-onu_1/1/6:62',
        onuSn: 'ZTEGC84A09F0'
    };

    const [formData, setFormData] = useState({
        serviceImpact: '',
        rootCause: '',
        networkImpact: '',
        severity: 'LOW',
        pic: '',
        recommendedAction: ''
    });

    if (!ticket) return null;

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose} hideCloseButton={true} className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Forward Ticket</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="h-4 w-4" /></Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Name</Label>
                    <Input value={mockData.name} readOnly className="bg-slate-50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Address</Label>
                    <Input value={mockData.address} readOnly className="bg-slate-50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Description</Label>
                        <Input value={mockData.description} readOnly className="bg-slate-50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Last Action</Label>
                        <Input value={mockData.lastAction} readOnly className="bg-slate-50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-300" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Service Impact/Desc</Label>
                    <Input value={formData.serviceImpact} onChange={e => setFormData({ ...formData, serviceImpact: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Root Cause</Label>
                        <Input value={formData.rootCause} onChange={e => setFormData({ ...formData, rootCause: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Network Impact</Label>
                        <Input value={formData.networkImpact} onChange={e => setFormData({ ...formData, networkImpact: e.target.value })} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">ONU index</Label>
                        <Input value={mockData.onuIndex} readOnly className="bg-slate-50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">ONU SN</Label>
                        <Input value={mockData.onuSn} readOnly className="bg-slate-50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-300" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Severity</Label>
                        <Select value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })}>
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Person In Charge</Label>
                        <Select value={formData.pic} onChange={e => setFormData({ ...formData, pic: e.target.value })}>
                            <option value="">--Choose One--</option>
                            <option value="tech1">Technician A</option>
                            <option value="tech2">Technician B</option>
                            <option value="tech3">Technician C</option>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Recommended Action</Label>
                    <Textarea
                        value={formData.recommendedAction}
                        onChange={(e) => setFormData({ ...formData, recommendedAction: e.target.value })}
                        className="min-h-[80px]"
                    />
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-zinc-900 flex justify-end gap-2 sticky bottom-0 z-10">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={() => onConfirm(ticket.id, formData.recommendedAction)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Forward to Tech</Button>
            </div>
        </ModalOverlay>
    );
};


// --- Config Modal ---
export const ConfigModal = ({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: 'basic' | 'bridge' }) => {
    const [mode, setMode] = useState<'manual' | 'auto'>('manual');
    const [isAutoLoading, setIsAutoLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOptionsLoading, setIsOptionsLoading] = useState(false);

    // Real config state
    const [oltOptions, setOltOptions] = useState<string[]>([]);
    const [packageOptions, setPackageOptions] = useState<string[]>([]);
    const [detectedOnts, setDetectedOnts] = useState<UnconfiguredOnt[]>([]);

    const [formData, setFormData] = useState({
        olt: '',
        name: '',
        address: '',
        pppoeUser: '',
        pppoePass: '',
        package: '',
        ethLock: false,
        interface: 'eth1',
        sn: '',
        port: '',
        slot: ''
    });

    // Fetch OLT Options on Demand
    const fetchOltOptions = async () => {
        setIsOptionsLoading(true);
        const { data } = await ConfigService.getOptions();
        if (data) {
            if (data.olt_options) setOltOptions(data.olt_options);
            if (data.package_options) {
                setPackageOptions(data.package_options);
                if (!formData.package && data.package_options.length > 0) {
                    setFormData(prev => ({ ...prev, package: data.package_options[0] }));
                }
            }
            if (data.olt_options.length > 0 && !formData.olt) {
                setFormData(prev => ({ ...prev, olt: data.olt_options[0] }));
            }
            toast.success("Options loaded");
        } else {
            toast.error("Failed to fetch options");
        }
        setIsOptionsLoading(false);
    };

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setMode('manual');
            setSearchTerm('');
            setSearchResults([]);
            setDetectedOnts([]);
            setOltOptions([]);
            setPackageOptions([]);
            setFormData({
                olt: '',
                name: '',
                address: '',
                pppoeUser: '',
                pppoePass: '',
                package: '',
                ethLock: false,
                interface: 'eth1',
                sn: '',
                port: '',
                slot: ''
            });
        }
    }, [isOpen]);

    // Search Logic (Supabase) for Manual Mode
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (mode === 'manual' && searchTerm.length > 1) {
                setIsSearching(true);
                try {
                    const { data } = await supabase
                        .from('data_fiber')
                        .select('*')
                        .or(`name.ilike.%${searchTerm}%,user_pppoe.ilike.%${searchTerm}%`)
                        .limit(5);

                    if (data) {
                        setSearchResults(data);
                    } else {
                        setSearchResults([]);
                    }
                } catch (e) {
                    console.error(e);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, mode]);

    const handleSelectUser = (user: any) => {
        setFormData(prev => ({
            ...prev,
            name: user.name || '',
            address: user.alamat || '',
            pppoeUser: user.user_pppoe || '',
            pppoePass: user.pppoe_password || '',
            ethLock: false
        }));
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleScanOnts = async () => {
        if (!formData.olt) {
            toast.error("Please select an OLT first");
            return;
        }
        setIsAutoLoading(true);
        setDetectedOnts([]);

        const { data, error } = await ConfigService.detectUnconfiguredOnts(formData.olt);

        if (data) {
            setDetectedOnts(data);
            if (data.length === 0) toast.info("No unconfigured ONTs found on this OLT.");
        } else {
            toast.error(error || "Failed to scan OLT");
        }
        setIsAutoLoading(false);
    };

    const handleSelectOnt = (ont: UnconfiguredOnt) => {
        setFormData(prev => ({
            ...prev,
            sn: ont.sn,
            port: ont.pon_port,
            slot: ont.pon_slot,
            interface: `gpon-onu_${ont.pon_slot}/${ont.pon_port}:1`
        }));
        toast.success(`Selected ONT: ${ont.sn}`);
    };

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose} className="max-w-[550px]" backdropClass="bg-black/80 backdrop-blur-md">
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {type === 'basic' ? 'New Service Configuration' : 'New Bridge Configuration'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Configure a new subscriber connection</p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10">
                        <span className={cn(
                            "px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-all",
                            mode === 'manual' ? "bg-white dark:bg-zinc-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500"
                        )} onClick={() => setMode('manual')}>
                            Manual
                        </span>
                        <span className={cn(
                            "px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-all",
                            mode === 'auto' ? "bg-indigo-500 shadow-sm text-white" : "text-slate-500"
                        )} onClick={() => setMode('auto')}>
                            Auto Scan
                        </span>
                    </div>
                </div>

                {/* 1. OLT & Package Selection - Always at top */}
                {/* 1. OLT & Package Selection - Always at top */}
                <div className="grid grid-cols-2 gap-8 px-2">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">OLT Device</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[11px] px-2 text-indigo-600 hover:text-indigo-700 hover:bg-transparent p-0"
                                onClick={fetchOltOptions}
                                disabled={isOptionsLoading}
                            >
                                <RefreshCw className={cn("mr-1.5 h-3 w-3", isOptionsLoading && "animate-spin")} />
                                {isOptionsLoading ? 'Loading' : 'Reload List'}
                            </Button>
                        </div>
                        <Select
                            value={formData.olt}
                            onValueChange={v => setFormData({ ...formData, olt: v })}
                            disabled={isOptionsLoading}
                        >
                            <SelectTrigger className="bg-slate-50 dark:bg-zinc-800 border-0 h-10 shadow-none rounded-2xl px-4 font-medium text-slate-700 dark:text-slate-200">
                                <SelectValue placeholder="Select OLT..." />
                            </SelectTrigger>
                            <SelectContent>
                                {oltOptions.length === 0 && <SelectItem value="none" disabled>No OLTs found</SelectItem>}
                                {oltOptions.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">Service Package</Label>
                        <Select
                            value={formData.package}
                            onValueChange={v => setFormData({ ...formData, package: v })}
                        >
                            <SelectTrigger className="bg-slate-50 dark:bg-zinc-800 border-0 h-10 shadow-none rounded-2xl px-4 font-medium text-slate-700 dark:text-slate-200">
                                <SelectValue placeholder="Select Package..." />
                            </SelectTrigger>
                            <SelectContent>
                                {packageOptions.length === 0 ? (
                                    <>
                                        <SelectItem value="50mbps">Home Basic (50 Mbps)</SelectItem>
                                        <SelectItem value="100mbps">Home Stream (100 Mbps)</SelectItem>
                                        <SelectItem value="300mbps">Gamer Pro (300 Mbps)</SelectItem>
                                    </>
                                ) : (
                                    packageOptions.map(pkg => (
                                        <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 2. Search Area - Card Style */}
                {mode === 'manual' ? (
                    <div className="p-1">
                        <div className="space-y-4 p-5 bg-slate-50/50 dark:bg-indigo-500/5 rounded-2xl border border-slate-100 dark:border-white/5 relative overflow-visible">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <UserIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Import from CRM</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Search customer database</p>
                                </div>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-indigo-300 dark:text-indigo-700" />
                                <Input
                                    placeholder="Search subscriber by name or ID..."
                                    className="pl-11 bg-white dark:bg-zinc-800 h-12 rounded-full border-2 border-indigo-100 dark:border-indigo-500/20 focus-visible:border-indigo-500 focus-visible:ring-0 text-base"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {/* Dropdown Results */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-[85%] left-4 right-4 mt-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 py-2">
                                    {searchResults.map(u => (
                                        <div
                                            key={u.id || u.user_pppoe}
                                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-indigo-500/10 cursor-pointer flex items-center gap-4 transition-colors"
                                            onClick={() => handleSelectUser(u)}
                                        >
                                            <Avatar fallback={u.name?.charAt(0) || 'U'} className="h-10 w-10 text-sm bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 font-bold" />
                                            <div className="overflow-hidden flex-1">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="font-mono text-indigo-600/80 dark:text-indigo-400">{u.user_pppoe}</span>
                                                    {u.alamat && <span className="truncate border-l pl-2 border-slate-200 dark:border-slate-700">{u.alamat}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-1">
                        <div className="space-y-4 p-5 bg-slate-50/50 dark:bg-indigo-500/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                        <Server className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Auto-Detect Devices</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Scan OLT for unconfigured ONTs</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleScanOnts}
                                    disabled={isAutoLoading}
                                    className="rounded-full bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm border border-slate-200 dark:border-zinc-700 hover:bg-indigo-50"
                                >
                                    {isAutoLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Start Scan'}
                                </Button>
                            </div>

                            {/* Dedicated Select Area Container */}
                            <div className="mt-3 min-h-[100px] border border-dashed border-indigo-200 dark:border-indigo-500/20 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-white/50 dark:bg-black/20 overflow-hidden relative">
                                {detectedOnts.length > 0 ? (
                                    <div className="w-full h-full p-2 space-y-2 max-h-[150px] overflow-y-auto mt-2">
                                        {detectedOnts.map((ont, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
                                                onClick={() => handleSelectOnt(ont)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                                        <Server className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-mono font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {ont.sn}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500">Unconfigured Device</div>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 dark:bg-white/5 border-slate-200">
                                                    {ont.pon_port}/{ont.pon_slot}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-center p-6 flex flex-col items-center gap-3">
                                        {isAutoLoading ? (
                                            <>
                                                <RefreshCw className="animate-spin h-6 w-6 text-indigo-500" />
                                                <span className="text-indigo-500 font-medium">Scanning network...</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-slate-400">Scan results will appear here</div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Fields */}
                <div className="space-y-6 px-1">
                    <div className="space-y-3">
                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Subscriber Name</Label>
                        <Input
                            placeholder="Full Name"
                            className="bg-white dark:bg-zinc-800 h-11 rounded-xl border-slate-200 dark:border-white/10 focus:ring-0 focus:border-indigo-500 text-sm"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Installation Address</Label>
                        <Textarea
                            placeholder="Street address, unit, city..."
                            className="bg-white dark:bg-zinc-800 min-h-[70px] rounded-xl border-slate-200 dark:border-white/10 resize-none p-3 focus:ring-0 focus:border-indigo-500 text-sm"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">PPPoE Username</Label>
                            <Input
                                placeholder="username"
                                className="bg-white dark:bg-zinc-800 h-9 rounded-lg border-slate-200 dark:border-white/10 shadow-none text-sm"
                                value={formData.pppoeUser}
                                onChange={e => setFormData({ ...formData, pppoeUser: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">PPPoE Password</Label>
                            <Input
                                type="password"
                                placeholder="••••••"
                                className="bg-white dark:bg-zinc-800 h-9 rounded-lg border-slate-200 dark:border-white/10 shadow-none text-sm"
                                value={formData.pppoePass}
                                onChange={e => setFormData({ ...formData, pppoePass: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-1">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ethernet Port Lock</h4>
                                <p className="text-xs text-slate-500">Restrict port access to specific MAC</p>
                            </div>
                        </div>
                        <Switch
                            checked={formData.ethLock}
                            onCheckedChange={c => setFormData({ ...formData, ethLock: c })}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-50 dark:border-white/5">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-full h-12 px-8 border-slate-200 dark:border-white/10 hover:bg-slate-50 text-slate-600 font-medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => { toast.success("Provisioning service..."); onClose(); }}
                        className="rounded-full h-11 px-8 !bg-indigo-600 hover:!bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 font-bold text-sm transition-all hover:scale-105 active:scale-95"
                    >
                        Provision Service
                    </Button>
                </div>
            </div>
        </ModalOverlay>
    );
};

// --- Ticket Detail Modal ---
const StatusBadge = ({ status }: { status: Ticket['status'] }) => {
    const styles = {
        open: 'secondary',
        in_progress: 'warning',
        resolved: 'success',
        closed: 'outline'
    } as const;
    const label = status.replace('_', ' ');
    return <Badge variant={styles[status] as any} className="capitalize">{label}</Badge>;
};

export const TicketDetailModal = ({ ticket, isOpen, onClose }: { ticket: Ticket | null, isOpen: boolean, onClose: () => void }) => {
    // Use custom hook for logs
    const logsQuery = useTicketLogs(ticket?.id);

    if (!ticket) return null;

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="flex flex-col h-[80vh] md:h-auto">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4 dark:border-white/10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{ticket.id}</Badge>
                            <StatusBadge status={ticket.status} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{ticket.title}</h2>
                        <p className="text-xs text-slate-500 mt-1">Created on {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {/* User Card */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                        <Avatar fallback={ticket.assigneeId ? 'AC' : 'U'} src={ticket.assigneeId ? 'https://i.pravatar.cc/150?u=alex' : undefined} className="h-12 w-12" />
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{ticket.assigneeId ? 'Alex Carter' : 'Unassigned'}</h4>
                            <p className="text-xs text-slate-500">{ticket.assigneeId ? 'Senior Administrator' : 'Waiting for assignment'}</p>
                        </div>
                        <Button variant="outline" size="sm">View Profile</Button>
                    </div>

                    {/* Activity Logs */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-200">Activity Log</h3>
                        <div className="space-y-4">
                            {logsQuery.isLoading ? (
                                <div className="text-center text-xs text-slate-500">Loading logs...</div>
                            ) : (
                                logsQuery.data?.map((log, i) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <div className="flex flex-col items-center">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                                {log.userName.charAt(0)}
                                            </div>
                                            {i < (logsQuery.data?.length || 0) - 1 && <div className="w-px h-full bg-slate-200 my-1 dark:bg-white/10" />}
                                        </div>
                                        <div className="pb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900 dark:text-slate-200">{log.userName}</span>
                                                <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 mt-1">{log.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-slate-100 pt-4 mt-4 flex justify-end gap-2 dark:border-white/10">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button>Add Note</Button>
                </div>
            </div>
        </ModalOverlay>
    );
};
