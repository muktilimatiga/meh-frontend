import * as React from 'react';
import { EnhancedTable, ColumnDef } from '../components/ui/EnhancedTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tooltip } from '../components/ui/Tooltip';
import { Input } from '../components/ui/Input';
import { User } from '../types';
import { Plus, Download, Receipt, RefreshCw, Router, MapPin, Search, ArrowLeft, Trash2 } from 'lucide-react';
import { useSupabaseCustomers } from '../hooks/useSupabaseCustomers';
import { InvoicePaymentModal } from './components/InvoicePaymentModal';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { Header } from '../components/Header';
import { AIResponseCard } from '../components/AIResponseCard';
import { MOCK_USER } from '../constants';

interface BroadbandPageProps {
    onBack: () => void;
}

export const BroadbandPage: React.FC<BroadbandPageProps> = ({ onBack }) => {
  const { data: customers, loading, searchTerm, setSearchTerm } = useSupabaseCustomers(); 
  const [selectedInvoiceUser, setSelectedInvoiceUser] = React.useState<User | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [aiResponse, setAiResponse] = React.useState<string | null>(null);

  // --- Selection Logic ---
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(customers.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    console.log("Deleting:", Array.from(selectedIds));
    setSelectedIds(new Set());
    // In real app, call delete mutation here
  };

  // --- Columns ---
  const columns: ColumnDef<User>[] = [
    {
        header: 'Select',
        accessorKey: 'id',
        cell: (row) => (
            <div className="flex items-center justify-center">
                <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedIds.has(row.id)}
                    onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                />
            </div>
        )
    },
    { 
       header: 'Customer (PPPoE)', 
       accessorKey: 'name', 
       cell: (row) => (
          <div className="flex items-center gap-3">
             <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src="" />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">{row.name?.charAt(0) || 'U'}</AvatarFallback>
             </Avatar>
             <div>
                <div className="font-medium text-foreground">{row.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{row.email}</div>
             </div>
          </div>
       )
    },
    { 
       header: 'OLT Info', 
       accessorKey: 'olt', 
       cell: (row) => row.olt ? (
          <div className="flex flex-col">
             <div className="flex items-center gap-1.5">
                <Router className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{row.olt}</span>
             </div>
             <span className="text-[10px] text-muted-foreground pl-4.5">{row.port}</span>
          </div>
       ) : <span className="text-xs text-muted-foreground">-</span>
    },
    { 
       header: 'Address', 
       accessorKey: 'address', 
       cell: (row) => row.address ? (
          <div className="flex items-start gap-1.5 max-w-[200px]">
             <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
             <span className="text-xs text-muted-foreground truncate" title={row.address}>{row.address}</span>
          </div>
       ) : <span className="text-xs text-muted-foreground">N/A</span>
    },
    { 
       header: 'Packet', 
       accessorKey: 'packet', 
       cell: (row) => row.packet ? (
          <Badge variant="outline" className="font-normal whitespace-nowrap">
             {row.packet}
          </Badge>
       ) : <span className="text-xs text-muted-foreground">-</span>
    },
    {
       header: 'Actions',
       accessorKey: 'id',
       cell: (row) => (
         <div className="flex items-center gap-2">
            <Tooltip text="Create Invoice">
               <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                  onClick={(e) => { e.stopPropagation(); setSelectedInvoiceUser(row); }}
               >
                  <Receipt className="h-4 w-4" />
               </Button>
            </Tooltip>
         </div>
       )
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-background font-sans text-foreground animate-in fade-in duration-300">
      <Header 
          user={MOCK_USER} 
          onSearch={() => {}} // Could be wired to table search if desired
          onAIResult={setAiResponse} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {aiResponse && (
            <div className="p-4 border-b border-border bg-muted/20">
                <AIResponseCard response={aiResponse} onClose={() => setAiResponse(null)} />
            </div>
        )}

        <InvoicePaymentModal 
            isOpen={!!selectedInvoiceUser} 
            user={selectedInvoiceUser} 
            onClose={() => setSelectedInvoiceUser(null)} 
        />

        {/* Page Header */}
        <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft size={18} />
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Broadband Subscribers</h1>
                    <p className="text-xs text-muted-foreground">Manage PPPoE customers and invoices</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {selectedIds.size > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete ({selectedIds.size})
                    </Button>
                )}
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Subscriber
                </Button>
            </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>

                {/* Server-side Search Input */}
                <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search name, PPPoE, or address..." 
                    className="pl-9 bg-card border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <EnhancedTable 
                    data={customers} 
                    columns={columns} 
                    onSelectAll={handleSelectAll}
                    selectedIds={selectedIds}
                />
            </div>
        </div>
      </div>
    </div>
  );
};