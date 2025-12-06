
import * as React from 'react';
import { useState } from 'react';
import { EnhancedTable, ColumnDef } from '../components/ui/EnhancedTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Tooltip } from '../components/ui/Tooltip';
import { Input } from '../components/ui/Input';
import { User } from '@/types';
import { Plus, Download, Receipt, RefreshCw, Router, MapPin, Search } from 'lucide-react';
import { useSupabaseCustomers } from '@/hooks/useSupabaseCustomers';
import { InvoicePaymentModal } from './components/InvoicePaymentModal';

export const BroadbandPage = () => {
  // Use the new Supabase hook with search capabilities
  const { data: customers, loading, searchTerm, setSearchTerm } = useSupabaseCustomers(); 
  const [selectedInvoiceUser, setSelectedInvoiceUser] = useState<User | null>(null);

  const columns: ColumnDef<any>[] = [
    {
       header: 'Customer (PPPoE)',
       accessorKey: 'name',
       cell: ({ row }) => {
          const name = row.getValue('name') as string;
          const email = row.original.email as string;
          return (
             <div className="flex items-center gap-3">
                <Avatar src={undefined} fallback={name?.charAt(0) || 'U'} className="w-9 h-9 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" />
                <div>
                   <div className="font-medium text-slate-900 dark:text-slate-100">{name}</div>
                   <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{email}</div>
                </div>
             </div>
          );
       }
    },
    {
       header: 'OLT Info',
       accessorKey: 'olt',
       cell: ({ row }) => {
          const olt = row.getValue('olt') as string;
          const port = row.original.port as string;
          return olt ? (
             <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                   <Router className="h-3 w-3 text-slate-400" />
                   <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{olt}</span>
                </div>
                <span className="text-[10px] text-slate-400 pl-4.5">{port}</span>
             </div>
          ) : <span className="text-xs text-slate-400">-</span>;
       }
    },
    {
       header: 'Address',
       accessorKey: 'address',
       cell: ({ row }) => {
          const address = row.getValue('address') as string;
          return address ? (
             <div className="flex items-start gap-1.5 max-w-[200px]">
                <MapPin className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-400 truncate" title={address}>{address}</span>
             </div>
          ) : <span className="text-xs text-slate-400">N/A</span>;
       }
    },
    {
       header: 'Packet',
       accessorKey: 'packet',
       cell: ({ row }) => {
          const packet = row.getValue('packet') as string;
          return packet ? (
             <Badge variant="outline" className="font-normal bg-slate-50 dark:bg-white/5 whitespace-nowrap">
                {packet}
             </Badge>
          ) : <span className="text-xs text-slate-400">-</span>;
       }
    },
    {
       header: 'Actions',
       accessorKey: 'id',
       cell: ({ row }) => (
         <div className="flex items-center gap-2">
            <Tooltip text="Create Invoice">
               <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                  onClick={(e) => { e.stopPropagation(); setSelectedInvoiceUser(row.original); }}
               >
                  <Receipt className="h-4 w-4" />
               </Button>
            </Tooltip>
         </div>
       )
    }
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <InvoicePaymentModal 
         isOpen={!!selectedInvoiceUser} 
         user={selectedInvoiceUser} 
         onClose={() => setSelectedInvoiceUser(null)} 
      />

      <div className="space-y-4">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Server-side Search Input */}
            <div className="relative w-full md:w-72 ml-auto">
               <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
               <Input 
                  placeholder="Search name, PPPoE, or address..." 
                  className="pl-9 bg-white dark:bg-black border-slate-200 dark:border-slate-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         <EnhancedTable 
            data={customers} 
            columns={columns} 
            // Removed searchKey="name" to rely on the server-side search input above
            onEdit={(u) => console.log('Edit', u)}
            onDelete={(u) => console.log('Delete', u)}
            actionButtons={
               <>
                  <Button variant="ghost" disabled={loading} className="bg-white dark:bg-black dark:text-white" onClick={() => window.location.reload()}>
                     <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
                     {loading ? 'Loading...' : 'Refresh'}
                  </Button>
                  <Button variant="outline" className="bg-white dark:bg-black">
                     <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                  <Button className="bg-slate-900 dark:bg-white dark:text-black">
                     <Plus className="mr-2 h-4 w-4" /> Add Subscriber
                  </Button>
               </>
            }
         />
      </div>
    </div>
  );
};
