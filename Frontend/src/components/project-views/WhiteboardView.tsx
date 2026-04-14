import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { RefreshCw, Download, Eraser, Pen } from 'lucide-react';

export function WhiteboardView({ projectId }: { projectId: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [strokes, setStrokes] = useState<any[]>([]);
    const [color, setColor] = useState('#0ea5e9'); // sky-500 default
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

    // Fetch initial state
    useEffect(() => {
        const fetchStrokes = async () => {
             setIsLoading(true);
             try {
                const res = await apiFetch(`/api/v1/projects/${projectId}/board`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.board) {
                        setStrokes(data.board);
                        redrawCanvas(data.board);
                    }
                }
             } catch(err) {
                 console.error(err);
             } finally {
                 setIsLoading(false);
             }
        };
        fetchStrokes();
    }, [projectId]);

    const redrawCanvas = (paths: any[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        paths.forEach(stroke => {
            if (stroke.color === 'ERASER') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = stroke.color;
            }
            ctx.lineWidth = stroke.width;
            ctx.beginPath();
            stroke.points.forEach((point: any, index: number) => {
                if (index === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        });
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
    };

    // To prevent infinite re-renders during drag, we store current stroke locally
    const currentStrokeRef = useRef<{ color: string, width: number, points: {x:number, y:number}[] } | null>(null);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        currentStrokeRef.current = {
            color: tool === 'eraser' ? 'ERASER' : color, 
            width: tool === 'eraser' ? 20 : 3,
            points: [{ x, y }]
        };
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentStrokeRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        currentStrokeRef.current.points.push({ x, y });

        // Draw line directly to canvas for performance
        const points = currentStrokeRef.current.points;
        const prev = points[points.length - 2];
        
        ctx.strokeStyle = currentStrokeRef.current.color;
        
        if (currentStrokeRef.current.color === 'ERASER') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }
        
        ctx.lineWidth = currentStrokeRef.current.width;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (currentStrokeRef.current) {
            const newStrokes = [...strokes, currentStrokeRef.current];
            setStrokes(newStrokes);
            // Optionally: Send to backend or rely on sockets
            currentStrokeRef.current = null;
        }
    };

    const clearBoard = () => {
        setStrokes([]);
        redrawCanvas([]);
    };

    if (isLoading) {
        return (
            <div className="h-full flex flex-col w-full animate-pulse">
                <div className="shrink-0 h-14 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-200 dark:border-zinc-800/40 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-md bg-zinc-200 dark:bg-zinc-900" />
                        <div className="w-9 h-9 rounded-md bg-zinc-200 dark:bg-zinc-900" />
                        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-2" />
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-900" />
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-20 h-8 rounded-md bg-zinc-200 dark:bg-zinc-900" />
                        <div className="w-24 h-8 rounded-md bg-zinc-200 dark:bg-zinc-900" />
                    </div>
                </div>
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-950/10 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-2 border-zinc-200 dark:border-zinc-800/40 opacity-50" />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Toolbar */}
            <div className="shrink-0 h-14 bg-white dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setTool('pen')}
                        className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${tool === 'pen' ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                    >
                        <Pen size={18} />
                    </button>
                    <button 
                        onClick={() => setTool('eraser')}
                        className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${tool === 'eraser' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'}`}
                    >
                        <Eraser size={18} />
                    </button>
                    <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-2" />
                    {['#171717', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#a855f7'].map(c => (
                        <button 
                            key={c}
                            onClick={() => { setColor(c); setTool('pen'); }}
                            className={`w-6 h-6 rounded-full transition-transform ${color === c && tool === 'pen' ? 'scale-125 border-2 border-white dark:border-zinc-900 ring-2 ring-sky-500 shadow-sm' : 'hover:scale-110 shadow-sm border border-zinc-200 dark:border-zinc-800'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
                
                <div className="flex items-center gap-3">
                     <button 
                        onClick={clearBoard}
                        className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold tracking-wide text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors uppercase"
                    >
                        <RefreshCw size={14} /> Clear
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-transparent overflow-hidden cursor-crosshair">
                <canvas 
                    ref={canvasRef}
                    width={2000}
                    height={1200}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="absolute top-0 left-0"
                />
            </div>
        </div>
    );
}
