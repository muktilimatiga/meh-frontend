
import * as React from 'react';
import { useState, useMemo, useEffect, Fragment } from 'react';
import { 
  Search, 
  Plus, 
  Minus,
  MessageSquare, 
  Wifi, 
  Copy, 
  Check, 
  Settings as SettingsIcon, 
  Edit2, 
  Tag,
  ChevronRight,
  FolderOpen,
  FileText,
  CornerDownRight,
  Trash2,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Code,
  AlertTriangle
} from 'lucide-react';
import {
  Input,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  ModalOverlay,
  Label,
  Select,
  Switch
}
from '@/components/ui'
import {cn} from '@/lib/utils'
// --- Types & Mock Data ---

interface Template {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  content: string;
  tags: string[];
  usageCount: number;
}

const INITIAL_TEMPLATES: Template[] = [
  // Customer Service -> General
  { 
    id: '1', 
    title: 'General Greeting', 
    category: 'Customer Service',
    subcategory: 'General',
    content: "Hi {name}, thanks for contacting Nexus Support! My name is {agent}. How can I help you today?", 
    tags: ['greeting', 'intro'],
    usageCount: 1240 
  },
  { 
    id: '2', 
    title: 'Closing Ticket', 
    category: 'Customer Service',
    subcategory: 'General',
    content: "I haven't heard back from you in a while, so I'll be closing this ticket. If you still need help, just reply to this email to reopen it. Have a great day!", 
    tags: ['closing', 'follow-up'],
    usageCount: 430 
  },
  // Customer Service -> Billing
  { 
    id: '3', 
    title: 'Invoice Explanation', 
    category: 'Customer Service',
    subcategory: 'Billing',
    content: "I've reviewed your latest invoice. The extra charge corresponds to the pro-rated upgrade you requested on {date}. Does that clarify things?", 
    tags: ['billing', 'invoice'],
    usageCount: 85 
  },
  { 
    id: '4', 
    title: 'Refund Processed', 
    category: 'Customer Service',
    subcategory: 'Billing',
    content: "I've processed a refund of ${amount} to your payment method. It should appear within 3-5 business days.", 
    tags: ['billing', 'refund'],
    usageCount: 22 
  },
  // Broadband -> Troubleshooting
  { 
    id: '5', 
    title: 'ONT Restart Instructions', 
    category: 'Broadband Technical',
    subcategory: 'Troubleshooting',
    content: "Please locate your Optical Network Terminal (white box). Unplug the power cable, wait 30 seconds, and plug it back in. Wait for the 'PON' light to turn solid green.", 
    tags: ['hardware', 'restart'],
    usageCount: 890 
  },
  { 
    id: '6', 
    title: 'Slow Speed Diagnosis', 
    category: 'Broadband Technical',
    subcategory: 'Troubleshooting',
    content: "To diagnose the speed issue, please connect a computer directly to the router via Ethernet cable and run a speed test at speed.nexus.com. Let me know the results.", 
    tags: ['speed', 'diagnosis'],
    usageCount: 310 
  },
  // Broadband -> Outage
  { 
    id: '7', 
    title: 'Area Outage Notice', 
    category: 'Broadband Technical',
    subcategory: 'Outage',
    content: "We are currently experiencing a service outage in your area due to maintenance. Technicians are on-site. Estimated resolution time is {time}.", 
    tags: ['outage', 'maintenance'],
    usageCount: 120 
  },
];

// --- Components ---

// --- Components ---

