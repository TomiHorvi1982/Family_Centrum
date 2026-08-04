import React, { useState, useEffect } from 'react';
import { Member, ShoppingItem } from '../types';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Check, 
  Filter, 
  User, 
  Sparkles, 
  Apple, 
  Package, 
  Egg, 
  Utensils, 
  AlertTriangle,
  ArrowUpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ShoppingListViewProps {
  members: Member[];
}

const DEFAULT_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 'shop-1',
    name: 'Polotučné mléko',
    quantity: '2 l',
    category: 'potraviny',
    requestedBy: 'dite1', // Přál si k snídani kuličky
    completed: false,
    priority: 'high',
    createdAt: '2026-07-19'
  },
  {
    id: 'shop-2',
    name: 'Křupavé housky',
    quantity: '10 ks',
    category: 'pecivo',
    requestedBy: 'manzelka',
    completed: true,
    completedBy: 'manzel',
    priority: 'medium',
    createdAt: '2026-07-18'
  },
  {
    id: 'shop-3',
    name: 'Toaletní papír (Heřmánek)',
    quantity: '1 balení',
    category: 'drogerie',
    requestedBy: 'manzelka',
    completed: false,
    priority: 'high',
    createdAt: '2026-07-19'
  },
  {
    id: 'shop-4',
    name: 'Čerstvé banány',
    quantity: '1 trs',
    category: 'ovoce-zelenina',
    requestedBy: 'dite2',
    completed: false,
    priority: 'low',
    createdAt: '2026-07-19'
  },
  {
    id: 'shop-5',
    name: 'Zrnková káva (Arabica)',
    quantity: '1 kg',
    category: 'potraviny',
    requestedBy: 'manzel',
    completed: false,
    priority: 'high',
    createdAt: '2026-07-19'
  },
  {
    id: 'shop-6',
    name: 'Prací gel pro citlivou pokožku',
    quantity: '1 ks',
    category: 'drogerie',
    requestedBy: 'manzelka',
    completed: true,
    completedBy: 'manzelka',
    priority: 'medium',
    createdAt: '2026-07-17'
  }
];

