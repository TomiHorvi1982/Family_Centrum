import React, { useState } from 'react';
import { Contact, ContactCategory } from '../types';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Copy, 
  Heart, 
  Stethoscope, 
  GraduationCap, 
  ShieldAlert, 
  Info, 
  Check, 
  X,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContactsViewProps {
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
}

const CATEGORY_META = {
  family: { label: 'Rodina', icon: Heart, colorClass: 'text-rose-500 bg-rose-50 border-rose-100' },
  doctor: { label: 'Doktoři & Lékaři', icon: Stethoscope, colorClass: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
  school: { label: 'Škola & Kroužky', icon: GraduationCap, colorClass: 'text-blue-500 bg-blue-50 border-blue-100' },
  services: { label: 'Služby & Úřady', icon: ShieldAlert, colorClass: 'text-amber-500 bg-amber-50 border-amber-100' },
  other: { label: 'Ostatní', icon: Info, colorClass: 'text-slate-500 bg-slate-50 border-slate-100' }
};

export default function ContactsView({ contacts, onAddContact, onUpdateContact, onDeleteContact }: ContactsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory | 'all'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<ContactCategory>('family');

  const handleCopyPhone = (contact: Contact) => {
    navigator.clipboard.writeText(contact.phone);
    setCopiedId(contact.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAddForm = () => {
    setIsAdding(true);
    setEditingId(null);
    resetForm();
  };

  const handleOpenEditForm = (contact: Contact) => {
    setEditingId(contact.id);
    setIsAdding(false);
    setName(contact.name);
    setRelation(contact.relation);
    setPhone(contact.phone);
    setEmail(contact.email || '');
    setAddress(contact.address || '');
    setNote(contact.note || '');
    setCategory(contact.category);
  };

  const resetForm = () => {
    setName('');
    setRelation('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNote('');
    setCategory('family');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !relation.trim()) return;

    if (editingId) {
      onUpdateContact({
        id: editingId,
        name,
        relation,
        phone,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        note: note.trim() || undefined,
        category
      });
      setEditingId(null);
    } else {
      onAddContact({
        id: 'contact-' + Date.now(),
        name,
        relation,
        phone,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        note: note.trim() || undefined,
        category
      });
      setIsAdding(false);
    }
    resetForm();
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.relation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.note && contact.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      contact.phone.includes(searchTerm);
    
    const matchesCategory = selectedCategory === 'all' || contact.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 id="contacts-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-950 uppercase font-display">
            Důležité kontakty
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Mějte telefonní čísla na babičku, doktory, školy i tísňové linky v Bohumíně vždy po ruce.
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            id="btn-add-contact"
            onClick={handleOpenAddForm}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            Nový kontakt
          </button>
        )}
      </div>

      {/* Form Area */}
      <AnimatePresence mode="wait">
        {(isAdding || editingId) && (
          <motion.div
            id="contact-form-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 overflow-hidden shadow-sm"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-indigo-950 text-base uppercase tracking-wider font-display">
                {editingId ? 'Upravit rodinný kontakt' : 'Přidat nový rodinný kontakt'}
              </h3>
              <button
                id="btn-close-contact-form"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-650 p-1.5 rounded-full hover:bg-slate-100 transition"
                aria-label="Zrušit"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="contact-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="contact-name" className="text-xs font-semibold text-slate-500 uppercase">Jméno nebo Název instituce *</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="např. Dětská lékařka, ZŠ Čs. armády"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-relation" className="text-xs font-semibold text-slate-500 uppercase">Vztah / Popis *</label>
                <input
                  id="contact-relation"
                  type="text"
                  required
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  placeholder="např. Pediatr, Třídní učitelka Tomíka"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-phone" className="text-xs font-semibold text-slate-500 uppercase">Telefon *</label>
                <input
                  id="contact-phone"
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="např. +420 596 012 345 nebo 112"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-email" className="text-xs font-semibold text-slate-500 uppercase">E-mail (nepovinné)</label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="např. skola@bohumin.cz"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-category" className="text-xs font-semibold text-slate-500 uppercase">Kategorie</label>
                <select
                  id="contact-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ContactCategory)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="family">Rodina</option>
                  <option value="doctor">Doktoři & Lékaři</option>
                  <option value="school">Škola & Kroužky</option>
                  <option value="services">Služby & Úřady</option>
                  <option value="other">Ostatní</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-address" className="text-xs font-semibold text-slate-500 uppercase">Adresa (nepovinné)</label>
                <input
                  id="contact-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="např. Koperníkova 1200, Bohumín"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label htmlFor="contact-note" className="text-xs font-semibold text-slate-500 uppercase">Poznámka / Ordinační hodiny / Detaily</label>
                <textarea
                  id="contact-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="např. Ordinační doba Po-Pá 8-12 hod, volat předem"
                  rows={2}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  id="btn-cancel-contact"
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                >
                  Zrušit
                </button>
                <button
                  id="btn-submit-contact"
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-3xs transition"
                >
                  {editingId ? 'Uložit změny' : 'Přidat kontakt'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-contacts"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Vyhledat kontakt podle jména, popisu, telefonu..."
            className="w-full text-sm border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs text-slate-800"
          />
          {searchTerm && (
            <button
              id="btn-clear-search"
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-md transition"
            >
              Vymazat
            </button>
          )}
        </div>

        {/* Categories filters */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          <button
            id="filter-cat-all"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-2xs ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            Všechny
          </button>
          {Object.entries(CATEGORY_META).map(([key, value]) => {
            const Icon = value.icon;
            const isSelected = selectedCategory === key;
            return (
              <button
                id={`filter-cat-${key}`}
                key={key}
                onClick={() => setSelectedCategory(key as ContactCategory)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border border-slate-200 shadow-2xs ${
                  isSelected
                    ? 'bg-slate-800 text-white border-transparent'
                    : 'bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                {value.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Nebyly nalezeny žádné kontakty.</p>
          <p className="text-slate-400 text-sm mt-1">Zkuste upravit vyhledávání nebo filtr.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredContacts.map((contact) => {
              const meta = CATEGORY_META[contact.category];
              const IconComponent = meta.icon;

              return (
                <motion.div
                  id={`contact-card-${contact.id}`}
                  key={contact.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-indigo-950 text-base uppercase font-display tracking-tight leading-snug">{contact.name}</h3>
                          <span className={`flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border tracking-wider ${meta.colorClass}`}>
                            <IconComponent className="w-2.5 h-2.5" />
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-1">{contact.relation}</p>
                      </div>

                      {/* Edit/Delete Actions */}
                      <div className="flex gap-1">
                        <button
                          id={`btn-edit-contact-${contact.id}`}
                          onClick={() => handleOpenEditForm(contact)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="Upravit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-delete-contact-${contact.id}`}
                          onClick={() => {
                            if (confirm(`Opravdu chcete smazat kontakt "${contact.name}"?`)) {
                              onDeleteContact(contact.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Smazat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono font-medium">{contact.phone}</span>
                        <button
                          id={`btn-copy-phone-${contact.id}`}
                          onClick={() => handleCopyPhone(contact)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition"
                          title="Kopírovat číslo"
                        >
                          {copiedId === contact.id ? (
                            <span className="text-[10px] text-emerald-600 font-semibold px-1">Zkopírováno!</span>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {contact.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{contact.email}</span>
                          <a
                            id={`link-email-${contact.id}`}
                            href={`mailto:${contact.email}`}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition"
                            title="Poslat email"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {contact.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{contact.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Note */}
                  {contact.note && (
                    <div className="mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                      <span className="font-semibold block mb-0.5 text-slate-600">Detaily / Poznámka:</span>
                      {contact.note}
                    </div>
                  )}

                  {/* Click to Call Button */}
                  <div className="mt-4 flex gap-2">
                    <a
                      id={`link-call-${contact.id}`}
                      href={`tel:${contact.phone}`}
                      className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-250 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-3xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Zavolat
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
