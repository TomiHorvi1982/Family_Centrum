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

export default function ExpensesView({ members }: ExpensesViewProps) {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('family_expenses');
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
  });

  const [activeUser, setActiveUser] = useState<string>(() => {
    return members[0]?.id || 'manzelka';
  });

  // Form states
  const [amount, setAmount] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [category, setCategory] = useState<Expense['category']>('nakup');
  const [paidBy, setPaidBy] = useState<string>(activeUser);
  const [date, setDate] = useState<string>('2026-07-19');
  const [notes, setNotes] = useState<string>('');

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07'); // Default July 2026
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('family_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Keep payer select in sync with active editor
  useEffect(() => {
    setPaidBy(activeUser);
  }, [activeUser]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Zadejte prosím platnou kladnou částku.');
      return;
    }
    if (!purpose.trim()) {
      alert('Zadejte účel výdaje.');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      amount: parsedAmount,
      purpose: purpose.trim(),
      category,
      paidBy,
      date,
      notes: notes.trim() || undefined
    };

    setExpenses(prev => [newExpense, ...prev]);
    
    // Reset form
    setAmount('');
    setPurpose('');
    setNotes('');
    setDate('2026-07-19');
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

  // Stats over current selection
  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
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
  const uniqueMonths = Array.from(
    new Set(expenses.map(e => e.date.substring(0, 7)))
  ).sort().reverse() as string[];

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
        
        {/* Active Member Role Roleplay */}
        <div className="sm:col-span-2 bento-card p-5 bg-white rounded-3xl border border-slate-200 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
              Účtující osoba:
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
              Zvol člena, který platil nebo zapisuje
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {members.map(member => {
              const isActive = activeUser === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => setActiveUser(member.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition cursor-pointer ${
                    isActive
                      ? `${member.bgClass} ${member.textClass} border-transparent shadow-xs scale-102`
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-sm leading-none">{member.avatar}</span>
                  <span>{member.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Total Spendings */}
        <div className="bento-card p-5 bg-white rounded-3xl border border-slate-200 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
              Celkem za výběr
            </span>
            <h4 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white font-display">
              {totalAmount.toLocaleString('cs-CZ')} <span className="text-sm text-slate-400 dark:text-slate-500 font-normal">Kč</span>
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Včetně všech podskupin a filtrů.
          </p>
        </div>

        {/* Average and Top Spender */}
        <div className="bento-card p-5 bg-white rounded-3xl border border-slate-200 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 block mb-1">
              Nejvyšší jednorázový výdaj
            </span>
            <h4 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white truncate">
              {maxExpense ? `${maxExpense.amount.toLocaleString('cs-CZ')} Kč` : '0 Kč'}
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
              {maxExpense ? maxExpense.purpose : 'Žádné výdaje'}
            </p>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Průměrný výdaj: <span className="font-bold text-slate-800 dark:text-white">{averageAmount.toLocaleString('cs-CZ')} Kč</span>
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Record expense + Visual overview chart */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Record Expense Form */}
          <div className="bento-card p-6 bg-white rounded-3xl border border-slate-200 shadow-3xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                <PiggyBank className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Zapsat společný výdaj</h2>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
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
                  Účel / Co se kupovalo? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="např. Nákup v Tescu, Lístky do kina, Oprava pračky..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Kategorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Expense['category'])}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700"
                  >
                    <option value="nakup">🛒 Nákup / Potraviny</option>
                    <option value="sluzby">🏠 Služby / Energie</option>
                    <option value="vylet">🌲 Výlet / Zábava</option>
                    <option value="ostatni">📦 Ostatní</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Kdo platil?
                  </label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700"
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
                    Datum platby
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Poznámky / Podrobnosti (nepovinné)
                </label>
                <textarea
                  placeholder="Zadejte další detaily k výdaji..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700 text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider shadow-sm transition hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Uložit výdaj
              </button>
            </form>
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
              </select>

              {/* Member filter */}
              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
              >
                <option value="all">👤 Všichni plátci</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.avatar} {m.name}
                  </option>
                ))}
              </select>

            </div>

          </div>

          {/* Expense history listing card */}
          <div className="bento-card bg-white rounded-3xl border border-slate-200 shadow-3xs overflow-hidden">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Historie společných výdajů ({filteredExpenses.length})
              </h3>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                Seřazeno od nejnovějších
              </span>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <PiggyBank className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Žádné zaznamenané výdaje</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Zkuste vybrat jiný měsíc, vyčistit filtry nebo zapsat nový výdaj v levém panelu.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExpenses.map(exp => {
                  const payer = getMember(exp.paidBy);
                  const cat = CATEGORY_META[exp.category];
                  const CatIcon = cat.icon;

                  return (
                    <div key={exp.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition">
                      
                      {/* Left: Avatar & Info */}
                      <div className="flex items-start gap-4 min-w-0">
                        <div className={`w-9 h-9 rounded-xl ${payer.bgClass} flex items-center justify-center text-lg shrink-0 shadow-3xs`}>
                          {payer.avatar}
                        </div>

                        <div className="min-w-0 space-y-1">
                          
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 tracking-tight">
                              {exp.purpose}
                            </span>
                            
                            {/* Category Badge */}
                            <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-md shrink-0 ${cat.bg}`}>
                              <CatIcon className="w-2.5 h-2.5" />
                              {cat.label}
                            </span>
                          </div>

                          {/* Notes */}
                          {exp.notes && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50 mt-1">
                              {exp.notes}
                            </p>
                          )}

                          {/* Info footer line */}
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            <span>Zaplatil(a): <strong className="text-slate-600 dark:text-slate-400">{payer.name}</strong></span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(exp.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>

                        </div>
                      </div>

                      {/* Right: Amount & Delete button */}
                      <div className="text-right flex items-center gap-3 shrink-0">
                        <div className="space-y-0.5">
                          <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 tracking-tight font-display">
                            -{exp.amount.toLocaleString('cs-CZ')} Kč
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
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
            {filteredExpenses.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>CELKOVÁ ÚTRATA ZA VÝBĚR</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                  -{totalAmount.toLocaleString('cs-CZ')} Kč
                </span>
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
