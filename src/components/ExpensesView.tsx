import React, { useState, useEffect } from 'react';
import { Member, Expense } from '../types';
import { 
  PiggyBank, 
  Plus, 
  Trash2, 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Compass, 
  Layers, 
  User, 
  Calendar, 
  Info, 
  Sparkles,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpensesViewProps {
  members: Member[];
}

const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    amount: 1540,
    purpose: 'Týdenní nákup v Lidlu',
    category: 'nakup',
    paidBy: 'manzelka',
    date: '2026-07-18',
    notes: 'Včetně ovoce pro děti a masa na nedělní grilování.'
  },
  {
    id: 'exp-2',
    amount: 4200,
    purpose: 'Záloha na elektřinu a plyn',
    category: 'sluzby',
    paidBy: 'manzel',
    date: '2026-07-15',
    notes: 'Pravidelná měsíční platba.'
  },
  {
    id: 'exp-3',
    amount: 2450,
    purpose: 'Rodinný výlet do ZOO Ostrava',
    category: 'vylet',
    paidBy: 'manzel',
    date: '2026-07-12',
    notes: 'Vstupné + občerstvení + suvenýry.'
  },
  {
    id: 'exp-4',
    amount: 450,
    purpose: 'Léky v lékárně',
    category: 'sluzby',
    paidBy: 'manzelka',
    date: '2026-07-19',
    notes: 'Sirup na kašel pro mladší dceru.'
  },
  {
    id: 'exp-5',
    amount: 890,
    purpose: 'Benzín do auta',
    category: 'vylet',
    paidBy: 'manzel',
    date: '2026-07-10',
    notes: 'Tankování na cestu k babičce.'
  },
  {
    id: 'exp-6',
    amount: 320,
    purpose: 'Nové pastelky a sešit',
    category: 'ostatni',
    paidBy: 'dite1',
    date: '2026-07-14',
    notes: 'Koupeno ze svého kapesného / příspěvku od rodičů.'
  }
];

