import React, { useState, useEffect, useRef } from 'react';
import { Member, Activity, TripTip, ChatMessage, ActivityType } from '../types';
import { 
  Sparkles, 
  MapPin, 
  Compass, 
  Send, 
  RefreshCw, 
  Navigation, 
  Baby, 
  Flame, 
  Smile, 
  Check, 
  Bot, 
  User, 
  Waves, 
  TreePine, 
  Castle, 
  Dumbbell,
  Lightbulb,
  Search,
  Calendar,
  Clock,
  UserCheck,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OFFLINE_TRIP_TIPS } from '../utils/defaultData';

interface TipsViewProps {
  members: Member[];
  activities: Activity[];
  onAddActivity?: (newAct: Activity) => void;
}

export default function TipsView({ members, activities, onAddActivity }: TipsViewProps) {
  const [tips, setTips] = useState<TripTip[]>(OFFLINE_TRIP_TIPS);
  const [loadingTips, setLoadingTips] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSearch, setActiveSearch] = useState<string>('');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: 'Ahoj! Jsem váš Bohumínský rodinný rádce. Znám výborně Bohumín a jeho okolí. Pomohu vám naplánovat rodinné výlety, najít nejlepší cyklotrasu, vyřešit kolize v kalendáři nebo vymyslet, co podniknout o víkendu. Na co se chcete zeptat?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Modal State for adding to calendar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState<TripTip | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('2026-07-19');
  const [formStartTime, setFormStartTime] = useState('14:00');
  const [formEndTime, setFormEndTime] = useState('16:00');
  const [formLocation, setFormLocation] = useState('');
  const [formCategory, setFormCategory] = useState<ActivityType>('free');
  const [formSelectedMembers, setFormSelectedMembers] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Fetch dynamic tips from Gemini backend
  const handleFetchDynamicTips = async (categoryFilter?: string, queryText?: string) => {
    setLoadingTips(true);
    const cat = categoryFilter !== undefined ? categoryFilter : selectedCategory;
    const search = queryText !== undefined ? queryText : searchQuery;

    try {
      const kid1 = members.find(m => m.role === 'dite1')?.age || 10;
      const kid2 = members.find(m => m.role === 'dite2')?.age || 6;

      const response = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          kid1Age: kid1, 
          kid2Age: kid2,
          searchQuery: search,
          category: cat
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setTips(data);
          setActiveSearch(search);
        }
      }
    } catch (err) {
      console.error("Nepodařilo se načíst dynamické tipy:", err);
    } finally {
      setLoadingTips(false);
    }
  };

  // Trigger search on submit or refresh
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchDynamicTips(selectedCategory, searchQuery);
  };

  // Trigger filter selection (fresh query if user wants)
  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    // Fetch with selected category and current search query
    handleFetchDynamicTips(cat, searchQuery);
  };

  // Send message to Gemini chat assistant
  const handleSendMessage = async (msgText: string) => {
    if (!msgText.trim() || sendingMessage) return;

    const userMsg: ChatMessage = { role: 'user', content: msgText };
    const updatedMessages = [...chatMessages, userMsg];
    
    setChatMessages(updatedMessages);
    setInputMessage('');
    setSendingMessage(true);

    try {
      const response = await fetch('/api/ask-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          members,
          activities
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: 'model', content: data.content }]);
      } else {
        throw new Error("Chyba při komunikaci se serverem");
      }
    } catch (err) {
      console.error("Chyba chat bota:", err);
      setChatMessages(prev => [
        ...prev,
        { 
          role: 'model', 
          content: 'Omlouvám se, ale nepodařilo se mi spojit se serverem. Zkontrolujte prosím připojení nebo zkuste napsat znovu později.' 
        }
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  // Open add-to-calendar modal with pre-populated data
  const openAddModal = (tip: TripTip) => {
    setSelectedTip(tip);
    setFormTitle(tip.title);
    setFormDescription(tip.description);
    setFormDate(tip.date || '2026-07-20');
    setFormStartTime(tip.startTime || '14:00');
    setFormEndTime(tip.endTime || '17:00');
    setFormLocation(tip.location);
    
    // Choose activity type based on category
    let initialType: ActivityType = 'free';
    if (tip.category === 'active') initialType = 'club';
    else if (tip.category === 'culture') initialType = 'other';
    else if (tip.category === 'water') initialType = 'free';
    setFormCategory(initialType);

    // Default to selecting all family members
    setFormSelectedMembers(members.map(m => m.id));
    setIsModalOpen(true);
  };

  // Handle adding action
  const handleSaveToCalendar = () => {
    if (!onAddActivity || !selectedTip) return;

    const newActivity: Activity = {
      id: `act-ai-${Date.now()}`,
      title: formTitle,
      description: formDescription,
      memberIds: formSelectedMembers,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      type: formCategory,
      location: formLocation
    };

    onAddActivity(newActivity);
    setIsModalOpen(false);
    setSelectedTip(null);
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'water': return <Waves className="w-4 h-4 text-blue-500" />;
      case 'nature': return <TreePine className="w-4 h-4 text-emerald-500" />;
      case 'culture': return <Castle className="w-4 h-4 text-purple-500" />;
      case 'active': return <Dumbbell className="w-4 h-4 text-amber-500" />;
      default: return <Compass className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case 'water': return 'Koupání / Voda';
      case 'nature': return 'Příroda / Parky';
      case 'culture': return 'Kultura / Památky';
      case 'active': return 'Aktivní / Sport';
      default: return 'Ostatní';
    }
  };

  const quickQuestions = [
    "Co podniknout o víkendu v Bohumíně?",
    "Máme v kalendáři nějaké kolize?",
    "Kam jet na jídlo s dětmi v okolí?",
    "Navrhni cyklotrasu podél řeky Odry."
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
      
      {/* LEFT COLUMN: Trip Tips (7 cols on XL) */}
      <div className="xl:col-span-7 flex flex-col space-y-6">
        
        {/* Search & Action Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 id="tips-heading" className="text-xl sm:text-2xl font-black text-indigo-950 flex items-center gap-2 uppercase tracking-tight font-display">
                <Compass className="w-5.5 h-5.5 text-indigo-600" />
                AI Výlety & Akce Bohumín
              </h2>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                Vyhledejte reálné akce, festivaly a výlety v Bohumíně a okolí.
              </p>
            </div>

            <button
              id="btn-fetch-tips"
              onClick={() => handleFetchDynamicTips(selectedCategory, searchQuery)}
              disabled={loadingTips}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 disabled:bg-slate-50 text-indigo-700 disabled:text-slate-400 border border-indigo-100 rounded-xl text-xs font-bold uppercase tracking-wider shadow-3xs transition shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingTips ? 'animate-spin' : ''}`} />
              {loadingTips ? 'Vyhledávám...' : 'Aktualizovat z AI'}
            </button>
          </div>

          {/* Search bar form */}
          <form id="search-tips-form" onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="search-tips-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hledat akce (např. koncert, letní kino, dětský den, koupání)..."
                className="w-full text-xs border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 bg-slate-50 placeholder-slate-400 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
            <button
              id="btn-search-tips-submit"
              type="submit"
              disabled={loadingTips}
              className="flex items-center justify-center gap-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-50"
            >
              Hledat
            </button>
          </form>

          {activeSearch && (
            <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100/60 rounded-xl px-3 py-1.5 text-[11px] font-bold text-indigo-950">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Výsledky hledání pro: "{activeSearch}"
              </span>
              <button 
                type="button" 
                onClick={() => { setSearchQuery(''); handleFetchDynamicTips(selectedCategory, ''); }}
                className="text-indigo-600 hover:text-indigo-800 uppercase text-[9px] tracking-wider"
              >
                Zrušit hledání
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
          <button
            id="tip-filter-all"
            onClick={() => handleCategorySelect('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 shadow-3xs'
            }`}
          >
            Všechny výlety
          </button>
          {['nature', 'water', 'active', 'culture', 'indoor'].map((cat) => (
            <button
              id={`tip-filter-${cat}`}
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 shadow-3xs'
              }`}
            >
              {getCategoryIcon(cat)}
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Tips list */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
          {loadingTips ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
              <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
              <div>
                <p className="text-slate-800 font-bold">Vyhledávám reálné události a tipy v okolí Bohumína...</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Grounded s aktuálními informacemi z internetu.</p>
              </div>
            </div>
          ) : tips.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 font-medium">
              Nebyly nalezeny žádné akce pro vybrané vyhledávání. Zkuste hledat jiné klíčové slovo.
            </div>
          ) : (
            tips.map((tip) => (
              <motion.div
                id={`tip-card-${tip.id}`}
                key={tip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-black text-indigo-950 font-display text-base uppercase tracking-tight leading-snug">{tip.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {tip.location}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wide">
                          🚗 {tip.distance}
                        </span>
                        {tip.date && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 text-[10px] text-rose-500 font-extrabold uppercase tracking-wide">
                              <Calendar className="w-3 h-3" />
                              {new Date(tip.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </>
                        )}
                        {tip.startTime && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                              <Clock className="w-3 h-3" />
                              {tip.startTime} {tip.endTime ? `- ${tip.endTime}` : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-xl text-xs font-bold border border-slate-100 shrink-0">
                      {getCategoryIcon(tip.category)}
                      <span className="text-slate-600 text-[10px] uppercase font-bold">{tip.category}</span>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {tip.description}
                  </p>
                </div>

                {/* Footer labels */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {tip.suitableForKids ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black uppercase tracking-wider">
                        <Baby className="w-3 h-3 text-emerald-500" /> Vhodné pro děti
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100 text-[9px] font-black uppercase tracking-wider">
                        Pro starší děti
                      </span>
                    )}
                  </div>
                  
                  {/* Add to calendar button */}
                  <button
                    id={`btn-add-tip-${tip.id}`}
                    onClick={() => openAddModal(tip)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-2xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Naplánovat v kalendáři
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: AI Chat Assistant (5 cols on XL) - Dark Accent Card (Signature Bento) */}
      <div className="xl:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl flex flex-col h-[650px] overflow-hidden text-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-100 text-sm flex items-center gap-2 uppercase tracking-wide font-display">
                AI Rodinný Rádce
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Online"></span>
              </h3>
              <p className="text-[10px] text-slate-400 leading-tight uppercase font-extrabold tracking-wider">Poradce s kontextem rodiny a plánů</p>
            </div>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
          <AnimatePresence initial={false}>
            {chatMessages.map((msg, index) => {
              const isAI = msg.role === 'model';
              return (
                <motion.div
                  id={`chat-message-${index}`}
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isAI ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/50' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Body */}
                  <div className={`rounded-2xl p-3.5 text-xs leading-relaxed border ${
                    isAI 
                      ? 'bg-slate-800/70 border-slate-700/60 text-slate-100' 
                      : 'bg-indigo-600 border-transparent text-white shadow-sm'
                  }`}>
                    {/* Preserve line breaks */}
                    <div className="whitespace-pre-line space-y-2">
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {sendingMessage && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-800/50 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="font-bold uppercase text-[10px] tracking-wider">Rádce přemýšlí</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce"></span>
                    <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce delay-100"></span>
                    <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce delay-200"></span>
                  </span>
                </div>
              </div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex gap-1.5 overflow-x-auto">
          {quickQuestions.map((q, idx) => (
            <button
              id={`quick-question-chip-${idx}`}
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={sendingMessage}
              className="text-[10px] font-bold bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-3.5 py-2 rounded-full shrink-0 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <form
            id="chat-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="flex gap-2"
          >
            <input
              id="chat-message-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Zeptejte se na plány, kolize nebo výlety..."
              disabled={sendingMessage}
              className="flex-1 text-xs border border-slate-800 rounded-xl px-3.5 py-2.5 bg-slate-900 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              id="btn-send-chat-msg"
              type="submit"
              disabled={!inputMessage.trim() || sendingMessage}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-xl transition shadow-sm shrink-0"
              title="Odeslat"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest font-extrabold mt-2">
            Asistent zohledňuje věk dětí a kalendář
          </p>
        </div>

      </div>

      {/* Add To Calendar Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && selectedTip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-indigo-950 p-5 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wide font-display">Naplánovat rodinný zážitek</h3>
                    <p className="text-[10px] text-indigo-200 leading-none mt-0.5">Uložení tipu přímo do sdíleného kalendáře</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setSelectedTip(null); }}
                  className="p-1.5 hover:bg-indigo-900 text-indigo-300 hover:text-white rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body / Scrollable Form */}
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-slate-800">
                
                {/* Information Callout */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wide">Předvyplněno pomocí AI</h4>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1">
                      Detaily, doporučený letní den i hodiny byly automaticky přizpůsobeny charakteru akce. Hodnoty můžete upravit.
                    </p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-3">
                  
                  {/* Title */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Název aktivity v kalendáři</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  {/* Date and Times in row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Datum konání</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Začátek</label>
                      <input
                        type="text"
                        placeholder="HH:MM"
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Konec</label>
                      <input
                        type="text"
                        placeholder="HH:MM"
                        value={formEndTime}
                        onChange={(e) => setFormEndTime(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Lokalita / Místo</label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  {/* Category Type */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Typ aktivity</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ActivityType)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    >
                      <option value="free">Volný čas / Výlet</option>
                      <option value="club">Kroužek / Organizovaná akce</option>
                      <option value="holiday">Prázdniny / Dovolená</option>
                      <option value="other">Ostatní rodinná záležitost</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Popis / Poznámky</label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition resize-none"
                    />
                  </div>

                  {/* Selected Members */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Kdo se zúčastní?</label>
                    <div className="flex flex-wrap gap-2">
                      {members.map((m) => {
                        const isSelected = formSelectedMembers.includes(m.id);
                        return (
                          <button
                            id={`modal-member-btn-${m.id}`}
                            key={m.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setFormSelectedMembers(formSelectedMembers.filter(id => id !== m.id));
                              } else {
                                setFormSelectedMembers([...formSelectedMembers, m.id]);
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition duration-200 ${
                              isSelected 
                                ? `${m.lightBgClass} ${m.borderClass} ${m.textClass}`
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
                            }`}
                          >
                            <span className="text-sm">{m.avatar}</span>
                            <span>{m.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setSelectedTip(null); }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider hover:bg-slate-100 rounded-xl transition"
                >
                  Zrušit
                </button>
                <button
                  id="btn-confirm-add-activity"
                  type="button"
                  onClick={handleSaveToCalendar}
                  disabled={formSelectedMembers.length === 0 || !formTitle.trim()}
                  className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs transition"
                >
                  <Plus className="w-4 h-4" />
                  Uložit do kalendáře
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
