
import * as React from 'react';
import { useState, useEffect } from 'react';
import { X, Copy, Send, DollarSign } from 'lucide-react';
import { ModalOverlay, Label, Input, Textarea, Button, Separator } from '@/components/ui'
import { Customer } from '@/types'
import { useLogActivity } from '@/hooks/useQueries';

interface InvoicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Customer | null;
}

export const InvoicePaymentModal = ({ isOpen, onClose, user }: InvoicePaymentModalProps) => {
  const [amount, setAmount] = useState('170000');
  const [phone, setPhone] = useState('6282231311855'); // Default/Mock phone
  const [message, setMessage] = useState('');
  
  const logActivity = useLogActivity();
  
  // Mock Data generation based on selected user
  const internetId = React.useMemo(() => Math.floor(100000000000 + Math.random() * 900000000000).toString(), [user]);
  const paymentLink = React.useMemo(() => `https://payment.lexxadata.net.id/?id=${Math.random().toString(16).substr(2, 8)}`, [user]);
  const currentDate = new Date();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const deadlineDate = new Date(currentDate.setDate(currentDate.getDate() + 7)).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Update message when dependencies change
  useEffect(() => {
    if (!user) return;

    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(amount.replace(/[^0-9]/g, '')));

    const msg = `Pelanggan Yth, *${user.nameaddres.toUpperCase()}*
Berikut detail tagihan internet bulan ${monthName} ${year},

No Internet : ${internetId}
Nama: ${user.nameaddres.toUpperCase()}
Tagihan : ${formattedAmount}
Link Payment : ${paymentLink}

Silahkan melakukan pembayaran sebelum tanggal ${deadlineDate}. Agar internet Anda tidak terisolir oleh sistem.`;

    setMessage(msg);
  }, [user, amount, internetId, paymentLink, monthName, year, deadlineDate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    // In a real app, toast success here
  };

  const handleSend = () => {
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    // Log the activity
    logActivity.mutate({
        level: 'info',
        source: 'Invoice',
        message: `Invoice sent to ${user?.nameaddres  }`,
        user: 'Admin', // Assuming current user is admin
        metadata: { amount, phone, internetId }
    });

    window.open(whatsappUrl, '_blank');
    onClose();
  };

  if (!user) return null;

  // Mock Address based on user ID logic or static for demo
  const mockAddress = "DSN. KRAJAN, 02/03, NGENTRONG, CAMPURDARAT"; 

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} hideCloseButton={true} className="max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
         <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
               <DollarSign className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Send Invoice</h2>
         </div>
         <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="h-4 w-4" /></Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        
        {/* User Details Section (Read-Only) */}
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Customer Details</Label>
                <div className="grid gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                    <div>
                        <Label className="text-xs text-slate-400">Name</Label>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                    </div>
                    <div>
                        <Label className="text-xs text-slate-400">Address</Label>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{mockAddress}</div>
                    </div>
                </div>
            </div>
        </div>

        <Separator />

        {/* Dynamic Inputs */}
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone (WhatsApp)</Label>
                    <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        className="font-mono text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount (IDR)</Label>
                    <Input 
                        id="amount" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        className="font-mono text-sm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="desc">Deskripsi (Generated Message)</Label>
                <Textarea 
                    id="desc" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[200px] font-mono text-sm bg-slate-50 dark:bg-black/20 leading-relaxed"
                />
            </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-end gap-2">
         <Button variant="outline" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" /> Copy Text
         </Button>
         <Button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700">
            <Send className="mr-2 h-4 w-4" /> Send WhatsApp
         </Button>
      </div>
    </ModalOverlay>
  );
};
