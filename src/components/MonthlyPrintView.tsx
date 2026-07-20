import React, { useState } from 'react';
import { Member, Activity } from '../types';
import { Printer, Calendar, ChevronLeft, ChevronRight, Info, Heart } from 'lucide-react';

interface MonthlyPrintViewProps {
  members: Member[];
  activities: Activity[];
}

const MONTHS_CZ = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
];

const DAYS_OF_WEEK_CZ = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];

// Preset Czech holidays / significant days in 2026 to make it look highly authentic
const SIGNIFICANT_DAYS: Record<string, string> = {
  '2026-01-01': 'Nový rok / Den obnovy ČR',
  '2026-04-03': 'Velký pátek',
  '2026-04-06': 'Velikonoční pondělí',
  '2026-05-01': 'Svátek práce',
  '2026-05-08': 'Den vítězství',
  '2026-07-05': 'Den věrozvěstů Cyrila a Metoděje 🇨🇿',
  '2026-07-06': 'Den upálení mistra Jana Husa 🇨🇿',
  '2026-09-28': 'Den české státnosti',
  '2026-10-28': 'Den vzniku samostatného čs. státu',
  '2026-11-17': 'Den boje za svobodu a demokracii',
  '2026-12-24': 'Štědrý den 🎄',
  '2026-12-25': '1. svátek vánoční',
  '2026-12-26': '2. svátek vánoční'
};

// Preset family birthdays
const FAMILY_BIRTHDAYS: Record<string, string> = {
  '07-15': 'Táta Honza má narozeniny! 🎂',
  '07-19': 'Eliška má narozeniny (6 let)! 🎂',
  '10-12': 'Máma Marie má narozeniny! 🎂',
  '03-24': 'Tomík má narozeniny! 🎂'
};

