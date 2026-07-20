import React, { useState, useRef, useEffect } from 'react';
import { Member, FamilyMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Paintbrush, 
  Mic, 
  MessageSquare, 
  Trash2, 
  Trash, 
  Undo2, 
  RotateCcw, 
  Play, 
  Pause, 
  Volume2, 
  CheckCircle, 
  AlertCircle,
  Timer,
  ChevronDown
} from 'lucide-react';

interface MessageWallViewProps {
  members: Member[];
  messages: FamilyMessage[];
  onAddMessage: (message: Omit<FamilyMessage, 'id' | 'createdAt'>) => void;
  onDeleteMessage: (id: string) => void;
}

const BRUSH_COLORS = [
  '#4f46e5', // indigo
  '#e11d48', // rose
  '#059669', // emerald
  '#ca8a04', // amber
  '#2563eb', // blue
  '#0f172a', // slate
  '#9333ea', // purple
];

const BRUSH_SIZES = [3, 5, 8, 12];

const BG_PRESETS = [
  { class: 'bg-amber-100 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900', text: 'text-amber-900 dark:text-amber-200', name: 'Čajová' },
  { class: 'bg-rose-100 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900', text: 'text-rose-900 dark:text-rose-200', name: 'Růžová' },
  { class: 'bg-emerald-100 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900', text: 'text-emerald-900 dark:text-emerald-200', name: 'Limetka' },
  { class: 'bg-sky-100 border-sky-200 dark:bg-sky-950/40 dark:border-sky-900', text: 'text-sky-900 dark:text-sky-200', name: 'Modrá' },
  { class: 'bg-indigo-100 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900', text: 'text-indigo-900 dark:text-indigo-200', name: 'Fialová' },
];

