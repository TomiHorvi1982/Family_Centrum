import React, { useState } from 'react';
import { Member, HelpQuestion, HelpAnswer } from '../types';
import { 
  HelpCircle, 
  MessageSquare, 
  Heart, 
  Brain, 
  Sparkles, 
  PlusCircle, 
  Trash2, 
  Compass, 
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Smile,
  MessageCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WhatToDoViewProps {
  members: Member[];
  questions: HelpQuestion[];
  onAddQuestion: (question: Omit<HelpQuestion, 'id' | 'createdAt' | 'answers'>) => void;
  onAddAnswer: (questionId: string, answer: Omit<HelpAnswer, 'id' | 'createdAt'>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onGetAiAdvice: (questionId: string) => Promise<void>;
}

export default function WhatToDoView({ 
  members, 
  questions, 
  onAddQuestion, 
  onAddAnswer, 
  onDeleteQuestion,
  onGetAiAdvice 
}: WhatToDoViewProps) {
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  
  // Question form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'vychova' | 'puberta' | 'vztahy' | 'skola' | 'psychologie' | 'emoce'>('vychova');
  const [newSenderId, setNewSenderId] = useState(members[0]?.id || 'member-3');

  // Answer form states (keyed by question ID)
  const [answerTexts, setAnswerTexts] = useState<Record<string, string>>({});
  const [answerSenderIds, setAnswerSenderIds] = useState<Record<string, string>>({});
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [aiLoadingStates, setAiLoadingStates] = useState<Record<string, boolean>>({});

  const categories = [
    { value: 'all', label: 'Všechny otázky', icon: HelpCircle, bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    { value: 'vychova', label: 'Výchova', icon: GraduationCap, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'puberta', label: 'Puberta', icon: Sparkles, bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'vztahy', label: 'Vztahy', icon: Heart, bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    { value: 'skola', label: 'Škola & Kamarádi', icon: Compass, bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'psychologie', label: 'Psychologie & Emoce', icon: Brain, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  ];

  const getCategoryDetails = (cat: string) => {
    return categories.find(c => c.value === cat) || categories[1];
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddQuestion({
      senderId: newSenderId,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory
    });

    // Reset
    setNewTitle('');
    setNewContent('');
    setIsAddingQuestion(false);
  };

  const handleCreateAnswer = (questionId: string) => {
    const text = answerTexts[questionId];
    const senderId = answerSenderIds[questionId] || members[0]?.id;

    if (!text || !text.trim()) return;

    const author = members.find(m => m.id === senderId);
    if (!author) return;

    onAddAnswer(questionId, {
      authorId: senderId,
      authorName: `${author.name} (${senderRoleLabel(author.role)})`,
      authorAvatar: author.avatar,
      content: text.trim()
    });

    // Clear text
    setAnswerTexts(prev => ({ ...prev, [questionId]: '' }));
  };

  const handleFetchAiAdvice = async (questionId: string) => {
    setAiLoadingStates(prev => ({ ...prev, [questionId]: true }));
    try {
      await onGetAiAdvice(questionId);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoadingStates(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const senderRoleLabel = (role: string) => {
    if (role === 'manzel') return 'Táta';
    if (role === 'manzelka') return 'Máma';
    if (role === 'dite1') return 'Syn';
    if (role === 'dite2') return 'Dcera';
    return 'Rodina';
  };

  const toggleQuestionExpanded = (id: string) => {
    setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter questions
  const filteredQuestions = selectedCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === selectedCategory);

  return (
    <div className="space-y-6">
      
      {/* Bento Header Intro */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
              Nový modul
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 text-xs font-semibold">Psychologická poradna</span>
          </div>
          <h2 className="text-2xl font-black text-indigo-950 font-display">
            Co mám dělat, když... 🤔
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Náš rodinný bezpečný přístav. Položte jakoukoliv otázku ohledně dětí, vztahů, puberty, výchovy nebo emocí. Ostatní členové rodiny vám poradí, nebo můžete jedním kliknutím získat citlivou odpověď od naší rodinné AI psycholožky.
          </p>
        </div>
        <button
          onClick={() => setIsAddingQuestion(!isAddingQuestion)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-sm transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Položit otázku
        </button>
      </div>

      {/* Form to Add Question */}
      <AnimatePresence>
        {isAddingQuestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateQuestion} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                Nová otázka "Co mám dělat, když..."
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Co mám dělat, když...</label>
                  <input
                    type="text"
                    required
                    placeholder="...se mi vůbec nechce psát úkoly / ...se ségra nechce dělit o hračky / ...jsem večer strašně unavená"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                {/* Sender Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kdo se ptá?</label>
                  <select
                    value={newSenderId}
                    onChange={(e) => setNewSenderId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.avatar} {m.name} ({senderRoleLabel(m.role)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategorie tématu</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    <option value="vychova">👶 Výchova dětí</option>
                    <option value="puberta">⚡ Puberta & dospívání</option>
                    <option value="vztahy">❤️ Sourozenci & Vztahy</option>
                    <option value="skola">📚 Škola & Kroužky</option>
                    <option value="psychologie">🧠 Emoce & Psychologie</option>
                  </select>
                </div>

                {/* Content */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Podrobnosti (volitelné)</label>
                  <textarea
                    rows={3}
                    placeholder="Popiš situaci trochu podrobněji, ať ti rodina nebo AI mohou lépe poradit (např. kolik je komu let, co přesně se stalo)..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-600 transition"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs uppercase tracking-wider text-white shadow-sm transition"
                >
                  Položit otázku
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Tabs */}
      <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive 
                  ? `${cat.bg} border-current ring-1 ring-current shadow-2xs` 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600">
              <Smile className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Žádné otázky v této kategorii</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Nezdráhejte se být první! Klikněte na tlačítko nahoře a zeptejte se na cokoli, co vás zrovna trápí.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const sender = members.find(m => m.id === q.senderId);
            const catDetails = getCategoryDetails(q.category);
            const CatIcon = catDetails.icon;
            const isExpanded = expandedQuestions[q.id] ?? true; // Default expanded for great visibility
            const isLoadingAi = aiLoadingStates[q.id];

            // Filter answer into AI vs family
            const aiAnswer = q.answers.find(ans => ans.authorId === 'ai');
            const familyAnswers = q.answers.filter(ans => ans.authorId !== 'ai');

            return (
              <div 
                key={q.id} 
                className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 transition overflow-hidden shadow-2xs"
              >
                {/* Header section of card */}
                <div className="p-6 pb-4 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-xl border border-slate-100 shadow-3xs">
                        {sender?.avatar || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {sender ? sender.name : 'Neznámý člen'}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                            {sender ? senderRoleLabel(sender.role) : 'Rodina'}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                          {new Date(q.createdAt).toLocaleString('cs-CZ', { 
                            day: 'numeric', 
                            month: 'long', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider ${catDetails.bg}`}>
                        <CatIcon className="w-3.5 h-3.5" />
                        {catDetails.label}
                      </span>
                      <button
                        onClick={() => onDeleteQuestion(q.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Smazat otázku"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Main Question Heading */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-extrabold text-slate-900 leading-snug">
                      Co mám dělat, když <span className="text-indigo-600">{q.title}</span>?
                    </h4>
                    {q.content && (
                      <p className="text-sm text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 leading-relaxed italic">
                        "{q.content}"
                      </p>
                    )}
                  </div>

                  {/* CTA row (expand/collapse & AI Advice Button) */}
                  <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => toggleQuestionExpanded(q.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 text-indigo-500" />
                          Skrýt odpovědi ({q.answers.length})
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 text-indigo-500" />
                          Zobrazit odpovědi ({q.answers.length})
                        </>
                      )}
                    </button>

                    <div className="flex gap-2">
                      {!aiAnswer && (
                        <button
                          onClick={() => handleFetchAiAdvice(q.id)}
                          disabled={isLoadingAi}
                          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                          {isLoadingAi ? 'AI přemýšlí...' : 'Zeptat se AI Psychologa'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Answers / Comments Accordion Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 bg-slate-50/40"
                    >
                      <div className="p-6 space-y-6">
                        
                        {/* Loading indicator for AI generation */}
                        {isLoadingAi && (
                          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 space-y-4 animate-pulse">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-indigo-600 animate-spin" />
                              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">AI psychologická poradna vypracovává radu...</span>
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 bg-indigo-100 rounded-full w-5/6"></div>
                              <div className="h-3 bg-indigo-100 rounded-full w-full"></div>
                              <div className="h-3 bg-indigo-100 rounded-full w-4/5"></div>
                            </div>
                            <span className="text-[10px] text-indigo-400 font-semibold italic block">
                              "Pamatuj, že každá rodinná výzva se dá vyřešit láskou, trpělivostí a správným slovem."
                            </span>
                          </div>
                        )}

                        {/* AI Advice Block */}
                        {aiAnswer && (
                          <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/30 border border-indigo-100/80 rounded-3xl p-6 relative overflow-hidden shadow-2xs">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                              <Brain className="w-24 h-24 text-indigo-600" />
                            </div>

                            <div className="flex items-start gap-3.5">
                              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl text-white shrink-0 shadow-md shadow-indigo-500/20">
                                🤖
                              </div>
                              <div className="space-y-3 w-full">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-indigo-950 text-sm">
                                        AI Psychologický Rádce
                                      </span>
                                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[8px] font-black uppercase tracking-wider">
                                        Odborný pohled
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
                                      {new Date(aiAnswer.createdAt).toLocaleString('cs-CZ', { 
                                        day: 'numeric', 
                                        month: 'long', 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm text-slate-700 leading-relaxed space-y-2 whitespace-pre-wrap">
                                  {aiAnswer.content}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Family Answers list */}
                        {familyAnswers.length > 0 && (
                          <div className="space-y-4">
                            <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2 pl-1">
                              <MessageCircle className="w-4 h-4 text-emerald-500" />
                              Rady a podpora od rodiny ({familyAnswers.length})
                            </h5>

                            <div className="space-y-3">
                              {familyAnswers.map((ans) => (
                                <div key={ans.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-lg border border-slate-100 shrink-0 select-none">
                                    {ans.authorAvatar}
                                  </div>
                                  <div className="space-y-1 w-full">
                                    <div className="flex justify-between items-baseline">
                                      <span className="font-bold text-slate-800 text-xs">
                                        {ans.authorName}
                                      </span>
                                      <span className="text-[9px] text-slate-400">
                                        {new Date(ans.createdAt).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                      {ans.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {familyAnswers.length === 0 && !aiAnswer && !isLoadingAi && (
                          <div className="text-center py-4 text-xs text-slate-400 italic">
                            Zatím nikdo neporadil. Buďte první, kdo podá pomocnou ruku!
                          </div>
                        )}

                        {/* Write Advice Form */}
                        <div className="border-t border-slate-100 pt-5 space-y-4">
                          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider pl-1">
                            Poradit nebo podpořit člena rodiny
                          </h5>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
                            {/* Member select */}
                            <select
                              value={answerSenderIds[q.id] || members[0]?.id || ''}
                              onChange={(e) => setAnswerSenderIds(prev => ({ ...prev, [q.id]: e.target.value }))}
                              className="bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/20 shadow-3xs shrink-0 self-start sm:w-44"
                            >
                              {members.map(m => (
                                <option key={m.id} value={m.id}>
                                  {m.avatar} {m.name}
                                </option>
                              ))}
                            </select>

                            {/* Message input */}
                            <div className="w-full flex gap-2">
                              <input
                                type="text"
                                placeholder="Napiš svou radu, podporu nebo pochopení..."
                                value={answerTexts[q.id] || ''}
                                onChange={(e) => setAnswerTexts(prev => ({ ...prev, [q.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCreateAnswer(q.id);
                                  }
                                }}
                                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-3xs"
                              />
                              <button
                                onClick={() => handleCreateAnswer(q.id)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-2xl shadow-xs transition shrink-0"
                              >
                                Poradit
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
