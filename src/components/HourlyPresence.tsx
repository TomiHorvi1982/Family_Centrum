import React, { useState } from 'react';
import { Member, Activity, ActivityType } from '../types';
import { 
  Clock, 
  Home, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  UserMinus, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Smile,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface HourlyPresenceProps {
  members: Member[];
  activities: Activity[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenQuickAdd: (memberId: string, date: string, hour: number) => void;
}

// Convert "HH:MM" string to a decimal number
function timeToDecimal(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + (minutes / 60);
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 06:00 to 21:00

export default function HourlyPresence({ 
  members, 
  activities, 
  selectedDate, 
  onDateChange,
  onOpenQuickAdd 
}: HourlyPresenceProps) {
  
  // Format selectedDate for nice display in Czech
  const getCzechDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const weekdays = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
      const months = [
        'ledna', 'února', 'března', 'dubna', 'května', 'června', 
        'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
      ];
      
      const dayName = weekdays[d.getDay()];
      const dayNum = d.getDate();
      const monthName = months[d.getMonth()];
      
      // Check if it's today relative to our current app time (2026-07-19)
      if (dateStr === '2026-07-19') {
        return `Dnes (Neděle, ${dayNum}. ${monthName})`;
      }
      
      return `${dayName}, ${dayNum}. ${monthName}`;
    } catch {
      return dateStr;
    }
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  // Resolve status for a specific member at a specific hour
  const getMemberStatusAtHour = (memberId: string, hour: number): {
    type: ActivityType | 'free-home';
    title: string;
    activity?: Activity;
  } => {
    // Filter activities for this member and this date
    const dayActivities = activities.filter(
      (act) => act.date === selectedDate && act.memberIds.includes(memberId)
    );

    // Find if any activity covers this hour slot (e.g. 14:00 covers interval 14:00 - 15:00)
    const slotStart = hour;
    const slotEnd = hour + 1;

    const matchingAct = dayActivities.find((act) => {
      const actStart = timeToDecimal(act.startTime);
      const actEnd = timeToDecimal(act.endTime);
      // Check overlap: activity overlaps with [slotStart, slotEnd]
      return actStart < slotEnd && actEnd > slotStart;
    });

    if (matchingAct) {
      return {
        type: matchingAct.type,
        title: matchingAct.title,
        activity: matchingAct
      };
    }

    // Default to Home/Free
    return {
      type: 'free-home',
      title: 'Doma / Volný čas'
    };
  };

  // Visual meta for statuses
  const STATUS_META: Record<string, {
    label: string;
    icon: React.ElementType;
    bgClass: string;
    textClass: string;
    borderClass: string;
  }> = {
    'work': { label: 'V práci', icon: Briefcase, bgClass: 'bg-rose-100', textClass: 'text-rose-700', borderClass: 'border-rose-200' },
    'school': { label: 'Škola / Školka', icon: GraduationCap, bgClass: 'bg-indigo-100', textClass: 'text-indigo-700', borderClass: 'border-indigo-200' },
    'club': { label: 'Na kroužku', icon: Sparkles, bgClass: 'bg-amber-100', textClass: 'text-amber-700', borderClass: 'border-amber-200' },
    'doctor': { label: 'U doktora', icon: AlertCircle, bgClass: 'bg-red-100', textClass: 'text-red-700', borderClass: 'border-red-200' },
    'free': { label: 'Mimo domov / Volno', icon: UserMinus, bgClass: 'bg-sky-100', textClass: 'text-sky-700', borderClass: 'border-sky-200' },
    'home': { label: 'Doma', icon: Home, bgClass: 'bg-emerald-100', textClass: 'text-emerald-700', borderClass: 'border-emerald-200' },
    'other': { label: 'Ostatní', icon: Clock, bgClass: 'bg-slate-100', textClass: 'text-slate-700', borderClass: 'border-slate-200' },
    'free-home': { label: 'Doma', icon: Home, bgClass: 'bg-emerald-50 hover:bg-emerald-100', textClass: 'text-emerald-600', borderClass: 'border-emerald-100' }
  };

  // Find when all family members are home / free (no work, school, club, or doctor)
  const getCommonFreeHours = () => {
    const freeHours: number[] = [];
    HOURS.forEach((h) => {
      let allFree = true;
      members.forEach((m) => {
        const status = getMemberStatusAtHour(m.id, h);
        if (['work', 'school', 'club', 'doctor', 'free'].includes(status.type)) {
          allFree = false;
        }
      });
      if (allFree) {
        freeHours.push(h);
      }
    });
    return freeHours;
  };

  const commonFreeHours = getCommonFreeHours();

  return (
    <div className="space-y-6">
      {/* Date Picker Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 id="presence-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-950 uppercase font-display">
            Hodinový přehled přítomnosti
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Plány rozepsané na konkrétní hodiny. Podívejte se, kdo kdy bude doma a kdy bude mít volný čas.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-2xs">
          <button
            id="btn-prev-day"
            onClick={handlePrevDay}
            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-xl transition"
            title="Předchozí den"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 px-3">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <input
              id="presence-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent focus:outline-hidden cursor-pointer uppercase tracking-wider"
            />
          </div>

          <button
            id="btn-next-day"
            onClick={handleNextDay}
            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-xl transition"
            title="Následující den"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Date label banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-500/20 font-display">
            {new Date(selectedDate).getDate() || '19'}
          </div>
          <div>
            <h3 className="font-black text-indigo-950 text-lg font-display uppercase tracking-tight">
              {getCzechDateLabel(selectedDate)}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Hodinový harmonogram dne a přehled společného rodinného času.
            </p>
          </div>
        </div>
        
        {/* Quick status counters */}
        <div className="flex gap-6">
          <div className="text-left sm:text-center sm:px-4 sm:py-1 border-r border-indigo-100 pr-4">
            <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">Společné volno</span>
            <span className="text-xl font-black text-emerald-600 font-display">{commonFreeHours.length} hod</span>
          </div>
          <div className="text-left sm:text-center sm:px-4 sm:py-1">
            <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">Mimo domov</span>
            <span className="text-xl font-black text-indigo-600 font-display">{HOURS.length - commonFreeHours.length} hod</span>
          </div>
        </div>
      </div>

      {/* Timeline Grid (Desktop Layout) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Status Legend */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
          <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5 text-emerald-600" /> Doma / Volno</span>
          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-rose-600" /> V práci</span>
          <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Škola / Školka</span>
          <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-600" /> Kroužek</span>
          <span className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-red-600" /> U doktora</span>
        </div>

        {/* Scrollable grid wrapper */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px] p-5">
            {/* Header row: Hours */}
            <div className="grid grid-cols-[160px_repeat(16,1fr)] gap-2 mb-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">Člen rodiny</div>
              {HOURS.map((h) => (
                <div key={h} className="text-center font-mono text-xs font-bold text-slate-500">
                  {h}:00
                </div>
              ))}
            </div>

            {/* Members Rows */}
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="grid grid-cols-[160px_repeat(16,1fr)] gap-2 items-center">
                  
                  {/* Member Name */}
                  <div className="flex items-center gap-2 pr-2">
                    <span className="text-2xl select-none" role="img" aria-label="Avatar">{member.avatar}</span>
                    <div className="truncate">
                      <span className="font-bold text-slate-800 text-sm block leading-tight">{member.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${member.lightBgClass} ${member.textClass}`}>
                        {member.role === 'manzel' ? 'Táta' : member.role === 'manzelka' ? 'Máma' : 'Dítě'}
                      </span>
                    </div>
                  </div>

                  {/* Hours Cells */}
                  {HOURS.map((h) => {
                    const status = getMemberStatusAtHour(member.id, h);
                    const meta = STATUS_META[status.type];
                    const Icon = meta.icon;

                    return (
                      <div
                        id={`presence-cell-${member.id}-${h}`}
                        key={h}
                        onClick={() => !status.activity && onOpenQuickAdd(member.id, selectedDate, h)}
                        className={`group relative h-14 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${meta.bgClass} ${meta.borderClass} ${
                          status.activity ? 'shadow-2xs' : 'hover:scale-105 hover:ring-4 hover:ring-indigo-500/20'
                        }`}
                        title={`${member.name} v ${h}:00 - ${status.title}`}
                      >
                        <Icon className={`w-4 h-4 ${meta.textClass}`} />
                        <span className="text-[9px] font-bold text-slate-400 mt-1 block group-hover:hidden">
                          {h}:00
                        </span>
                        <span className={`hidden group-hover:block text-[8px] font-bold uppercase truncate px-1 text-center ${meta.textClass}`}>
                          {meta.label}
                        </span>

                        {/* Tooltip on hover with activity title */}
                        {status.activity && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-[10px] rounded-lg p-2 shadow-lg hidden group-hover:block z-10 w-48 pointer-events-none">
                            <p className="font-bold truncate">{status.activity.title}</p>
                            <p className="text-[9px] text-slate-300 mt-0.5">
                              {status.activity.startTime} - {status.activity.endTime}
                            </p>
                            {status.activity.location && (
                              <p className="text-[8px] text-blue-300 truncate mt-0.5">📍 {status.activity.location}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                </div>
              ))}
            </div>

            {/* "All Home" Row indicator */}
            <div className="grid grid-cols-[160px_repeat(16,1fr)] gap-2 mt-6 pt-4 border-t border-slate-100 items-center bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <Smile className="w-4 h-4" />
                Společný volný čas
              </div>
              {HOURS.map((h) => {
                const isCommonFree = commonFreeHours.includes(h);
                return (
                  <div
                    key={h}
                    className={`h-6 rounded-lg flex items-center justify-center transition-all ${
                      isCommonFree 
                        ? 'bg-emerald-500 text-white font-bold text-[10px] shadow-xs' 
                        : 'bg-slate-200 text-slate-400 text-[10px]'
                    }`}
                    title={isCommonFree ? 'Všichni jsou doma nebo mají volný čas!' : 'Někdo je mimo domov'}
                  >
                    {isCommonFree ? 'ANO' : ''}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Analysis and recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common free time analysis card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-black text-indigo-950 text-base flex items-center gap-2 uppercase tracking-wider font-display">
            <Home className="w-5 h-5 text-emerald-500" />
            Společné chvíle doma
          </h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">
            Chcete naplánovat společný rodinný oběd nebo si jen tak sednout a popovídat?
          </p>
          
          <div className="mt-4 space-y-3">
            {commonFreeHours.length > 0 ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Nejlepší hodiny pro společný čas dnes:</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {commonFreeHours.map((h) => (
                    <span key={h} className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-xl">
                      {h}:00 - {h+1}:00
                    </span>
                  ))}
                </div>
                <div className="mt-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs text-emerald-800 leading-relaxed">
                  💡 <strong>Tip:</strong> V těchto časech nemají děti žádné kroužky a rodiče jsou doma z práce. Skvělá příležitost pro společnou večeři, stolní hru nebo malou procházku v parku Petra Bezruče.
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-850 flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong>Plný kalendář:</strong> Podle rozvrhu se dnes nenachází žádná společná hodina, kdy by byli všichni členové rodiny doma. Zkuste se podívat na jiný den nebo upravit odpolední plány.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Help Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-black text-indigo-950 text-base flex items-center gap-2 uppercase tracking-wider font-display">
              <Clock className="w-5 h-5 text-indigo-600" />
              Jak to funguje?
            </h3>
            <ul className="text-xs text-slate-600 mt-3 space-y-2.5 list-disc pl-4 leading-relaxed font-medium">
              <li>Rozvrh přítomnosti se <strong>automaticky generuje</strong> z událostí zadaných v Kalendáři. Nemusíte nic zadávat dvakrát!</li>
              <li>Chcete-li někomu naplánovat práci, kroužek nebo lékaře, klikněte na prázdné políčko v řádku dané osoby a hodiny. Otevře se rychlé přidání události.</li>
              <li>Zelená políčka indikují, že osoba nemá žádnou naplánovanou aktivitu mimo domov.</li>
            </ul>
          </div>
          
          <div className="mt-5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-500 font-medium flex items-center gap-2">
            <span>ℹ️</span>
            <span>Časy jsou zaokrouhleny na celé hodiny pro vizuální přehlednost.</span>
          </div>
        </div>
      </div>

    </div>
  );
}
