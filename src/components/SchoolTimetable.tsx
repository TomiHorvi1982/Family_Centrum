import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Printer, Edit2, Check, X, RefreshCw, Info } from 'lucide-react';

interface TimetableData {
  childId: 'tomik' | 'eliska';
  childName: string;
  grade: string;
  school: string;
  schedule: Record<string, string[]>; // Day -> array of 6 subjects
}

const DEFAULT_TIMETABLES: Record<'tomik' | 'eliska', TimetableData> = {
  tomik: {
    childId: 'tomik',
    childName: 'Tomík',
    grade: '2. třída',
    school: 'ZŠ Čs. armády, Bohumín',
    schedule: {
      'Pondělí': ['Český jazyk', 'Matematika', 'Český jazyk', 'Prvouka', 'Hudební v.'],
      'Úterý': ['Český jazyk', 'Matematika', 'Tělesná v.', 'Prvouka', 'Výtvarná v.'],
      'Středa': ['Český jazyk', 'Matematika', 'Český jazyk', 'Prvouka', ''],
      'Čtvrtek': ['Český jazyk', 'Matematika', 'Tělesná v.', 'Pracovní č.', ''],
      'Pátek': ['Český jazyk', 'Matematika', 'Český jazyk', 'Hudební v.', '']
    }
  },
  eliska: {
    childId: 'eliska',
    childName: 'Eliška',
    grade: '5. třída',
    school: 'ZŠ Čs. armády, Bohumín',
    schedule: {
      'Pondělí': ['Český jazyk', 'Matematika', 'Anglický jaz.', 'Vlastivěda', 'Tělesná v.'],
      'Úterý': ['Český jazyk', 'Matematika', 'Přírodověda', 'Hudební v.', 'Český jazyk', 'Informatika'],
      'Středa': ['Český jazyk', 'Matematika', 'Anglický jaz.', 'Vlastivěda', 'Tělesná v.', ''],
      'Čtvrtek': ['Český jazyk', 'Matematika', 'Anglický jaz.', 'Výtvarná v.', 'Pracovní č.', ''],
      'Pátek': ['Český jazyk', 'Matematika', 'Přírodověda', 'Český jazyk', 'Vlastivěda', '']
    }
  }
};

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Český jazyk': { bg: 'bg-indigo-50 hover:bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  'Matematika': { bg: 'bg-rose-50 hover:bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  'Prvouka': { bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  'Vlastivěda': { bg: 'bg-teal-50 hover:bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  'Přírodověda': { bg: 'bg-green-50 hover:bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  'Anglický jaz.': { bg: 'bg-amber-50 hover:bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  'Tělesná v.': { bg: 'bg-orange-50 hover:bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  'Hudební v.': { bg: 'bg-purple-50 hover:bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  'Výtvarná v.': { bg: 'bg-pink-50 hover:bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  'Pracovní č.': { bg: 'bg-cyan-50 hover:bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  'Informatika': { bg: 'bg-sky-50 hover:bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
  '': { bg: 'bg-slate-50/50 hover:bg-slate-50', text: 'text-slate-400', border: 'border-slate-100' }
};

const SUBJECT_LIST = [
  'Český jazyk',
  'Matematika',
  'Prvouka',
  'Vlastivěda',
  'Přírodověda',
  'Anglický jaz.',
  'Tělesná v.',
  'Hudební v.',
  'Výtvarná v.',
  'Pracovní č.',
  'Informatika',
  'Volná hodina / Volno'
];

export default function SchoolTimetable() {
  const [activeChild, setActiveChild] = useState<'tomik' | 'eliska'>('tomik');
  const [timetables, setTimetables] = useState<Record<'tomik' | 'eliska', TimetableData>>(DEFAULT_TIMETABLES);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: string; index: number } | null>(null);
  const [editSubjectValue, setEditSubjectValue] = useState('');

  // Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('school_timetables');
    if (stored) {
      try {
        setTimetables(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored timetables', e);
      }
    }
  }, []);

  const saveTimetables = (newTimetables: Record<'tomik' | 'eliska', TimetableData>) => {
    setTimetables(newTimetables);
    localStorage.setItem('school_timetables', JSON.stringify(newTimetables));
  };

  const handleCellClick = (day: string, index: number, currentValue: string) => {
    if (!isEditing) return;
    setSelectedCell({ day, index });
    setEditSubjectValue(currentValue);
  };

  const handleSaveCell = (subjectName: string) => {
    if (!selectedCell) return;
    const { day, index } = selectedCell;
    const actualSubject = subjectName === 'Volná hodina / Volno' ? '' : subjectName;
    
    const updated = {
      ...timetables,
      [activeChild]: {
        ...timetables[activeChild],
        schedule: {
          ...timetables[activeChild].schedule,
          [day]: timetables[activeChild].schedule[day].map((sub, idx) => idx === index ? actualSubject : sub)
        }
      }
    };

    saveTimetables(updated);
    setSelectedCell(null);
  };

  const handleReset = () => {
    if (confirm('Opravdu chcete obnovit rozvrh na výchozí hodnoty pro ZŠ ČSA Bohumín?')) {
      saveTimetables(DEFAULT_TIMETABLES);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  const currentTimetable = timetables[activeChild];
  const days = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek'];
  const maxLessons = activeChild === 'tomik' ? 5 : 6;
  const lessonTimes = [
    { start: '08:00', end: '08:45' },
    { start: '08:55', end: '09:40' },
    { start: '10:00', end: '10:45' },
    { start: '10:55', end: '11:40' },
    { start: '11:50', end: '12:35' },
    { start: '12:45', end: '13:30' }
  ];

  const getSubjectMeta = (sub: string) => {
    return SUBJECT_COLORS[sub] || { bg: 'bg-blue-50/75 hover:bg-blue-50', text: 'text-slate-800', border: 'border-slate-200' };
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION (HIDDEN IN PRINT) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 no-print">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-950 uppercase font-display flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            Rozvrhy hodin dětí
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Sledujte a upravujte rozvrh hodin pro Tomíka (2. třída) a Elišku (5. třída) na <strong className="text-indigo-950">ZŠ Čs. armády Bohumín</strong>.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition border ${
              isEditing 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-3xs'
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-4 h-4" />
                Hotovo
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                Upravit rozvrh
              </>
            )}
          </button>
          
          <button
            onClick={triggerPrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-3xs hover:shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            Vytisknout
          </button>

          <button
            onClick={handleReset}
            title="Obnovit výchozí rozvrh"
            className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-2xl bg-white text-slate-500 hover:text-slate-800 shadow-3xs transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KIDS TABS (HIDDEN IN PRINT) */}
      <div className="flex gap-2 border-b border-slate-200 pb-1 no-print">
        <button
          onClick={() => { setActiveChild('tomik'); setSelectedCell(null); }}
          className={`px-5 py-3 rounded-t-2xl text-xs font-black uppercase tracking-wider transition ${
            activeChild === 'tomik'
              ? 'border-b-4 border-indigo-600 text-indigo-950 bg-indigo-50/40'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          👦 Tomík (2. třída)
        </button>
        <button
          onClick={() => { setActiveChild('eliska'); setSelectedCell(null); }}
          className={`px-5 py-3 rounded-t-2xl text-xs font-black uppercase tracking-wider transition ${
            activeChild === 'eliska'
              ? 'border-b-4 border-indigo-600 text-indigo-950 bg-indigo-50/40'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          👧 Eliška (5. třída)
        </button>
      </div>

      {/* EDITING MODE BANNER (HIDDEN IN PRINT) */}
      {isEditing && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 items-center text-xs text-emerald-800 no-print animate-fade-in">
          <Info className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-medium">
            <strong>Režim úprav aktivní:</strong> Klikněte na jakoukoliv buňku v rozvrhu níže a vyberte nebo napište předmět pro změnu.
          </p>
        </div>
      )}

      {/* MAIN TIMETABLE GRID FOR SCREEN AND PRINT */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        
        {/* Printable Header - Visible ONLY in print */}
        <div className="only-print text-center pb-6 mb-6 border-b-2 border-slate-300">
          <h1 className="text-3xl font-black uppercase tracking-wider text-slate-900">ROZVRH HODIN</h1>
          <p className="text-lg font-bold text-slate-700 mt-1">
            {currentTimetable.childName} — {currentTimetable.grade} ({currentTimetable.school})
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Vytištěno z Rodinného Plánovače</p>
        </div>

        {/* The Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {/* Day column header */}
                <th className="p-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-[120px]">
                  Den
                </th>
                {/* Lesson headers */}
                {Array.from({ length: maxLessons }).map((_, i) => (
                  <th key={i} className="p-3 text-center border-b border-slate-200 min-w-[120px]">
                    <div className="text-xs font-black text-indigo-950 font-display">
                      {i + 1}. hodina
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {lessonTimes[i].start} - {lessonTimes[i].end}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const dayLessons = currentTimetable.schedule[day] || [];
                return (
                  <tr key={day} className="border-b border-slate-100 last:border-0">
                    {/* Day label */}
                    <td className="p-3 text-sm font-black text-slate-700 font-display bg-slate-50/50 w-[120px]">
                      {day}
                    </td>
                    {/* Lesson cells */}
                    {Array.from({ length: maxLessons }).map((_, idx) => {
                      const subject = dayLessons[idx] || '';
                      const meta = getSubjectMeta(subject);
                      const isSelected = selectedCell?.day === day && selectedCell?.index === idx;

                      return (
                        <td
                          key={idx}
                          onClick={() => handleCellClick(day, idx, subject)}
                          className={`p-2 border-l border-slate-100 text-center transition-all duration-200 relative ${
                            isEditing ? 'cursor-pointer hover:ring-2 hover:ring-indigo-500/30' : ''
                          } ${isSelected ? 'ring-4 ring-indigo-500/25 bg-indigo-50/30' : ''}`}
                        >
                          <div className={`py-4 px-2 rounded-2xl border ${meta.bg} ${meta.border} transition-all duration-300 h-full flex flex-col justify-center min-h-[70px]`}>
                            <span className={`text-xs font-black uppercase tracking-tight leading-snug ${meta.text}`}>
                              {subject || '—'}
                            </span>
                            {isEditing && (
                              <span className="absolute top-1 right-1 opacity-0 hover:opacity-100 group-hover:opacity-100 text-[9px] text-slate-400 font-bold bg-white/85 px-1 rounded">
                                Upravit
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Timetable Notes / Legend */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 font-medium">
          <span className="font-bold text-slate-600">Předměty:</span>
          <div className="flex flex-wrap gap-2">
            {Object.keys(SUBJECT_COLORS).map((sub) => {
              if (!sub) return null;
              const meta = SUBJECT_COLORS[sub];
              return (
                <span key={sub} className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${meta.bg} ${meta.border} ${meta.text}`}>
                  {sub}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* QUICK SUBJECT SELECT MODAL / POPOVER FOR EDITING */}
      {selectedCell && (
        <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-2xs flex items-center justify-center p-4 z-50 no-print animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-indigo-950 text-base uppercase tracking-wider font-display">
                Změnit předmět
              </h3>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-slate-650 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Vyberte předmět pro {selectedCell.day}, {selectedCell.index + 1}. vyučovací hodinu:
            </p>

            {/* Quick list of preset subjects */}
            <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto p-1">
              {SUBJECT_LIST.map((subj) => {
                const isSelectedPreset = editSubjectValue === (subj === 'Volná hodina / Volno' ? '' : subj);
                return (
                  <button
                    key={subj}
                    onClick={() => {
                      const val = subj === 'Volná hodina / Volno' ? '' : subj;
                      setEditSubjectValue(val);
                      handleSaveCell(val);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-tight text-left transition border ${
                      isSelectedPreset
                        ? 'bg-indigo-600 text-white border-transparent'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {subj}
                  </button>
                );
              })}
            </div>

            {/* Custom subject manual input */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400">Vlastní název předmětu</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editSubjectValue}
                  onChange={(e) => setEditSubjectValue(e.target.value)}
                  placeholder="Např. Ekologie, Němčina..."
                  className="flex-1 text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={() => handleSaveCell(editSubjectValue)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-3xs"
                >
                  Uložit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
