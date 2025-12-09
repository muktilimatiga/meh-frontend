import { useState, useEffect } from 'react';
import { 
    Search, 
    RefreshCw, 
    Server, 
    User as UserIcon, 
    Lock} from 'lucide-react';
import { 
    ModalOverlay, 
    Label, 
    Input, 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue, 
    Textarea, 
    Button, 
    Badge, 
    Avatar, 
    Switch 
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { UnconfiguredOnt, CustomerPSB } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { CustomerService, ConfigService } from '@/services/external';
import { toast } from 'sonner';

// --- Config Modal ---
export const ConfigModal = ({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: 'basic' | 'bridge' }) => {
    const [mode, setMode] = useState<'manual' | 'auto'>('auto');
    const [isAutoLoading, setIsAutoLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOptionsLoading, setIsOptionsLoading] = useState(false);

    // Real config state
    const [oltOptions, setOltOptions] = useState<string[]>([]);
    const [packageOptions, setPackageOptions] = useState<string[]>([]);
    const [modemOptions, setModemOptions] = useState<string[]>([]);
    const [detectedOnts, setDetectedOnts] = useState<UnconfiguredOnt[]>([]);

    const [formData, setFormData] = useState({
        olt: '',
        name: '',
        address: '',
        pppoeUser: '',
        pppoePass: '',
        package: '',
        modemType: '',
        ethLock: false,
        interface: 'eth1',
        sn: '',
    });

    // Fetch OLT Options on Demand
    const fetchOltOptions = async () => {
        setIsOptionsLoading(true);
        const { data } = await ConfigService.getOptions() as { data: any };
        if (data) {
            if (data.olt_options) setOltOptions(data.olt_options);
            if (data.modem_options) {
                setModemOptions(data.modem_options);
                if (!formData.modemType && data.modem_options.length > 0) {
                     setFormData(prev => ({ ...prev, modemType: data.modem_options[0] }));
                }
            }
            if (data.package_options) {
                setPackageOptions(data.package_options);
                if (!formData.package && data.package_options.length > 0) {
                    setFormData(prev => ({ ...prev, package: data.package_options[0] }));
                }
            }
            if (data.olt_options?.length > 0 && !formData.olt) {
                setFormData(prev => ({ ...prev, olt: data.olt_options[0] }));
            }
            toast.success("Options loaded");
        } else {
            toast.error("Failed to fetch options");
        }
        setIsOptionsLoading(false);
    };

    const fetchCustomerPSB = async () => {
        setIsOptionsLoading(true);
        const { data } = await CustomerService.getPSBData();
        if (data) {
             setSearchResults(data);
             toast.success(`Loaded ${data.length} PSB records`);
        }
        setIsOptionsLoading(false);
    };



    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setMode('auto');
            setSearchTerm('');
            setSearchResults([]);
            setDetectedOnts([]);
            setOltOptions([]);
            setModemOptions([]);
            setPackageOptions([]);
            setFormData({
                olt: '',
                name: '',
                address: '',
                pppoeUser: '',
                pppoePass: '',
                package: '',
                modemType: '',
                ethLock: false,
                interface: 'eth1',
                sn: '',
                port: '',
                slot: ''
            });
            // Auto fetch options on open
            fetchOltOptions();
        }
    }, [isOpen]);

    // Search Logic (Supabase) for Manual Mode
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (mode === 'manual' && formData.name.length > 2) {
                setIsSearching(true);
                try {
                    const { data } = await supabase
                        .from('data_fiber')
                        .select('*')
                        .or(`name.ilike.%${formData.name}%,user_pppoe.ilike.%${formData.name}%`)
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
            } else if (mode === 'manual' && formData.name.length <= 2) {
                setSearchResults([]);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [formData.name, mode]);

    const handleSelectUser = (user: any) => {
        // Map fields based on source (PSB vs CRM)
        // PSB: address, pppoe_password, paket
        // CRM: alamat, pppoe_password (or different?), packet?
        // Note: The user said "Auto just fetching from datapsb" and "Manual fetching from data_fiber"
        
        let pppoePass = user.pppoe_password || ''; 
        let address = user.address || user.alamat || '';
        let pkg = user.paket || formData.package || '';

        // If package from PSB is e.g. "10M", we might need to map it if our select expects "10mbps" etc.
        // For now, let's just use it or keep existing if not present.

        setFormData(prev => ({
            ...prev,
            name: user.name || '',
            address: address,
            pppoeUser: user.user_pppoe || '',
            pppoePass: pppoePass,
            package: pkg || prev.package,
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
            slot: ont.pon_slot
        }));
        toast.success(`Selected ONT: ${ont.sn}`);
        // Optionally close the list or keep it open? Let's keep it but maybe highlight?
    };

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose} className="max-w-[550px]" backdropClass="bg-black/80 backdrop-blur-md">
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/5">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {type === 'basic' ? 'New Configuration' : 'New Bridge Configuration'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">Setup subscriber connection</p>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                        <button
                            onClick={() => {
                                setMode('manual');
                                setSearchResults([]);
                                setFormData(prev => ({ ...prev, name: '' }));
                            }}
                            className={cn(
                                "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200",
                                mode === 'manual' 
                                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            Manual
                        </button>
                        <button
                            onClick={() => {
                                setMode('auto');
                                setSearchResults([]);
                                setFormData(prev => ({ ...prev, name: '' }));
                            }}
                            className={cn(
                                "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200",
                                mode === 'auto' 
                                    ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/20" 
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            Auto
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-1">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">OLT Device</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 text-[10px] px-2 text-indigo-600 hover:text-indigo-700 hover:bg-transparent p-0"
                                onClick={fetchOltOptions}
                                disabled={isOptionsLoading}
                            >
                                <RefreshCw className={cn("mr-1 h-3 w-3", isOptionsLoading && "animate-spin")} />
                                {isOptionsLoading ? 'Loading' : 'Reload'}
                            </Button>
                        </div>
                        <Select
                            value={formData.olt}
                            onValueChange={v => setFormData({ ...formData, olt: v })}
                            disabled={isOptionsLoading}
                        >
                            <SelectTrigger className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-white/10 h-10 shadow-sm rounded-xl px-3 text-sm">
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
                    <div className="space-y-2">
                         <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">Modem Type</Label>
                         <Select
                            value={formData.modemType}
                            onValueChange={v => setFormData({ ...formData, modemType: v })}
                            disabled={isOptionsLoading}
                        >
                            <SelectTrigger className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-white/10 h-10 shadow-sm rounded-xl px-3 text-sm">
                                <SelectValue placeholder="Type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {modemOptions.length === 0 && <SelectItem value="none" disabled>No Types</SelectItem>}
                                {modemOptions.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">Service Package</Label>
                        <Select
                            value={formData.package}
                            onValueChange={v => setFormData({ ...formData, package: v })}
                        >
                            <SelectTrigger className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-white/10 h-10 shadow-sm rounded-xl px-3 text-sm">
                                <SelectValue placeholder="Select Package..." />
                            </SelectTrigger>
                            <SelectContent>
                                {packageOptions.length === 0 ? <SelectItem value="none" disabled>No Packages</SelectItem> : (
                                    packageOptions.map(pkg => (
                                        <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 2. Device / SN Section */}
                <div className="pt-2">
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <Server className="h-4 w-4 text-indigo-500" />
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-200">ONT Configuration</Label>
                             </div>
                             <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleScanOnts}
                                disabled={isAutoLoading || !formData.olt}
                                className="h-7 text-xs font-medium bg-white dark:bg-zinc-800 border-slate-200 dark:border-white/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                            >
                                <RefreshCw className={cn("mr-2 h-3 w-3", isAutoLoading && "animate-spin")} />
                                {isAutoLoading ? 'Scanning...' : 'Scan Unconfigured'}
                            </Button>
                        </div>

                        <div className="relative">
                             <Select
                                value={formData.sn}
                                onValueChange={(v) => {
                                    const selectedOnt = detectedOnts.find(o => o.sn === v);
                                    if (selectedOnt) handleSelectOnt(selectedOnt);
                                    else setFormData(prev => ({ ...prev, sn: v }));
                                }}
                                disabled={isAutoLoading || !formData.olt}
                             >
                                <SelectTrigger className="bg-white dark:bg-zinc-900 h-11 rounded-xl border-slate-200 dark:border-white/10 font-mono text-sm shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20 hover:border-indigo-300">
                                    <SelectValue placeholder={
                                        isAutoLoading 
                                            ? "Scanning OLT..." 
                                            : (detectedOnts.length > 0 ? "Select unconfigured ONT..." : "No new ONTs detected")
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {detectedOnts.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-slate-500">
                                            No unconfigured devices found on {formData.olt || 'selected OLT'}
                                        </div>
                                    ) : (
                                        detectedOnts.map((ont) => (
                                            <SelectItem key={ont.sn} value={ont.sn} className="font-mono">
                                                <span className="font-bold text-slate-900 dark:text-white">{ont.sn}</span>
                                                <span className="ml-2 text-slate-400 text-xs">Port {ont.pon_port}/{ont.pon_slot}</span>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                             </Select>
                        </div>
                    </div>
                </div>

                {/* 3. Customer Data Form */}
                <div className="space-y-5">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Customer Details</Label>
                            {/* Auto Mode Action: Load New */}
                            {mode === 'auto' && (
                                <button
                                    onClick={fetchCustomerPSB}
                                    disabled={isOptionsLoading}
                                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                                >
                                    <RefreshCw className={cn("h-3 w-3", isOptionsLoading && "animate-spin")} />
                                    {isOptionsLoading ? 'Syncing...' : 'Fetch New Data'}
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                             <div className="relative">
                                <Input
                                    placeholder={mode === 'manual' ? "Search customer name..." : "Select pending customer..."}
                                    className={cn(
                                        "bg-white dark:bg-zinc-800 h-11 rounded-xl border-slate-200 dark:border-white/10 text-sm shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20",
                                        mode === 'manual' && "pl-10"
                                    )}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    readOnly={mode === 'auto'}
                                    onClick={() => {
                                        if(mode === 'auto' && searchResults.length === 0) fetchCustomerPSB(); 
                                    }}
                                />
                                {mode === 'manual' ? (
                                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                ) : (
                                    <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                )}
                                
                                {/* Dropdown Results */}
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 py-1">
                                        {searchResults.map(u => (
                                            <div
                                                key={u.id || u.user_pppoe || Math.random()}
                                                className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-indigo-500/10 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50/50 last:border-0 group"
                                                onClick={() => handleSelectUser(u)}
                                            >
                                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                    <span className="text-xs font-bold">{u.name?.charAt(0) || 'C'}</span>
                                                </div>
                                                <div className="overflow-hidden flex-1">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{u.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="font-mono bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{u.user_pppoe}</span>
                                                        {u.alamat && <span className="truncate text-slate-400">{u.alamat}</span>}
                                                        {u.address && <span className="truncate text-slate-400">{u.address}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <Textarea
                                placeholder="Installation address details..."
                                className="bg-white dark:bg-zinc-800 min-h-[80px] rounded-xl border-slate-200 dark:border-white/10 resize-none p-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                        <div className="grid grid-cols-2 gap-5">
                             <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">PPPoE Username</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="Username"
                                        className="bg-white dark:bg-zinc-800 h-11 pl-10 rounded-xl border-slate-200 dark:border-white/10 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500/20"
                                        value={formData.pppoeUser}
                                        onChange={e => setFormData({ ...formData, pppoeUser: e.target.value })}
                                    />
                                    <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">PPPoE Password</Label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Password"
                                        className="bg-white dark:bg-zinc-800 h-11 pl-10 rounded-xl border-slate-200 dark:border-white/10 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500/20"
                                        value={formData.pppoePass}
                                        onChange={e => setFormData({ ...formData, pppoePass: e.target.value })}
                                    />
                                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center transition-colors shadow-sm",
                                    formData.ethLock 
                                        ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" 
                                        : "bg-white dark:bg-white/10 text-slate-400 border border-slate-200 dark:border-white/5"
                                )}>
                                    <Lock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Secure Port Lock</h4>
                                    <p className="text-xs text-slate-500">Bind configuration to specific MAC address</p>
                                </div>
                            </div>
                            <Switch
                                checked={formData.ethLock}
                                onCheckedChange={c => setFormData({ ...formData, ethLock: c })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-white/5 mt-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            toast.success("Configuration sent to localized queue!");
                            onClose();
                        }}
                        className="flex-[2] h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20"
                    >
                        Deploy Configuration
                    </Button>
                </div>
        </ModalOverlay>
    );
};
