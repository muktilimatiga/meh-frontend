import * as React from 'react';
import { X, Copy, Send, DollarSign } from 'lucide-react';
import { ModalOverlay } from '../../components/ui/ModalOverlay';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Separator } from '../../components/ui/Separator';
import { User } from '../../types';

interface InvoicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const InvoicePaymentModal: React.FC<InvoicePaymentModalProps> = ({ isOpen, onClose, user }) => {
  const [amount, setAmount] = React.useState('170000');
  const [phone, setPhone] = React.useState('6282231311855');
  const [message, setMessage] = React.useState('');
  
  const currentDate = new Date();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const deadlineDate = new Date(currentDate.setDate(currentDate.getDate() + 7)).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Memoize random values so they don't change on every render
  const internetId = React.useMemo(() => Math.floor(100000000000 + Math.random() * 900000000000).toString(), []);
  const paymentLink = React.useMemo(() => `https://payment.lexxadata.net.id/?id=${Math.random().toString(16).substr(2, 8)}`, []);

  React.useEffect(() => {
    if (!user) return;

    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(amount.replace(/[^0-9]/g, '')));

    const msg = `Pelanggan Yth, *${user.name?.toUpperCase() || 'CUSTOMER'}*
Berikut detail tagihan internet bulan ${monthName} ${year},

No Internet : ${internetId}
Nama: ${user.name?.toUpperCase()}
Tagihan : ${formattedAmount}
Link Payment : ${paymentLink}

Silahkan melakukan pembayaran sebelum tanggal ${deadlineDate}. Agar internet Anda tidak terisolir oleh sistem.`;

    setMessage(msg);
  }, [user, amount, internetId, paymentLink, monthName, year, deadlineDate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
  };

  const handleSend = () => {
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  if (!user) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} hideCloseButton={true} className="max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/10">
         <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
               <DollarSign className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Send Invoice</h2>
         </div>
         <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="h-4 w-4" /></Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Customer Details</Label>
                <div className="grid gap-3 p-3 bg-muted/20 rounded-lg border border-border">
                    <div>
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <div className="text-sm font-medium text-foreground">{user.name}</div>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Address</Label>
                        <div className="text-sm font-medium text-foreground">{user.address || 'N/A'}</div>
                    </div>
                </div>
            </div>
        </div>

        <Separator />

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
                    className="min-h-[200px] font-mono text-sm bg-muted/10 leading-relaxed"
                />
            </div>
        </div>
      </div>

      <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-2">
         <Button variant="outline" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" /> Copy Text
         </Button>
         <Button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Send className="mr-2 h-4 w-4" /> Send WhatsApp
         </Button>
      </div>
    </ModalOverlay>
  );
};