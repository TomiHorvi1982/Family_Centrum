import React, { useState } from 'react';
import { Member, Activity, ActivityType } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  X, 
  User, 
  Users, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  AlertCircle, 
  Home, 
  Filter 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarViewProps {
  members: Member[];
  activities: Activity[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onAddActivity: (activity: Activity | Activity[]) => void;
  onUpdateActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
  quickAddState: { memberId: string; date: string; hour: number } | null;
  onClearQuickAdd: () => void;
}

const TYPE_LABELS: Record<ActivityType, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  work: { label: 'Práce', bg: 'bg-rose-50 border-rose-100', text: 'text-rose-700', icon: Briefcase },
  school: { label: 'Škola / Školka', bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-700', icon: GraduationCap },
  club: { label: 'Kroužek', bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', icon: Sparkles },
  doctor: { label: 'U doktora', bg: 'bg-red-50 border-red-100', text: 'text-red-700', icon: AlertCircle },
  free: { label: 'Volno / Výlet', bg: 'bg-sky-50 border-sky-100', text: 'text-sky-700', icon: Users },
  home: { label: 'Doma', bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', icon: Home },
  birthday: { label: 'Narozeniny', bg: 'bg-pink-50 border-pink-100', text: 'text-pink-700', icon: Users },
  holiday: { label: 'Významný den / Svátek', bg: 'bg-violet-50 border-violet-100', text: 'text-violet-700', icon: Calendar },
  other: { label: 'Ostatní', bg: 'bg-slate-50 border-slate-100', text: 'text-slate-700', icon: Clock }
};

// Generate relative dates for the current week starting from 2026-07-13 (Monday) to 2026-07-19 (Sunday)
const WEEK_DAYS = [
  { label: 'Pondělí', date: '2026-07-13', short: 'Po' },
  { label: 'Úterý', date: '2026-07-14', short: 'Út' },
  { label: 'Středa', date: '2026-07-15', short: 'St' },
  { label: 'Čtvrtek', date: '2026-07-16', short: 'Čt' },
  { label: 'Pátek', date: '2026-07-17', short: 'Pá' },
  { label: 'Sobota', date: '2026-07-18', short: 'So' },
  { label: 'Neděle', date: '2026-07-19', short: 'Ne' }
];

export default function CalendarView({
  members,
  activities,
  selectedDate,
  onDateChange,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  quickAddState,
  onClearQuickAdd
}: CalendarViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter States
  const [filterMemberId, setFilterMemberId] = useState<string | 'all'>('all');
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [type, setType] = useState<ActivityType>('free');
  const [location, setLocation] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Recurrence States
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'workdays' | 'custom'>('weekly');
  const [repeatUntil, setRepeatUntil] = useState('2026-07-19');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1]);

  // Open Add form with defaults or quickAdd values
  React.useEffect(() => {
    if (quickAddState) {
      setIsAdding(true);
      setEditingId(null);
      setTitle('');
      setDescription('');
      setDate(quickAddState.date);
      const startHour = quickAddState.hour.toString().padStart(2, '0');
      const endHour = (quickAddState.hour + 1).toString().padStart(2, '0');
      setStartTime(`${startHour}:00`);
      setEndTime(`${endHour}:00`);
      setType('free');
      setLocation('');
      setSelectedMemberIds([quickAddState.memberId]);
    }
  }, [quickAddState]);

  const handleOpenAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDate(selectedDate);
    setStartTime('08:00');
    setEndTime('09:00');
    setType('free');
    setLocation('');
    setSelectedMemberIds(members.length > 0 ? [members[0].id] : []);
    onClearQuickAdd();
  };

  const handleOpenEdit = (act: Activity) => {
    setEditingId(act.id);
    setIsAdding(false);
    setTitle(act.title);
    setDescription(act.description || '');
    setDate(act.date);
    setStartTime(act.startTime);
    setEndTime(act.endTime);
    setType(act.type);
    setLocation(act.location || '');
    setSelectedMemberIds(act.memberIds);
    onClearQuickAdd();
  };

  const handleToggleMember = (memberId: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };

  const handleSelectAllMembers = () => {
    setSelectedMemberIds(members.map(m => m.id));
  };

// Date helper to generate recurrence array
const generateRecurrenceDates = (startDateStr: string, endDateStr: string, type: 'daily' | 'weekly' | 'workdays' | 'custom', weekdays: number[]): string[] => {
  const dates: string[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [startDateStr];
  }
  
  const current = new Date(start);
  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    const jsDay = current.getDay();
    const normalizedDay = jsDay === 0 ? 7 : jsDay;
    
    let include = false;
    if (type === 'daily') {
      include = true;
    } else if (type === 'weekly') {
      const startJsDay = start.getDay();
      const startNormalizedDay = startJsDay === 0 ? 7 : startJsDay;
      include = normalizedDay === startNormalizedDay;
    } else if (type === 'workdays') {
      include = normalizedDay >= 1 && normalizedDay <= 5;
    } else if (type === 'custom') {
      include = weekdays.includes(normalizedDay);
    }
    
    if (include) {
      dates.push(dateStr);
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedMemberIds.length === 0 || !date) return;

    if (editingId) {
      onUpdateActivity({
        id: editingId,
        title,
        description: description.trim() || undefined,
        memberIds: selectedMemberIds,
        date,
        startTime,
        endTime,
        type,
        location: location.trim() || undefined
      });
      setEditingId(null);
    } else if (isRecurring) {
      const recurrenceDates = generateRecurrenceDates(date, repeatUntil, recurrenceType, selectedWeekdays);
      const acts: Activity[] = recurrenceDates.map((d, index) => ({
        id: `act-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
        title,
        description: description.trim() || undefined,
        memberIds: selectedMemberIds,
        date: d,
        startTime,
        endTime,
        type,
        location: location.trim() || undefined
      }));
      onAddActivity(acts);
      setIsAdding(false);
    } else {
      onAddActivity({
        id: 'act-' + Date.now(),
        title,
        description: description.trim() || undefined,
        memberIds: selectedMemberIds,
        date,
        startTime,
        endTime,
        type,
        location: location.trim() || undefined
      });
      setIsAdding(false);
    }
    onClearQuickAdd();
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setStartTime('08:00');
    setEndTime('09:00');
    setType('free');
    setLocation('');
    setSelectedMemberIds([]);
    setIsRecurring(false);
    setRecurrenceType('weekly');
    setRepeatUntil('2026-07-19');
    setSelectedWeekdays([1]);
  };

  // Filter and sort activities
  const getDayActivities = (dayDate: string) => {
    return activities
      .filter(act => {
        const matchesDate = act.date === dayDate;
        const matchesMember = filterMemberId === 'all' || act.memberIds.includes(filterMemberId);
        const matchesType = filterType === 'all' || act.type === filterType;
        return matchesDate && matchesMember && matchesType;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 id="calendar-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-950 uppercase font-display">
            Týdenní kalendář rodiny
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Zaznamenávejte práci, kroužky, doktory a výlety. Hned uvidíte, kdo co má na starosti.
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            id="btn-add-activity"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            Naplánovat aktivitu
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence mode="wait">
        {(isAdding || editingId) && (
          <motion.div
            id="activity-form-container"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-indigo-950 text-base uppercase tracking-wider font-display">
                {editingId ? 'Upravit událost v kalendáři' : 'Naplánovat novou rodinnou událost'}
              </h3>
              <button
                id="btn-close-activity-form"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  onClearQuickAdd();
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="activity-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Left Column */}
              <div className="space-y-4 md:col-span-2">
                <div className="space-y-1">
                  <label htmlFor="activity-title" className="text-xs font-semibold text-slate-500 uppercase">Název aktivity *</label>
                  <input
                    id="activity-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="např. Florbalový trénink, Zubař Bohumín, Nákup v Lidlu"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="activity-date" className="text-xs font-semibold text-slate-500 uppercase">Datum *</label>
                    <input
                      id="activity-date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="activity-start-time" className="text-xs font-semibold text-slate-500 uppercase">Čas od *</label>
                    <input
                      id="activity-start-time"
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="activity-end-time" className="text-xs font-semibold text-slate-500 uppercase">Čas do *</label>
                    <input
                      id="activity-end-time"
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="activity-type" className="text-xs font-semibold text-slate-500 uppercase">Kategorie / Typ</label>
                    <select
                      id="activity-type"
                      value={type}
                      onChange={(e) => setType(e.target.value as ActivityType)}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                    >
                      <option value="work">💼 Práce</option>
                      <option value="school">🏫 Škola / Školka</option>
                      <option value="club">⚽ Kroužek</option>
                      <option value="doctor">🏥 U doktora</option>
                      <option value="free">🚶 Volno / Společný výlet</option>
                      <option value="home">🏠 Doma / Domácí práce</option>
                      <option value="birthday">🎂 Narozeniny</option>
                      <option value="holiday">🇨🇿 Významný den / Svátek</option>
                      <option value="other">⚙️ Ostatní</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="activity-location" className="text-xs font-semibold text-slate-500 uppercase">Místo konání (nepovinné)</label>
                    <input
                      id="activity-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="např. Bospor hala, DDM, Rychvald"
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="activity-description" className="text-xs font-semibold text-slate-500 uppercase">Popis / Detaily (nepovinné)</label>
                  <textarea
                    id="activity-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="např. Nezapomenout vzít přezůvky a láhev s vodou."
                    rows={2}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                {/* Recurrence Section (only when adding new activity) */}
                {!editingId && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        id="activity-is-recurring"
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Pravidelně se opakující aktivita</span>
                    </label>

                    {isRecurring && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                        <div className="space-y-1">
                          <label htmlFor="recurrence-type" className="text-[10px] font-bold text-slate-500 uppercase">Frekvence opakování</label>
                          <select
                            id="recurrence-type"
                            value={recurrenceType}
                            onChange={(e) => setRecurrenceType(e.target.value as any)}
                            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                          >
                            <option value="daily">Každý den</option>
                            <option value="weekly">Každý týden</option>
                            <option value="workdays">Pracovní dny (Po - Pá)</option>
                            <option value="custom">Vlastní dny v týdnu</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="repeat-until" className="text-[10px] font-bold text-slate-500 uppercase">Opakovat až do</label>
                          <input
                            id="repeat-until"
                            type="date"
                            required={isRecurring}
                            value={repeatUntil}
                            onChange={(e) => setRepeatUntil(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                          />
                        </div>

                        {recurrenceType === 'custom' && (
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Vyberte dny v týdnu</label>
                            <div className="flex flex-wrap gap-1">
                              {[
                                { val: 1, label: 'Po' },
                                { val: 2, label: 'Út' },
                                { val: 3, label: 'St' },
                                { val: 4, label: 'Čt' },
                                { val: 5, label: 'Pá' },
                                { val: 6, label: 'So' },
                                { val: 7, label: 'Ne' }
                              ].map(day => {
                                const isSel = selectedWeekdays.includes(day.val);
                                return (
                                  <button
                                    id={`btn-custom-weekday-${day.val}`}
                                    key={day.val}
                                    type="button"
                                    onClick={() => {
                                      setSelectedWeekdays(prev => 
                                        prev.includes(day.val)
                                          ? prev.filter(v => v !== day.val)
                                          : [...prev, day.val]
                                      );
                                    }}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                                      isSel 
                                        ? 'bg-indigo-600 border-transparent text-white' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    {day.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Family Members checkbox */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pro koho plan platí? *</span>
                    <button
                      id="btn-select-all-members"
                      type="button"
                      onClick={handleSelectAllMembers}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase"
                    >
                      Vybrat všechny
                    </button>
                  </div>

                  <div className="space-y-2">
                    {members.map(member => {
                      const isChecked = selectedMemberIds.includes(member.id);
                      return (
                        <button
                          id={`btn-toggle-member-${member.id}`}
                          type="button"
                          key={member.id}
                          onClick={() => handleToggleMember(member.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                            isChecked 
                              ? `${member.lightBgClass} ${member.borderClass} ring-1 ring-offset-0 ring-${member.color}-400`
                              : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full overflow-hidden select-none flex items-center justify-center shrink-0">
                              {member.avatar && (member.avatar.startsWith('data:image/') || member.avatar.startsWith('http')) ? (
                                <img src={member.avatar} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <span className="text-xl" role="img" aria-label="Avatar">{member.avatar || '👤'}</span>
                              )}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{member.name}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isChecked ? 'bg-blue-600 border-transparent text-white' : 'border-slate-300'
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedMemberIds.length === 0 && (
                    <p className="text-[10px] text-red-500 font-bold mt-2">⚠️ Musíte vybrat alespoň jednoho člena rodiny!</p>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    id="btn-cancel-activity"
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setEditingId(null);
                      onClearQuickAdd();
                      resetForm();
                    }}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                  >
                    Zrušit
                  </button>
                  <button
                    id="btn-submit-activity"
                    type="submit"
                    disabled={selectedMemberIds.length === 0}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-3xs transition"
                  >
                    {editingId ? 'Uložit' : 'Vytvořit'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Quick selection Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 uppercase tracking-wider font-display">
            <Filter className="w-4 h-4 text-indigo-600" />
            Filtry:
          </div>

          {/* Member Filter */}
          <select
            id="filter-member"
            value={filterMemberId}
            onChange={(e) => setFilterMemberId(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 focus:outline-hidden"
          >
            <option value="all">Všichni členové</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            id="filter-activity-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ActivityType | 'all')}
            className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 focus:outline-hidden"
          >
            <option value="all">Všechny kategorie</option>
            <option value="work">💼 Práce</option>
            <option value="school">🏫 Škola / Školka</option>
            <option value="club">⚽ Kroužky</option>
            <option value="doctor">🏥 Lékaři</option>
            <option value="free">🚶 Výlety / Volný čas</option>
            <option value="home">🏠 Domácí aktivity</option>
            <option value="birthday">🎂 Narozeniny</option>
            <option value="holiday">🇨🇿 Významné dny</option>
            <option value="other">⚙️ Ostatní</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Práce</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> Škola</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Kroužek</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Doktor</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Doma</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-400"></span> Narozeniny</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-400"></span> Svátek</span>
        </div>
      </div>

      {/* Week Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {WEEK_DAYS.map((day) => {
          const dayDate = day.date;
          const dayActivitiesList = getDayActivities(dayDate);
          const isSelected = selectedDate === dayDate;

          return (
            <div
              id={`calendar-day-column-${dayDate}`}
              key={dayDate}
              className={`rounded-3xl border transition-all flex flex-col min-h-[380px] bg-white ${
                isSelected 
                  ? 'border-indigo-300 ring-4 ring-indigo-500/10 shadow-md' 
                  : 'border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              {/* Day Header */}
              <div
                onClick={() => onDateChange(dayDate)}
                className={`p-4 border-b text-center cursor-pointer select-none rounded-t-[22px] transition-all ${
                  isSelected 
                    ? 'bg-indigo-600 text-white font-bold' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-850'
                }`}
              >
                <div className="text-xs uppercase tracking-widest font-black font-display">
                  {day.label}
                </div>
                <div className="text-xl font-black tracking-tight font-display mt-0.5">
                  {dayDate.split('-')[2]}.7.
                </div>
              </div>

              {/* Day Activities List */}
              <div className="p-2.5 flex-1 space-y-2 overflow-y-auto max-h-[400px]">
                {dayActivitiesList.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <p className="text-[11px] text-slate-400 font-medium">Žádné plány</p>
                    <button
                      id={`btn-quick-add-day-${dayDate}`}
                      onClick={() => {
                        setDate(dayDate);
                        setIsAdding(true);
                        setEditingId(null);
                        setTitle('');
                        setDescription('');
                        setStartTime('08:00');
                        setEndTime('09:00');
                        setType('free');
                        setLocation('');
                        setSelectedMemberIds(members.length > 0 ? [members[0].id] : []);
                      }}
                      className="text-[10px] text-blue-500 hover:text-blue-700 font-bold mt-1 uppercase"
                    >
                      + Přidat
                    </button>
                  </div>
                ) : (
                  dayActivitiesList.map((act) => {
                    const meta = TYPE_LABELS[act.type] || TYPE_LABELS.other;
                    const Icon = meta.icon;

                    return (
                      <div
                        id={`calendar-activity-item-${act.id}`}
                        key={act.id}
                        className={`p-2.5 rounded-xl border ${meta.bg} flex flex-col justify-between space-y-2 group hover:shadow-xs transition duration-200 relative overflow-hidden`}
                      >
                        {/* Colored left bar */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                          act.type === 'work' ? 'bg-rose-500' :
                          act.type === 'school' ? 'bg-indigo-500' :
                          act.type === 'club' ? 'bg-amber-500' :
                          act.type === 'doctor' ? 'bg-red-500' :
                          act.type === 'home' ? 'bg-emerald-500' : 'bg-slate-500'
                        }`} />

                        <div className="pl-1.5 space-y-1.5">
                          {/* Title and Time */}
                          <div>
                            <h4 className="text-[11px] font-extrabold text-slate-800 leading-tight line-clamp-2">
                              {act.title}
                            </h4>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{act.startTime} - {act.endTime}</span>
                            </div>
                          </div>

                          {/* Member icons badges */}
                          <div className="flex flex-wrap gap-1">
                            {act.memberIds.map(id => {
                              const m = members.find(m => m.id === id);
                              if (!m) return null;
                              return (
                                <span
                                  key={id}
                                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full border overflow-hidden text-xs select-none shadow-3xs ${m.lightBgClass} ${m.borderClass}`}
                                  title={m.name}
                                >
                                  {m.avatar && (m.avatar.startsWith('data:image/') || m.avatar.startsWith('http')) ? (
                                    <img src={m.avatar} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    m.avatar
                                  )}
                                </span>
                              );
                            })}
                          </div>

                          {/* Location & category label */}
                          {act.location && (
                            <div className="flex items-center gap-1 text-[9px] text-blue-600 font-semibold truncate">
                              <MapPin className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                              <span>{act.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons (Visible on hover in group) */}
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 absolute right-1 bottom-1 p-0.5 rounded-lg border border-slate-100">
                          <button
                            id={`btn-edit-act-item-${act.id}`}
                            onClick={() => handleOpenEdit(act)}
                            className="p-1 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 transition"
                            title="Upravit"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                          </button>
                          <button
                            id={`btn-delete-act-item-${act.id}`}
                            onClick={() => {
                              if (confirm(`Opravdu smazat plán "${act.title}"?`)) {
                                onDeleteActivity(act.id);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100 transition"
                            title="Smazat"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
