import React, { useState, useEffect } from 'react';
import { Member, MedicationLog, MedicationHistoryEntry } from '../types';
import { 
  Pill, 
  PlusCircle, 
  History, 
  User, 
  Calendar, 
  Clock, 
  Trash2, 
  Lock, 
  Unlock, 
  AlertCircle, 
  Check, 
  HeartPulse,
  ChevronRight,
  ShieldAlert,
  Info,
  Bell,
  BellRing,
  BellOff,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MedicationViewProps {
  members: Member[];
  medications: MedicationLog[];
  onAddMedication: (med: Omit<MedicationLog, 'id' | 'lastGiven' | 'givenBy' | 'history'>) => void;
  onGiveMedication: (medId: string, parentId: string, dosage: string, note?: string) => void;
  onDeleteMedication: (medId: string) => void;
  onUpdateMedication: (medId: string, updates: Partial<MedicationLog>) => void;
}

export default function MedicationView({
  members,
  medications,
  onAddMedication,
  onGiveMedication,
  onDeleteMedication,
  onUpdateMedication
}: MedicationViewProps) {
  
  // Security parent mode states
  const [isParentVerified, setIsParentVerified] = useState<boolean>(() => {
    return localStorage.getItem('parent_medication_verified') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>(
    members.find(m => m.role === 'manzel' || m.role === 'manzelka')?.id || 'member-1'
  );
  const [pinError, setPinError] = useState('');

  // Medication form states
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [newChildId, setNewChildId] = useState<string>(
    members.find(m => m.role === 'dite1' || m.role === 'dite2')?.id || 'member-3'
  );
  const [newName, setNewName] = useState('');
  const [newIllness, setNewIllness] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newIntervalHours, setNewIntervalHours] = useState<number>(8);
  const [newRemindersEnabled, setNewRemindersEnabled] = useState<boolean>(true);

  // Browser notification permission state
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  // Track already notified doses to avoid spamming
  const [notifiedDoses, setNotifiedDoses] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('family_notified_doses');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const saveNotifiedDose = (doseKey: string) => {
    setNotifiedDoses(prev => {
      const updated = { ...prev, [doseKey]: true };
      localStorage.setItem('family_notified_doses', JSON.stringify(updated));
      return updated;
    });
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          new Notification('Upozornění aktivována! 🔔', {
            body: 'Nyní budete dostávat automatická připomenutí léků pro vaše děti.',
            icon: '/favicon.ico'
          });
        }
      } catch (err) {
        console.error('Request notification permission failed', err);
      }
    }
  };

  // Double beep alarm sound using Web Audio API
  const playAlertSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playBeep = (delay: number, freq: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };
      
      playBeep(0, 659.25, 0.15); // E5
      playBeep(0.25, 659.25, 0.15); // E5
    } catch (e) {
      console.warn('Web Audio beep error:', e);
    }
  };

  // Helper to compute countdown and overdue information
  const getNextDoseInfo = (med: MedicationLog) => {
    if (!med.lastGiven || !med.intervalHours) return null;
    
    const lastGivenTime = new Date(med.lastGiven).getTime();
    const nextDoseTime = lastGivenTime + med.intervalHours * 3600 * 1000;
    const now = Date.now();
    const diffMs = nextDoseTime - now;
    const diffMins = Math.round(diffMs / 60000);
    
    const formattedNextTime = new Date(nextDoseTime).toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const formattedNextDate = new Date(nextDoseTime).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short'
    });

    const isOverdue = diffMs < 0;
    const absDiffMins = Math.abs(diffMins);
    const absDiffHours = Math.floor(absDiffMins / 60);
    const remainingMins = absDiffMins % 60;

    let relativeText = '';
    if (isOverdue) {
      if (absDiffMins < 60) {
        relativeText = `Mělo být podáno před ${absDiffMins} min`;
      } else {
        relativeText = `Zpoždění o ${absDiffHours} hod ${remainingMins} min`;
      }
    } else {
      if (absDiffMins < 60) {
        relativeText = `Za ${absDiffMins} minut`;
      } else {
        relativeText = `Za ${absDiffHours} hod ${remainingMins} min`;
      }
    }

    return {
      nextDoseTime,
      formattedNextTime,
      formattedNextDate,
      isOverdue,
      relativeText,
      diffMins
    };
  };

  // Background check for all medications with active reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      
      medications.forEach(med => {
        if (!med.remindersEnabled || !med.intervalHours || !med.lastGiven) return;
        
        const nextDueTime = new Date(med.lastGiven).getTime() + med.intervalHours * 3600 * 1000;
        
        // If overdue
        if (now >= nextDueTime) {
          const doseKey = `${med.id}-${med.lastGiven}`;
          
          if (!notifiedDoses[doseKey]) {
            const child = members.find(m => m.id === med.childId);
            const childName = child?.name || 'Dítě';
            const childAvatar = child?.avatar || '👶';
            
            const title = `⏰ Čas na lék: ${med.name} pro ${childName}`;
            const body = `${childAvatar} ${childName} má dostat lék ${med.name} (${med.dosage}). Interval ${med.intervalHours} hod. vypršel.`;
            
            // 1. Browser Notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(title, {
                  body: body,
                  tag: med.id,
                  icon: '/favicon.ico'
                });
              } catch (err) {
                console.error('Failed to show standard notification', err);
              }
            }
            
            // 2. Play Audio Alert
            playAlertSound();
            
            // 3. Dispatch global toast notification
            const event = new CustomEvent('family_notification', { 
              detail: `⏰ ČAS NA LÉK: ${childName} má dostat ${med.name} (${med.dosage})!` 
            });
            window.dispatchEvent(event);
            
            // 4. Mark as notified
            saveNotifiedDose(doseKey);
          }
        }
      });
    };
    
    checkReminders();
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [medications, members, notifiedDoses]);

  const handleToggleCardReminder = (medId: string, currentVal: boolean) => {
    onUpdateMedication(medId, { remindersEnabled: !currentVal });
  };

  const handleUpdateCardInterval = (medId: string, hours: number) => {
    onUpdateMedication(medId, { intervalHours: hours });
  };

  // Give medicine states (keyed by medication ID)
  const [giveDosage, setGiveDosage] = useState<Record<string, string>>({});
  const [giveNote, setGiveNote] = useState<Record<string, string>>({});
  const [activeGiveId, setActiveGiveId] = useState<string | null>(null);

  // Filter child members
  const children = members.filter(m => m.role === 'dite1' || m.role === 'dite2');
  const parents = members.filter(m => m.role === 'manzel' || m.role === 'manzelka');

  const handleVerifyParent = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN is 1234 or any click if they choose (let's use 1234 as a realistic, easy lock)
    if (pinInput === '1234') {
      setIsParentVerified(true);
      setPinError('');
      localStorage.setItem('parent_medication_verified', 'true');
    } else {
      setPinError('Nesprávný PIN kód. Zkuste to znovu (nápověda: 1234).');
    }
  };

  const handleLogoutParent = () => {
    setIsParentVerified(false);
    setPinInput('');
    localStorage.removeItem('parent_medication_verified');
  };

  const handleAddMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newIllness.trim() || !newDosage.trim()) return;

    onAddMedication({
      childId: newChildId,
      name: newName.trim(),
      illness: newIllness.trim(),
      dosage: newDosage.trim(),
      notes: newNotes.trim() || undefined,
      intervalHours: newRemindersEnabled ? newIntervalHours : undefined,
      remindersEnabled: newRemindersEnabled
    });

    // Reset
    setNewName('');
    setNewIllness('');
    setNewDosage('');
    setNewNotes('');
    setNewIntervalHours(8);
    setNewRemindersEnabled(true);
    setIsAddingMed(false);
  };

  const handleGiveMedSubmit = (medId: string) => {
    const med = medications.find(m => m.id === medId);
    if (!med) return;

    const dosage = giveDosage[medId]?.trim() || med.dosage;
    const note = giveNote[medId]?.trim();

    onGiveMedication(medId, selectedParentId, dosage, note);
    
    // Clear give state
    setGiveDosage(prev => ({ ...prev, [medId]: '' }));
    setGiveNote(prev => ({ ...prev, [medId]: '' }));
    setActiveGiveId(null);
  };

  const getChildDetails = (id: string) => {
    return members.find(m => m.id === id);
  };

  const getParentDetails = (id: string) => {
    return members.find(m => m.id === id);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Nikdy';
    const date = new Date(dateStr);
    return date.toLocaleString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get relative time from now
  const getRelativeTime = (dateStr: string) => {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'před chvílí';
    if (diffMins < 60) {
      if (diffMins === 1) return 'před 1 minutou';
      if (diffMins < 5) return `před ${diffMins} minutami`;
      return `před ${diffMins} minutami`;
    }
    if (diffHours < 24) {
      if (diffHours === 1) return 'před 1 hodinou';
      if (diffHours < 5) return `před ${diffHours} hodinami`;
      return `před ${diffHours} hodinami`;
    }
    const days = Math.floor(diffHours / 24);
    if (days === 1) return 'včera';
    return `před ${days} dny`;
  };

  // Get all history logs across all medications for global audit
  const globalHistory: { entry: MedicationHistoryEntry; medName: string; childName: string; childAvatar: string }[] = [];
  medications.forEach(med => {
    const child = getChildDetails(med.childId);
    med.history.forEach(entry => {
      globalHistory.push({
        entry,
        medName: med.name,
        childName: child?.name || 'Dítě',
        childAvatar: child?.avatar || '👶'
      });
    });
  });

  // Sort global history by time descending
  globalHistory.sort((a, b) => new Date(b.entry.time).getTime() - new Date(a.entry.time).getTime());

  if (!isParentVerified) {
    return (
      <div className="max-w-md mx-auto my-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6 text-center"
        >
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600 border border-indigo-100 shadow-3xs">
            <Lock className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-indigo-950 font-display">Zabezpečená zóna rodičů 🔒</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Vstup do sekce léků je povolen pouze dospělým (Honza nebo Marie). Tím zabráníme tomu, aby děti omylem upravovaly dávkování nebo mazaly záznamy o lécích.
            </p>
          </div>

          <form onSubmit={handleVerifyParent} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block text-left">Přednastavený rodičovský PIN</label>
              <input
                type="password"
                required
                maxLength={4}
                placeholder="Zadejte PIN (výchozí: 1234)"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ''));
                  setPinError('');
                }}
                className="w-full text-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-lg font-mono tracking-widest focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            {pinError && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {pinError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-md shadow-indigo-500/10 transition"
            >
              Potvrdit a vstoupit
            </button>
          </form>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
            Bezpečnost na prvním místě
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full uppercase tracking-wider">
              Pouze pro rodiče
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 text-xs font-semibold flex items-center gap-1">
              <Unlock className="w-3 h-3 text-emerald-500" /> Přihlášen rodič
            </span>
          </div>
          <h2 className="text-2xl font-black text-indigo-950 font-display flex items-center gap-2.5">
            <Pill className="w-7 h-7 text-rose-500" />
            Léky a zdravotní stav dětí 🩺
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Zde můžete zaznamenat, jaké léky vaše děti aktuálně berou, k jaké nemoci se vážou a v kolik hodin měly poslední dávku. Díky tomu budete mít oba přehled a lék nikdy nepodáte dvakrát.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          {/* Parent selection dropdown */}
          <div className="space-y-1 w-full md:w-auto">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Podávám jako rodič:</label>
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/20"
            >
              {parents.map(p => (
                <option key={p.id} value={p.id}>
                  {p.avatar} {p.name.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full md:w-auto pt-5 md:pt-0">
            <button
              onClick={() => setIsAddingMed(!isAddingMed)}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-2xl shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              Zapsat lék
            </button>
            <button
              onClick={handleLogoutParent}
              className="text-[10px] text-slate-400 hover:text-slate-600 text-center font-bold uppercase tracking-wider underline mt-1"
            >
              Uzamknout sekci
            </button>
          </div>
        </div>
      </div>

      {/* Browser Notification Setup Banner */}
      {notificationPermission !== 'granted' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-amber-500/10 border border-amber-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center text-xl shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Aktivujte si automatické notifikace v prohlížeči 🔔</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Aplikace vás včas upozorní zvukem a zprávou na ploše, když vyprší nastavený interval a je čas podat dítěti další dávku léku.
              </p>
            </div>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition shrink-0 cursor-pointer"
          >
            Povolit upozornění
          </button>
        </motion.div>
      )}

      {/* Form to Add Medication */}
      <AnimatePresence>
        {isAddingMed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddMedSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Pill className="w-5 h-5 text-rose-500" />
                Nový záznam o lécích dítěte
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Child Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kterému dítěti?</label>
                  <select
                    value={newChildId}
                    onChange={(e) => setNewChildId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    {children.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.avatar} {c.name} (Věk: {c.age} let)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medication Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Název léku / sirupu</label>
                  <input
                    type="text"
                    required
                    placeholder="Např. Nurofen jahoda sirup, Aerius kapky, Paralen"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                {/* Illness/Symptoms */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Co děcku je? (Nemoc / Příznaky)</label>
                  <input
                    type="text"
                    required
                    placeholder="Např. Horečka a zuby, Kašel, Silná alergie"
                    value={newIllness}
                    onChange={(e) => setNewIllness(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                {/* Dosage */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Standardní dávkování</label>
                  <input
                    type="text"
                    required
                    placeholder="Např. 5 ml, 1 tableta, 5 kapek"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Poznámky, časy a pokyny lékaře</label>
                  <input
                    type="text"
                    placeholder="Např. Podávat max 3x denně po 8 hodinách. Ideálně po jídle."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                {/* Reminders Toggle */}
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Připomenutí (Notifikace)</label>
                  <button
                    type="button"
                    onClick={() => setNewRemindersEnabled(!newRemindersEnabled)}
                    className={`w-full flex items-center justify-between border rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${
                      newRemindersEnabled 
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' 
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {newRemindersEnabled ? <Bell className="w-4 h-4 text-emerald-600" /> : <BellOff className="w-4 h-4" />}
                      {newRemindersEnabled ? 'Aktivní připomenutí' : 'Bez připomenutí'}
                    </span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-white border">
                      {newRemindersEnabled ? 'ANO' : 'NE'}
                    </span>
                  </button>
                </div>

                {/* Reminder Interval */}
                {newRemindersEnabled && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Interval podávání</label>
                    <select
                      value={newIntervalHours}
                      onChange={(e) => setNewIntervalHours(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    >
                      <option value={4}>⏱️ Každé 4 hodiny (střídání léků, např. Paralen a Nurofen)</option>
                      <option value={6}>⏱️ Každých 6 hodin (4x denně, např. některé sirupy/antibiotika)</option>
                      <option value={8}>⏱️ Každých 8 hodin (3x denně, standardní interval pro teplotu)</option>
                      <option value={12}>⏱️ Každých 12 hodin (2x denně, ráno a večer)</option>
                      <option value={24}>⏱️ Každých 24 hodin (1x denně, např. protialergické sirupy)</option>
                    </select>
                  </div>
                )}

              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMed(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-600 transition"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs uppercase tracking-wider text-white shadow-sm transition"
                >
                  Uložit lék
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Medications Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 pl-1">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            Aktuálně podávané léky dětí ({medications.length})
          </h3>

          {medications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-700">Skvělé zprávy, žádné léky se aktuálně nepodávají! 🎉</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Děcka jsou zdravá jako rybičky. Pokud někdo onemocní, zapište jeho medikaci nahoře.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map((med) => {
                const child = getChildDetails(med.childId);
                const lastGivenParent = getParentDetails(med.givenBy);
                const isGivingThis = activeGiveId === med.id;

                return (
                  <div 
                    key={med.id}
                    className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-100 transition shadow-2xs overflow-hidden"
                  >
                    <div className="p-6 space-y-4">
                      
                      {/* Top Row: Child + Medication Name */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl ${child?.lightBgClass || 'bg-slate-50'} border ${child?.borderClass || 'border-slate-100'} flex items-center justify-center text-2xl select-none`}>
                            {child?.avatar || '👶'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900">{child?.name}</span>
                              <span className="text-[10px] font-bold text-slate-400">({child?.age} let)</span>
                            </div>
                            <span className="text-sm font-bold text-indigo-950 block mt-0.5">
                              💊 {med.name}
                            </span>
                          </div>
                        </div>

                        {/* Badges and Delete */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                            🤒 {med.illness}
                          </span>
                          <button
                            onClick={() => onDeleteMedication(med.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Odstranit lék ze seznamu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Middle Grid info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Standardní dávka</span>
                          <span className="font-bold text-slate-800 text-sm">{med.dosage}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Naposledy podáno</span>
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <span>
                              {med.lastGiven ? (
                                <>
                                  {formatDate(med.lastGiven)}{' '}
                                  <span className="text-rose-500 font-extrabold">({getRelativeTime(med.lastGiven)})</span>
                                </>
                              ) : (
                                <span className="text-slate-400 italic">Zatím nebylo podáno</span>
                              )}
                            </span>
                          </div>
                          {lastGivenParent && (
                            <span className="text-[10px] text-slate-500 block mt-0.5 font-semibold">
                              Podal(a): {lastGivenParent.avatar} {lastGivenParent.name.split(' ')[0]}
                            </span>
                          )}
                        </div>

                        {med.notes && (
                          <div className="sm:col-span-2 border-t border-slate-100 pt-2 flex items-start gap-1.5 text-slate-500">
                            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>Pokyny k podávání:</strong> {med.notes}
                            </span>
                          </div>
                        )}

                        {/* Reminders & Next Dose Block */}
                        <div className="sm:col-span-2 border-t border-slate-100 pt-3 mt-1 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upozornění:</span>
                              <button
                                onClick={() => handleToggleCardReminder(med.id, !!med.remindersEnabled)}
                                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                                  med.remindersEnabled 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100' 
                                    : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                {med.remindersEnabled ? (
                                  <>
                                    <Bell className="w-3 h-3 text-emerald-600 animate-pulse" /> Aktivní
                                  </>
                                ) : (
                                  <>
                                    <BellOff className="w-3 h-3" /> Vypnuto
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Interval Editor */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interval:</span>
                              <select
                                value={med.intervalHours || 8}
                                onChange={(e) => handleUpdateCardInterval(med.id, Number(e.target.value))}
                                className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                              >
                                <option value={4}>4 hod. (střídavě)</option>
                                <option value={6}>6 hod. (4x denně)</option>
                                <option value={8}>8 hod. (3x denně)</option>
                                <option value={12}>12 hod. (2x denně)</option>
                                <option value={24}>24 hod. (1x denně)</option>
                              </select>
                            </div>
                          </div>

                          {/* Countdown / Overdue Display */}
                          {med.remindersEnabled && med.intervalHours && med.lastGiven && (() => {
                            const info = getNextDoseInfo(med);
                            if (!info) return null;
                            return (
                              <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 transition ${
                                info.isOverdue 
                                  ? 'bg-rose-50 border-rose-100 text-rose-800' 
                                  : 'bg-indigo-50/40 border-indigo-100/60 text-indigo-950'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <Clock className={`w-4 h-4 ${info.isOverdue ? 'text-rose-500 animate-pulse' : 'text-indigo-500'}`} />
                                  <div className="text-xs">
                                    <span className="font-extrabold">{info.relativeText}</span>
                                    <span className="text-[10px] block opacity-75">
                                      Další dávka má být podána v <strong className="font-bold">{info.formattedNextTime}</strong> ({info.formattedNextDate})
                                    </span>
                                  </div>
                                </div>
                                {info.isOverdue && (
                                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-black text-[9px] uppercase tracking-wider animate-pulse shrink-0">
                                    MÁ ZPOŽDĚNÍ! ⚠️
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Quick "Give Medication" section */}
                      <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {!isGivingThis ? (
                          <>
                            <div className="text-xs text-slate-400 italic">
                              Podali jste zrovna tento lék? Zaznamenejte to pro druhého rodiče.
                            </div>
                            <button
                              onClick={() => {
                                setGiveDosage(prev => ({ ...prev, [med.id]: med.dosage }));
                                setActiveGiveId(med.id);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-xs transition shrink-0"
                            >
                              ✓ Zapsat podání teď
                            </button>
                          </>
                        ) : (
                          <div className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-3">
                            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                              Zapsat podání léku ({med.name})
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Dosage input */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Množství / Dávka</label>
                                <input
                                  type="text"
                                  value={giveDosage[med.id] || ''}
                                  onChange={(e) => setGiveDosage(prev => ({ ...prev, [med.id]: e.target.value }))}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                                />
                              </div>

                              {/* Custom note */}
                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Poznámka (např. Teplota 38.5, usnul)</label>
                                <input
                                  type="text"
                                  placeholder="Volitelně, jak se dítě cítí..."
                                  value={giveNote[med.id] || ''}
                                  onChange={(e) => setGiveNote(prev => ({ ...prev, [med.id]: e.target.value }))}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setActiveGiveId(null)}
                                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-bold text-[10px] uppercase tracking-wider transition"
                              >
                                Zrušit
                              </button>
                              <button
                                onClick={() => handleGiveMedSubmit(med.id)}
                                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider transition"
                              >
                                Potvrdit podání
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Medication Log Audit History (Timeline) */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 pl-1">
            <History className="w-4 h-4 text-indigo-500" />
            Historie podání léků (Timeline)
          </h3>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 max-h-[550px] overflow-y-auto no-scrollbar">
            {globalHistory.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 italic">
                Zatím nebyly zapsány žádné podané dávky léků.
              </div>
            ) : (
              <div className="relative border-l-2 border-indigo-100 pl-4 ml-2 space-y-6">
                {globalHistory.map((item, index) => {
                  const parent = getParentDetails(item.entry.givenBy);
                  return (
                    <div key={item.entry.id} className="relative space-y-1">
                      {/* Timeline dot */}
                      <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      </span>

                      {/* Header log entry */}
                      <div className="flex flex-wrap justify-between items-baseline gap-2">
                        <span className="text-xs font-black text-slate-900 leading-none">
                          {item.childAvatar} {item.childName} – {item.medName}
                        </span>
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">
                          {getRelativeTime(item.entry.time)}
                        </span>
                      </div>

                      {/* Dosage info */}
                      <p className="text-xs text-slate-600">
                        Podána dávka: <strong className="text-slate-800">{item.entry.dosage}</strong>
                      </p>

                      {/* Who gave it */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                        <span>Osoba:</span>
                        <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md">
                          {parent?.avatar || '👤'} {parent?.name.split(' ')[0] || 'Rodič'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span>{new Date(item.entry.time).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Note if any */}
                      {item.entry.note && (
                        <p className="text-[11px] bg-indigo-50/50 border border-indigo-100/30 text-indigo-950 p-2 rounded-xl italic">
                          "{item.entry.note}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Practical advice box */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 space-y-2.5">
            <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              Rodinný Tip pro rodiče
            </h4>
            <p className="text-xs text-indigo-900 leading-relaxed">
              Máte doma více léků se stejnou účinnou látkou? Zkontrolujte složení (např. ibuprofen či paracetamol) a střídejte je podle pokynů pediatra. Zde zaznamenané časy vám pomohou dodržet bezpečný odstup minimálně 6 hodin mezi stejnými skupinami.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
