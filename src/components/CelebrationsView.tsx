import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Member, CelebrationEvent, CelebrationType } from '../types';
import { 
  Cake, 
  Calendar, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  Sparkles, 
  Clock, 
  Heart, 
  Tag, 
  Gift, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface CelebrationsViewProps {
  members: Member[];
}

const DEFAULT_CELEBRATIONS: CelebrationEvent[] = [
  {
    id: 'cel-1',
    name: 'Honza (Táta) - Narozeniny',
    type: 'birthday',
    date: '1984-07-15',
    memberId: 'member-1',
    notes: 'Koupit dobré pivo z lokálního pivovaru nebo knihu o historii.'
  },
  {
    id: 'cel-2',
    name: 'Honza (Táta) - Svátek',
    type: 'nameday',
    date: '06-24',
    memberId: 'member-1',
    notes: 'Péct jablečný koláč.'
  },
  {
    id: 'cel-3',
    name: 'Marie (Máma) - Narozeniny',
    type: 'birthday',
    date: '1986-10-12',
    memberId: 'member-2',
    notes: 'Květiny (lilie) a poukaz do wellness.'
  },
  {
    id: 'cel-4',
    name: 'Marie (Máma) - Svátek',
    type: 'nameday',
    date: '09-12',
    memberId: 'member-2',
    notes: 'Čokoládové pralinky.'
  },
  {
    id: 'cel-5',
    name: 'Tomík - Narozeniny',
    type: 'birthday',
    date: '2016-03-24',
    memberId: 'member-3',
    notes: 'Stavebnice Lego, dálkově ovládané auto.'
  },
  {
    id: 'cel-6',
    name: 'Tomík - Svátek',
    type: 'nameday',
    date: '03-07',
    memberId: 'member-3',
    notes: 'Vzít ho do cukrárny na pohár.'
  },
  {
    id: 'cel-7',
    name: 'Eliška - Narozeniny',
    type: 'birthday',
    date: '2020-07-19',
    memberId: 'member-4',
    notes: 'Panenka, omalovánky s princeznami a třpytky.'
  },
  {
    id: 'cel-8',
    name: 'Eliška - Svátek',
    type: 'nameday',
    date: '10-05',
    memberId: 'member-4',
    notes: 'Ovocný dort se svíčkami.'
  },
  {
    id: 'cel-9',
    name: 'Výročí svatby Honzy & Marie',
    type: 'anniversary',
    date: '2015-08-14',
    notes: 'Společná večeře v restauraci bez dětí (zajistit hlídání).'
  },
  {
    id: 'cel-10',
    name: 'Babička Jana - Narozeniny',
    type: 'birthday',
    date: '1956-05-18',
    notes: 'Krásná fotokniha s vnoučaty.'
  },
  {
    id: 'cel-11',
    name: 'Děda Pavel - Narozeniny',
    type: 'birthday',
    date: '1953-11-30',
    notes: 'Nářadí do dílny nebo křížovky.'
  },
  {
    id: 'cel-12',
    name: 'Štědrý večer 🎄',
    type: 'holiday',
    date: '12-24',
    notes: 'Kapr, salát a rozdávání dárků!'
  },
  {
    id: 'cel-13',
    name: 'Silvestr 🎉',
    type: 'holiday',
    date: '12-31',
    notes: 'Dětský šampus, jednohubky a deskové hry.'
  }
];

const CELEBRATION_META: Record<CelebrationType, { label: string; bg: string; text: string; border: string; icon: React.ComponentType<any> }> = {
  birthday: { label: 'Narozeniny', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', icon: Cake },
  nameday: { label: 'Svátek', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', icon: Tag },
  anniversary: { label: 'Výročí', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: Heart },
  holiday: { label: 'Významný den / Svátky', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Calendar },
  other: { label: 'Ostatní', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: Clock }
};

// Anchor to 2026-07-19
const ANCHOR_DATE_STR = '2026-07-19';

export default function CelebrationsView({ members }: CelebrationsViewProps) {
  const [celebrations, setCelebrations] = useState<CelebrationEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<CelebrationType | 'all'>('all');
  
  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CelebrationEvent | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<CelebrationType>('birthday');
  const [formDate, setFormDate] = useState(''); // can be YYYY-MM-DD or MM-DD (or we let user select date)
  const [formMemberId, setFormMemberId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  
  const [isCustomDateOnlyMD, setIsCustomDateOnlyMD] = useState(false);
  const [formMonth, setFormMonth] = useState('07');
  const [formDay, setFormDay] = useState('19');

  // Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('family_celebrations');
    if (stored) {
      try {
        setCelebrations(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse celebrations', e);
        setCelebrations(DEFAULT_CELEBRATIONS);
      }
    } else {
      setCelebrations(DEFAULT_CELEBRATIONS);
      localStorage.setItem('family_celebrations', JSON.stringify(DEFAULT_CELEBRATIONS));
    }
  }, []);

  const saveCelebrations = (newList: CelebrationEvent[]) => {
    setCelebrations(newList);
    localStorage.setItem('family_celebrations', JSON.stringify(newList));
  };

  // Days countdown calculation helper
  const calculateDaysRemainingAndMeta = (dateStr: string) => {
    const anchor = new Date(ANCHOR_DATE_STR);
    
    let month = 0;
    let day = 0;
    let birthYear: number | null = null;

    if (dateStr.length === 5) {
      // MM-DD
      const [m, d] = dateStr.split('-').map(Number);
      month = m;
      day = d;
    } else if (dateStr.length === 10) {
      // YYYY-MM-DD
      const [y, m, d] = dateStr.split('-').map(Number);
      birthYear = y;
      month = m;
      day = d;
    } else {
      return { days: 999, nextOccurrence: anchor, age: null };
    }

    // Try current year (2026)
    let year = 2026;
    let nextDate = new Date(year, month - 1, day);
    
    // If it's already passed in 2026 (relative to July 19, 2026), next occurrence is in 2027
    if (nextDate < anchor) {
      year = 2027;
      nextDate = new Date(year, month - 1, day);
    }

    // Difference in time
    const diffTime = nextDate.getTime() - anchor.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If difference is -0 (e.g. today), we make sure it's 0
    const finalDiffDays = diffDays === -0 ? 0 : diffDays;

    let targetAge: number | null = null;
    if (birthYear) {
      targetAge = year - birthYear;
    }

    return {
      days: finalDiffDays,
      nextOccurrence: nextDate,
      age: targetAge,
      formattedDate: `${day}. ${month}.`
    };
  };

  // Map celebrations with countdown data
  const mappedCelebrations = celebrations.map(cel => {
    const calc = calculateDaysRemainingAndMeta(cel.date);
    return {
      ...cel,
      countdown: calc.days,
      ageToTurn: calc.age,
      formattedDate: calc.formattedDate,
      nextDate: calc.nextOccurrence
    };
  });

  // Sort celebrations: nearest first
  const sortedCelebrations = [...mappedCelebrations].sort((a, b) => a.countdown - b.countdown);

  // Filters
  const filteredCelebrations = sortedCelebrations.filter(cel => {
    const matchesSearch = cel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (cel.notes && cel.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = activeFilter === 'all' || cel.type === activeFilter;
    return matchesSearch && matchesType;
  });

  // Handle open Form
  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormName('');
    setFormType('birthday');
    setFormDate('2026-07-19');
    setFormMemberId('');
    setFormNotes('');
    setIsCustomDateOnlyMD(false);
    setFormMonth('07');
    setFormDay('19');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cel: CelebrationEvent) => {
    setEditingEvent(cel);
    setFormName(cel.name);
    setFormType(cel.type);
    setFormMemberId(cel.memberId || '');
    setFormNotes(cel.notes || '');

    if (cel.date.length === 5) {
      setIsCustomDateOnlyMD(true);
      const [m, d] = cel.date.split('-');
      setFormMonth(m);
      setFormDay(d);
      setFormDate('2026-07-19'); // placeholder
    } else {
      setIsCustomDateOnlyMD(false);
      setFormDate(cel.date);
    }
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Opravdu chcete smazat událost "${name}"?`)) {
      const updated = celebrations.filter(cel => cel.id !== id);
      saveCelebrations(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let finalDate = '';
    if (isCustomDateOnlyMD) {
      finalDate = `${formMonth.padStart(2, '0')}-${formDay.padStart(2, '0')}`;
    } else {
      if (!formDate) {
        alert('Prosím, vyberte datum.');
        return;
      }
      finalDate = formDate;
    }

    if (editingEvent) {
      // Edit
      const updated = celebrations.map(cel => {
        if (cel.id === editingEvent.id) {
          return {
            ...cel,
            name: formName,
            type: formType,
            date: finalDate,
            memberId: formMemberId || undefined,
            notes: formNotes
          };
        }
        return cel;
      });
      saveCelebrations(updated);
    } else {
      // Create
      const newEvent: CelebrationEvent = {
        id: `cel-${Date.now()}`,
        name: formName,
        type: formType,
        date: finalDate,
        memberId: formMemberId || undefined,
        notes: formNotes
      };
      saveCelebrations([...celebrations, newEvent]);
    }

    setIsFormOpen(false);
  };

  // Get active celebrating today
  const todayCelebrants = sortedCelebrations.filter(cel => cel.countdown === 0);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 no-print">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-950 uppercase font-display flex items-center gap-2">
            <Cake className="w-8 h-8 text-pink-500 animate-bounce" />
            Narozeniny & Svátky dětí a rodiny
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Nezapomeňte na žádné narozeniny, svátky ani výročí! Sledujte přesný odpočet a tipy na dárky.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-3xs hover:shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Přidat událost
        </button>
      </div>

      {/* TODAY CELEBRATIONS ALERT BAR */}
      {todayCelebrants.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 rounded-3xl p-6 text-white shadow-md animate-pulse">
          <div className="absolute top-[-20px] right-[-20px] opacity-15 rotate-12">
            <Sparkles className="w-40 h-40" />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Sparkles className="w-8 h-8 text-white animate-spin" />
              </div>
              <div>
                <h3 className="font-black font-display text-lg uppercase tracking-wider">
                  Dnes máme v rodině oslavu! 🥳
                </h3>
                <div className="mt-1 space-y-1 font-medium text-white/90 text-sm">
                  {todayCelebrants.map(cel => (
                    <p key={cel.id}>
                      🌟 <strong>{cel.name}</strong> 
                      {cel.ageToTurn && <> oslavuje krásných <strong>{cel.ageToTurn}. narozeniny!</strong></>}
                      {cel.type === 'nameday' && <> má dnes krásný svátek!</>}
                      {cel.type === 'anniversary' && <> slaví dnes výročí!</>}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            {todayCelebrants[0].notes && (
              <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/20 max-w-sm text-xs font-medium">
                <span className="font-bold block text-amber-200">📌 Pozor na dárky / poznámka:</span>
                <p className="mt-0.5">{todayCelebrants[0].notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center no-print">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Hledat událost, jméno nebo dárky..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white border-transparent'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
            }`}
          >
            Vše
          </button>
          <button
            onClick={() => setActiveFilter('birthday')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border flex items-center gap-1.5 ${
              activeFilter === 'birthday'
                ? 'bg-pink-600 text-white border-transparent'
                : 'bg-pink-50/50 text-pink-700 hover:bg-pink-50 border-pink-200'
            }`}
          >
            <Cake className="w-3.5 h-3.5" />
            Narozeniny
          </button>
          <button
            onClick={() => setActiveFilter('nameday')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border flex items-center gap-1.5 ${
              activeFilter === 'nameday'
                ? 'bg-violet-600 text-white border-transparent'
                : 'bg-violet-50/50 text-violet-700 hover:bg-violet-50 border-violet-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Svátky
          </button>
          <button
            onClick={() => setActiveFilter('anniversary')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border flex items-center gap-1.5 ${
              activeFilter === 'anniversary'
                ? 'bg-rose-600 text-white border-transparent'
                : 'bg-rose-50/50 text-rose-700 hover:bg-rose-50 border-rose-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Výročí
          </button>
          <button
            onClick={() => setActiveFilter('holiday')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border flex items-center gap-1.5 ${
              activeFilter === 'holiday'
                ? 'bg-amber-600 text-white border-transparent'
                : 'bg-amber-50/50 text-amber-700 hover:bg-amber-50 border-amber-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Svátky/Dny
          </button>
        </div>
      </div>

      {/* UPCOMING EVENTS BENTO ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCelebrations.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700 text-sm">Nenalezena žádná výročí nebo významné dny</p>
            <p className="text-xs text-slate-400 mt-1">Zkuste upravit vyhledávání nebo filtr nebo přidejte novou událost.</p>
          </div>
        ) : (
          filteredCelebrations.map((cel) => {
            const meta = CELEBRATION_META[cel.type];
            const IconComponent = meta.icon;

            // Find associated member if any
            const associatedMember = cel.memberId ? members.find(m => m.id === cel.memberId) : null;

            // Highlight if countdown is 0 (today) or <= 7 (this week)
            const isToday = cel.countdown === 0;
            const isSoon = cel.countdown > 0 && cel.countdown <= 7;

            return (
              <motion.div
                key={cel.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className={`bg-white rounded-3xl border transition-all duration-300 p-5 relative overflow-hidden flex flex-col justify-between group ${
                  isToday 
                    ? 'ring-4 ring-pink-500/20 border-pink-300 bg-pink-50/10 shadow-md' 
                    : isSoon 
                      ? 'border-amber-300 bg-amber-50/5 shadow-3xs ring-2 ring-amber-500/10' 
                      : 'border-slate-200 hover:shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Background decorative ring for top category */}
                <div className={`absolute top-[-10px] right-[-10px] w-20 h-20 rounded-full opacity-5 pointer-events-none ${isToday ? 'bg-pink-500' : 'bg-indigo-500'}`} />

                <div className="space-y-4">
                  
                  {/* Category, Date & Countdown Badge */}
                  <div className="flex justify-between items-start gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${meta.bg} ${meta.border} ${meta.text}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                      {meta.label}
                    </span>
                    
                    {/* Countdown Banner */}
                    <div className="text-right">
                      {isToday ? (
                        <span className="inline-flex items-center gap-1 bg-pink-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-3xs">
                          <Sparkles className="w-3 h-3" />
                          Dnes!
                        </span>
                      ) : isSoon ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          Za {cel.countdown} {cel.countdown === 1 ? 'den' : cel.countdown < 5 ? 'dny' : 'dní'}
                        </span>
                      ) : (
                        <span className="text-xs font-black font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                          za {cel.countdown} dní
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title of event & age */}
                  <div>
                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-wide leading-snug">
                      {cel.name}
                    </h4>
                    
                    {/* Birthday detail (how old they are turning) */}
                    {cel.ageToTurn !== null && (
                      <p className="text-xs font-bold text-pink-600 mt-1 flex items-center gap-1">
                        <Cake className="w-3.5 h-3.5" />
                        Oslaví {cel.ageToTurn}. narozeniny!
                      </p>
                    )}

                    {/* Show date */}
                    <p className="text-[10px] font-bold font-mono text-slate-400 uppercase mt-1">
                      Datum: <span className="text-slate-700">{cel.formattedDate}</span> 
                      {cel.date.length === 10 && <span className="text-slate-400"> (rok {cel.date.split('-')[0]})</span>}
                    </p>
                  </div>

                  {/* Member reference if present */}
                  {associatedMember && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100/60">
                      <span className="w-5 h-5 rounded-full overflow-hidden select-none flex items-center justify-center shrink-0 border border-slate-100">
                        {associatedMember.avatar && (associatedMember.avatar.startsWith('data:image/') || associatedMember.avatar.startsWith('http')) ? (
                          <img src={associatedMember.avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-xs">{associatedMember.avatar || '👤'}</span>
                        )}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        Přiřazený člen: <strong className={associatedMember.textClass}>{associatedMember.name}</strong>
                      </span>
                    </div>
                  )}

                  {/* Notes / Gift ideas */}
                  {cel.notes && (
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Gift className="w-3 h-3 text-indigo-500" />
                        Poznámky & Tipy na dárky
                      </span>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {cel.notes}
                      </p>
                    </div>
                  )}

                </div>

                {/* Edit & Delete Actions (hidden in print, visible on hover) */}
                <div className="flex justify-end gap-1.5 pt-4 border-t border-slate-100/80 mt-4 no-print opacity-85 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleOpenEdit(cel)}
                    className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition shadow-3xs"
                    title="Upravit událost"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cel.id, cel.name)}
                    className="p-1.5 border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-xl transition shadow-3xs"
                    title="Smazat událost"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </motion.div>
            );
          })
        )}
      </div>

      {/* REUSABLE ADD / EDIT POPUP MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50 no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-black text-indigo-950 text-lg uppercase tracking-wider font-display flex items-center gap-2">
                  {editingEvent ? <Edit3 className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
                  {editingEvent ? 'Upravit významný den / narozeniny' : 'Přidat významný den / narozeniny'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-slate-650 p-1.5 rounded-full hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                
                {/* Event Name */}
                <div className="space-y-1">
                  <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px]">
                    Název události / Jméno <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Např. Eliška - Narozeniny, Babička Jana - Svátek, Výročí svatby"
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Event Type & Member Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px]">
                      Typ události
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as CelebrationType)}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="birthday">🎂 Narozeniny</option>
                      <option value="nameday">🏷️ Svátek</option>
                      <option value="anniversary">💖 Výročí</option>
                      <option value="holiday">🇨🇿 Významný den / Svátky</option>
                      <option value="other">⚙️ Ostatní</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px]">
                      Přiřadit k členu rodiny
                    </label>
                    <select
                      value={formMemberId}
                      onChange={(e) => setFormMemberId(e.target.value)}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">-- Žádný (Všeobecná událost) --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.avatar} {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date Picker Modes */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px]">
                      Nastavení data události
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomDateOnlyMD(!isCustomDateOnlyMD)}
                      className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 tracking-wider bg-white px-2.5 py-1 border border-slate-200 rounded-lg transition"
                    >
                      {isCustomDateOnlyMD ? 'Přepnout na plné datum (s rokem)' : 'Přepnout na pouze Den a Měsíc'}
                    </button>
                  </div>

                  {isCustomDateOnlyMD ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-500 text-[9px] uppercase">Měsíc</label>
                        <select
                          value={formMonth}
                          onChange={(e) => setFormMonth(e.target.value)}
                          className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none"
                        >
                          {Array.from({ length: 12 }).map((_, idx) => {
                            const val = (idx + 1).toString().padStart(2, '0');
                            return <option key={val} value={val}>{val}. měsíc</option>;
                          })}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-500 text-[9px] uppercase">Den</label>
                        <select
                          value={formDay}
                          onChange={(e) => setFormDay(e.target.value)}
                          className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none"
                        >
                          {Array.from({ length: 31 }).map((_, idx) => {
                            const val = (idx + 1).toString().padStart(2, '0');
                            return <option key={val} value={val}>{val}. den</option>;
                          })}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-500 text-[9px] uppercase">Plné datum s rokem narození</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                      />
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        💡 Výběr s rokem (např. 1984) automaticky vypočítá přesný věk, který oslavenec dovrší.
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes / Gifts / Recommendations */}
                <div className="space-y-1">
                  <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px]">
                    Poznámky & Tipy na dárky
                  </label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Např. Má rád sci-fi knížky. Koupit dárkový poukaz do jeho oblíbené prodejny..."
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-3xs"
                  >
                    <Check className="w-4 h-4" />
                    Uložit změny
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