const TemplateCard = ({
   template,
   onEdit,
   onDelete
}: {
   template: Template,
   onEdit: () => void,
   onDelete: () => void
}) => {
   const [copied, setCopied] = useState(false);

   const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(template.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   return (
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-[#121214] border-slate-300 dark:border-white/5 shadow-md hover:border-indigo-300 dark:hover:border-white/10">
         <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/0 group-hover:bg-indigo-500 transition-all duration-300" />
         
         <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-4">
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-0 text-[10px] uppercase tracking-wide font-semibold">
                        {template.subcategory || template.category}
                     </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold leading-tight text-slate-900 dark:text-slate-100">
                     {template.title}
                  </CardTitle>
               </div>
               <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
               >
                  <Edit2 className="h-4 w-4" />
               </Button>
            </div>
         </CardHeader>
         
         <CardContent className="space-y-4">
            <div className="relative bg-slate-50 dark:bg-black/40 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-400 font-mono line-clamp-3">
               {template.content}
            </div>
            
            <div className="flex items-center justify-between pt-2">
               <div className="flex gap-1.5 flex-wrap">
                  {template.tags.slice(0, 3).map(tag => (
                     <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-500 border border-slate-200 dark:border-white/5">
                        #{tag}
                     </span>
                  ))}
                  {template.tags.length > 3 && (
                     <span className="text-[10px] px-1.5 py-0.5 text-slate-400">+ {template.tags.length - 3}</span>
                  )}
               </div>
               
               <div className="flex gap-1">
                  <Button
                     size="sm"
                     variant="ghost"
                     className={cn(
                        "h-7 text-xs transition-colors border",
                         copied 
                           ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20" 
                           : "text-slate-500 border-transparent hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 dark:hover:bg-white/5 dark:hover:border-white/10"
                     )}
                     onClick={handleCopy}
                  >
                     {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                     <span className="ml-1.5">{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
               </div>
            </div>
         </CardContent>
      </Card>
   );
};

// --- Rich Text Editor Simulator ---
const RichTextEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  return (
    <div className="border border-slate-200 dark:border-white/10 rounded-md overflow-hidden bg-white dark:bg-[#09090b] focus-within:ring-1 focus-within:ring-slate-950 dark:focus-within:ring-slate-300">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-slate-100 dark:border-white/10 p-1 bg-slate-50 dark:bg-white/5">
        <Button variant="ghost" size="icon" className="h-6 w-6" tabIndex={-1}><Bold className="h-3 w-3" /></Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" tabIndex={-1}><Italic className="h-3 w-3" /></Button>
        <div className="w-px h-3 bg-slate-200 dark:bg-white/10 mx-1" />
        <Button variant="ghost" size="icon" className="h-6 w-6" tabIndex={-1}><List className="h-3 w-3" /></Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" tabIndex={-1}><LinkIcon className="h-3 w-3" /></Button>
        <div className="w-px h-3 bg-slate-200 dark:bg-white/10 mx-1" />
        <Button variant="ghost" size="icon" className="h-6 w-6" tabIndex={-1}><Code className="h-3 w-3" /></Button>
        <div className="ml-auto">
           <Select className="h-6 text-[10px] py-0 px-2 w-auto border-none bg-transparent shadow-none focus:ring-0">
              <option>Variable...</option>
              <option>{'{name}'}</option>
              <option>{'{agent}'}</option>
              <option>{'{date}'}</option>
           </Select>
        </div>
      </div>
      {/* Editor Area */}
      <textarea
        className="w-full p-3 min-h-[120px] bg-transparent border-none outline-none text-sm resize-none text-slate-900 dark:text-slate-50 font-mono"
        placeholder="Type your message here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

// --- Template Modal (Create & Edit) ---
const TemplateModal = ({ 
  isOpen, 
  onClose, 
  initialData, 
  onSave 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  initialData?: Template | null,
  onSave: (data: Partial<Template>) => void
}) => {
   const [formData, setFormData] = useState<Partial<Template>>({
      title: '',
      category: 'Customer Service',
      subcategory: '',
      content: '',
      tags: []
   });

   useEffect(() => {
      if (isOpen) {
         if (initialData) {
            setFormData(initialData);
         } else {
            setFormData({
               title: '',
               category: 'Customer Service',
               subcategory: '',
               content: '',
               tags: []
            });
         }
      }
   }, [isOpen, initialData]);

   const handleSubmit = () => {
      if (!formData.title || !formData.content) return;
      onSave(formData);
      onClose();
   };

   return (
      <ModalOverlay isOpen={isOpen} onClose={onClose}>
         <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
               <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <MessageSquare className="h-5 w-5" />
               </div>
               <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                     {initialData ? 'Edit Template' : 'New Message Template'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                     {initialData ? 'Modify existing response details.' : 'Create a canned response for agents.'}
                  </p>
               </div>
            </div>

            <div className="space-y-3">
               <div className="space-y-2">
                  <Label>Template Title</Label>
                  <Input 
                     placeholder="e.g. Modem Reset Steps" 
                     value={formData.title}
                     onChange={e => setFormData({...formData, title: e.target.value})}
                     autoFocus 
                  />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Category</Label>
                     <Select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                     >
                        <option value="Customer Service">Customer Service</option>
                        <option value="Broadband Technical">Broadband Technical</option>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <Label>Subcategory</Label>
                     <Input 
                        placeholder="e.g. Billing" 
                        value={formData.subcategory}
                        onChange={e => setFormData({...formData, subcategory: e.target.value})}
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <Label>Message Content</Label>
                  <RichTextEditor 
                     value={formData.content || ''}
                     onChange={val => setFormData({...formData, content: val})}
                  />
                  <p className="text-[10px] text-slate-500">Supported variables: {'{name}, {agent}, {date}, {time}'}</p>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="outline" onClick={onClose}>Cancel</Button>
               <Button onClick={handleSubmit}>
                  {initialData ? 'Save Changes' : 'Create Template'}
               </Button>
            </div>
         </div>
      </ModalOverlay>
   );
};

// --- Delete Confirmation Modal ---
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  templateTitle 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void,
  templateTitle: string
}) => {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
       <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
             <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
             </div>
             <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Template</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
             </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete the template <span className="font-semibold text-slate-900 dark:text-white">"{templateTitle}"</span>?
          </p>

          <div className="flex justify-end gap-2 pt-4">
             <Button variant="outline" onClick={onClose}>Cancel</Button>
             <Button variant="destructive" onClick={onConfirm} className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white">
                Delete Template
             </Button>
          </div>
       </div>
    </ModalOverlay>
  );
};

export const TemplatePage = () => {
   const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCategory, setSelectedCategory] = useState<string>('All');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
   const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);

   // Extract Categories
   const categories = useMemo(() => {
      const cats = new Set(templates.map(t => t.category));
      return ['All', ...Array.from(cats)];
   }, [templates]);

   const filteredTemplates = useMemo(() => {
      return templates.filter(t => {
         const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
         const matchesSearch = 
            searchQuery === '' ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
         
         return matchesCategory && matchesSearch;
      });
   }, [templates, selectedCategory, searchQuery]);

   // CRUD Handlers (kept same)
   const handleSave = (data: Partial<Template>) => {
      if (editingTemplate) {
         setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...data } as Template : t));
      } else {
         const newTemplate: Template = {
            id: Date.now().toString(),
            title: data.title || 'Untitled',
            category: data.category || 'General',
            subcategory: data.subcategory || 'General',
            content: data.content || '',
            tags: data.tags || [],
            usageCount: 0
         };
         setTemplates(prev => [...prev, newTemplate]);
      }
      setEditingTemplate(null);
   };

   const initiateDelete = (template: Template) => {
      setDeletingTemplate(template);
   };

   const confirmDelete = () => {
      if (deletingTemplate) {
         setTemplates(prev => prev.filter(t => t.id !== deletingTemplate.id));
         setDeletingTemplate(null);
      }
   };

   const openCreateModal = () => {
      setEditingTemplate(null);
      setIsModalOpen(true);
   };

   const openEditModal = (template: Template) => {
      setEditingTemplate(template);
      setIsModalOpen(true);
   };

   return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 px-6 max-w-[1600px] mx-auto">
         <TemplateModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            initialData={editingTemplate}
            onSave={handleSave}
         />

         <DeleteConfirmationModal 
            isOpen={!!deletingTemplate}
            onClose={() => setDeletingTemplate(null)}
            onConfirm={confirmDelete}
            templateTitle={deletingTemplate?.title || ''}
         />

         {/* Header & Controls */}
         <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
               <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Templates</h1>
                  <p className="text-slate-500 dark:text-slate-400 max-w-lg text-lg">
                     Manage and organize your canned responses and support templates for faster communication.
                  </p>
               </div>
               <Button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">
                  <Plus className="mr-2 h-4 w-4" /> New Template
               </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/80 dark:bg-[#121214] p-2 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                {/* Category Filters */}
               <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full md:w-auto p-1">
                  {categories.map(cat => (
                     <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                           "px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                           selectedCategory === cat 
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                              : "text-slate-600 dark:text-slate-400 hover:bg-white hover:shadow-sm dark:hover:bg-white/5"
                        )}
                     >
                        {cat}
                     </button>
                  ))}
               </div>

               {/* Search */}
               <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                        placeholder="Search templates..." 
                        className="pl-9 h-10 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>
         </div>

         {/* Content Grid */}
         {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
               <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 opacity-40 ps-1" />
               </div>
               <h3 className="text-lg font-medium text-slate-900 dark:text-white">No templates found</h3>
               <p className="text-sm mt-1">Try adjusting your search or filters.</p>
               <Button variant="link" onClick={() => {setSearchQuery(''); setSelectedCategory('All');}} className="mt-2 text-indigo-500">
                  Clear all filters
               </Button>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredTemplates.map(template => (
                  <TemplateCard 
                     key={template.id} 
                     template={template} 
                     onEdit={() => openEditModal(template)}
                     onDelete={() => initiateDelete(template)}
                  />
               ))}
            </div>
         )}
      </div>
   );
};