const CATEGORY_META = {
  nakup: { label: 'Nákupy', color: '#3b82f6', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400', icon: DollarSign },
  sluzby: { label: 'Služby & Poplatky', color: '#ec4899', bg: 'bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400', icon: Briefcase },
  vylet: { label: 'Výlety & Zábava', color: '#10b981', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', icon: Compass },
  ostatni: { label: 'Ostatní výdaje', color: '#64748b', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: Layers }
};

export interface ExtraIncome {
  id: string;
  amount: number;
  purpose: string;
  category: 'brigada' | 'dar' | 'bazar' | 'ostatni';
  receivedBy: string; // Member ID
  date: string; // YYYY-MM-DD
  notes?: string;
}

const DEFAULT_INCOMES: ExtraIncome[] = [
  {
    id: 'inc-1',
    amount: 1500,
    purpose: 'Prodej dětské autosedačky (Bazar)',
    category: 'bazar',
    receivedBy: 'manzelka',
    date: '2026-07-14',
    notes: 'Předáno osobně kupujícímu z Bohumína.'
  },
  {
    id: 'inc-2',
    amount: 6800,
    purpose: 'Mimořádná brigáda - inventura',
    category: 'brigada',
    receivedBy: 'manzel',
    date: '2026-07-16',
    notes: 'Noční směna o víkendu.'
  }
];

const INCOME_CATEGORY_META = {
  brigada: { label: 'Brigáda / Práce', color: '#10b981', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', icon: Briefcase },
  dar: { label: 'Dar / Příspěvek', color: '#f59e0b', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', icon: Sparkles },
  bazar: { label: 'Prodej / Bazar', color: '#3b82f6', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400', icon: Compass },
  ostatni: { label: 'Ostatní příjmy', color: '#64748b', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: Layers }
};

export default function ExpensesView({ members }: ExpensesViewProps) {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('family_expenses');
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
  });

  const [incomes, setIncomes] = useState<ExtraIncome[]>(() => {
    const saved = localStorage.getItem('family_incomes');
    return saved ? JSON.parse(saved) : DEFAULT_INCOMES;
  });

  const [activeUser, setActiveUser] = useState<string>(() => {
    return members[0]?.id || 'manzelka';
  });

  // Toggle for Zapisování Výdaj vs Příjem
  const [recordType, setRecordType] = useState<'expense' | 'income'>('expense');

  // Form states
  const [amount, setAmount] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [category, setCategory] = useState<string>('nakup'); // generic category state (holds either Expense category or ExtraIncome category)
  const [paidBy, setPaidBy] = useState<string>(activeUser);
  const [date, setDate] = useState<string>('2026-07-19');
  const [notes, setNotes] = useState<string>('');

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07'); // Default July 2026
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'expenses' | 'incomes'>('all');

  // Shift Wage Calculator states
  const [shiftMemberId, setShiftMemberId] = useState<string>(members[0]?.id || 'manzel');
  const [shiftHourlyRate, setShiftHourlyRate] = useState<string>('200');
  const [shiftHours, setShiftHours] = useState<string>('8');
  const [shiftCount, setShiftCount] = useState<string>('15');
  const [shiftBonusPercent, setShiftBonusPercent] = useState<string>('10');
  const [shiftFixedBonus, setShiftFixedBonus] = useState<string>('0');

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('family_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('family_incomes', JSON.stringify(incomes));
  }, [incomes]);

  // Keep payer select in sync with active editor
  useEffect(() => {
    setPaidBy(activeUser);
  }, [activeUser]);

  // Adjust category default based on record type change
  useEffect(() => {
    if (recordType === 'expense') {
      setCategory('nakup');
    } else {
      setCategory('brigada');
    }
  }, [recordType]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Zadejte prosím platnou kladnou částku.');
      return;
    }
    if (!purpose.trim()) {
      alert('Zadejte účel transakce.');
      return;
    }

    if (recordType === 'expense') {
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        amount: parsedAmount,
        purpose: purpose.trim(),
        category: category as Expense['category'],
        paidBy,
        date,
        notes: notes.trim() || undefined
      };
      setExpenses(prev => [newExpense, ...prev]);
    } else {
      const newIncome: ExtraIncome = {
        id: `inc-${Date.now()}`,
        amount: parsedAmount,
        purpose: purpose.trim(),
        category: category as ExtraIncome['category'],
        receivedBy: paidBy,
        date,
        notes: notes.trim() || undefined
      };
      setIncomes(prev => [newIncome, ...prev]);
    }
    
    // Reset form
    setAmount('');
    setPurpose('');
    setNotes('');
    setDate('2026-07-19');
  };

  const handleDeleteIncome = (id: string) => {
    if (window.confirm('Opravdu chcete smazat tento příjem?')) {
      setIncomes(prev => prev.filter(e => e.id !== id));
    }
  };

  const calculatedWage = (parseFloat(shiftCount) || 0) * (parseFloat(shiftHours) || 0) * (parseFloat(shiftHourlyRate) || 0) * (1 + (parseFloat(shiftBonusPercent) || 0) / 100) + (parseFloat(shiftFixedBonus) || 0);

  const handleImportCalculatedIncome = () => {
    const totalWage = Math.round(calculatedWage);
    if (totalWage <= 0) {
      alert('Vypočtená mzda musí být větší než 0 Kč.');
      return;
    }
    const workerName = members.find(m => m.id === shiftMemberId)?.name || 'Člen rodiny';
    
    const newIncome: ExtraIncome = {
      id: `inc-${Date.now()}`,
      amount: totalWage,
      purpose: `Výplata/Směny - ${workerName}`,
      category: 'brigada',
      receivedBy: shiftMemberId,
      date: '2026-07-19',
      notes: `Zadáno ze směn: ${shiftCount} směn, po ${shiftHours}h, hod. sazba ${shiftHourlyRate} Kč/h s příplatkem ${shiftBonusPercent}%.`
    };
    
    setIncomes(prev => [newIncome, ...prev]);
    alert(`Příjem ve výši ${totalWage.toLocaleString('cs-CZ')} Kč byl úspěšně zařazen jako mimořádný příjem pro: ${workerName}.`);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Opravdu chcete smazat tento výdaj?')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const getMember = (id: string) => {
    return members.find(m => m.id === id) || {
      name: 'Neznámý',
      avatar: '👤',
      bgClass: 'bg-slate-500',
      textClass: 'text-slate-700',
      lightBgClass: 'bg-slate-50',
      borderClass: 'border-slate-200'
    };
  };

  // Filter calculations
  const filteredExpenses = expenses.filter(exp => {
    // Check Month (match YYYY-MM)
    const expMonth = exp.date.substring(0, 7);
    const matchesMonth = selectedMonth === 'all' ? true : expMonth === selectedMonth;

    // Check Category
    const matchesCategory = categoryFilter === 'all' ? true : exp.category === categoryFilter;

    // Check Member
    const matchesMember = memberFilter === 'all' ? true : exp.paidBy === memberFilter;

    // Check Search
    const matchesSearch = searchQuery.trim() === '' 
      ? true 
      : exp.purpose.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesMonth && matchesCategory && matchesMember && matchesSearch;
  });

  const filteredIncomes = incomes.filter(inc => {
    // Check Month (match YYYY-MM)
    const incMonth = inc.date.substring(0, 7);
    const matchesMonth = selectedMonth === 'all' ? true : incMonth === selectedMonth;

    // Check Category
    const matchesCategory = categoryFilter === 'all' ? true : inc.category === categoryFilter;

    // Check Member
    const matchesMember = memberFilter === 'all' ? true : inc.receivedBy === memberFilter;

    // Check Search
    const matchesSearch = searchQuery.trim() === '' 
      ? true 
      : inc.purpose.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (inc.notes && inc.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesMonth && matchesCategory && matchesMember && matchesSearch;
  });

  // Stats over current selection
  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalIncomesAmount = filteredIncomes.reduce((sum, inc) => sum + inc.amount, 0);
  const netBalance = totalIncomesAmount - totalAmount;

  const averageAmount = filteredExpenses.length > 0 ? Math.round(totalAmount / filteredExpenses.length) : 0;
  const maxExpense = filteredExpenses.length > 0 
    ? [...filteredExpenses].sort((a, b) => b.amount - a.amount)[0] 
    : null;

  // Breakdown by Category
  const categoryStats = {
    nakup: 0,
    sluzby: 0,
    vylet: 0,
    ostatni: 0
  };
  filteredExpenses.forEach(exp => {
    if (categoryStats[exp.category] !== undefined) {
      categoryStats[exp.category] += exp.amount;
    } else {
      categoryStats.ostatni += exp.amount;
    }
  });

  // Breakdown by Member
  const memberStats: Record<string, number> = {};
  members.forEach(m => {
    memberStats[m.id] = 0;
  });
  filteredExpenses.forEach(exp => {
    if (memberStats[exp.paidBy] !== undefined) {
      memberStats[exp.paidBy] += exp.amount;
    } else {
      memberStats[exp.paidBy] = exp.amount;
    }
  });

  // Generate mock lists of unique months present in dataset for the month filter dropdown
  const allDates = [...expenses.map(e => e.date), ...incomes.map(i => i.date)];
  const uniqueMonths = Array.from(
    new Set(allDates.map(d => d.substring(0, 7)))
  ).sort().reverse() as string[];

  // Unified transactions for combined ledger view
  interface UnifiedTransaction {
    id: string;
    amount: number;
    purpose: string;
    category: string;
    type: 'expense' | 'income';
    memberId: string;
    date: string;
    notes?: string;
  }

  const unifiedTransactions: UnifiedTransaction[] = [];
  
  if (transactionTypeFilter === 'all' || transactionTypeFilter === 'expenses') {
    filteredExpenses.forEach(exp => {
      unifiedTransactions.push({
        id: exp.id,
        amount: exp.amount,
        purpose: exp.purpose,
        category: exp.category,
        type: 'expense',
        memberId: exp.paidBy,
        date: exp.date,
        notes: exp.notes
      });
    });
  }

  if (transactionTypeFilter === 'all' || transactionTypeFilter === 'incomes') {
    filteredIncomes.forEach(inc => {
      unifiedTransactions.push({
        id: inc.id,
        amount: inc.amount,
        purpose: inc.purpose,
        category: inc.category,
        type: 'income',
        memberId: inc.receivedBy,
        date: inc.date,
        notes: inc.notes
      });
    });
  }

  unifiedTransactions.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  // Color map helper
  const categoryColors: Record<Expense['category'], string> = {
    nakup: '#3b82f6', // blue
    sluzby: '#ec4899', // pink
    vylet: '#10b981', // emerald
    ostatni: '#64748b' // slate
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Status / KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Active Member Selector */}
        <div className="bento-card p-5 bg-white rounded-3xl border border-slate-200 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
              Aktivní člen:
            </span>
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2">
              Kliknutím zvolte zapisovatele
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {members.map(member => {
              const isActive = activeUser === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => setActiveUser(member.id)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                    isActive
                      ? `${member.bgClass} ${member.textClass} border-transparent shadow-3xs scale-102`
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs shrink-0">{member.avatar}</span>
                  <span className="truncate">{member.name.split(' ')[1] || member.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Total Spendings */}
        <div className="bento-card p-5 bg-white rounded-3xl border border-slate-200 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 block mb-1">
              Celkové výdaje
            </span>
            <h4 className="text-2xl font-black tracking-tight text-rose-600 font-display">
              -{totalAmount.toLocaleString('cs-CZ')} <span className="text-xs text-rose-400 font-normal">Kč</span>
            </h4>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            Průměrně {averageAmount.toLocaleString('cs-CZ')} Kč / nákup
          </p>
        </div>

        {/* Total Extra Incomes */}
        <div className="bento-card p-5 bg-white rounded-3xl border border-slate-200 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-1">
              Mimořádné příjmy
            </span>
            <h4 className="text-2xl font-black tracking-tight text-emerald-600 font-display">
              +{totalIncomesAmount.toLocaleString('cs-CZ')} <span className="text-xs text-emerald-400 font-normal">Kč</span>
            </h4>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            Z bazarů, brigád a směn
          </p>
        </div>

        {/* Net Balance */}
        <div className="bento-card p-5 bg-white rounded-3xl border border-slate-200 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
              Rodinná bilance
            </span>
            <h4 className={`text-2xl font-black tracking-tight font-display ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {netBalance >= 0 ? '+' : ''}{netBalance.toLocaleString('cs-CZ')} <span className="text-xs font-normal">Kč</span>
            </h4>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            {netBalance >= 0 ? '👍 Rozpočet je v plusu' : '⚠️ Výdaje převyšují příjmy'}
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Record expense + Visual overview chart */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Record Expense or Income Form */}
          <div className="bento-card p-6 bg-white rounded-3xl border border-slate-200 shadow-3xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl transition ${
                  recordType === 'expense'
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                }`}>
                  <PiggyBank className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {recordType === 'expense' ? 'Zapsat společný výdaj' : 'Zapsat mimořádný příjem'}
                </h2>
              </div>
            </div>

            {/* Segmented Tab Selector */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
              <button
                type="button"
                onClick={() => setRecordType('expense')}
                className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  recordType === 'expense'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                💸 Výdaj
              </button>
              <button
                type="button"
                onClick={() => setRecordType('income')}
                className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  recordType === 'income'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                💰 Příjem
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Částka *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Částka v Kč"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-4 pr-12 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700 font-bold text-slate-800 dark:text-white"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 font-bold text-sm">
                    Kč
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {recordType === 'expense' ? 'Účel / Co se kupovalo? *' : 'Zdroj příjmu / Účel *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={recordType === 'expense' ? 'např. Nákup v Tescu, Lístky do kina...' : 'např. Brigáda, Prodej kola, Dar k narozeninám...'}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Kategorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    {recordType === 'expense' ? (
                      <>
                        <option value="nakup">🛒 Nákup / Potraviny</option>
                        <option value="sluzby">🏠 Služby / Energie</option>
                        <option value="vylet">🌲 Výlet / Zábava</option>
                        <option value="ostatni">📦 Ostatní</option>
                      </>
                    ) : (
                      <>
                        <option value="brigada">💼 Brigáda / Práce</option>
                        <option value="dar">🎁 Dar / Příspěvek</option>
                        <option value="bazar">🧸 Prodej / Bazar</option>
                        <option value="ostatni">🪙 Ostatní příjmy</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {recordType === 'expense' ? 'Kdo platil?' : 'Příjemce'}
                  </label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Datum transakce
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Poznámky / Podrobnosti (nepovinné)
                </label>
                <textarea
                  placeholder="Zadejte další detaily k transakci..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700 text-xs resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className={`w-full text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider shadow-sm transition hover:shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  recordType === 'expense'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                {recordType === 'expense' ? 'Uložit výdaj' : 'Uložit příjem'}
              </button>
            </form>
          </div>

          {/* Shift Income Calculator / Kalkulačka příjmů ze směn */}
          <div className="bento-card p-6 bg-white rounded-3xl border border-slate-200 shadow-3xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kalkulačka příjmů ze směn</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Spočítejte si odhadovaný příjem na základě zadaných směn v daném měsíci:
            </p>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Pracovník
                  </label>
                  <select
                    value={shiftMemberId}
                    onChange={(e) => setShiftMemberId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Hodinová mzda (Kč)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={shiftHourlyRate}
                    onChange={(e) => setShiftHourlyRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden text-slate-800 dark:text-white bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Délka směny
                  </label>
                  <select
                    value={shiftHours}
                    onChange={(e) => setShiftHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="8">8 hodin (Ranní/Odpolední)</option>
                    <option value="12">12 hodin (Dlouhý den/Noční)</option>
                    <option value="6">6 hodin (Zkrácený úvazek)</option>
                    <option value="4">4 hodiny (Brigáda)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Počet směn v měsíci
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={shiftCount}
                    onChange={(e) => setShiftCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden text-slate-800 dark:text-white bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Víken./Noční příplatek
                  </label>
                  <select
                    value={shiftBonusPercent}
                    onChange={(e) => setShiftBonusPercent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="0">Bez příplatku</option>
                    <option value="10">10% (Běžný noční)</option>
                    <option value="25">25% (Svátek / víkend)</option>
                    <option value="50">50% (Přesčasy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Fixní odměny / prémie (Kč)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={shiftFixedBonus}
                    onChange={(e) => setShiftFixedBonus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden text-slate-800 dark:text-white bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Result & add button */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Očekávaný příjem:</p>
                  <p className="text-xl font-black text-emerald-600 font-display">
                    {Math.round(calculatedWage).toLocaleString('cs-CZ')} Kč
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleImportCalculatedIncome}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-3xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Zapsat do příjmů
                </button>
              </div>
            </div>
          </div>

          {/* Graphical Breakdowns / Charts (CSS and SVG driven) */}
          <div className="bento-card p-6 bg-white rounded-3xl border border-slate-200 shadow-3xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Přehled útrat podle kategorií</h3>
              </div>
            </div>

            {/* Category visual progress meters */}
            <div className="space-y-4">
              {(Object.keys(CATEGORY_META) as Array<keyof typeof CATEGORY_META>).map(catKey => {
                const meta = CATEGORY_META[catKey];
                const catSum = categoryStats[catKey] || 0;
                const percentage = totalAmount > 0 ? (catSum / totalAmount) * 100 : 0;
                const CatIcon = meta.icon;

                return (
                  <div key={catKey} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded-lg ${meta.bg}`}>
                          <CatIcon className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{meta.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800 dark:text-white">{catSum.toLocaleString('cs-CZ')} Kč</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5">({Math.round(percentage)}%)</span>
                      </div>
                    </div>
                    {/* Gauge bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-3 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: meta.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spendings per member visual meter */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Podíl členů na výdajích
              </h4>

              <div className="space-y-3">
                {members.map(member => {
                  const mSum = memberStats[member.id] || 0;
                  const percentage = totalAmount > 0 ? (mSum / totalAmount) * 100 : 0;

                  return (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="text-lg leading-none w-6 text-center">{member.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-slate-700 dark:text-slate-300 truncate">{member.name}</span>
                          <span className="text-slate-600 dark:text-slate-400">{mSum.toLocaleString('cs-CZ')} Kč ({Math.round(percentage)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${member.bgClass}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Right column: Search, Filter & Expense List */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Controls Bar */}
          <div className="bento-card p-5 bg-white rounded-3xl border border-slate-200 shadow-3xs flex flex-col sm:flex-row gap-3 justify-between items-center">
            
            <div className="relative w-full sm:w-auto flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Hledat ve výdajích..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs dark:bg-slate-900 dark:border-slate-700"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
              
              {/* Transaction Type Filter */}
              <select
                value={transactionTypeFilter}
                onChange={(e) => setTransactionTypeFilter(e.target.value as any)}
                className="px-3 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="all">📊 Všechny transakce</option>
                <option value="expenses">💸 Jen výdaje</option>
                <option value="incomes">💰 Jen příjmy</option>
              </select>

              {/* Month Selector Filter */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="all">📅 Všechny měsíce</option>
                <option value="2026-07">📅 Červenec 2026</option>
                <option value="2026-06">📅 Červen 2026</option>
                {uniqueMonths.map(ym => {
                  if (ym === '2026-07' || ym === '2026-06') return null; // Avoid duplicate mock options
                  const [year, month] = ym.split('-');
                  return (
                    <option key={ym} value={ym}>
                      📅 {month}/{year}
                    </option>
                  );
                })}
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
              >
                <option value="all">🔍 Všechny kategorie</option>
                <option value="nakup">🛒 Nákupy</option>
                <option value="sluzby">🏠 Služby & Energie</option>
                <option value="vylet">🌲 Výlety & Zábava</option>
                <option value="ostatni">📦 Ostatní</option>
                <option value="brigada">💼 Brigády / Práce</option>
                <option value="dar">🎁 Dary / Příspěvky</option>
                <option value="bazar">🧸 Prodeje / Bazar</option>
              </select>

              {/* Member filter */}
              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
              >
                <option value="all">👤 Všichni členové</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.avatar} {m.name}
                  </option>
                ))}
              </select>

            </div>

          </div>

          {/* Unified history listing card */}
          <div className="bento-card bg-white rounded-3xl border border-slate-200 shadow-3xs overflow-hidden">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Historie rodinných financí ({unifiedTransactions.length})
              </h3>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                Seřazeno od nejnovějších
              </span>
            </div>

            {unifiedTransactions.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <PiggyBank className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Žádné zaznamenané transakce</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Zkuste vybrat jiný měsíc, vyčistit filtry nebo zapsat novou transakci v levém panelu.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {unifiedTransactions.map(tx => {
                  const member = getMember(tx.memberId);
                  const isExpense = tx.type === 'expense';
                  
                  const catMeta = isExpense 
                    ? CATEGORY_META[tx.category as keyof typeof CATEGORY_META] 
                    : INCOME_CATEGORY_META[tx.category as keyof typeof INCOME_CATEGORY_META];
                  const CatIcon = catMeta ? catMeta.icon : Layers;
                  const catLabel = catMeta ? catMeta.label : 'Ostatní';
                  const catBg = catMeta ? catMeta.bg : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

                  return (
                    <div key={tx.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition">
                      
                      {/* Left: Avatar & Info */}
                      <div className="flex items-start gap-4 min-w-0">
                        <div className={`w-9 h-9 rounded-xl ${member.bgClass} flex items-center justify-center text-lg shrink-0 shadow-3xs`}>
                          {member.avatar}
                        </div>

                        <div className="min-w-0 space-y-1">
                          
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 tracking-tight">
                              {tx.purpose}
                            </span>
                            
                            {/* Category Badge */}
                            <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-md shrink-0 ${catBg}`}>
                              <CatIcon className="w-2.5 h-2.5" />
                              {catLabel}
                            </span>
                          </div>

                          {/* Notes */}
                          {tx.notes && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50 mt-1">
                              {tx.notes}
                            </p>
                          )}

                          {/* Info footer line */}
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            <span>
                              {isExpense ? 'Zaplatil(a):' : 'Získal(a):'}{' '}
                              <strong className="text-slate-600 dark:text-slate-400">{member.name}</strong>
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
                            isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {isExpense ? '-' : '+'}{tx.amount.toLocaleString('cs-CZ')} Kč
                          </span>
                        </div>
                        <button
                          onClick={() => isExpense ? handleDeleteExpense(tx.id) : handleDeleteIncome(tx.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                          title="Smazat záznam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Total aggregate summary row */}
            {unifiedTransactions.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <div className="flex gap-4">
                  <span>Výdaje: <span className="text-rose-600">-{totalAmount.toLocaleString('cs-CZ')} Kč</span></span>
                  <span>Příjmy: <span className="text-emerald-600">+{totalIncomesAmount.toLocaleString('cs-CZ')} Kč</span></span>
                </div>
                <div>
                  <span>ROZDÍL BILANCE: </span>
                  <span className={`text-sm font-black ${netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {netBalance >= 0 ? '+' : ''}{netBalance.toLocaleString('cs-CZ')} Kč
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Quick Tip Box */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100/30 dark:border-indigo-500/10 flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300">💡 Tip k vyrovnání výdajů:</span> Na konci měsíce můžete snadno spočítat, kdo platil nejvíce, a rozdíl si vyrovnat zasláním peněz na účet (např. pomocí QR kódu v mobilním bankovnictví). Systém automaticky sčítá podíl každého člena.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
