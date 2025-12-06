import * as React from 'react';
import { ArrowLeft, Square, Circle, ArrowRight, Pen, Image, Eraser, Download, Share2 } from 'lucide-react';
import { Button } from './ui/Button';

interface ExcalidrawViewProps {
    onBack: () => void;
}

export const ExcalidrawView: React.FC<ExcalidrawViewProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col h-screen bg-[#ffffff] text-black font-sans relative overflow-hidden">
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 p-1 bg-white rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.1)]">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md hover:bg-violet-100 text-slate-700">
                    <Square size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md hover:bg-violet-100 text-slate-700">
                    <Circle size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md hover:bg-violet-100 text-slate-700">
                    <ArrowRight size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md bg-violet-100 text-violet-700">
                    <Pen size={18} />
                </Button>
                <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md hover:bg-violet-100 text-slate-700">
                    <Image size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md hover:bg-violet-100 text-slate-700">
                    <Eraser size={18} />
                </Button>
            </div>

            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 z-10 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack} className="shadow-sm">
                        <ArrowLeft size={16} className="mr-2" />
                        Dashboard
                    </Button>
                    <div className="bg-slate-100 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600">
                        Untitled Topology
                    </div>
                </div>
                <div className="pointer-events-auto flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white">
                        <Download size={16} className="mr-2" />
                        Export
                    </Button>
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                        <Share2 size={16} className="mr-2" />
                        Share
                    </Button>
                </div>
            </div>

            {/* Canvas Area (Mock) */}
            <div className="absolute inset-0 z-0 bg-slate-50 cursor-crosshair">
                {/* Dot Pattern Background */}
                <div 
                    className="w-full h-full opacity-30" 
                    style={{ 
                        backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', 
                        backgroundSize: '20px 20px' 
                    }}
                ></div>

                {/* Hand-drawn style mock elements */}
                <div className="absolute top-1/3 left-1/4 w-48 h-32 border-2 border-black rounded-lg bg-white flex items-center justify-center -rotate-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="font-handwriting text-lg">Client App</span>
                </div>
                
                <svg className="absolute top-[38%] left-[calc(25%+12rem)] w-32 h-12 overflow-visible">
                    <path d="M 0 10 Q 50 -10 120 20" stroke="black" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                    <defs>
                        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L0,6 L9,3 z" fill="black" />
                        </marker>
                    </defs>
                </svg>

                <div className="absolute top-[40%] left-[calc(25%+20rem)] w-48 h-32 border-2 border-black rounded-full bg-white flex items-center justify-center rotate-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="font-handwriting text-lg">API Gateway</span>
                </div>
            </div>
        </div>
    );
};