import React, { useState, useEffect } from 'react';
import { Member, ChildDuty, ImportantAlert } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  User, 
  Bell, 
  ThumbsUp,
  X,
  PlusCircle
} from 'lucide-react';

interface DutiesViewProps {
  members: Member[];
  duties: ChildDuty[];
  alerts: ImportantAlert[];
  onAddDuty: (duty: Omit<ChildDuty, 'id' | 'completed'>) => void;
  onToggleDuty: (id: string) => void;
  onDeleteDuty: (id: string) => void;
  onAddAlert: (content: string, memberId: string) => void;
  onDeleteAlert: (id: string) => void;
}

const PRESET_EMOJIS = ['🧹', '📚', '🗑️', '🎒', '🧸', '🛏️', '🐱', '🪥', '🐶', '🍎', '💧', '🪴', '🚴', '🛹', '👟', '🦷', '🍽️', '🥛'];

export default function DutiesView({
  members,
  duties,
  alerts,
  onAddDuty,
  onToggleDuty,
  onDeleteDuty,
  onAddAlert,
  onDeleteAlert
}: DutiesViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'duties' | 'add_duty' | 'alerts'>('duties');
  
  // Children members for duties assignment
  const childrenMembers = members.filter(
    m => m.role === 'dite1' || m.role === 'dite2' || (m.age !== undefined && m.age < 18)
  );

  // Form states for new duty
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('🧹');
  const [newAssignedTo, setNewAssignedTo] = useState(childrenMembers[0]?.id || '');

  // Form states for important alert
  const [newAlertContent, setNewAlertContent] = useState('');
  const [newAlertMemberId, setNewAlertMemberId] = useState(members[0]?.id || '');

  // Auto-update assigned member when members change
  useEffect(() => {
    if (childrenMembers.length > 0 && !newAssignedTo) {
      setNewAssignedTo(childrenMembers[0].id);
    }
  }, [members]);

  useEffect(() => {
    if (members.length > 0 && !newAlertMemberId) {
      setNewAlertMemberId(members[0].id);
    }
  }, [members]);

  const handleCreateDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    onAddDuty({
      title: newTitle.trim(),
      emoji: newEmoji,
      assignedTo: newAssignedTo
    });
    
    setNewTitle('');
    setActiveSubTab('duties');
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertContent.trim() || !newAlertMemberId) return;

    onAddAlert(newAlertContent.trim(), newAlertMemberId);
    setNewAlertContent('');
    
    // Quick success message
    alert(`Upozornění uloženo! Bude zobrazeno na hlavní stránce.`);
  };

  // Group duties by child for better overview
  const getDutiesForChild = (childId: string) => {
    return duties.filter(d => d.assignedTo === childId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 id="duties-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-950 dark:text-white uppercase font-display">
            Povinnosti a úkoly dětí
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Motivujte děti ke splnění každodenních úkolů. Kliknutím úkol označíte za splněný.
          </p>
        </div>
      </div>

      {/* Navigation sub-tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('duties')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            activeSubTab === 'duties'
              ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          📋 Přehled povinností
        </button>
        <button
          onClick={() => setActiveSubTab('add_duty')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            activeSubTab === 'add_duty'
              ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          ➕ Nová povinnost
        </button>
        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            activeSubTab === 'alerts'
              ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          📌 Důležité & Nezapomeň!
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'duties' && (
          <motion.div
            key="duties-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {childrenMembers.length === 0 ? (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-3xl p-6 text-center max-w-lg mx-auto">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Nebyly nalezeny žádné děti</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Chcete-li využít tento modul, přidejte děti nebo jim upravte věk v záložce <strong>Naše Rodina</strong>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {childrenMembers.map((child) => {
                  const childDuties = getDutiesForChild(child.id);
                  const completedCount = childDuties.filter(d => d.completed).length;
                  const totalCount = childDuties.length;
                  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                  return (
                    <div 
                      key={child.id} 
                      className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-4"
                    >
                      {/* Child Profile & Progress */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl select-none">
                            {child.avatar}
                          </span>
                          <div>
                            <h3 className="font-black text-indigo-950 dark:text-white uppercase font-display tracking-tight text-lg">
                              {child.name}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Splněno: {completedCount} z {totalCount} ({percentage}%)
                            </p>
                          </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="w-20 h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden relative" title={`${percentage}% splněno`}>
                          <div 
                            className={`h-full transition-all duration-500 ${child.bgClass}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Duties Grid */}
                      {childDuties.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                          Žádné povinnosti pro dnešek. Přidejte novou!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {childDuties.map((duty) => (
                            <motion.button
                              id={`duty-card-${duty.id}`}
                              key={duty.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onToggleDuty(duty.id)}
                              className={`relative text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden flex items-center gap-3.5 shadow-2xs cursor-pointer group ${
                                duty.completed
                                  ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-50 filter saturate-50 line-through'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-slate-600 hover:shadow-xs'
                              }`}
                            >
                              {/* Left color stripe for assigned child */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${child.bgClass}`} />
                              
                              {/* Emoji icon */}
                              <div className={`text-3xl p-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl select-none group-hover:scale-110 transition duration-300 ${duty.completed ? 'opacity-40' : ''}`}>
                                {duty.emoji}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-extrabold text-indigo-950 dark:text-white truncate ${duty.completed ? 'text-slate-400' : ''}`}>
                                  {duty.title}
                                </h4>
                                <span className={`text-[9px] font-black uppercase tracking-wider block mt-1 ${
                                  duty.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                }`}>
                                  {duty.completed ? '✓ Splněno' : '○ Čeká'}
                                </span>
                              </div>

                              {/* Completed Overlay Banner / Stamp */}
                              {duty.completed && (
                                <div className="absolute right-2 bottom-2 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 px-2 py-0.5 rounded-lg rotate-12 flex items-center gap-1 select-none">
                                  <ThumbsUp className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                  <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Splněno!</span>
                                </div>
                              )}

                              {/* Simple Parent Delete Icon (visible on hover) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Opravdu smazat tuto povinnost?')) {
                                    onDeleteDuty(duty.id);
                                  }
                                }}
                                className="absolute top-2 right-2 p-1 bg-red-50 dark:bg-red-950/50 hover:bg-red-150 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition duration-200"
                                title="Smazat povinnost"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeSubTab === 'add_duty' && (
          <motion.div
            key="add-duty-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-150 dark:border-slate-700 pb-4 mb-5">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-indigo-950 dark:text-white uppercase font-display text-lg">
                Vytvořit novou povinnost
              </h3>
            </div>

            {childrenMembers.length === 0 ? (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-xs">
                Nejprve přidejte děti v záložce <strong>Naše Rodina</strong>.
              </div>
            ) : (
              <form onSubmit={handleCreateDuty} className="space-y-5">
                {/* Duty Name */}
                <div className="space-y-1">
                  <label htmlFor="duty-title" className="block text-xs font-black uppercase tracking-wider text-slate-400">
                    Název povinnosti / úkolu *
                  </label>
                  <input
                    id="duty-title"
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Např. Ustlat si postýlku, Připravit svačinu..."
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Assigned Child */}
                <div className="space-y-1">
                  <label htmlFor="duty-child" className="block text-xs font-black uppercase tracking-wider text-slate-400">
                    Pro koho? *
                  </label>
                  <select
                    id="duty-child"
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {childrenMembers.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.avatar} {child.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Emoji Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                    Vyberte ikonu (obrázek)
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                    {PRESET_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewEmoji(emoji)}
                        className={`text-2xl p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          newEmoji === emoji
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-3xs scale-115'
                            : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition shadow-3xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Uložit povinnost
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {activeSubTab === 'alerts' && (
          <motion.div
            key="alerts-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Form card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b border-slate-150 dark:border-slate-700 pb-4">
                <Bell className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-indigo-950 dark:text-white uppercase font-display text-lg">
                  Nové důležité upozornění
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Napište krátkou připomínku (např. „Nezapomeň si vzít klíče!“) pro vybraného člena rodiny. Toto sdělení bude <strong>výrazně zvýrazněno na hlavní straně</strong> jako nepřehlédnutelné upozornění.
              </p>

              <form onSubmit={handleCreateAlert} className="space-y-4">
                {/* For Whom */}
                <div className="space-y-1">
                  <label htmlFor="alert-member" className="block text-xs font-black uppercase tracking-wider text-slate-400">
                    Pro koho je vzkaz? *
                  </label>
                  <select
                    id="alert-member"
                    value={newAlertMemberId}
                    onChange={(e) => setNewAlertMemberId(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.avatar} {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <label htmlFor="alert-content" className="block text-xs font-black uppercase tracking-wider text-slate-400">
                    Co si má pamatovat? *
                  </label>
                  <textarea
                    id="alert-content"
                    required
                    rows={3}
                    maxLength={150}
                    value={newAlertContent}
                    onChange={(e) => setNewAlertContent(e.target.value)}
                    placeholder="Např. Nezapomeň vyvenčit psa hned po škole, dnes ti přijde balíček..."
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-3xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Uložit a zvýraznit na hlavní straně
                </button>
              </form>
            </div>

            {/* List card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
              <h3 className="font-black text-indigo-950 dark:text-white uppercase font-display text-lg border-b border-slate-150 dark:border-slate-700 pb-4">
                Aktivní upozornění ({alerts.length})
              </h3>

              {alerts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                  Momentálně nejsou aktivní žádná důležitá upozornění.
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {alerts.map((alert) => {
                    const member = members.find(m => m.id === alert.memberId);
                    if (!member) return null;

                    return (
                      <div
                        key={alert.id}
                        className="flex items-start justify-between gap-3 p-4 border border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/40 relative overflow-hidden"
                      >
                        {/* Colored side bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${member.bgClass}`} />
                        
                        <div className="pl-1.5 space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm select-none">{member.avatar}</span>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${member.textClass}`}>
                              {member.name}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                            {alert.content}
                          </p>
                        </div>

                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                          title="Smazat upozornění"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
