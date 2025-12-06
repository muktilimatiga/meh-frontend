import * as React from 'react';
import { ArrowLeft, Square, Circle, MousePointer2, Trash2, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { WhiteboardShape, WhiteboardTool } from '../types';
import { Header } from '../components/Header';
import { MOCK_USER } from '../constants';
import { AIResponseCard } from '../components/AIResponseCard';

interface ExcalidrawPageProps {
    onBack: () => void;
}

export const ExcalidrawPage: React.FC<ExcalidrawPageProps> = ({ onBack }) => {
    const [shapes, setShapes] = React.useState<WhiteboardShape[]>([]);
    const [selectedTool, setSelectedTool] = React.useState<WhiteboardTool>('select');
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [aiResponse, setAiResponse] = React.useState<string | null>(null);
    
    const startPos = React.useRef({ x: 0, y: 0 });
    const currentShapeId = React.useRef<string | null>(null);

    // --- Actions ---

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (selectedTool === 'select') {
            setSelectedId(null);
            return;
        }

        setIsDrawing(true);
        startPos.current = { x, y };
        const newId = `shape-${Date.now()}`;
        currentShapeId.current = newId;

        const newShape: WhiteboardShape = {
            id: newId,
            type: selectedTool,
            x,
            y,
            width: 0,
            height: 0,
            color: getRandomColor(),
        };

        setShapes(prev => [...prev, newShape]);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing || !currentShapeId.current) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const width = currentX - startPos.current.x;
        const height = currentY - startPos.current.y;

        setShapes(prev => prev.map(shape => {
            if (shape.id === currentShapeId.current) {
                return {
                    ...shape,
                    width,
                    height
                };
            }
            return shape;
        }));
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        currentShapeId.current = null;
        if (selectedTool !== 'select') {
            setSelectedTool('select');
        }
    };

    const deleteSelected = () => {
        if (selectedId) {
            setShapes(prev => prev.filter(s => s.id !== selectedId));
            setSelectedId(null);
        }
    };

    const getRandomColor = () => {
        const colors = ['#e0e7ff', '#f3e8ff', '#dcfce7', '#ffedd5'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans">
             <Header 
                user={MOCK_USER} 
                onSearch={() => {}} 
                onAIResult={setAiResponse} 
            />
            
            <div className="flex-1 relative overflow-hidden flex flex-col">
                 {aiResponse && (
                    <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-background/90 backdrop-blur-sm border-b border-border">
                        <AIResponseCard response={aiResponse} onClose={() => setAiResponse(null)} />
                    </div>
                )}

                {/* Toolbar */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1.5 bg-white rounded-xl shadow-lg border border-slate-100/60 ring-1 ring-slate-900/5">
                    <Button 
                        variant={selectedTool === 'select' ? 'secondary' : 'ghost'} 
                        size="icon" 
                        onClick={() => setSelectedTool('select')}
                        className={selectedTool === 'select' ? 'bg-violet-100 text-violet-700' : 'text-slate-600'}
                    >
                        <MousePointer2 size={18} />
                    </Button>
                    <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                    <Button 
                        variant={selectedTool === 'rectangle' ? 'secondary' : 'ghost'} 
                        size="icon" 
                        onClick={() => setSelectedTool('rectangle')}
                        className={selectedTool === 'rectangle' ? 'bg-violet-100 text-violet-700' : 'text-slate-600'}
                    >
                        <Square size={18} />
                    </Button>
                    <Button 
                        variant={selectedTool === 'circle' ? 'secondary' : 'ghost'} 
                        size="icon" 
                        onClick={() => setSelectedTool('circle')}
                        className={selectedTool === 'circle' ? 'bg-violet-100 text-violet-700' : 'text-slate-600'}
                    >
                        <Circle size={18} />
                    </Button>
                    {selectedId && (
                        <>
                            <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                            <Button variant="ghost" size="icon" onClick={deleteSelected} className="text-red-500 hover:bg-red-50">
                                <Trash2 size={18} />
                            </Button>
                        </>
                    )}
                </div>

                {/* Top Bar */}
                <div className="flex items-center justify-between p-4 z-20 pointer-events-none">
                    <div className="pointer-events-auto">
                        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80 backdrop-blur shadow-sm border-slate-200">
                            <ArrowLeft size={16} className="mr-2" />
                            Dashboard
                        </Button>
                    </div>
                    <div className="pointer-events-auto">
                        <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur shadow-sm border-slate-200 text-slate-600">
                            <Download size={16} className="mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Canvas */}
                <div 
                    className="absolute inset-0 z-0 cursor-crosshair overflow-hidden"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    <div 
                        className="w-full h-full opacity-40 pointer-events-none" 
                        style={{ 
                            backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', 
                            backgroundSize: '24px 24px' 
                        }}
                    ></div>

                    {shapes.map(shape => {
                        const isSelected = selectedId === shape.id;
                        const style: React.CSSProperties = {
                            position: 'absolute',
                            left: Math.min(shape.x, shape.x + shape.width!),
                            top: Math.min(shape.y, shape.y + shape.height!),
                            width: Math.abs(shape.width!),
                            height: Math.abs(shape.height!),
                            backgroundColor: shape.color,
                            border: isSelected ? '2px solid #8b5cf6' : '2px solid #1e293b',
                            borderRadius: shape.type === 'circle' ? '50%' : '8px',
                            boxShadow: '4px 4px 0px 0px rgba(30, 41, 59, 1)',
                        };

                        return (
                            <div 
                                key={shape.id} 
                                style={style}
                                onClick={(e) => { e.stopPropagation(); setSelectedId(shape.id); }}
                                className="hover:ring-2 ring-violet-300 transition-shadow"
                            />
                        );
                    })}
                </div>
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-medium pointer-events-none">
                    {selectedTool === 'select' ? 'Click shapes to select. Press Delete to remove.' : 'Click and drag to draw.'}
                </div>
            </div>
        </div>
    );
};