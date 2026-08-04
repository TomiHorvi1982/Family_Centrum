import React, { useState, useEffect } from 'react';
import { Member, PocketMoneyTransaction } from '../types';
import { 
  PiggyBank, 
  Plus, 
  Calendar, 
  Trash2, 
  Coins, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PocketMoneyViewProps {
  members: Member[];
}

// Initial mock transactions for Pocket Money
const INITIAL_TRANSACTIONS: PocketMoneyTransaction[] = [
  {
    id: 'pm-tx-1',
    childId: 'member-3', // Matyáš
    type: 'credit',
    amount: 500,
    purpose: 'Pravidelné měsíční kapesné (Červenec)',
    date: '2026-07-01',
    recordedBy: 'member-1', // Tomáš
    notes: 'Kapesné posláno na začátku měsíce.'
  },
  {
    id: 'pm-tx-2',
    childId: 'member-3', // Matyáš
    type: 'debit',
    amount: 150,
    purpose: 'Kniha o vesmíru a dinosaurech',
    date: '2026-07-05',
    recordedBy: 'member-3', // Matyáš
    notes: 'Koupeno v knihkupectví v Bohumíně.'
  },
  {
    id: 'pm-tx-3',
    childId: 'member-3', // Matyáš
    type: 'credit',
    amount: 100,
    purpose: 'Odměna za posekanou trávu a pomoc na zahradě',
    date: '2026-07-12',
    recordedBy: 'member-2', // Veronika
    notes: 'Tráva byla posekaná perfektně, včetně okrajů!'
  },
  {
    id: 'pm-tx-4',
    childId: 'member-3', // Matyáš
    type: 'debit',
    amount: 60,
    purpose: 'Zmrzlina a kofola s kamarády na hřišti',
    date: '2026-07-14',
    recordedBy: 'member-3'
  },
  {
    id: 'pm-tx-5',
    childId: 'member-4', // Sofie
    type: 'credit',
    amount: 300,
    purpose: 'Pravidelné měsíční kapesné (Červenec)',
    date: '2026-07-01',
    recordedBy: 'member-2', // Veronika
    notes: 'Kapesné na hračky a pamlsky.'
  },
  {
    id: 'pm-tx-6',
    childId: 'member-4', // Sofie
    type: 'debit',
    amount: 120,
    purpose: 'Omalovánky a pastelky (Koh-i-noor)',
    date: '2026-07-08',
    recordedBy: 'member-4', // Sofie
    notes: 'Kreslíme obrázky pro babičku.'
  },
  {
    id: 'pm-tx-7',
    childId: 'member-4', // Sofie
    type: 'credit',
    amount: 50,
    purpose: 'Za statečnost u pana zubaře',
    date: '2026-07-15',
    recordedBy: 'member-1', // Tomáš
    notes: 'Sofinka ani nezaplakala při kontrole zoubků!'
  },
  {
    id: 'pm-tx-8',
    childId: 'member-4', // Sofie
    type: 'debit',
    amount: 40,
    purpose: 'Ovocné lízátko a žvýkačky v Hrušce',
    date: '2026-07-18',
    recordedBy: 'member-4'
  }
];

export default function PocketMoneyView({ members }: PocketMoneyViewProps) {
  const [transactions, setTransactions] = useState<PocketMoneyTransaction[]>([]);
  const [activeFormTab, setActiveFormTab] = useState<'parent' | 'child'>('parent');
  
  // Parent Form States
  const [parentChildId, setParentChildId] = useState<string>('');
  const [parentGiverId, setParentGiverId] = useState<string>('');
  const [parentAmount, setParentAmount] = useState<string>('');
  const [parentPurpose, setParentPurpose] = useState<string>('Pravidelné kapesné');
  const [parentCustomPurpose, setParentCustomPurpose] = useState<string>('');
  const [parentDate, setParentDate] = useState<string>('2026-07-20');
  const [parentNotes, setParentNotes] = useState<string>('');

  // Child Form States
  const [childId, setChildId] = useState<string>('');
  const [childAmount, setChildAmount] = useState<string>('');
  const [childPurpose, setChildPurpose] = useState<string>('Pamlsky / Sladkosti');
  const [childCustomPurpose, setChildCustomPurpose] = useState<string>('');
  const [childDate, setChildDate] = useState<string>('2026-07-20');
  const [childNotes, setChildNotes] = useState<string>('');

  // Filters
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Load and save localStorage
  useEffect(() => {
    const stored = localStorage.getItem('family_pocket_money');
    if (stored) {
      setTransactions(JSON.parse(stored));
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem('family_pocket_money', JSON.stringify(INITIAL_TRANSACTIONS));
    }
  }, []);

  // Filter out children and parents from family members
  const children = members.filter(m => m.role === 'dite1' || m.role === 'dite2' || (m.age !== undefined && m.age < 18));
  const parents = members.filter(m => m.role === 'manzel' || m.role === 'manzelka' || (m.age !== undefined && m.age >= 18));

  // Set default form values once members are loaded
  useEffect(() => {
    if (children.length > 0 && !parentChildId) {
      setParentChildId(children[0].id);
    }
    if (children.length > 0 && !childId) {
      setChildId(children[0].id);
    }
    if (parents.length > 0 && !parentGiverId) {
      setParentGiverId(parents[0].id);
    }
  }, [members, children, parents]);

  const saveTransactions = (updated: PocketMoneyTransaction[]) => {
    setTransactions(updated);
    localStorage.setItem('family_pocket_money', JSON.stringify(updated));
  };

  const triggerToast = (message: string) => {
    // We use window custom event to let App.tsx know, or we can just trigger native toast/feedback 
    // Since App.tsx has its own toast, let's create a local toast or fire a customized event
    const event = new CustomEvent('family_notification', { detail: message });
    window.dispatchEvent(event);
  };

  // Calculations for kids
  const getChildAccount = (cId: string) => {
    const childTx = transactions.filter(t => t.childId === cId);
    const totalGiven = childTx.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = childTx.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalGiven - totalSpent;
    return { balance, totalGiven, totalSpent };
  };

  // Add credit (parent mode)
  const handleAddCredit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(parentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Zadejte platnou částku vyšší než 0 Kč.');
      return;
    }

    const finalPurpose = parentPurpose === 'custom' ? parentCustomPurpose : parentPurpose;
    if (!finalPurpose.trim()) {
      alert('Zadejte účel nebo důvod připsání.');
      return;
    }

    const newTx: PocketMoneyTransaction = {
      id: `pm-tx-${Date.now()}`,
      childId: parentChildId,
      type: 'credit',
      amount: amountNum,
      purpose: finalPurpose,
      date: parentDate,
      recordedBy: parentGiverId,
      notes: parentNotes.trim() || undefined
    };

    const updated = [newTx, ...transactions];
    saveTransactions(updated);
    
    const childName = members.find(m => m.id === parentChildId)?.name || 'Dítě';
    triggerToast(`💰 Připsáno ${amountNum} Kč pro: ${childName}! ✓`);

    // Reset Form
    setParentAmount('');
    setParentCustomPurpose('');
    setParentNotes('');
  };

  // Add debit (child mode)
  const handleAddDebit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(childAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Zadejte platnou částku vyšší než 0 Kč.');
      return;
    }

    const finalPurpose = childPurpose === 'custom' ? childCustomPurpose : childPurpose;
    if (!finalPurpose.trim()) {
      alert('Zadejte, co jsi si koupil(a).');
      return;
    }

    // Check if child has enough balance (optional warning, or support overdraft / debt)
    const { balance } = getChildAccount(childId);
    if (balance < amountNum) {
      const confirmSpend = window.confirm(
        `Pozor! Nemáš dostatek naspořených peněz (máš jen ${balance} Kč, ale chceš utratit ${amountNum} Kč). Budeš mít u rodičů dluh. Chceš to přesto zapsat?`
      );
      if (!confirmSpend) return;
    }

    const newTx: PocketMoneyTransaction = {
      id: `pm-tx-${Date.now()}`,
      childId: childId,
      type: 'debit',
      amount: amountNum,
      purpose: finalPurpose,
      date: childDate,
      recordedBy: childId,
      notes: childNotes.trim() || undefined
    };

    const updated = [newTx, ...transactions];
    saveTransactions(updated);

    const childName = members.find(m => m.id === childId)?.name || 'Dítě';
    triggerToast(`💸 Utraceno ${amountNum} Kč zapsáno pro: ${childName}!`);

    // Reset Form
    setChildAmount('');
    setChildCustomPurpose('');
    setChildNotes('');
  };

  // Delete transaction
  const handleDeleteTransaction = (txId: string) => {
    if (window.confirm('Opravdu chcete smazat tento záznam o kapesném? Změní se tím aktuální zůstatek dítěte.')) {
      const updated = transactions.filter(t => t.id !== txId);
      saveTransactions(updated);
      triggerToast('Záznam o kapesném byl smazán.');
    }
  };

  // Predefined reasons for parents
  const PARENT_REASONS = [
    'Pravidelné kapesné',
    'Odměna za úklid pokojíčku',
    'Pomoc na zahradě / posekání trávy',
    'Za dobré známky ve škole',
    'Dárek / příspěvek',
    'Odměna za splněné povinnosti',
    'Za statečnost (u lékaře/zubaře)',
    'custom'
  ];

  // Predefined purposes for kids
  const CHILD_PURPOSES = [
    'Zmrzlina / Nanuk',
    'Sladkosti / Čokoláda / Brambůrky',
    'Hračka / Plyšák',
    'Lego / Kartičky / Sběratelské předměty',
    'Kniha / Časopis',
    'Lístek do kina / na bus / lístky',
    'Občerstvení / pití venku',
    'Dárek pro mamku/taťku/ségru/bráchu',
    'custom'
  ];

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesChild = selectedChildFilter === 'all' || t.childId === selectedChildFilter;
    const matchesType = selectedTypeFilter === 'all' || t.type === selectedTypeFilter;
    return matchesChild && matchesType;
  });

  // Reset pocket money to defaults
  const handleResetPocketMoney = () => {
    if (window.confirm('Opravdu chcete vyčistit celou historii kapesného a vrátit ukázková data?')) {
      saveTransactions(INITIAL_TRANSACTIONS);
      triggerToast('Historie kapesného byla resetována.');
    }
  };

  // Helper for member lookup
  const getMember = (id: string) => {
    return members.find(m => m.id === id) || {
      name: 'Neznámý',
      avatar: '👤',
      bgClass: 'bg-slate-500',
      textClass: 'text-slate-700',
      lightBgClass: 'bg-slate-50'
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Intro section */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-emerald-500/10 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute right-6 top-6 opacity-10 pointer-events-none select-none">
          <PiggyBank className="w-32 h-32 text-indigo-950 dark:text-white" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🪙</span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Dětské kapesné a kasička
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Skvělý nástroj pro rozvoj finanční gramotnosti našich dětí. Rodiče zde připisují peníze (kapesné, odměny za pomoc) a děti si samy zapisují, za co své úspory utratily. Vždy tak vidí, kolik peněz jim u rodičů "v úschově" ještě zbývá!
            </p>
          </div>
          <button
            onClick={handleResetPocketMoney}
            className="self-start md:self-center px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 transition cursor-pointer"
            title="Resetovat na ukázková data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Obnovit ukázková data
          </button>
        </div>
      </div>

      {/* Grid: Balances of Kids (Bento Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map(child => {
          const { balance, totalGiven, totalSpent } = getChildAccount(child.id);
          const isOverdrawn = balance < 0;

          return (
            <motion.div
              key={child.id}
              layoutId={`card-${child.id}`}
              className={`bento-card p-6 bg-white dark:bg-slate-900 rounded-3xl border ${child.borderClass} relative overflow-hidden shadow-2xs`}
            >
              {/* Highlight strip with child's color */}
              <div className={`absolute top-0 left-0 right-0 h-2 ${child.bgClass}`} />

              <div className="flex justify-between items-start pt-2">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${child.bgClass} flex items-center justify-center text-2xl shadow-sm shrink-0`}>
                    {child.avatar}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{child.name}</h3>
                    <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Kasička a úspory</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Aktuální zůstatek</p>
                  <p className={`text-2xl sm:text-3xl font-black font-display tracking-tight ${isOverdrawn ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {balance.toLocaleString('cs-CZ')} Kč
                  </p>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    Celkem dostal(a): {totalGiven.toLocaleString('cs-CZ')} Kč
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    Celkem utratil(a): {totalSpent.toLocaleString('cs-CZ')} Kč
                  </span>
                </div>
                
                {/* Visual Ratio Bar */}
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  {totalGiven > 0 ? (
                    <>
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${Math.max(0, Math.min(100, (balance / totalGiven) * 100))}%` }}
                        title="Zůstatek k útratě"
                      />
                      <div 
                        className="bg-rose-500/80 h-full transition-all duration-500"
                        style={{ width: `${Math.max(0, Math.min(100, (totalSpent / totalGiven) * 100))}%` }}
                        title="Utraceno"
                      />
                    </>
                  ) : (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-full" />
                  )}
                </div>
              </div>

              {/* Alert / Advice message */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs">
                {isOverdrawn ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
                    <p className="text-slate-600 dark:text-slate-400">
                      {child.name} je v záporu <strong className="text-rose-600">-{Math.abs(balance)} Kč</strong>. Utratil(a) víc peněz, než dostal(a) od rodičů! Je potřeba doplnit kasičku.
                    </p>
                  </>
                ) : balance === 0 ? (
                  <>
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-slate-600 dark:text-slate-400">
                      {child.name} má prázdnou kasičku. Požádej rodiče o kapesné nebo jim pomoz s domácími pracemi za odměnu! 🧹
                    </p>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-slate-600 dark:text-slate-400">
                      {child.name} má u rodičů po ruce <strong className="text-emerald-600">{balance} Kč</strong> na libovolné sladkosti nebo hračky. Skvělé šetření!
                    </p>
                  </>
                )}
              </div>

              {/* Quick actions for kids to click directly */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedChildFilter(child.id);
                    // scroll to history listing
                    document.getElementById('pm-history-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer text-center"
                >
                  🔍 Zobrazit moji historii
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main interactive segment: forms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Forms column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bento-card p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-3xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Coins className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Zapsat novou transakci</h3>
            </div>

            {/* Segmented control tab: Parent (Rodič) vs Child (Dítě) */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setActiveFormTab('parent')}
                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeFormTab === 'parent'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                🧔 Rodič dal peníze
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('child')}
                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeFormTab === 'child'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                👦 Dítě utratilo
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeFormTab === 'parent' ? (
                <motion.form
                  key="parent-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleAddCredit}
                  className="space-y-4"
                >
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed mb-2">
                    💡 <strong>Pro Rodiče:</strong> Připište dítěti kapesné, odměnu za vyčištění zoubků, posekání trávy nebo dárek k svátku. Zůstatek v kasičce se navýší.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Které dítě dostalo? *
                      </label>
                      <select
                        value={parentChildId}
                        onChange={(e) => setParentChildId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                      >
                        {children.map(c => (
                          <option key={c.id} value={c.id}>{c.avatar} {c.name}</option>
                        ))}
                        {children.length === 0 && (
                          <option value="">Žádné děti v rodině</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Který rodič dal? *
                      </label>
                      <select
                        value={parentGiverId}
                        onChange={(e) => setParentGiverId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                      >
                        {parents.map(p => (
                          <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Kolik Kč jsi dal(a)? *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        placeholder="např. 100"
                        required
                        value={parentAmount}
                        onChange={(e) => setParentAmount(e.target.value)}
                        className="w-full pl-4 pr-12 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-white font-extrabold text-sm"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Kč</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Účel / Důvod *
                    </label>
                    <select
                      value={parentPurpose}
                      onChange={(e) => setParentPurpose(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-white text-xs"
                    >
                      {PARENT_REASONS.map(reason => (
                        <option key={reason} value={reason}>
                          {reason === 'custom' ? '✍️ Jiný důvod... (Zadat vlastní)' : `⭐ ${reason}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {parentPurpose === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1"
                    >
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Vlastní důvod *
                      </label>
                      <input
                        type="text"
                        placeholder="např. Odměna za pomoc se dřívím, statečnost u zubaře..."
                        required
                        value={parentCustomPurpose}
                        onChange={(e) => setParentCustomPurpose(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-white text-xs"
                      />
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Datum
                      </label>
                      <input
                        type="date"
                        value={parentDate}
                        onChange={(e) => setParentDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-800 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          // Quick add a standard amount
                          setParentAmount('100');
                        }}
                        className="w-full py-2 px-3 border border-dashed border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-[10px] font-bold uppercase text-slate-500 hover:text-slate-700 dark:text-slate-400 rounded-xl transition cursor-pointer"
                      >
                        ⚡ Rychlých 100 Kč
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Poznámky (nepovinné)
                    </label>
                    <textarea
                      placeholder="Doplňující detaily nebo pochvala pro dítě..."
                      value={parentNotes}
                      onChange={(e) => setParentNotes(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-800 dark:border-slate-700 text-xs resize-none text-slate-800 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider shadow-sm transition hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Připsat peníze do kasičky
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="child-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleAddDebit}
                  className="space-y-4"
                >
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed mb-2">
                    👦 <strong>Pro Děti:</strong> Kupuješ si nanuk, hračku, lego nebo dárek? Zadej sem částku a co si kupuješ. Peníze se odečtou z tvé kasičky u rodičů.
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Kdo utrácel? *
                    </label>
                    <select
                      value={childId}
                      onChange={(e) => setChildId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    >
                      {children.map(c => (
                        <option key={c.id} value={c.id}>{c.avatar} {c.name}</option>
                      ))}
                      {children.length === 0 && (
                        <option value="">Žádné děti v rodině</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Kolik to stálo? *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        placeholder="např. 45"
                        required
                        value={childAmount}
                        onChange={(e) => setChildAmount(e.target.value)}
                        className="w-full pl-4 pr-12 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-white font-extrabold text-sm"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Kč</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Za co jsi to utratil(a)? *
                    </label>
                    <select
                      value={childPurpose}
                      onChange={(e) => setChildPurpose(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-white text-xs"
                    >
                      {CHILD_PURPOSES.map(purpose => (
                        <option key={purpose} value={purpose}>
                          {purpose === 'custom' ? '✍️ Napsat vlastní nákup...' : `🛒 ${purpose}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {childPurpose === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1"
                    >
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Vlastní popis nákupu *
                      </label>
                      <input
                        type="text"
                        placeholder="např. Pstruh na grilu, lístek na kolotoč..."
                        required
                        value={childCustomPurpose}
                        onChange={(e) => setChildCustomPurpose(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-white text-xs"
                      />
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Datum nákupu
                      </label>
                      <input
                        type="date"
                        value={childDate}
                        onChange={(e) => setChildDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-800 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          setChildAmount('30');
                        }}
                        className="w-full py-2 px-3 border border-dashed border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-[10px] font-bold uppercase text-slate-500 hover:text-slate-700 dark:text-slate-400 rounded-xl transition cursor-pointer"
                      >
                        ⚡ Rychlých 30 Kč
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Poznámky (nepovinné)
                    </label>
                    <textarea
                      placeholder="např. Koupil(a) jsem to u babičky v Bohumíně, podělil jsem se s bráchou..."
                      value={childNotes}
                      onChange={(e) => setChildNotes(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-800 dark:border-slate-700 text-xs resize-none text-slate-800 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider shadow-sm transition hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Zapsat moji útratu
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

          </div>

          {/* Educational info card */}
          <div className="bento-card p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 dark:from-indigo-500/20 rounded-3xl border border-indigo-100 dark:border-indigo-950/40 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Tipy pro finanční gramotnost
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside leading-relaxed">
              <li><strong>Pravidelnost:</strong> Zaveďte výplatu kapesného na stejný den (např. každé pondělí nebo 1. v měsíci).</li>
              <li><strong>Odměny za pomoc:</strong> Rozlišujte mezi běžnými povinnostmi (úklid pokojíčku) a mimořádnými pracemi za odměnu (např. umytí auta).</li>
              <li><strong>Chyby učí:</strong> Nechte děti udělat špatné rozhodnutí (např. utratit vše za bonbóny). Pochopí, že peníze jsou omezené.</li>
              <li><strong>Úsporný cíl:</strong> Pomozte dětem stanovit si cíl (např. Lego za 800 Kč) a vizuálně sledovat, jak se k němu blíží.</li>
            </ul>
          </div>

        </div>

        {/* Ledger column: History & Filter (7 cols) */}
        <div id="pm-history-card" className="lg:col-span-7 space-y-6">
          
          {/* Filters Bar */}
          <div className="bento-card p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-3xs flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Filtrovat historii kapesného
            </h3>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
              
              {/* Child Filter */}
              <select
                value={selectedChildFilter}
                onChange={(e) => setSelectedChildFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 font-semibold"
              >
                <option value="all">👦 Všechny děti</option>
                {children.map(c => (
                  <option key={c.id} value={c.id}>👤 {c.name}</option>
                ))}
              </select>

              {/* Transaction Type Filter */}
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 font-semibold"
              >
                <option value="all">📊 Všechny pohyby</option>
                <option value="credit">➕ Jen příjmy (od rodičů)</option>
                <option value="debit">➖ Jen útrata (výdaje)</option>
              </select>

            </div>
          </div>

          {/* Ledger Listing */}
          <div className="bento-card bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-3xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Pohyby v kasičkách ({filteredTransactions.length})
              </h3>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                Seřazeno od nejnovějších
              </span>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <PiggyBank className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Žádné zaznamenané transakce</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Pro vybrané filtry nebyly nalezeny žádné pohyby. Zkuste změnit výběr dítěte nebo připsat nové kapesné.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[600px] overflow-y-auto no-scrollbar">
                {filteredTransactions.map(tx => {
                  const child = getMember(tx.childId);
                  const recorder = getMember(tx.recordedBy);
                  const isCredit = tx.type === 'credit';

                  return (
                    <motion.div
                      key={tx.id}
                      layout
                      className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition"
                    >
                      {/* Left: Avatar & info of the child */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl ${child.bgClass} flex items-center justify-center text-xl shrink-0 shadow-3xs`}>
                          {child.avatar}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 tracking-tight">
                              {tx.purpose}
                            </span>
                            
                            {/* Tag indicating transaction type */}
                            <span className={`inline-flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-md shrink-0 ${
                              isCredit 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30' 
                                : 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30'
                            }`}>
                              {isCredit ? 'Dostáno' : 'Utraceno'}
                            </span>
                          </div>

                          {tx.notes && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic bg-slate-50 dark:bg-slate-950/25 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50 mt-1">
                              {tx.notes}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            <span>
                              Pro koho: <strong className="text-slate-600 dark:text-slate-300">{child.name}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              {isCredit ? 'Zapsal rodič:' : 'Zapsal(a):'}{' '}
                              <strong className="text-slate-600 dark:text-slate-300">{recorder.name}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(tx.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Delete button */}
                      <div className="text-right flex items-center gap-3 shrink-0">
                        <div className="space-y-0.5">
                          <span className={`text-sm sm:text-base font-black tracking-tight font-display ${
                            isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {isCredit ? '+' : '-'}{tx.amount.toLocaleString('cs-CZ')} Kč
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                          title="Smazat záznam"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* aggregate summary row */}
            {filteredTransactions.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <div className="flex gap-4">
                  <span>Celkem zapsáno připsání: <span className="text-emerald-600">+{filteredTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0).toLocaleString('cs-CZ')} Kč</span></span>
                  <span>Celkem zapsáno útrat: <span className="text-rose-600">-{filteredTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0).toLocaleString('cs-CZ')} Kč</span></span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
