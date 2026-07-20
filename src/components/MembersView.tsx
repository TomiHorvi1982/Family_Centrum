import React, { useState } from 'react';
import { Member } from '../types';
import { User, Edit3, Check, RefreshCw, Share2, Home } from 'lucide-react';
import { motion } from 'motion/react';
import FamilyTreeView from './FamilyTreeView';

const AVATAR_OPTIONS: Record<string, string[]> = {
  manzel: ['🧔', '👨', '👨‍🦰', '👨‍🦳', '👨‍💻', '🤵', '🚴', '⚽', '🕶️', '🦁'],
  manzelka: ['👩', '👩‍🦰', '👩‍🦳', '👩‍💻', '👩‍⚕️', '🤰', '🧘', '🎨', '🌷', '🦊'],
  dite1: ['👦', '🧒', '🧑‍💻', '🏃', '🎮', '🛹', '🦖', '🍕', '🐱', '🚀'],
  dite2: ['👧', '🧒', '👩‍🎨', '🦄', '🩰', '🎨', '🧸', '🍭', '🐶', '⭐']
};

interface MembersViewProps {
  members: Member[];
  onUpdateMember: (updatedMember: Member) => void;
  onResetToDefaults: () => void;
}

export default function MembersView({ members, onUpdateMember, onResetToDefaults }: MembersViewProps) {
  const [subTab, setSubTab] = useState<'tree' | 'household'>('tree');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState<number | ''>('');
  const [editAvatar, setEditAvatar] = useState('');

  const handleStartEdit = (member: Member) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditAge(member.age || '');
    setEditAvatar(member.avatar);
  };

  const handleSaveEdit = (member: Member) => {
    if (!editName.trim()) return;
    onUpdateMember({
      ...member,
      name: editName,
      age: editAge === '' ? undefined : Number(editAge),
      avatar: editAvatar
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setSubTab('tree')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            subTab === 'tree'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Share2 className="w-4 h-4 text-indigo-500" />
          🌳 Rodokmen & Příbuzní
        </button>

        <button
          onClick={() => setSubTab('household')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            subTab === 'household'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Home className="w-4 h-4 text-emerald-500" />
          🏠 Členové naší domácnosti
        </button>
      </div>

      {subTab === 'tree' ? (
        <FamilyTreeView coreMembers={members} />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <h2 id="members-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-950 dark:text-white uppercase font-display">
                Složení naší rodiny
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Zde můžete upravit jména, věk a vybrat si z nových personalizovaných ikon členů vaší domácnosti.
              </p>
            </div>
            <button
              id="btn-reset-family"
              onClick={onResetToDefaults}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-indigo-950 rounded-2xl text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 shadow-3xs transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Obnovit výchozí hodnoty
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {members.map((member) => {
              const isEditing = editingId === member.id;
              return (
                <motion.div
                   id={`member-card-${member.id}`}
                   key={member.id}
                   layout
                   className={`rounded-3xl border bg-white dark:bg-slate-800 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                     isEditing ? 'ring-4 ring-indigo-500/15 border-indigo-300 dark:border-indigo-500 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-slate-300'
                   }`}
                >
                  {/* Colored side-stripe */}
                  <div className={`absolute top-0 left-0 bottom-0 w-2 ${member.bgClass}`} />

                  <div className="pl-2 space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="select-none flex flex-col items-center gap-1.5 w-full">
                        {isEditing ? (
                          <div className="flex flex-col items-center gap-1.5 w-full">
                            <div className="w-14 h-14 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-3xs relative">
                              {editAvatar && (editAvatar.startsWith('data:image/') || editAvatar.startsWith('http')) ? (
                                <img src={editAvatar} className="w-full h-full object-cover" alt="Avatar preview" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-3xl">{editAvatar || '👤'}</span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 items-center w-full">
                              <div className="flex gap-1.5 items-center justify-center">
                                <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-900 transition shadow-3xs text-center">
                                  Nahrát foto
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          const base64 = event.target?.result as string;
                                          setEditAvatar(base64);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                                <input
                                  id={`edit-avatar-${member.id}`}
                                  type="text"
                                  value={editAvatar && (editAvatar.startsWith('data:image/') || editAvatar.startsWith('http')) ? '' : editAvatar}
                                  placeholder="Emoji"
                                  onChange={(e) => setEditAvatar(e.target.value)}
                                  className="w-14 text-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-[10px] p-0.5"
                                  maxLength={4}
                                  title="Nebo zadejte Emoji"
                                />
                              </div>

                              {/* Predefined Avatars Picker Grid */}
                              <div className="mt-2.5 w-full border-t border-slate-100 dark:border-slate-800 pt-2">
                                <p className="text-[9px] font-bold text-slate-400 uppercase text-center mb-1.5">Vyberte si avatar:</p>
                                <div className="grid grid-cols-5 gap-1 justify-items-center max-w-[150px] mx-auto">
                                  {(AVATAR_OPTIONS[member.role] || []).map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => setEditAvatar(emoji)}
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all border cursor-pointer ${
                                        editAvatar === emoji 
                                          ? 'bg-indigo-100 border-indigo-400 dark:bg-indigo-950 scale-110 shadow-3xs' 
                                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 hover:scale-105'
                                      }`}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-full border border-slate-200 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden shadow-3xs">
                            {member.avatar && (member.avatar.startsWith('data:image/') || member.avatar.startsWith('http')) ? (
                              <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-3xl" role="img" aria-label="Avatar">
                                {member.avatar || '👤'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${member.lightBgClass} ${member.textClass}`}>
                        {member.role === 'manzel'
                          ? 'Táta'
                          : member.role === 'manzelka'
                          ? 'Máma'
                          : member.role === 'dite1'
                          ? 'Syn'
                          : 'Dcera'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div>
                            <label htmlFor={`edit-name-${member.id}`} className="block text-[10px] font-semibold uppercase text-slate-400">Jméno</label>
                            <input
                              id={`edit-name-${member.id}`}
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor={`edit-age-${member.id}`} className="block text-[10px] font-semibold uppercase text-slate-400">Věk (nepovinné)</label>
                            <input
                              id={`edit-age-${member.id}`}
                              type="number"
                              value={editAge}
                              onChange={(e) => setEditAge(e.target.value === '' ? '' : Number(e.target.value))}
                              className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-black text-indigo-950 dark:text-white text-lg uppercase font-display tracking-tight">{member.name}</h3>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">
                            {member.age ? `Věk: ${member.age} let` : 'Věk neuveden'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end pl-2">
                    {isEditing ? (
                      <button
                        id={`btn-save-member-${member.id}`}
                        onClick={() => handleSaveEdit(member)}
                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition shadow-3xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Uložit
                      </button>
                    ) : (
                      <button
                        id={`btn-edit-member-${member.id}`}
                        onClick={() => handleStartEdit(member)}
                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-indigo-650 hover:bg-indigo-50/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Upravit
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

