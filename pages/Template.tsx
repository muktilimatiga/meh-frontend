
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

const TreeRow = ({ 
  level = 0, 
  label, 
  isOpen, 
  onClick, 
  icon: Icon,
  extra,
  isLeaf = false
}: { 
  level?: number, 
  label: string, 
  isOpen: boolean, 
  onClick: () => void, 
  icon?: any,
  extra?: React.ReactNode,
  isLeaf?: boolean
}) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group flex items-center py-3 pr-4 cursor-pointer border-b border-slate-100 dark:border-white/5 transition-colors select-none",
        "hover:bg-slate-50 dark:hover:bg-white/5",
        isOpen && !isLeaf ? "bg-slate-50/50 dark:bg-white/5" : ""
      )}
      style={{ paddingLeft: `${level * 16 + 12}px` }}
    >
      <div className={cn(
        "mr-3 flex h-5 w-5 items-center justify-center rounded border transition-colors",
        isOpen 
          ? "border-slate-400 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-white/10 dark:text-slate-300" 
          : "border-slate-200 bg-white text-slate-400 dark:border-white/10 dark:bg-black dark:text-slate-500 group-hover:border-indigo-300 dark:group-hover:border-indigo-700"
      )}>
        {isOpen ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      </div>
      
      {Icon && <Icon className="mr-2 h-4 w-4 text-slate-400 group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-400" />}
      
      <span className={cn(
        "font-medium text-sm transition-colors",
        isOpen ? "text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-200"
      )}>
        {label}
      </span>
      
      {extra && <div className="ml-auto">{extra}</div>}
    </div>
  );
};

const TemplateContent = ({ 
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
    <div className="pl-[52px] pr-4 py-4 bg-slate-50/50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 animate-in slide-in-from-top-1 duration-200">
       <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-200 dark:bg-white/10 -ml-4" />
          <div className="text-sm text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-[#111] p-4 rounded-md border border-slate-200 dark:border-white/10 whitespace-pre-wrap">
             {template.content}
          </div>
          <div className="flex items-center justify-between mt-3">
             <div className="flex gap-2">
                {template.tags.map(tag => (
                   <Badge key={tag} variant="secondary" className="text-[10px] font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10 border-0">
                      #{tag}
                   </Badge>
                ))}
             </div>
             <div className="flex gap-2">
                 <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 text-xs hover:bg-slate-200 dark:hover:bg-white/10" 
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                 >
                    <Edit2 className="mr-2 h-3 w-3" /> Edit
                 </Button>
                 <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                 >
                    <Trash2 className="mr-2 h-3 w-3" /> Delete
                 </Button>
                 <Button 
                    size="sm" 
                    variant={copied ? 'default' : 'outline'} 
                    className={cn("h-7 text-xs", copied && "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600")}
                    onClick={handleCopy}
                 >
                    {copied ? <><Check className="mr-2 h-3 w-3" /> Copied</> : <><Copy className="mr-2 h-3 w-3" /> Copy</>}
                 </Button>
             </div>
          </div>
       </div>
    </div>
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

// --- Main Page ---

export const TemplatePage = () => {
   const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
   const [searchQuery, setSearchQuery] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
   const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
   
   const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
      'Customer Service': true,
      'Broadband Technical': true,
      'Customer Service-General': true
   });

   const toggleExpand = (key: string) => {
      setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
   };

   // CRUD Handlers
   const handleSave = (data: Partial<Template>) => {
      if (editingTemplate) {
         // Edit
         setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...data } as Template : t));
      } else {
         // Create
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

   // Hierarchy Builder
   const hierarchy = useMemo(() => {
      const groups: Record<string, Record<string, Template[]>> = {};
      
      templates.forEach(t => {
         const matchesSearch = 
            searchQuery === '' ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

         if (!matchesSearch) return;

         if (!groups[t.category]) groups[t.category] = {};
         if (!groups[t.category][t.subcategory]) groups[t.category][t.subcategory] = [];
         groups[t.category][t.subcategory].push(t);
      });
      return groups;
   }, [searchQuery, templates]);

   return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
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

         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <p className="text-slate-500 dark:text-slate-400">Manage support templates and canned responses.</p>
            </div>
            <div className="flex gap-2">
               <Button onClick={openCreateModal}>
                  <Plus className="mr-2 h-4 w-4" /> Add Template
               </Button>
            </div>
         </div>

         {/* Search Bar */}
         <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Search templates..." 
                className="pl-9 bg-white dark:bg-black border-slate-200 dark:border-white/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>

         {/* Tree View Content */}
         <Card className="dark:bg-black dark:border-white/20 overflow-hidden">
            <div className="min-h-[400px]">
               {Object.keys(hierarchy).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                     <Search className="h-8 w-8 mb-2 opacity-50" />
                     <p>No templates found matching "{searchQuery}"</p>
                  </div>
               ) : (
                  Object.entries(hierarchy).map(([category, subcategories]) => (
                     <Fragment key={category}>
                        {/* Level 1: Category */}
                        <TreeRow 
                           level={0}
                           label={category}
                           icon={FolderOpen}
                           isOpen={!!expandedItems[category]}
                           onClick={() => toggleExpand(category)}
                           extra={<Badge variant="outline" className="text-[10px] text-slate-500">{Object.values(subcategories).flat().length}</Badge>}
                        />
                        
                        {expandedItems[category] && Object.entries(subcategories).map(([subcategory, templates]) => {
                           const subKey = `${category}-${subcategory}`;
                           return (
                              <Fragment key={subKey}>
                                 {/* Level 2: Subcategory */}
                                 <TreeRow 
                                    level={1}
                                    label={subcategory}
                                    icon={CornerDownRight}
                                    isOpen={!!expandedItems[subKey]}
                                    onClick={() => toggleExpand(subKey)}
                                 />

                                 {/* Level 3: Templates */}
                                 {expandedItems[subKey] && templates.map(template => {
                                    const tmplKey = `tmpl-${template.id}`;
                                    const isOpen = !!expandedItems[tmplKey];
                                    return (
                                       <Fragment key={template.id}>
                                          <TreeRow 
                                             level={2}
                                             label={template.title}
                                             icon={FileText}
                                             isOpen={isOpen}
                                             isLeaf={true}
                                             onClick={() => toggleExpand(tmplKey)}
                                             extra={<span className="text-[10px] text-slate-400">{template.usageCount} uses</span>}
                                          />
                                          {isOpen && (
                                             <TemplateContent 
                                                template={template} 
                                                onEdit={() => openEditModal(template)} 
                                                onDelete={() => initiateDelete(template)}
                                             />
                                          )}
                                       </Fragment>
                                    );
                                 })}
                              </Fragment>
                           );
                        })}
                     </Fragment>
                  ))
               )}
            </div>
         </Card>

         {/* Settings Footer */}
         <div className="pt-8 border-t border-slate-200 dark:border-white/10">
            <Card className="dark:bg-black dark:border-white/20">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <SettingsIcon className="h-5 w-5 text-slate-500" /> 
                     <span>Global Configuration</span>
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                        <Label className="text-base">Auto-Append Signature</Label>
                        <p className="text-xs text-slate-500">Automatically add agent signature to all templates.</p>
                     </div>
                     <Switch checked={true} onCheckedChange={() => {}} />
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
};