const CATEGORY_META = {
  potraviny: { label: 'Potraviny', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400', icon: Egg },
  pecivo: { label: 'Pečivo', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', icon: Utensils },
  'ovoce-zelenina': { label: 'Ovoce & Zelenina', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', icon: Apple },
  drogerie: { label: 'Drogerie', bg: 'bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400', icon: Package },
  ostatni: { label: 'Ostatní', bg: 'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400', icon: ShoppingCart }
};

const QUICK_TEMPLATES = [
  { name: 'Mléko 1l', category: 'potraviny' as const, quantity: '1 ks' },
  { name: 'Máslo 250g', category: 'potraviny' as const, quantity: '1 ks' },
  { name: 'Chléb Šumava', category: 'pecivo' as const, quantity: '1 ks' },
  { name: 'Vajíčka L', category: 'potraviny' as const, quantity: '10 ks' },
  { name: 'Brambory', category: 'ovoce-zelenina' as const, quantity: '2 kg' },
  { name: 'Papírové kapesníky', category: 'drogerie' as const, quantity: '1 balení' }
];

export default function ShoppingListView({ members }: ShoppingListViewProps) {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('family_shopping_list');
    return saved ? JSON.parse(saved) : DEFAULT_SHOPPING_ITEMS;
  });

  // State of the active family member performing actions (adds a nice multi-user roleplay feel)
  const [activeShopperId, setActiveShopperId] = useState<string>(() => {
    return members[0]?.id || 'manzelka';
  });

  // Form states
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1 ks');
  const [newItemCategory, setNewItemCategory] = useState<ShoppingItem['category']>('potraviny');
  const [newItemPriority, setNewItemPriority] = useState<ShoppingItem['priority']>('medium');
  const [newItemRequestedBy, setNewItemRequestedBy] = useState<string>(activeShopperId);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('family_shopping_list', JSON.stringify(items));
  }, [items]);

  // Sync requestor select to active shopper changes
  useEffect(() => {
    setNewItemRequestedBy(activeShopperId);
  }, [activeShopperId]);

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: `shop-${Date.now()}`,
      name: newItemName.trim(),
      quantity: newItemQuantity || '1 ks',
      category: newItemCategory,
      requestedBy: newItemRequestedBy,
      completed: false,
      priority: newItemPriority,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setItems(prev => [newItem, ...prev]);
    setNewItemName('');
    setNewItemQuantity('1 ks');
    setNewItemCategory('potraviny');
    setNewItemPriority('medium');
  };

  const handleQuickAdd = (template: typeof QUICK_TEMPLATES[number]) => {
    const newItem: ShoppingItem = {
      id: `shop-${Date.now()}`,
      name: template.name,
      quantity: template.quantity,
      category: template.category,
      requestedBy: activeShopperId,
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setItems(prev => [newItem, ...prev]);
  };

  const handleToggleComplete = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          completedBy: nextCompleted ? activeShopperId : undefined
        };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCompleted = () => {
    if (window.confirm('Opravdu chcete smazat všechny nakoupené položky?')) {
      setItems(prev => prev.filter(item => !item.completed));
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

  // Filter logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? !item.completed :
      item.completed;
    const matchesCategory = categoryFilter === 'all' ? true : item.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' ? true : item.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  // Calculate stats
  const totalCount = items.length;
  const completedCount = items.filter(i => i.completed).length;
  const activeCount = totalCount - completedCount;

  return (
    <div className="space-y-6">
      
      {/* Upper Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Active Person Selector */}
        <div className="sm:col-span-2 bento-card p-5 bg-white rounded-3xl border border-slate-200 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
              Právě nakupuje / přidává:
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
              Zvol, kdo aktuálně s plánovačem pracuje
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {members.map(member => {
              const isActive = activeShopperId === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => setActiveShopperId(member.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition cursor-pointer ${
                    isActive
                      ? `${member.bgClass} ${member.textClass} border-transparent shadow-sm scale-102`
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

        {/* Stats card */}
        <div className="bento-card p-5 bg-white rounded-3xl border border-slate-200 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-1">
              Koupené věci
            </span>
            <h4 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white font-display">
              {completedCount} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">z {totalCount}</span>
            </h4>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Pending items card */}
        <div className="bento-card p-5 bg-white rounded-3xl border border-slate-200 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block mb-1">
              Zbývá nakoupit
            </span>
            <h4 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white font-display">
              {activeCount}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {activeCount === 0 
              ? '🎉 Všechno je nakoupeno!' 
              : '🛒 Nezapomeňte cestou z práce.'}
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Add item and quick templates */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Add Item Form */}
          <div className="bento-card p-6 bg-white rounded-3xl border border-slate-200 shadow-3xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Přidat věc do seznamu</h2>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Co potřebujeme koupit? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="např. Eidam 30%, Máslo, Plenky..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Množství / balení
                  </label>
                  <input
                    type="text"
                    placeholder="např. 2 ks, 1l, 350g"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Priorita
                  </label>
                  <select
                    value={newItemPriority}
                    onChange={(e) => setNewItemPriority(e.target.value as ShoppingItem['priority'])}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700"
                  >
                    <option value="low">Nízká</option>
                    <option value="medium">Střední</option>
                    <option value="high">Vysoká ⚠️</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Kategorie
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as ShoppingItem['category'])}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700"
                  >
                    <option value="potraviny">Potraviny</option>
                    <option value="pecivo">Pečivo</option>
                    <option value="ovoce-zelenina">Ovoce & Zelinářství</option>
                    <option value="drogerie">Drogerie</option>
                    <option value="ostatni">Ostatní</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Kdo to vyžaduje?
                  </label>
                  <select
                    value={newItemRequestedBy}
                    onChange={(e) => setNewItemRequestedBy(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition dark:bg-slate-900 dark:border-slate-700"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider shadow-sm transition hover:shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                Přidat položku
              </button>
            </form>
          </div>

          {/* Quick templates / Nákupní šablony */}
          <div className="bento-card p-6 bg-white rounded-3xl border border-slate-200 shadow-3xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rychlé šablony (1 kliknutí)</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Nejčastější rodinné položky. Klepnutím je okamžitě přidáte do seznamu.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {QUICK_TEMPLATES.map((tpl, idx) => {
                const Meta = CATEGORY_META[tpl.category];
                const IconComponent = Meta.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickAdd(tpl)}
                    className="text-left p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 transition flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`p-1 rounded-lg ${Meta.bg}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition" />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{tpl.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{tpl.quantity}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Akční letáky obchodů */}
          <div className="bento-card p-6 bg-white rounded-3xl border border-slate-200 shadow-3xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Akční letáky online</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Prohlédněte si aktuální slevy a naplánujte rodinný nákup výhodně:
            </p>

            <div className="space-y-2.5">
              {[
                { name: 'Lidl leták', url: 'https://www.lidl.cz/c/online-letaky/s10007875', color: 'from-blue-600 to-amber-400 hover:to-amber-500', logoText: 'Lidl', desc: 'Čerstvost a týdenní akce' },
                { name: 'Kaufland leták', url: 'https://www.kaufland.cz/akce/letaky.html', color: 'from-red-600 to-rose-500 hover:to-rose-600', logoText: 'Kaufland', desc: 'Velký výběr, skvělé ceny' },
                { name: 'Penny Market', url: 'https://www.penny.cz/letaky', color: 'from-red-500 to-amber-500 hover:to-amber-600', logoText: 'Penny', desc: 'Hezky česky, nejvýhodněji' },
                { name: 'Albert leták', url: 'https://www.albert.cz/letaky', color: 'from-emerald-500 to-yellow-400 hover:to-yellow-500', logoText: 'Albert', desc: 'Zdravá a kvalitní jídla' }
              ].map((leaflet, idx) => (
                <a
                  key={idx}
                  href={leaflet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${leaflet.color} text-white flex items-center justify-center font-black text-xs shadow-3xs tracking-wider select-none shrink-0`}>
                      {leaflet.logoText[0]}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition">
                        {leaflet.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {leaflet.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column - Filters and Shopping list */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Controls Bar */}
          <div className="bento-card p-5 bg-white rounded-3xl border border-slate-200 shadow-3xs flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Search and Status filter */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Hledat v nákupu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs w-full sm:w-48 dark:bg-slate-900 dark:border-slate-700"
              />

              <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200/50">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-white text-slate-800 shadow-xs dark:bg-slate-800 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  Vše
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    statusFilter === 'active'
                      ? 'bg-white text-slate-800 shadow-xs dark:bg-slate-800 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  K nákupu
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    statusFilter === 'completed'
                      ? 'bg-white text-slate-800 shadow-xs dark:bg-slate-800 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  Koupené
                </button>
              </div>
            </div>

            {/* Category and priority selectors */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
              >
                <option value="all">Všechny kategorie</option>
                <option value="potraviny">Potraviny</option>
                <option value="pecivo">Pečivo</option>
                <option value="ovoce-zelenina">Ovoce & Zelenina</option>
                <option value="drogerie">Drogerie</option>
                <option value="ostatni">Ostatní</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
              >
                <option value="all">Všechny priority</option>
                <option value="high">Pouze vysoká ⚠️</option>
                <option value="medium">Střední</option>
                <option value="low">Nízká</option>
              </select>

              {completedCount > 0 && (
                <button
                  onClick={handleClearCompleted}
                  className="p-2 border border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 rounded-2xl transition cursor-pointer dark:border-rose-900 dark:hover:bg-rose-950/30"
                  title="Smazat zakoupené věci"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

          {/* List items block */}
          <div className="bento-card bg-white rounded-3xl border border-slate-200 shadow-3xs overflow-hidden">
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <ShoppingCart className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nebyly nalezeny žádné věci</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Upravte filtry nebo zadejte novou položku k nákupu pomocí formuláře vlevo.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map(item => {
                  const reqMember = getMember(item.requestedBy);
                  const cmpMember = item.completedBy ? getMember(item.completedBy) : null;
                  const catMeta = CATEGORY_META[item.category];
                  const CatIcon = catMeta.icon;

                  return (
                    <div 
                      key={item.id}
                      className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                        item.completed 
                          ? 'bg-slate-50/50 dark:bg-slate-900/30' 
                          : 'hover:bg-slate-50/30 dark:hover:bg-slate-800/10'
                      }`}
                    >
                      {/* Checkbox + Title + Meta Column */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        
                        {/* Interactive Checkbox */}
                        <button
                          onClick={() => handleToggleComplete(item.id)}
                          className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition shrink-0 cursor-pointer ${
                            item.completed
                              ? 'bg-emerald-500 border-transparent text-white dark:bg-emerald-600'
                              : item.priority === 'high'
                                ? 'border-rose-300 hover:border-rose-500 bg-rose-50/30 dark:border-rose-900/50'
                                : 'border-slate-300 hover:border-indigo-500 bg-white dark:border-slate-700 dark:bg-slate-900'
                          }`}
                        >
                          {item.completed && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div className="min-w-0">
                          {/* Item Name with line-through animation */}
                          <div className="flex items-center gap-2">
                            <span 
                              className={`font-bold text-xs sm:text-sm tracking-tight transition-all duration-200 truncate ${
                                item.completed 
                                  ? 'text-slate-400 line-through decoration-slate-300 dark:text-slate-500 dark:decoration-slate-700' 
                                  : 'text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {item.name}
                            </span>
                            
                            {/* Quantity pill */}
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-[10px] dark:bg-slate-800 dark:text-slate-400 shrink-0">
                              {item.quantity}
                            </span>

                            {/* High Priority Warning indicator */}
                            {!item.completed && item.priority === 'high' && (
                              <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 px-1.5 py-0.5 rounded-md shrink-0 animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5" /> spěchá
                              </span>
                            )}
                          </div>

                          {/* Item meta badges */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            
                            {/* Category pill */}
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg font-bold ${catMeta.bg}`}>
                              <CatIcon className="w-3 h-3" />
                              {catMeta.label}
                            </span>

                            {/* Requested by (Who wanted it) */}
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="text-slate-400 dark:text-slate-500">Chce:</span>
                              <span className="font-bold flex items-center gap-0.5">
                                <span className="text-xs leading-none">{reqMember.avatar}</span>
                                <span>{reqMember.name}</span>
                              </span>
                            </span>

                            {/* Bought by (Who bought it) */}
                            {item.completed && cmpMember && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                <span>Koupil(a):</span>
                                <span className="flex items-center gap-0.5">
                                  <span>{cmpMember.avatar}</span>
                                  <span>{cmpMember.name}</span>
                                </span>
                              </span>
                            )}

                          </div>
                        </div>

                      </div>

                      {/* Trash action button */}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer shrink-0"
                        title="Odstranit položku"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Informational Tip Box */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100/30 dark:border-indigo-500/10 flex items-start gap-3">
            <Clock className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300">💡 Jak to funguje v rodině:</span> Položky může kdokoli přidat na telefonu, tabletu nebo počítači. Až půjde taťka nebo mamka nakupovat do Alberta nebo Lidlu v Bohumíně, jednoduše si seznam otevře v mobilu a věci odškrtává. Ostatní okamžitě vidí, co už je koupené!
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
