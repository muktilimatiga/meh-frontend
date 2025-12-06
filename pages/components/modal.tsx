
import * as React from 'react';
import { useState, useEffect } from 'react';
import { ChevronLeft, Search, Lock, Unlock, X, RefreshCw, Cloud, Server, ChevronDown, List, User as UserIcon } from 'lucide-react';
import { ModalOverlay, Label, Input, Select, Textarea, Button, Badge, Avatar, Switch } from '@/components/ui'
import { cn } from '@/lib/utils';
import { Ticket } from '@/types';
import { useTicketStore } from '../stores/ticketStore';
import { useTicketLogs } from '@/hooks/useQueries';
import { CustomerCard } from './CustomerCard';
import { supabase } from '../../../lib/supabaseClient';
import { ConfigService, UnconfiguredOnt } from '../../../services/external';
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
                    className="bg-slate-50/50 dark:bg-black/20"
                    readOnly={readOnly}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Installation Address</Label>
                <Input 
                    id="address" 
                    value={data.address} 
                    onChange={e => handleChange('address', e.target.value)} 
                    className="bg-slate-50/50 dark:bg-black/20"
                    readOnly={readOnly}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input 
                        id="contact" 
                        value={data.contact} 
                        onChange={e => handleChange('contact', e.target.value)} 
                        className="bg-slate-50/50 dark:bg-black/20"
                        readOnly={readOnly}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="noInternet">No Internet ID</Label>
                    <Input 
                        id="noInternet" 
                        value={data.noInternet} 
                        onChange={e => handleChange('noInternet', e.target.value)} 
                        className="bg-slate-50/50 dark:bg-black/20"
                        readOnly={readOnly}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                        id="priority" 
                        value={data.priority}
                        onChange={e => handleChange('priority', e.target.value)}
                        disabled={readOnly}
                    >
                        <option value="">Select...</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select 
                        id="type"
                        value={data.type}
                        onChange={e => handleChange('type', e.target.value)}
                        disabled={readOnly}
                    >
                        <option value="">Select...</option>
                        <option value="Technical">Technical</option>
                        <option value="Billing">Billing</option>
                        <option value="Sales">Sales</option>
                        <option value="Complaint">Complaint</option>
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
                            <Avatar fallback={user.name.charAt(0)} className="h-8 w-8 text-xs" />
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
                     <Input value={formData.serviceImpact} onChange={e => setFormData({...formData, serviceImpact: e.target.value})} />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                         <Label className="text-xs text-slate-500">Root Cause</Label>
                         <Input value={formData.rootCause} onChange={e => setFormData({...formData, rootCause: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                         <Label className="text-xs text-slate-500">Network Impact</Label>
                         <Input value={formData.networkImpact} onChange={e => setFormData({...formData, networkImpact: e.target.value})} />
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
                         <Select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                         </Select>
                     </div>
                     <div className="space-y-2">
                         <Label className="text-xs text-slate-500">Person In Charge</Label>
                         <Select value={formData.pic} onChange={e => setFormData({...formData, pic: e.target.value})}>
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
                        onChange={(e) => setFormData({...formData, recommendedAction: e.target.value})} 
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
     if(isOpen) {
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
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="space-y-5">
         <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
               {type === 'basic' ? 'New Service Configuration' : 'New Bridge Configuration'}
            </h2>
            <div className="flex items-center gap-2">
                <Label className="text-xs cursor-pointer text-slate-500" onClick={() => setMode(m => m === 'manual' ? 'auto' : 'manual')}>
                    {mode === 'manual' ? 'Manual Entry' : 'Scan Network'}
                </Label>
                <Switch checked={mode === 'auto'} onCheckedChange={(c) => { setMode(c ? 'auto' : 'manual'); }} />
            </div>
         </div>

         {/* 1. OLT & Package Selection - Always at top */}
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <div className="flex items-center justify-between">
                   <Label>OLT Device</Label>
                   <Button 
                       variant="ghost" 
                       size="sm" 
                       className="h-6 text-[10px] px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400"
                       onClick={fetchOltOptions}
                       disabled={isOptionsLoading}
                   >
                       <RefreshCw className={cn("mr-1 h-3 w-3", isOptionsLoading && "animate-spin")} />
                       {isOptionsLoading ? 'Loading...' : 'Reload List'}
                   </Button>
               </div>
               <Select 
                  value={formData.olt} 
                  onChange={e => setFormData({...formData, olt: e.target.value})}
                  disabled={isOptionsLoading}
               >
                  {oltOptions.length === 0 && <option value="">-- Click Reload to fetch OLTs --</option>}
                  {oltOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                  ))}
               </Select>
            </div>
            <div className="space-y-2">
               {/* Spacer to align with OLT Device label + button height */}
               <div className="h-6 mb-2 flex items-center"><Label>Service Package</Label></div>
               <Select 
                  value={formData.package} 
                  onChange={e => setFormData({...formData, package: e.target.value})}
               >
                  {packageOptions.length === 0 ? (
                      <>
                        <option value="50mbps">Home Basic (50 Mbps)</option>
                        <option value="100mbps">Home Stream (100 Mbps)</option>
                        <option value="300mbps">Gamer Pro (300 Mbps)</option>
                      </>
                  ) : (
                      packageOptions.map(pkg => (
                          <option key={pkg} value={pkg}>{pkg}</option>
                      ))
                  )}
               </Select>
            </div>
         </div>

         {/* 2. Conditional Scan/Search Area - Below OLT */}
         {mode === 'manual' ? (
             <div className="space-y-3 p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10 animate-in fade-in slide-in-from-top-2 duration-300 relative">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">Import from CRM</p>
                        <p className="text-xs text-slate-500">Search customer database</p>
                    </div>
                </div>
                
                <div className="relative">
                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                   <Input 
                      placeholder="Search subscriber by name or ID..." 
                      className="pl-9 bg-white dark:bg-black/20"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      autoFocus
                   />
                </div>
                
                {/* Dropdown Results */}
                {searchResults.length > 0 && (
                   <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                      {searchResults.map(u => (
                         <div 
                            key={u.id || u.user_pppoe}
                            className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-2 border-b border-slate-50 dark:border-white/5 last:border-0"
                            onClick={() => handleSelectUser(u)}
                         >
                            <Avatar fallback={u.name?.charAt(0) || 'U'} className="h-8 w-8 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" />
                            <div className="overflow-hidden">
                               <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{u.name}</p>
                               <p className="text-xs text-slate-500 truncate">{u.user_pppoe}</p>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
         ) : (
             <div className="space-y-3 p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Server className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">Unconfigured ONTs</p>
                            <p className="text-xs text-slate-500">Scan selected OLT for new devices</p>
                        </div>
                    </div>
                    <Button size="sm" variant="default" onClick={handleScanOnts} disabled={isAutoLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs px-3">
                        <RefreshCw className={cn("h-3 w-3 mr-2", isAutoLoading && "animate-spin")} />
                        {isAutoLoading ? 'Scanning...' : 'Scan OLT'}
                    </Button>
                </div>
                
                {/* Dedicated Select Area Container - REFINED BORDER */}
                <div className="mt-3 min-h-[100px] border border-dashed border-slate-200 dark:border-white/10 rounded-lg flex flex-col items-center justify-center text-slate-400 bg-white/50 dark:bg-black/20 overflow-hidden relative">
                    {/* Label for area */}
                    <div className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-slate-300 dark:text-slate-600 pointer-events-none">
                        Select Device
                    </div>

                    {detectedOnts.length > 0 ? (
                        <div className="w-full h-full p-2 space-y-2 max-h-[150px] overflow-y-auto mt-4">
                            {detectedOnts.map((ont, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex items-center justify-between p-3 rounded-md bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all group"
                                    onClick={() => handleSelectOnt(ont)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <Server className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {ont.sn}
                                            </div>
                                            <div className="text-[10px] text-slate-400">New Device</div>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 dark:bg-white/5">
                                        {ont.pon_port}/{ont.pon_slot}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-center p-8 flex flex-col items-center gap-3">
                           {isAutoLoading ? (
                               <>
                                 <RefreshCw className="animate-spin h-6 w-6 text-indigo-500"/>
                                 <span className="text-indigo-500 font-medium">Scanning network...</span>
                               </>
                           ) : (
                               <>
                                   <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                      <List className="h-5 w-5 opacity-40" />
                                   </div>
                                   <span className="text-slate-400">Scan results will appear here.</span>
                               </>
                           )}
                        </div>
                    )}
                </div>
            </div>
         )}

         {/* 3. Common Form Fields */}
         <div className="space-y-2">
            <Label>Subscriber Name</Label>
            <Input 
               value={formData.name} 
               onChange={e => setFormData({...formData, name: e.target.value})}
               placeholder="Full Name"
            />
         </div>

         {formData.sn && (
             <div className="p-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                 <Badge variant="success" className="h-4 px-1 text-[10px]">Ready</Badge>
                 Configuring device: <span className="font-mono font-bold">{formData.sn}</span>
                 <span className="text-slate-400 ml-auto text-[10px]">Port: {formData.port}/{formData.slot}</span>
             </div>
         )}

         <div className="space-y-2">
            <Label>Installation Address</Label>
            <Textarea 
               value={formData.address} 
               onChange={e => setFormData({...formData, address: e.target.value})}
               placeholder="Street address, unit, city..."
               className="min-h-[60px]"
            />
         </div>

         <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-100 dark:border-white/10">
            <div className="space-y-2">
               <Label>PPPoE Username</Label>
               <Input 
                  value={formData.pppoeUser} 
                  onChange={e => setFormData({...formData, pppoeUser: e.target.value})}
                  placeholder="username"
               />
            </div>
            <div className="space-y-2">
               <Label>PPPoE Password</Label>
               <Input 
                  type="password"
                  value={formData.pppoePass} 
                  onChange={e => setFormData({...formData, pppoePass: e.target.value})}
                  placeholder="••••••"
               />
            </div>
         </div>

         {type === 'bridge' && (
             <div className="space-y-2">
               <Label>Bridge Interface</Label>
               <Input 
                  value={formData.interface}
                  onChange={e => setFormData({...formData, interface: e.target.value})}
                  placeholder="e.g. eth1, nas0_1"
               />
             </div>
         )}

         <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
               <div className={cn("p-2 rounded-full", formData.ethLock ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-100 text-slate-500 dark:bg-white/10")}>
                  {formData.ethLock ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
               </div>
               <div className="space-y-0.5">
                  <Label className="cursor-pointer" onClick={() => setFormData({...formData, ethLock: !formData.ethLock})}>Ethernet Port Lock</Label>
                  <p className="text-xs text-slate-500">Restrict port access to specific MAC</p>
               </div>
            </div>
            <Switch 
               checked={formData.ethLock} 
               onCheckedChange={c => setFormData({...formData, ethLock: c})} 
            />
         </div>

         <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => { console.log(formData); onClose(); }}>
               {type === 'basic' ? 'Provision Service' : 'Configure Bridge'}
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
                                <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
