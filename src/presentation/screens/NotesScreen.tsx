import React, { useState, useEffect, useRef } from 'react';
import { StorageRepository } from '../../data/database/db';
import { Note } from '../../data/models/note';
import { 
  Plus, Search, Edit3, Trash2, Image as ImageIcon, 
  PenTool, Eraser, RotateCcw, RotateCw, X, Check, FileText, ChevronLeft 
} from 'lucide-react';
import { format } from 'date-fns';

export const NotesScreen: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [drawingDataUrl, setDrawingDataUrl] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'text' | 'sketch'>('text');

  // Drawing canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [penColor, setPenColor] = useState('#6366f1');
  const [strokeSize, setStrokeSize] = useState(4);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const data = await StorageRepository.getAllNotes();
    setNotes(data);
  };

  const handleOpenCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setDrawingDataUrl(undefined);
    setUndoStack([]);
    setRedoStack([]);
    setActiveTab('text');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setDrawingDataUrl(note.drawingDataUrl);
    setUndoStack([]);
    setRedoStack([]);
    setActiveTab('text');
    setIsEditorOpen(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim() && !content.trim() && !drawingDataUrl) {
      setIsEditorOpen(false);
      return;
    }

    let canvasImage = drawingDataUrl;
    if (canvasRef.current) {
      canvasImage = canvasRef.current.toDataURL('image/png');
    }

    const noteToSave: Note = {
      id: editingNote ? editingNote.id : `note_${Date.now()}`,
      title: title.trim() || 'Untitled Note',
      content,
      drawingDataUrl: canvasImage,
      createdAt: editingNote ? editingNote.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await StorageRepository.saveNote(noteToSave);
    await loadNotes();
    setIsEditorOpen(false);
  };

  const handleDeleteNote = async (id: string) => {
    await StorageRepository.deleteNote(id);
    await loadNotes();
  };

  // Setup Canvas when canvasRef becomes available
  useEffect(() => {
    if (isEditorOpen && activeTab === 'sketch' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.parentElement?.getBoundingClientRect();
        canvas.width = rect?.width || 340;
        canvas.height = Math.max(320, (rect?.height || 400) - 60);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (drawingDataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            saveCanvasState();
          };
          img.src = drawingDataUrl;
        } else {
          saveCanvasState();
        }
      }
    }
  }, [isEditorOpen, activeTab]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setUndoStack(prev => [...prev, imageData]);
        setRedoStack([]);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = strokeSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pen') {
      ctx.strokeStyle = penColor;
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.strokeStyle = '#FFFFFF';
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasState();
      if (canvasRef.current) {
        setDrawingDataUrl(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const current = undoStack[undoStack.length - 1];
    const previous = undoStack[undoStack.length - 2];

    setRedoStack(prev => [current, ...prev]);
    setUndoStack(prev => prev.slice(0, -1));

    ctx.putImageData(previous, 0, 0);
    setDrawingDataUrl(canvas.toDataURL('image/png'));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const next = redoStack[0];
    setRedoStack(prev => prev.slice(1));
    setUndoStack(prev => [...prev, next]);

    ctx.putImageData(next, 0, 0);
    setDrawingDataUrl(canvas.toDataURL('image/png'));
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
    setDrawingDataUrl(undefined);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-24">
      {/* Header & Search */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Notes & Sketches
        </h2>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active-touch"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#202124] rounded-3xl border border-slate-200 dark:border-[#2F2F33] space-y-3 my-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl">
            📝
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">No notes yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Capture quick thoughts, daily plans, or freehand sketches.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => handleOpenEdit(note)}
              className="p-4 rounded-3xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2 relative group"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {note.title || 'Untitled Note'}
                </h3>
                <span className="text-[10px] font-semibold text-slate-400">
                  {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
                </span>
              </div>

              {note.content && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {note.content}
                </p>
              )}

              {note.drawingDataUrl && (
                <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#2F2F33] max-h-28 bg-white flex items-center justify-center">
                  <img
                    src={note.drawingDataUrl}
                    alt="Sketch preview"
                    className="max-h-28 object-contain"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  {note.drawingDataUrl ? <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> : <FileText className="w-3.5 h-3.5" />}
                  {note.drawingDataUrl ? 'Includes sketch' : 'Text note'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL-SCREEN Note Editor */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#0F0F10] flex flex-col h-full w-full animate-in fade-in">
          {/* Top Bar Header */}
          <div className="px-4 py-3 bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-[#2F2F33] flex items-center justify-between shadow-sm shrink-0">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="flex items-center gap-1 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-[#27272A]"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>Back</span>
            </button>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#27272A] p-1 rounded-2xl">
              <button
                onClick={() => setActiveTab('text')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'text'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Text
              </button>
              <button
                onClick={() => setActiveTab('sketch')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'sketch'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Sketch</span>
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveNote}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 active-touch"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save</span>
            </button>
          </div>

          {/* Editor Body */}
          <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
            {/* Title Input */}
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-black text-slate-900 dark:text-white placeholder-slate-400 bg-transparent focus:outline-none border-b border-slate-200/60 dark:border-[#2F2F33] pb-2"
            />

            {/* Text Mode */}
            {activeTab === 'text' && (
              <textarea
                placeholder="Start typing your note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full flex-1 p-4 rounded-3xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed shadow-sm min-h-[350px]"
              />
            )}

            {/* Sketch Mode */}
            {activeTab === 'sketch' && (
              <div className="flex-1 flex flex-col space-y-3 min-h-[350px]">
                {/* Sketch Controls Toolbar */}
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTool('pen')}
                      className={`p-2 rounded-xl transition-all ${
                        tool === 'pen' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                      }`}
                      title="Pen tool"
                    >
                      <PenTool className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTool('eraser')}
                      className={`p-2 rounded-xl transition-all ${
                        tool === 'eraser' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                      }`}
                      title="Eraser"
                    >
                      <Eraser className="w-4 h-4" />
                    </button>
                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                    {['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#000000'].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setPenColor(color);
                          setTool('pen');
                        }}
                        className={`w-5 h-5 rounded-full border-2 transition-transform ${
                          penColor === color && tool === 'pen' ? 'scale-125 border-indigo-600' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleUndo}
                      disabled={undoStack.length <= 1}
                      className="p-1.5 rounded-lg disabled:opacity-30 text-slate-600 dark:text-slate-300"
                      title="Undo"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={redoStack.length === 0}
                      className="p-1.5 rounded-lg disabled:opacity-30 text-slate-600 dark:text-slate-300"
                      title="Redo"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleClearCanvas}
                      className="text-xs font-extrabold text-rose-500 hover:text-rose-600 px-2 py-1"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 border border-slate-300 dark:border-[#2F2F33] rounded-3xl overflow-hidden bg-white touch-none shadow-sm flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full cursor-crosshair block"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
