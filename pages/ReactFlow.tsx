import * as React from 'react';
import {
    ArrowLeft,
    Plus,
    Minus,
    Zap,
    MousePointer2,
    Database,
    Cloud,
    GitFork,
    FileInput,
    FileOutput,
    Cpu,
    Trash2,
    Settings2,
    BoxSelect
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Node, Edge, NodeType } from '../types';
import { MOCK_USER } from '../constants';
import { AIResponseCard } from '../components/AIResponseCard';
import { useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../store';

export const ReactFlowPage: React.FC = () => {
    const navigate = useNavigate();
    const onBack = () => navigate({ to: '/' });

    const { setAiResponse, aiResponse } = useAppStore();

    // Initial State with a Demo Graph
    const [nodes, setNodes] = React.useState<Node[]>([
        { id: 'node-1', type: 'input', position: { x: 100, y: 150 }, label: 'User Request', data: { method: 'HTTP' } },
        { id: 'node-2', type: 'process', position: { x: 400, y: 150 }, label: 'Auth Check', data: { priority: 'High' } },
        { id: 'node-3', type: 'decision', position: { x: 400, y: 300 }, label: 'Is Admin?', data: { condition: 'Role == Admin' } },
        { id: 'node-4', type: 'output', position: { x: 700, y: 150 }, label: 'Dashboard', data: { format: 'JSON' } }
    ]);

    const [edges, setEdges] = React.useState<Edge[]>([
        { id: 'e-1-2', source: 'node-1', target: 'node-2' },
        { id: 'e-2-3', source: 'node-2', target: 'node-3' },
        { id: 'e-2-4', source: 'node-2', target: 'node-4' }
    ]);

    const [zoom, setZoom] = React.useState(1);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [connectingNodeId, setConnectingNodeId] = React.useState<string | null>(null);
    const [editingNodeId, setEditingNodeId] = React.useState<string | null>(null);

    // Dragging state
    const [isDraggingNode, setIsDraggingNode] = React.useState<string | null>(null);
    const dragOffset = React.useRef({ x: 0, y: 0 });
    const canvasRef = React.useRef<HTMLDivElement>(null);

    // --- Actions ---

    const handleDragStart = (e: React.DragEvent, type: NodeType) => {
        e.dataTransfer.setData('application/reactflow', type);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('application/reactflow') as NodeType;
        if (!type || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;

        // Default Labels & Data based on type
        const defaults: Record<NodeType, { label: string, data: any }> = {
            input: { label: 'Input Source', data: { method: 'HTTP' } },
            process: { label: 'Processor', data: { priority: 'Medium' } },
            output: { label: 'Output Dest', data: { format: 'JSON' } },
            database: { label: 'Database', data: { dbType: 'Postgres' } },
            api: { label: 'API Endpoint', data: { method: 'GET' } },
            decision: { label: 'Condition', data: { condition: 'True' } }
        };

        const newNode: Node = {
            id: `node-${Date.now()}`,
            type,
            position: { x, y },
            label: defaults[type].label,
            data: defaults[type].data
        };

        setNodes((nds) => [...nds, newNode]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    // Node Movement
    const onNodeMouseDown = (e: React.MouseEvent, id: string) => {
        if (connectingNodeId) return; // Don't drag if connecting
        e.stopPropagation();
        setIsDraggingNode(id);
        setSelectedId(id);
        setEditingNodeId(null); // Stop editing if clicking elsewhere

        const node = nodes.find(n => n.id === id);
        if (node && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            dragOffset.current = {
                x: (e.clientX - rect.left) / zoom - node.position.x,
                y: (e.clientY - rect.top) / zoom - node.position.y
            };
        }
    };

    const onCanvasMouseMove = (e: React.MouseEvent) => {
        if (isDraggingNode && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / zoom - dragOffset.current.x;
            const y = (e.clientY - rect.top) / zoom - dragOffset.current.y;

            setNodes(nds => nds.map(n => n.id === isDraggingNode ? { ...n, position: { x, y } } : n));
        }
    };

    const onCanvasMouseUp = () => {
        setIsDraggingNode(null);
    };

    // Connections
    const handleConnectStart = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        setConnectingNodeId(nodeId);
    };

    const handleConnectEnd = (e: React.MouseEvent, targetId: string) => {
        e.stopPropagation();
        if (connectingNodeId && connectingNodeId !== targetId) {
            const newEdge: Edge = {
                id: `e-${connectingNodeId}-${targetId}`,
                source: connectingNodeId,
                target: targetId
            };
            if (!edges.find(e => e.source === connectingNodeId && e.target === targetId)) {
                setEdges(eds => [...eds, newEdge]);
            }
        }
        setConnectingNodeId(null);
    };

    const deleteSelected = () => {
        if (!selectedId) return;
        setNodes(nds => nds.filter(n => n.id !== selectedId));
        setEdges(eds => eds.filter(e => e.id !== selectedId && e.source !== selectedId && e.target !== selectedId));
        setSelectedId(null);
    };

    // Node Data Updates
    const updateNodeLabel = (id: string, label: string) => {
        setNodes(nds => nds.map(n => n.id === id ? { ...n, label } : n));
    };

    const updateNodeData = (id: string, key: string, value: any) => {
        setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, [key]: value } } : n));
    };

    // Listen for delete key
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && !editingNodeId) {
                deleteSelected();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, editingNodeId]);


    // --- Render Helpers ---

    const getNodeStyles = (type: NodeType) => {
        switch (type) {
            case 'input': return { base: 'border-blue-500 bg-blue-50', header: 'bg-blue-500', icon: FileInput };
            case 'process': return { base: 'border-purple-500 bg-purple-50', header: 'bg-purple-500', icon: Cpu };
            case 'output': return { base: 'border-green-500 bg-green-50', header: 'bg-green-500', icon: FileOutput };
            case 'database': return { base: 'border-amber-500 bg-amber-50', header: 'bg-amber-500', icon: Database };
            case 'api': return { base: 'border-cyan-500 bg-cyan-50', header: 'bg-cyan-500', icon: Cloud };
            case 'decision': return { base: 'border-orange-500 bg-orange-50', header: 'bg-orange-500', icon: GitFork };
            default: return { base: 'border-slate-200 bg-white', header: 'bg-slate-400', icon: Zap };
        }
    };

    const renderNodeCustomContent = (node: Node) => {
        const commonSelectClass = "block w-full mt-2 text-[10px] p-1 rounded border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-pink-500";

        switch (node.type) {
            case 'api':
                return (
                    <select
                        className={commonSelectClass}
                        value={node.data?.method || 'GET'}
                        onChange={(e) => updateNodeData(node.id, 'method', e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
                    >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                );
            case 'database':
                return (
                    <select
                        className={commonSelectClass}
                        value={node.data?.dbType || 'Postgres'}
                        onChange={(e) => updateNodeData(node.id, 'dbType', e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <option value="Postgres">Postgres</option>
                        <option value="MySQL">MySQL</option>
                        <option value="MongoDB">MongoDB</option>
                        <option value="Redis">Redis</option>
                    </select>
                );
            case 'decision':
                return (
                    <select
                        className={commonSelectClass}
                        value={node.data?.condition || 'True'}
                        onChange={(e) => updateNodeData(node.id, 'condition', e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <option value="True">Always True</option>
                        <option value="False">Always False</option>
                        <option value="Error">On Error</option>
                        <option value="Success">On Success</option>
                    </select>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-900">

            <div className="flex-1 flex overflow-hidden relative">
                {aiResponse && (
                    <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-background/90 backdrop-blur-sm border-b border-border">
                        <AIResponseCard response={aiResponse} onClose={() => setAiResponse(null)} />
                    </div>
                )}

                {/* Sidebar */}
                <div className="w-64 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm shrink-0">
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-slate-800 font-bold">
                            <Zap className="text-pink-500 fill-pink-500" size={20} />
                            <span>Workflow Builder</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Drag nodes to the canvas</p>
                    </div>

                    <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                        {/* Basic Group */}
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Basic</div>

                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'input')}
                            className="p-3 border border-slate-200 rounded-lg bg-white cursor-grab hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-3 group select-none"
                        >
                            <FileInput size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm text-slate-700">Input</span>
                        </div>

                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'process')}
                            className="p-3 border border-slate-200 rounded-lg bg-white cursor-grab hover:border-purple-400 hover:shadow-sm transition-all flex items-center gap-3 group select-none"
                        >
                            <Cpu size={16} className="text-purple-500 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm text-slate-700">Process</span>
                        </div>

                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'output')}
                            className="p-3 border border-slate-200 rounded-lg bg-white cursor-grab hover:border-green-400 hover:shadow-sm transition-all flex items-center gap-3 group select-none"
                        >
                            <FileOutput size={16} className="text-green-500 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm text-slate-700">Output</span>
                        </div>

                        {/* Advanced Group */}
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Advanced</div>

                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'database')}
                            className="p-3 border border-slate-200 rounded-lg bg-white cursor-grab hover:border-amber-400 hover:shadow-sm transition-all flex items-center gap-3 group select-none"
                        >
                            <Database size={16} className="text-amber-500 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm text-slate-700">Database</span>
                        </div>

                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'api')}
                            className="p-3 border border-slate-200 rounded-lg bg-white cursor-grab hover:border-cyan-400 hover:shadow-sm transition-all flex items-center gap-3 group select-none"
                        >
                            <Cloud size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm text-slate-700">API</span>
                        </div>

                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'decision')}
                            className="p-3 border border-slate-200 rounded-lg bg-white cursor-grab hover:border-orange-400 hover:shadow-sm transition-all flex items-center gap-3 group select-none"
                        >
                            <GitFork size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm text-slate-700">Decision</span>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <Button variant="outline" className="w-full justify-start text-slate-600" onClick={onBack}>
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div
                    className="flex-1 relative bg-slate-50 overflow-hidden"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onMouseMove={onCanvasMouseMove}
                    onMouseUp={onCanvasMouseUp}
                    onClick={() => { setSelectedId(null); setEditingNodeId(null); }}
                    ref={canvasRef}
                >
                    {/* Empty State */}
                    {nodes.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 text-slate-400">
                            <BoxSelect size={48} strokeWidth={1} className="mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-slate-500">Canvas is Empty</h3>
                            <p className="text-sm">Drag and drop nodes from the sidebar to start building.</p>
                        </div>
                    )}

                    {/* Grid Pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                            backgroundSize: `${20 * zoom}px ${20 * zoom}px`
                        }}
                    ></div>

                    {/* Transform Container */}
                    <div
                        className="w-full h-full origin-top-left"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        {/* Edges */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            {edges.map(edge => {
                                const sourceNode = nodes.find(n => n.id === edge.source);
                                const targetNode = nodes.find(n => n.id === edge.target);
                                if (!sourceNode || !targetNode) return null;

                                const sx = sourceNode.position.x + 192;
                                const sy = sourceNode.position.y + 50; // Approximated center-ish
                                const tx = targetNode.position.x;
                                const ty = targetNode.position.y + 50;

                                const isSelected = selectedId === edge.id;

                                return (
                                    <g key={edge.id} onClick={(e) => { e.stopPropagation(); setSelectedId(edge.id); }} className="pointer-events-auto cursor-pointer group">
                                        {/* Invisible wider path for easier clicking */}
                                        <path
                                            d={`M ${sx} ${sy} C ${sx + 50} ${sy} ${tx - 50} ${ty} ${tx} ${ty}`}
                                            stroke="transparent"
                                            strokeWidth="15"
                                            fill="none"
                                        />
                                        {/* Visible path */}
                                        <path
                                            d={`M ${sx} ${sy} C ${sx + 50} ${sy} ${tx - 50} ${ty} ${tx} ${ty}`}
                                            stroke={isSelected ? "#ec4899" : "#94a3b8"}
                                            strokeWidth={isSelected ? "3" : "2"}
                                            fill="none"
                                            className="transition-colors duration-200 group-hover:stroke-pink-400"
                                        />
                                    </g>
                                );
                            })}
                            {/* Connecting Line (during drag) */}
                            {connectingNodeId && isDraggingNode === null && (() => {
                                const node = nodes.find(n => n.id === connectingNodeId);
                                if (!node) return null;
                                return null;
                            })()}
                        </svg>

                        {/* Nodes */}
                        {nodes.map(node => {
                            const styles = getNodeStyles(node.type);
                            const Icon = styles.icon;
                            const isSelected = selectedId === node.id;
                            const isEditing = editingNodeId === node.id;

                            return (
                                <div
                                    key={node.id}
                                    style={{
                                        left: node.position.x,
                                        top: node.position.y,
                                        width: '192px'
                                    }}
                                    className={`absolute rounded-xl border-2 shadow-sm transition-shadow bg-white ${isSelected ? 'ring-2 ring-pink-500/50 shadow-md border-pink-500' : 'border-slate-200'}`}
                                    onMouseDown={(e) => onNodeMouseDown(e, node.id)}
                                >
                                    {/* Header Stripe */}
                                    <div className={`h-1.5 w-full rounded-t-[10px] opacity-75 ${styles.header}`}></div>

                                    <div className="p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            {isEditing ? (
                                                <input
                                                    autoFocus
                                                    className="w-full text-sm font-semibold border-b border-pink-500 outline-none bg-transparent"
                                                    value={node.label}
                                                    onChange={(e) => updateNodeLabel(node.id, e.target.value)}
                                                    onBlur={() => setEditingNodeId(null)}
                                                    onKeyDown={(e) => e.key === 'Enter' && setEditingNodeId(null)}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <div
                                                    className="font-semibold text-sm text-slate-800 cursor-text truncate"
                                                    onDoubleClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingNodeId(node.id);
                                                    }}
                                                    title="Double click to rename"
                                                >
                                                    {node.label}
                                                </div>
                                            )}
                                            <Icon size={14} className="text-slate-500 opacity-50 shrink-0 ml-2" />
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide font-medium">{node.type}</div>

                                        {/* Custom Dropdowns/Content */}
                                        {renderNodeCustomContent(node)}
                                    </div>

                                    {/* Handles */}
                                    {node.type !== 'input' && (
                                        <div
                                            className="absolute -left-1.5 top-[calc(50%+4px)] -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-400 rounded-full cursor-crosshair hover:border-pink-500 hover:scale-125 transition-all z-10"
                                            onMouseUp={(e) => handleConnectEnd(e, node.id)}
                                            title="Connect Input"
                                        ></div>
                                    )}

                                    {node.type !== 'output' && (
                                        <div
                                            className="absolute -right-1.5 top-[calc(50%+4px)] -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-400 rounded-full cursor-crosshair hover:bg-pink-500 hover:border-pink-500 transition-all z-10"
                                            onMouseDown={(e) => handleConnectStart(e, node.id)}
                                            title="Connect Output"
                                        ></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Floating Controls */}
                    <div className="absolute bottom-6 left-6 flex flex-col gap-2 bg-white p-1.5 rounded-xl shadow-lg border border-slate-200/60 z-30">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}><Plus size={18} /></Button>
                        <div className="h-[1px] bg-slate-100 w-full"></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100" onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}><Minus size={18} /></Button>
                    </div>

                    {/* Selection Controls */}
                    {selectedId && (
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1.5 rounded-lg shadow-md border border-slate-200 flex items-center gap-1 z-30 animate-in fade-in slide-in-from-top-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
                                <Settings2 size={14} className="mr-1.5" />
                                Properties
                            </Button>
                            <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
                            <Button variant="ghost" size="sm" onClick={deleteSelected} className="h-8 px-2 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700">
                                <Trash2 size={14} className="mr-1.5" />
                                Delete
                            </Button>
                        </div>
                    )}

                    {/* Info Toast */}
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-slate-200 flex items-center gap-2 text-xs font-medium text-slate-500 pointer-events-none select-none z-30">
                        <MousePointer2 size={14} className="text-pink-500" />
                        {nodes.length === 0 ? "Drag nodes from sidebar to start" : `${nodes.length} nodes active`}
                    </div>
                </div>
            </div>
        </div>
    );
};