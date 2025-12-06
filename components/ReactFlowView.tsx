import * as React from 'react';
import { ArrowLeft, Plus, Minus, Lock, Info, Zap } from 'lucide-react';
import { Button } from './ui/Button';

interface ReactFlowViewProps {
    onBack: () => void;
}

export const ReactFlowView: React.FC<ReactFlowViewProps> = ({ onBack }) => {
    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 relative overflow-hidden">
            {/* Sidebar (Mock) */}
            <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 z-10">
                <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
                    <Zap className="text-pink-500" />
                    <span>Workflow Builder</span>
                </div>
                
                <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nodes</div>
                    <div className="p-3 border border-slate-200 rounded-md bg-white cursor-grab hover:border-pink-500 hover:shadow-sm transition-all flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Input Node
                    </div>
                    <div className="p-3 border border-slate-200 rounded-md bg-white cursor-grab hover:border-pink-500 hover:shadow-sm transition-all flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        Process Node
                    </div>
                    <div className="p-3 border border-slate-200 rounded-md bg-white cursor-grab hover:border-pink-500 hover:shadow-sm transition-all flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Output Node
                    </div>
                </div>
                
                <div className="mt-auto">
                    <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={onBack}>
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Home
                    </Button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-slate-50">
                 {/* Grid Background */}
                 <div 
                    className="absolute inset-0 opacity-40 pointer-events-none" 
                    style={{ 
                        backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', 
                        backgroundSize: '20px 20px' 
                    }}
                ></div>

                {/* Controls */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-white p-1 rounded-md shadow-lg border border-slate-100 z-10">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Plus size={16}/></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Minus size={16}/></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Lock size={16}/></Button>
                </div>

                {/* Mock Nodes on Canvas */}
                <div className="absolute inset-0 overflow-auto flex items-center justify-center">
                    <div className="relative w-full h-full max-w-4xl max-h-[800px]">
                        {/* Node 1 */}
                        <div className="absolute top-[20%] left-[20%] w-48 bg-white rounded-lg border-2 border-slate-200 shadow-sm p-0 overflow-hidden">
                             <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-400"></div>
                             <div className="p-4">
                                 <div className="font-semibold text-sm">Data Source</div>
                                 <div className="text-xs text-slate-500 mt-1">PostgreSQL DB</div>
                             </div>
                             {/* Handle */}
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-slate-400 rounded-full border-2 border-white"></div>
                        </div>

                        {/* Connection Line */}
                         <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            <path d="M 360 200 C 450 200 450 350 540 350" stroke="#94a3b8" strokeWidth="2" fill="none" />
                        </svg>

                        {/* Node 2 */}
                        <div className="absolute top-[35%] left-[45%] w-48 bg-white rounded-lg border-2 border-pink-500 shadow-md p-0 overflow-hidden ring-4 ring-pink-500/10">
                             <div className="h-2 bg-gradient-to-r from-pink-500 to-purple-500"></div>
                             <div className="p-4">
                                 <div className="font-semibold text-sm">Processor</div>
                                 <div className="text-xs text-slate-500 mt-1">Transform Data</div>
                             </div>
                             {/* Handles */}
                             <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-slate-400 rounded-full border-2 border-white"></div>
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-slate-400 rounded-full border-2 border-white"></div>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                    <Info size={14} />
                    <span>Read-only mode</span>
                </div>
            </div>
        </div>
    );
};