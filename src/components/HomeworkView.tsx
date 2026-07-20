import React, { useState } from 'react';
import { Member, HomeworkTask } from '../types';
import { 
  BookOpen, 
  PlusCircle, 
  Calendar, 
  CheckCircle, 
  Trash2, 
  Award, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Smile, 
  HelpCircle,
  GraduationCap,
  Play,
  ArrowRight,
  BookMarked,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeworkViewProps {
  members: Member[];
  tasks: HomeworkTask[];
  onAddTask: (task: Omit<HomeworkTask, 'id' | 'completed' | 'createdAt'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function HomeworkView({
  members,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask
}: HomeworkViewProps) {
  
  // Filter active children
  const children = members.filter(m => m.role === 'dite1' || m.role === 'dite2');

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.id || 'member-3');
  const [subject, setSubject] = useState('Matematika');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [isPoem, setIsPoem] = useState(false);
  const [poemText, setPoemText] = useState('');
  const [notes, setNotes] = useState('');

  // Active training states
  const [trainingTask, setTrainingTask] = useState<HomeworkTask | null>(null);
  const [trainingMode, setTrainingMode] = useState<'full' | 'hideRandom' | 'revealLine' | 'firstLetters'>('full');
  const [hiddenWordPercentage, setHiddenWordPercentage] = useState<number>(30); // 30% of words hidden
  const [revealedLinesCount, setRevealedLinesCount] = useState<number>(1);

  // Tab filter
  const [activeFilter, setActiveFilter] = useState<'all' | 'poems' | 'completed'>('all');

  const subjects = [
    'Matematika', 
    'Český jazyk', 
    'Angličtina', 
    'Prvouka', 
    'Vlastivěda', 
    'Přírodověda', 
    'Básnička / Recitace', 
    'Jiné'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      childId: selectedChildId,
      subject,
      title: title.trim(),
      dueDate,
      isPoem,
      poemText: isPoem ? poemText : undefined,
      notes: notes.trim() || undefined
    });

    // Reset Form
    setTitle('');
    setIsPoem(false);
    setPoemText('');
    setNotes('');
    setIsAdding(false);
  };

  const getChildDetails = (id: string) => {
    return members.find(m => m.id === id);
  };

  const getDaysLeft = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysLeftBadge = (dateStr: string) => {
    const days = getDaysLeft(dateStr);
    if (days < 0) {
      return (
        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-[10px] font-extrabold uppercase tracking-wider">
          Zpoždění {Math.abs(days)} {Math.abs(days) === 1 ? 'den' : Math.abs(days) < 5 ? 'dny' : 'dní'} ⚠️
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
          Dnes odevzdat! 🔥
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[10px] font-extrabold uppercase tracking-wider">
          Zítra odevzdat ⏰
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-wider">
        Zbývá {days} dní
      </span>
    );
  };

  // Helper to split a poem text into lines
  const getPoemLines = (text?: string) => {
    if (!text) return [];
    return text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  };

  // Poem helper: Hide random words from a line
  const renderLineWithHiddenWords = (line: string, index: number, seed: string) => {
    const words = line.split(/\s+/);
    return words.map((word, wIdx) => {
      // Deterministic pseudo-random based on indices & custom slider
      const hash = (index * 7 + wIdx * 13 + seed.length) % 100;
      const isWordHidden = hash < hiddenWordPercentage;
      
      // Keep punctuation outside of span if possible
      const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~() Czech?]/g, "");
      const punctuation = word.slice(cleanWord.length);

      if (isWordHidden && cleanWord.length > 1) {
        return (
          <span key={wIdx} className="inline-block mr-1.5 group relative">
            <span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-100 dark:text-indigo-950/40 select-none px-1 rounded-sm border-b-2 border-indigo-400 font-bold transition hover:bg-indigo-200 cursor-pointer">
              {cleanWord}
            </span>
            <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-md pointer-events-none whitespace-nowrap z-10">
              Nápověda: {cleanWord}
            </span>
            {punctuation && <span className="text-slate-700">{punctuation}</span>}
          </span>
        );
      }
      return <span key={wIdx} className="mr-1.5">{word}</span>;
    });
  };

  // Poem helper: Show only first letters of words in a line
  const renderLineFirstLetters = (line: string) => {
    const words = line.split(/\s+/);
    return words.map((word, wIdx) => {
      const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~() Czech?]/g, "");
      const punctuation = word.slice(cleanWord.length);
      const firstLetter = cleanWord.charAt(0);

      if (cleanWord.length > 1) {
        return (
          <span key={wIdx} className="inline-block mr-1.5 group relative">
            <span className="font-mono text-indigo-600 font-bold border-b border-dashed border-indigo-300">
              {firstLetter}
              <span className="text-slate-300 font-normal">
                {'_'.repeat(cleanWord.length - 1)}
              </span>
            </span>
            <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-md pointer-events-none whitespace-nowrap z-10">
              {cleanWord}
            </span>
            {punctuation && <span className="text-slate-700">{punctuation}</span>}
          </span>
        );
      }
      return <span key={wIdx} className="mr-1.5">{word}</span>;
    });
  };

  // Filtered tasks
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'poems') return task.isPoem && !task.completed;
    if (activeFilter === 'completed') return task.completed;
    return !task.completed; // 'all' active tasks
  });

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
              Škola & Znalosti
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 text-xs font-semibold flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Trénink básniček a úkolů
            </span>
          </div>
          <h2 className="text-2xl font-black text-indigo-950 font-display flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            Školní úkoly & Básničky 📚
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Mějte přehled o tom, co děti čeká do školy. Zadejte úkoly z matematiky či češtiny, nebo vložte básničku, kterou se mají naučit nazpaměť, a spusťte interaktivní trenažér paměti!
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-sm transition shrink-0 w-full md:w-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Zadat úkol / básničku
        </button>
      </div>

      {/* Form to Add Task */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-500" />
                Nový zápis úkolu nebo básničky
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Child Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kterému dítěti?</label>
                  <select
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    {children.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.avatar} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Předmět / Kategorie</label>
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      if (e.target.value === 'Básnička / Recitace') {
                        setIsPoem(true);
                      } else {
                        setIsPoem(false);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Do kdy splnit?</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                {/* Title */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Co přesně má dělat? (Zadání)</label>
                  <input
                    type="text"
                    required
                    placeholder="Např. Naučit se básničku Lesní studánka, Vypočítat příklady str. 12"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                {/* Checkbox for Poem */}
                <div className="flex items-center gap-2 pt-8 pl-1">
                  <input
                    type="checkbox"
                    id="isPoemCheckbox"
                    checked={isPoem}
                    onChange={(e) => setIsPoem(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500"
                  />
                  <label htmlFor="isPoemCheckbox" className="text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer select-none">
                    Je to básnička k naučení 🎭
                  </label>
                </div>

                {/* Textarea for Poem Text (Conditionally shown) */}
                <AnimatePresence>
                  {isPoem && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="md:col-span-3 space-y-1.5"
                    >
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Text básničky (každý verš na nový řádek)</label>
                      <textarea
                        rows={6}
                        placeholder={`Vložte text básničky sem, např.:\nZnám křišťálovou studánku,\nkde nejhlubší je les...`}
                        value={poemText}
                        onChange={(e) => setPoemText(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-sans focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Notes */}
                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dodatečné poznámky / Pokyny učitele</label>
                  <input
                    type="text"
                    placeholder="Např. Paní učitelka bude zkoušet ve středu před tabulí."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-600 transition"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs uppercase tracking-wider text-white shadow-sm transition"
                >
                  Uložit úkol
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Panel Content split into List vs Training */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Homework List Section */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* List Tab Filters */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  activeFilter === 'all'
                    ? 'bg-white text-indigo-950 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Aktivní úkoly
              </button>
              <button
                onClick={() => setActiveFilter('poems')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  activeFilter === 'poems'
                    ? 'bg-white text-indigo-950 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🎭 Básničky
              </button>
              <button
                onClick={() => setActiveFilter('completed')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  activeFilter === 'completed'
                    ? 'bg-white text-indigo-950 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                ✓ Splněné
              </button>
            </div>

            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Celkem: {filteredTasks.length}
            </span>
          </div>

          {/* Tasks loop */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-indigo-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-700">Žádné úkoly k zobrazení! 🎉</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {activeFilter === 'completed' 
                  ? 'Zatím nebyly dokončeny žádné úkoly. Šup do práce!' 
                  : 'Všechno je hotovo nebo nebyly zadány žádné úkoly. Užívejte si volno!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const child = getChildDetails(task.childId);
                const isPoemWithText = task.isPoem && task.poemText;

                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-3xl border ${
                      task.completed 
                        ? 'border-slate-150 bg-slate-50/50 opacity-80' 
                        : 'border-slate-200 hover:border-indigo-150'
                    } transition shadow-3xs overflow-hidden`}
                  >
                    <div className="p-5 space-y-3">
                      {/* Top Header line of task card */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          {/* Child Avatar badge */}
                          <div className={`w-9 h-9 rounded-xl ${child?.lightBgClass || 'bg-slate-50'} border ${child?.borderClass || 'border-slate-100'} flex items-center justify-center text-xl select-none shrink-0`}>
                            {child?.avatar || '👶'}
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block leading-none">
                              {task.subject}
                            </span>
                            <span className="text-xs font-bold text-slate-500 block mt-1 leading-none">
                              Pro: <strong className="text-slate-800">{child?.name}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Deadlines and buttons */}
                        <div className="flex items-center gap-2">
                          {!task.completed && getDaysLeftBadge(task.dueDate)}
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Smazat úkol"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Title of the Homework */}
                      <div className="space-y-1">
                        <h4 className={`text-sm font-extrabold text-slate-900 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </h4>
                        {task.notes && (
                          <p className="text-xs text-slate-400 font-semibold italic flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            Poznámka: {task.notes}
                          </p>
                        )}
                      </div>

                      {/* Poem preview banner if any */}
                      {isPoemWithText && !task.completed && (
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3 flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-2 text-indigo-950 font-semibold">
                            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>Básnička obsahuje {getPoemLines(task.poemText).length} veršů. Spusťte trénování!</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setTrainingTask(task);
                              setRevealedLinesCount(1);
                            }}
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase tracking-wider text-[10px] px-3.5 py-2 rounded-xl transition cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            Učit se 🎭
                          </button>
                        </div>
                      )}

                      {/* Actions footer of the card */}
                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-4">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Termín: {new Date(task.dueDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>

                        <button
                          onClick={() => onToggleTask(task.id)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider transition border ${
                            task.completed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100 cursor-pointer'
                          }`}
                        >
                          <CheckCircle className={`w-3.5 h-3.5 ${task.completed ? 'text-emerald-600' : 'text-indigo-500'}`} />
                          {task.completed ? 'Splněno ✓' : 'Označit jako hotové'}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Dynamic Poem Memorizer & Motivation Sidebar */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 pl-1">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            Trénink básniček & Motivace 🏆
          </h3>

          <AnimatePresence mode="wait">
            {trainingTask ? (
              <motion.div
                key={trainingTask.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border-2 border-indigo-500 p-5 shadow-lg space-y-4 text-left relative"
              >
                {/* Floating exit training button */}
                <button
                  onClick={() => setTrainingTask(null)}
                  className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-lg"
                >
                  Zavřít trénink ✕
                </button>

                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                    Interaktivní trenažér
                  </span>
                  <h4 className="text-base font-black text-slate-900 leading-tight">
                    🎭 {trainingTask.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold">
                    Student: {getChildDetails(trainingTask.childId)?.name}
                  </p>
                </div>

                {/* Training Mode Switcher */}
                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
                  {(['full', 'hideRandom', 'revealLine', 'firstLetters'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setTrainingMode(mode)}
                      className={`py-1 text-[9px] font-bold uppercase rounded-lg tracking-wider text-center transition ${
                        trainingMode === mode 
                          ? 'bg-indigo-600 text-white shadow-3xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {mode === 'full' && 'Plný text'}
                      {mode === 'hideRandom' && 'Slepá m.'}
                      {mode === 'revealLine' && 'Verš po v.'}
                      {mode === 'firstLetters' && 'První p.'}
                    </button>
                  ))}
                </div>

                {/* Training Description Tip */}
                <div className="bg-indigo-50/50 p-2.5 rounded-xl text-[10px] text-indigo-900 leading-relaxed">
                  {trainingMode === 'full' && '📖 Čti celou básničku nahlas pro upevnění paměti.'}
                  {trainingMode === 'hideRandom' && '🙈 Některá slova jsou zakrytá. Kliknutím na ně zobrazíš nápovědu!'}
                  {trainingMode === 'revealLine' && '👇 Odkrývej verše jeden po druhém klepnutím na tlačítko dole.'}
                  {trainingMode === 'firstLetters' && '🔠 Vidíš jen první písmeno každého slova. Skvělé pro testování paměti!'}
                </div>

                {/* Poetry render stage */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 min-h-[180px] max-h-[300px] overflow-y-auto flex flex-col justify-center space-y-3 select-none">
                  {trainingMode === 'revealLine' ? (
                    // Reveal one by one
                    <div className="space-y-2.5">
                      {getPoemLines(trainingTask.poemText).map((line, idx) => {
                        const isRevealed = idx < revealedLinesCount;
                        return (
                          <div 
                            key={idx} 
                            className={`text-xs md:text-sm font-black font-display py-0.5 transition duration-300 ${
                              isRevealed ? 'text-indigo-950 opacity-100' : 'text-indigo-200/25 blur-3xs select-none'
                            }`}
                          >
                            {idx + 1}. {isRevealed ? line : '❓ Verš je zakrytý'}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Other modes
                    <div className="space-y-2 text-center">
                      {getPoemLines(trainingTask.poemText).map((line, idx) => (
                        <div key={idx} className="text-xs md:text-sm font-black text-indigo-950 font-display tracking-wide">
                          {trainingMode === 'full' && line}
                          {trainingMode === 'hideRandom' && renderLineWithHiddenWords(line, idx, trainingTask.id)}
                          {trainingMode === 'firstLetters' && renderLineFirstLetters(line)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mode controls */}
                {trainingMode === 'hideRandom' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <span>Úroveň obtížnosti (zakrytí):</span>
                      <span className="text-indigo-600 font-black">{hiddenWordPercentage}% slov</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="80"
                      step="5"
                      value={hiddenWordPercentage}
                      onChange={(e) => setHiddenWordPercentage(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                )}

                {trainingMode === 'revealLine' && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-bold">
                      Odhaleno: {Math.min(revealedLinesCount, getPoemLines(trainingTask.poemText).length)} z {getPoemLines(trainingTask.poemText).length} veršů
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setRevealedLinesCount(1)}
                        className="bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setRevealedLinesCount(prev => Math.min(prev + 1, getPoemLines(trainingTask.poemText).length))}
                        disabled={revealedLinesCount >= getPoemLines(trainingTask.poemText).length}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-[10px] uppercase px-4 py-1.5 rounded-lg transition flex items-center gap-1"
                      >
                        Další verš <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Completed recitation validation */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Umí už celou básničku?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleTask(trainingTask.id);
                      setTrainingTask(null);
                    }}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase tracking-wider text-[10px] px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Umí celou! 🏆
                  </button>
                </div>

              </motion.div>
            ) : (
              // General motivation state if no poem is active
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-3xs">
                  <BookMarked className="w-6 h-6" />
                </div>
                
                <div className="space-y-1.5 text-left">
                  <h4 className="text-sm font-black text-indigo-950 uppercase tracking-wide">
                    Školní Síň Úspěchů ⭐
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Každý vyřešený úkol a odrecitovaná básnička přibližuje děti k rodinné odměně (např. společný výlet do kina nebo zmrzlinový pohár).
                  </p>
                </div>

                {/* Kids simple points tracker based on completed count */}
                <div className="border-t border-slate-100 pt-3 space-y-3 text-left">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Skóre splněných úkolů</span>
                  {children.map(child => {
                    const childTasksCount = tasks.filter(t => t.childId === child.id && t.completed).length;
                    return (
                      <div key={child.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg select-none">{child.avatar}</span>
                          <span className="text-xs font-bold text-slate-700">{child.name}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-lg text-xs font-extrabold">
                          <span>{childTasksCount * 10} bodů</span>
                          <span>( {childTasksCount} ✓ )</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pedagogy support note */}
                <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed space-y-1 text-left">
                  <h5 className="font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 text-amber-950">
                    <Smile className="w-3.5 h-3.5 text-amber-600" />
                    Tip k memorování básniček
                  </h5>
                  <p className="text-[11px] text-amber-900/80">
                    Odborníci doporučují učit se básničky těsně před spaním. Mozek během spánku informace konsoliduje a ráno si dítě básničku vybaví mnohem snáze. Vyzkoušejte náš <strong>Slepá m.</strong> režim!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