export default function MessageWallView({
  members,
  messages,
  onAddMessage,
  onDeleteMessage
}: MessageWallViewProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'drawing' | 'voice'>('text');
  const [senderId, setSenderId] = useState<string>(members[0]?.id || '');
  
  // Text message states
  const [textContent, setTextContent] = useState('');
  const [selectedBg, setSelectedBg] = useState(0);

  // Canvas / Drawing states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#4f46e5');
  const [brushSize, setBrushSize] = useState(5);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  
  // Voice Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Custom Audio Player state for each voice message
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clear states when switching tabs
  useEffect(() => {
    // Reset canvas when tab is 'drawing'
    if (activeTab === 'drawing') {
      setTimeout(initCanvas, 50);
    }
    // Stop recording if active and tab switches
    if (activeTab !== 'voice' && isRecording) {
      stopRecording();
    }
  }, [activeTab]);

  // Handle active audio player end
  const handleAudioPlaybackEnd = () => {
    setPlayingAudioId(null);
  };

  // Play audio helper for the message feed
  const playVoiceMessage = (messageId: string, base64Audio: string) => {
    if (playingAudioId === messageId) {
      // Pause
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      // Stop currently playing
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      
      const audio = new Audio(base64Audio);
      activeAudioRef.current = audio;
      setPlayingAudioId(messageId);
      audio.play().catch(err => {
        console.error("Audio playback failed:", err);
        setPlayingAudioId(null);
      });
      audio.onended = handleAudioPlaybackEnd;
    }
  };

  // --- DRAWING CANVAS LOGIC ---
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set real size according to display
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill with background white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state to history
    setCanvasHistory([canvas.toDataURL()]);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingAndSave = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Save to history for undo
    const currentData = canvas.toDataURL();
    setCanvasHistory(prev => [...prev, currentData]);
  };

  const handleUndo = () => {
    if (canvasHistory.length <= 1) return; // Cannot undo initial white canvas
    const newHistory = canvasHistory.slice(0, -1);
    setCanvasHistory(newHistory);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = newHistory[newHistory.length - 1];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleClearCanvas = () => {
    initCanvas();
  };

  const handlePostDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgDataUrl = canvas.toDataURL('image/png');
    
    onAddMessage({
      senderId,
      type: 'drawing',
      content: imgDataUrl
    });

    initCanvas();
    alert('Obrázek byl úspěšně vyvěšen na zeď!');
  };

  // --- VOICE RECORDER LOGIC ---
  const startRecording = async () => {
    setRecordingError(null);
    setAudioBlob(null);
    setAudioBase64(null);
    setRecordingSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Convert Blob to Base64 to save in storage
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setAudioBase64(base64Data);
        };

        // Stop all track streams so microphone icon disappears
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

      // Start 10 seconds timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 9) {
            // Reached limit! Stop automatically
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      console.error("Microphone access failed:", err);
      setRecordingError("Nelze přistoupit k mikrofonu. Zkontrolujte prosím povolení v prohlížeči.");
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handlePostVoice = () => {
    if (!audioBase64) return;
    
    onAddMessage({
      senderId,
      type: 'voice',
      content: audioBase64,
      duration: recordingSeconds || 1
    });

    setAudioBlob(null);
    setAudioBase64(null);
    setRecordingSeconds(0);
    alert('Hlasový vzkaz byl úspěšně vyvěšen na zeď!');
  };

  // --- POST TEXT MESSAGE ---
  const handlePostText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim()) return;

    // Attach background index in content like [BG_INDEX]ActualText
    const styledContent = `[BG:${selectedBg}]${textContent.trim()}`;

    onAddMessage({
      senderId,
      type: 'text',
      content: styledContent
    });

    setTextContent('');
  };

  const parseTextMessage = (content: string) => {
    const match = content.match(/^\[BG:(\d+)\](.*)/s);
    if (match) {
      return {
        bgIndex: parseInt(match[1], 10),
        text: match[2]
      };
    }
    return {
      bgIndex: 0,
      text: content
    };
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 id="message-wall-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-950 dark:text-white uppercase font-display">
          Rodinná vzkazová zeď 💬
        </h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Pošlete si vzkaz, nakreslete veselý obrázek nebo nahrajte rychlý hlasový vzkaz (do 10 sekund).
        </p>
      </div>

      {/* SENDER SELECTOR & TAB BUTTONS IN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Creator / Sender card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-xs space-y-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
              👤 Kdo posílá vzkaz?
            </label>
            <div className="grid grid-cols-1 gap-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSenderId(member.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left transition cursor-pointer ${
                    senderId === member.id
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 font-bold ring-2 ring-indigo-500/20'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="text-2xl select-none">{member.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${senderId === member.id ? 'text-indigo-950 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {member.name}
                    </p>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                      {member.role === 'manzel' ? 'Táta' : member.role === 'manzelka' ? 'Máma' : 'Dítě'}
                    </span>
                  </div>
                  {senderId === member.id && (
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form area: Text, drawing or voice input */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-xs flex flex-col min-h-[380px]">
          
          {/* Internal subtab headers */}
          <div className="flex border-b border-slate-150 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition ${
                activeTab === 'text'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-amber-500" />
              ✍️ Text
            </button>
            <button
              onClick={() => setActiveTab('drawing')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition ${
                activeTab === 'drawing'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Paintbrush className="w-4 h-4 text-emerald-500" />
              🎨 Kreslení
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition ${
                activeTab === 'voice'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Mic className="w-4 h-4 text-rose-500" />
              🎤 Hlas (10s)
            </button>
          </div>

          {/* Tab content area */}
          <div className="p-5 flex-1 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              
              {/* TEXT TAB */}
              {activeTab === 'text' && (
                <motion.form
                  key="text-form"
                  onSubmit={handlePostText}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <label htmlFor="text-msg-input" className="block text-xs font-black uppercase tracking-wider text-slate-400">
                      Napište vzkaz rodině
                    </label>
                    <textarea
                      id="text-msg-input"
                      rows={4}
                      maxLength={250}
                      required
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Sem napište vzkaz... např. K obědu je polévka v lednici! Vyzvedni mě z kroužku..."
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                    />

                    {/* Color Presets */}
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Vyberte barvu lístku vzkazu:
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {BG_PRESETS.map((preset, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedBg(index)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${preset.class} ${preset.text} ${
                              selectedBg === index ? 'ring-2 ring-indigo-500/50 scale-105 border-slate-400' : 'opacity-80'
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                      type="submit"
                      disabled={!textContent.trim()}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition shadow-3xs cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Vyvěsit vzkaz
                    </button>
                  </div>
                </motion.form>
              )}

              {/* DRAWING TAB */}
              {activeTab === 'drawing' && (
                <motion.div
                  key="drawing-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="block text-xs font-black uppercase tracking-wider text-slate-400">
                        Kreslicí plátno
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Undo & Clear */}
                        <button
                          onClick={handleUndo}
                          disabled={canvasHistory.length <= 1}
                          className="p-2 border border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition text-slate-500 disabled:opacity-30 cursor-pointer"
                          title="Zpět"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleClearCanvas}
                          className="p-2 border border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition text-slate-500 cursor-pointer"
                          title="Vymazat"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Canvas Frame */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white relative">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawingAndSave}
                        onMouseLeave={stopDrawingAndSave}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawingAndSave}
                        className="w-full h-44 cursor-crosshair block touch-none"
                      />
                    </div>

                    {/* Custom brush selectors */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                      {/* Color list */}
                      <div className="space-y-1">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Barva štětce:
                        </span>
                        <div className="flex gap-1.5">
                          {BRUSH_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => setBrushColor(color)}
                              className={`w-6 h-6 rounded-full border border-white dark:border-slate-800 shadow-3xs transition cursor-pointer ${
                                brushColor === color ? 'scale-125 ring-2 ring-indigo-500' : ''
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Brush size */}
                      <div className="space-y-1">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Tloušťka:
                        </span>
                        <div className="flex gap-2">
                          {BRUSH_SIZES.map((size) => (
                            <button
                              key={size}
                              onClick={() => setBrushSize(size)}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition cursor-pointer ${
                                brushSize === size
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700'
                                  : 'border-slate-100 dark:border-slate-800'
                              }`}
                            >
                              {size}px
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                      onClick={handlePostDrawing}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition shadow-3xs cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Vyvěsit obrázek
                    </button>
                  </div>
                </motion.div>
              )}

              {/* VOICE TAB */}
              {activeTab === 'voice' && (
                <motion.div
                  key="voice-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4 text-center py-4">
                    <div className="max-w-xs mx-auto space-y-4">
                      
                      {/* Recorder central interface */}
                      <div className="relative inline-flex items-center justify-center">
                        {isRecording && (
                          <span className="absolute animate-ping inline-flex h-20 w-20 rounded-full bg-rose-400 opacity-30" />
                        )}
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-md transition cursor-pointer ${
                            isRecording 
                              ? 'bg-rose-600 hover:bg-rose-700 text-white scale-105' 
                              : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900'
                          }`}
                        >
                          {isRecording ? (
                            <div className="w-6 h-6 bg-white rounded-xs" />
                          ) : (
                            <Mic className="w-8 h-8" />
                          )}
                        </button>
                      </div>

                      <div>
                        {isRecording ? (
                          <div className="space-y-2">
                            <p className="text-sm font-black text-rose-600 animate-pulse">
                              Nahrávám vzkaz... {recordingSeconds}s / 10s
                            </p>
                            <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-rose-500 h-full transition-all duration-300"
                                style={{ width: `${(recordingSeconds / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        ) : audioBase64 ? (
                          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-2xl p-3 inline-flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <div className="text-left">
                              <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase">
                                Vzkaz připraven ({recordingSeconds}s)
                              </p>
                              {/* Simple Play / Preview Button */}
                              <button
                                onClick={() => {
                                  if (audioBase64) {
                                    const audio = new Audio(audioBase64);
                                    audio.play();
                                  }
                                }}
                                className="flex items-center gap-1 mt-1 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider"
                              >
                                <Play className="w-3 h-3 fill-indigo-600 dark:fill-indigo-400" />
                                Přehrát náhled
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                            Stiskněte mikrofon pro spuštění nahrávání. <br/>
                            Limit je <strong>strikvně 10 sekund</strong>.
                          </p>
                        )}
                      </div>

                      {recordingError && (
                        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-3 flex items-start gap-2 text-left">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="text-[10px] font-semibold text-red-800 dark:text-red-300">
                            {recordingError}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                      onClick={handlePostVoice}
                      disabled={!audioBase64 || isRecording}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition shadow-3xs cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Vyvěsit vzkaz
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* FEED / MESSAGES GRID */}
      <div className="space-y-4">
        <h3 className="font-black text-indigo-950 dark:text-white uppercase font-display text-lg tracking-tight">
          Aktivní vzkazy na zdi ({messages.length})
        </h3>

        {messages.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 p-12 text-center text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-500" />
            <p className="text-xs font-bold uppercase tracking-wider">Na zdi nejsou žádné vzkazy.</p>
            <p className="text-[10px] text-slate-400 mt-1">Buďte první a napište nebo nakreslete něco hezkého!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {messages.map((msg) => {
                const sender = members.find(m => m.id === msg.senderId);
                const isVoice = msg.type === 'voice';
                const isDrawing = msg.type === 'drawing';
                const isText = msg.type === 'text';

                // Default fallback if sender was deleted or not found
                const senderName = sender ? sender.name : 'Člen rodiny';
                const senderAvatar = sender ? sender.avatar : '👤';
                const senderBgClass = sender ? sender.bgClass : 'bg-slate-500';
                const senderTextClass = sender ? sender.textClass : 'text-slate-800';

                // For text messages, parse custom sticky colors
                let bgStyle = 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700';
                let parsedText = msg.content;
                
                if (isText) {
                  const { bgIndex, text } = parseTextMessage(msg.content);
                  const preset = BG_PRESETS[bgIndex] || BG_PRESETS[0];
                  bgStyle = `${preset.class}`;
                  parsedText = text;
                }

                return (
                  <motion.div
                    id={`family-msg-${msg.id}`}
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`rounded-3xl border p-5 flex flex-col justify-between shadow-2xs relative overflow-hidden min-h-[170px] ${
                      isDrawing ? 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700' : 
                      isVoice ? 'bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800' : bgStyle
                    }`}
                  >
                    {/* Upper decorative tape / pin */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-3 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-b-md" />

                    <div className="space-y-3 flex-1">
                      {/* Top sender panel */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl select-none">{senderAvatar}</span>
                          <div>
                            <span className={`text-[10px] font-black uppercase tracking-wider block ${senderTextClass}`}>
                              {senderName}
                            </span>
                            <span className="text-[8px] font-semibold text-slate-400 block">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Message type badge */}
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-700/50 text-slate-500">
                          {isText ? '✍️ Text' : isDrawing ? '🎨 Obrázek' : '🎤 Hlas'}
                        </span>
                      </div>

                      {/* Content panel */}
                      <div className="pt-2 flex-1 min-h-[60px] flex items-center">
                        {isText && (
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed font-display whitespace-pre-line">
                            {parsedText}
                          </p>
                        )}

                        {isDrawing && (
                          <div className="w-full border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden bg-white max-h-40">
                            <img 
                              src={msg.content} 
                              alt={`Kresba od ${senderName}`} 
                              className="w-full h-auto object-contain block"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        {isVoice && (
                          <div className="w-full space-y-2">
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-750 shadow-3xs">
                              {/* Audio button */}
                              <button
                                onClick={() => playVoiceMessage(msg.id, msg.content)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition ${
                                  playingAudioId === msg.id 
                                    ? 'bg-rose-500 text-white animate-pulse' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                              >
                                {playingAudioId === msg.id ? (
                                  <Pause className="w-4 h-4 fill-white" />
                                ) : (
                                  <Play className="w-4 h-4 fill-white ml-0.5" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                                  <span>Hlasová zpráva</span>
                                  <span>{msg.duration || 0}s</span>
                                </div>
                                
                                {/* Static wave animation visualizer */}
                                <div className="flex items-end gap-0.5 h-4 mt-1">
                                  {[3, 8, 5, 12, 16, 10, 4, 14, 11, 7, 15, 6, 9, 3, 5, 12, 7, 4].map((h, i) => (
                                    <div
                                      key={i}
                                      className={`flex-1 rounded-full transition-all duration-300 ${
                                        playingAudioId === msg.id 
                                          ? 'bg-rose-500 animate-bounce' 
                                          : 'bg-indigo-400'
                                      }`}
                                      style={{ 
                                        height: playingAudioId === msg.id ? '100%' : `${h * 6}%`,
                                        animationDelay: `${i * 75}ms`,
                                        animationDuration: '0.8s'
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom deletion panel */}
                    <div className="pt-3 border-t border-slate-100/40 dark:border-slate-700/50 mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          if (confirm('Opravdu smazat tento vzkaz ze zdi?')) {
                            onDeleteMessage(msg.id);
                          }
                        }}
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-red-500 flex items-center gap-1 transition cursor-pointer"
                        title="Odstranit ze zdi"
                      >
                        <Trash className="w-3.5 h-3.5" />
                        Odstranit
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