export default function MonthlyPrintView({ members, activities }: MonthlyPrintViewProps) {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonthIdx, setCurrentMonthIdx] = useState<number>(6); // July (0-indexed is June, so 6 is July)

  const handlePrevMonth = () => {
    if (currentMonthIdx === 0) {
      setCurrentMonthIdx(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIdx(currentMonthIdx - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx === 11) {
      setCurrentMonthIdx(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonthIdx(currentMonthIdx + 1);
    }
  };

  // Generate calendar days for selected Month
  const getCalendarGrid = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonthIdx, 1);
    // JS getDay() returns 0 for Sunday, 1 for Monday... 
    // We want 0 for Monday, 6 for Sunday
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday is index 6

    const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
    
    const grid: ({ dateStr: string; dayNum: number; isPadding: boolean } | null)[] = [];

    // Add padding days from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const monthStr = (currentMonthIdx + 1).toString().padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      grid.push({
        dateStr,
        dayNum: day,
        isPadding: false
      });
    }

    return grid;
  };

  const triggerPrint = () => {
    window.print();
  };

  const gridDays = getCalendarGrid();

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS (HIDDEN IN PRINT) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 no-print">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-950 uppercase font-display flex items-center gap-2">
            <Printer className="w-8 h-8 text-indigo-600" />
            Měsíční kalendář na lednici
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Vytiskněte si měsíční přehled pro celou rodinu. Ideální k zavěšení magnetem na lednici!
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={triggerPrint}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-3xs hover:shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            Vytisknout kalendář
          </button>
        </div>
      </div>

      {/* MONTH NAVIGATOR (HIDDEN IN PRINT) */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-3xl p-4 no-print shadow-xs">
        <button
          onClick={handlePrevMonth}
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h3 className="font-black text-indigo-950 text-lg uppercase tracking-wider font-display">
            {MONTHS_CZ[currentMonthIdx]} {currentYear}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Vyberte měsíc pro tisk</p>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* INSTRUCTION TIP (HIDDEN IN PRINT) */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex gap-3 items-center text-xs text-indigo-800 no-print">
        <Info className="w-5 h-5 text-indigo-500 shrink-0" />
        <div>
          <p className="font-bold uppercase tracking-wider text-[10px] text-indigo-950 mb-0.5">Tip pro perfektní tisk:</p>
          <p className="font-medium">
            V tiskovém dialogu zvolte orientaci <strong>Krajina (Landscape)</strong>, zapněte volbu <strong>Tisk pozadí (Background graphics)</strong> a nastavte okraje na minimum. Kalendář bude vypadat fantasticky!
          </p>
        </div>
      </div>

      {/* PRINT CONTAINER WITH MONTHLY CALENDAR GRID */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden print:p-0 print:border-0">
        
        {/* Printable Title Banner */}
        <div className="flex justify-between items-center pb-6 mb-4 border-b-2 border-slate-300">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-indigo-950 font-display">
              RODINNÝ PLÁNOVAČ
            </h1>
            <p className="text-sm font-bold text-slate-500 mt-0.5 uppercase tracking-wider">
              {MONTHS_CZ[currentMonthIdx]} {currentYear}
            </p>
          </div>
          <div className="text-right flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 font-display">
              Držíme spolu doma v Bohumíně!
            </span>
          </div>
        </div>

        {/* Member Legend at the top */}
        <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-slate-100 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] flex items-center">Legenda:</span>
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-1.5 font-bold uppercase tracking-tight text-[10px]">
              <span className={`w-3.5 h-3.5 rounded-full border ${m.bgClass} border-transparent flex items-center justify-center text-[8px] text-white`}>
                {m.avatar && (m.avatar.startsWith('data:image/') || m.avatar.startsWith('http')) ? '' : m.avatar}
              </span>
              <span className={m.textClass}>{m.name.split(' ')[0]}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-tight text-[10px]">
            <span className="text-sm">🎂</span>
            <span className="text-pink-600">Narozeniny</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-tight text-[10px]">
            <span className="text-sm">🇨🇿</span>
            <span className="text-violet-600">Svátek / Významný den</span>
          </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-7 gap-1 border border-slate-200 bg-slate-200 rounded-2xl overflow-hidden print:rounded-none">
          
          {/* Weekday headers */}
          {DAYS_OF_WEEK_CZ.map(day => (
            <div key={day} className="bg-slate-100 p-2 text-center text-xs font-black uppercase tracking-wider text-slate-600 border-b border-slate-200 font-display">
              {day}
            </div>
          ))}

          {/* Calendar Day cells */}
          {gridDays.map((cell, idx) => {
            if (!cell) {
              return <div key={`padding-${idx}`} className="bg-slate-50/50 min-h-[90px] print:min-h-[70px]" />;
            }

            const { dateStr, dayNum } = cell;

            // Find activities for this day
            const dayActivities = activities.filter(act => act.date === dateStr);

            // Check if public holiday or special day
            const publicHoliday = SIGNIFICANT_DAYS[dateStr];

            // Check if family birthday
            const shortDateStr = dateStr.slice(5); // MM-DD
            const birthdayMsg = FAMILY_BIRTHDAYS[shortDateStr];

            const isWeekend = idx % 7 === 5 || idx % 7 === 6;

            return (
              <div 
                key={dateStr} 
                className={`bg-white p-2 min-h-[110px] print:min-h-[85px] flex flex-col justify-between border-r border-b border-slate-200/60 last:border-0 ${
                  isWeekend ? 'bg-slate-50/40' : ''
                }`}
              >
                {/* Header of cell */}
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-black font-display ${
                    isWeekend ? 'text-indigo-600' : 'text-slate-800'
                  }`}>
                    {dayNum}
                  </span>
                  
                  {/* Indicators */}
                  <div className="flex gap-1">
                    {birthdayMsg && <span className="text-xs" title={birthdayMsg}>🎂</span>}
                    {publicHoliday && <span className="text-xs" title={publicHoliday}>🇨🇿</span>}
                  </div>
                </div>

                {/* Holidays and Birthday overlay text */}
                <div className="space-y-1 my-1">
                  {publicHoliday && (
                    <div className="text-[8px] font-extrabold text-violet-600 uppercase tracking-wide leading-tight bg-violet-50 p-1 rounded-sm border border-violet-100">
                      {publicHoliday.replace(' 🇨🇿', '')}
                    </div>
                  )}
                  {birthdayMsg && (
                    <div className="text-[8px] font-extrabold text-pink-600 uppercase tracking-wide leading-tight bg-pink-50 p-1 rounded-sm border border-pink-100">
                      🎂 {birthdayMsg.replace(' má narozeniny!', '').replace(' má narozeniny (6 let)!', '')}
                    </div>
                  )}
                </div>

                {/* Day's activity list */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-[70px] print:max-h-[60px]">
                  {dayActivities.map(act => {
                    // Match members involved
                    const involved = act.memberIds.map(id => members.find(m => m.id === id)).filter(Boolean) as Member[];

                    return (
                      <div 
                        key={act.id} 
                        className={`text-[8px] font-bold p-1 rounded-sm border leading-none flex flex-col gap-0.5 ${
                          act.type === 'work' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                          act.type === 'school' ? 'bg-indigo-50 border-indigo-100 text-indigo-800' :
                          act.type === 'club' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                          act.type === 'doctor' ? 'bg-red-50 border-red-100 text-red-800' :
                          act.type === 'birthday' ? 'bg-pink-50 border-pink-100 text-pink-800' :
                          act.type === 'holiday' ? 'bg-violet-50 border-violet-100 text-violet-800' :
                          'bg-slate-50 border-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold font-mono text-[7px] opacity-85 shrink-0 mr-1">{act.startTime}</span>
                          <span className="truncate flex-1 font-black uppercase tracking-tight text-[7.5px]">{act.title}</span>
                        </div>
                        {involved.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5 justify-end">
                            {involved.map(m => (
                              <span 
                                key={m.id} 
                                className={`px-1 rounded-xs font-black text-[6px] text-white ${m.bgClass}`}
                                title={m.name}
                              >
                                {m.name.split(' ')[0][0]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
