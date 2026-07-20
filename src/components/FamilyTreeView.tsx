import React, { useState, useEffect } from 'react';
import { FamilyTreeMember, Member } from '../types';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Cake, 
  MapPin, 
  Briefcase, 
  Heart, 
  Camera, 
  BookOpen, 
  Info, 
  Check, 
  X,
  FileDown,
  FileUp,
  RefreshCw,
  Search,
  Sparkles,
  Award,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FamilyTreeViewProps {
  coreMembers: Member[]; // Just in case we want to reference them
}

const DEFAULT_TREE_MEMBERS: FamilyTreeMember[] = [
  {
    id: 'tree-josef',
    name: 'Josef Novák',
    relationship: 'Dědeček (tátův otec)',
    gender: 'male',
    avatar: '👴',
    birthDate: '1952-04-12',
    birthPlace: 'Bohumín',
    occupation: 'Bývalý strojvedoucí ČD',
    hobbies: 'Vlaky, kutilství, zahrádka, křížovky, četba historických knih',
    bio: 'Josef pracoval celý život na železnici v Bohumíně jako strojvedoucí. Miluje vyprávění napínavých příběhů ze starých časů a je to rodinný kutil, který opraví naprosto všechno, co mu přijde pod ruku.',
    generation: 2
  },
  {
    id: 'tree-anna',
    name: 'Anna Nováková',
    relationship: 'Babička (tátova matka)',
    gender: 'female',
    avatar: '👵',
    birthDate: '1955-09-22',
    birthPlace: 'Ostrava',
    occupation: 'Učitelka v důchodu',
    hobbies: 'Pečení koláčů, pletení svetrů, zahradničení, četba románů',
    bio: 'Anna učila český jazyk a dějepis na místní základní škole. Její buchty a koláče jsou legendární v celém okolí. Vždy s láskou dbá na správnou výslovnost a češtinu u svých vnoučat.',
    generation: 2,
    spouseId: 'tree-josef'
  },
  {
    id: 'tree-honza',
    name: 'Tomáš Novák',
    relationship: 'Táta',
    gender: 'male',
    avatar: '🧔',
    birthDate: '1984-07-15',
    birthPlace: 'Bohumín',
    occupation: 'Projektový manažer ve stavebnictví',
    hobbies: 'Fotbal, horská cyklistika, grilování na zahradě, technologie',
    bio: 'Tomáš je hlavním pilířem naší domácnosti. Rád organizuje rodinné výlety do hor a stará se o společné víkendové plány. O víkendech ho nejčastěji najdete na kole nebo u grilu.',
    generation: 1,
    fatherId: 'tree-josef',
    motherId: 'tree-anna'
  },
  {
    id: 'tree-marie',
    name: 'Veronika Nováková',
    relationship: 'Máma',
    gender: 'female',
    avatar: '👩',
    birthDate: '1986-11-03',
    birthPlace: 'Karviná',
    occupation: 'Lékárnice',
    hobbies: 'Jóga, pěstování orchidejí, fotografování rodiny, pečení',
    bio: 'Veronika pracuje v bohumínské lékárně a má obrovské znalosti o bylinkách. Má neuvěřitelnou trpělivost a nejraději tráví čas aranžováním květin na zahradě nebo focením našich dětí při hrách.',
    generation: 1,
    spouseId: 'tree-honza'
  },
  {
    id: 'tree-pavel',
    name: 'Pavel Novák',
    relationship: 'Strýc (tátův bratr)',
    gender: 'male',
    avatar: '🧑',
    birthDate: '1988-02-18',
    birthPlace: 'Bohumín',
    occupation: 'IT Analytik',
    hobbies: 'Počítačové hry, cykloturistika, programování, sci-fi filmy',
    bio: 'Strýček Pavel žije v Ostravě, ale je u nás jako doma. Je to technologický nadšenec, který dětem vždy ukazuje nejnovější herní novinky a pomáhá tátovi s domácí sítí.',
    generation: 1,
    fatherId: 'tree-josef',
    motherId: 'tree-anna'
  },
  {
    id: 'tree-jana',
    name: 'Jana Svobodová',
    relationship: 'Teta (mámina sestra)',
    gender: 'female',
    avatar: '👩‍🦰',
    birthDate: '1990-05-30',
    birthPlace: 'Karviná',
    occupation: 'Grafická designérka',
    hobbies: 'Malování, cestování, jóga, interiérový design',
    bio: 'Teta Jana je velmi kreativní duše. Navrhuje loga a ilustruje knihy. Často s dětmi kreslí složité omalovánky a pomáhá nám s výzdobou domu na Vánoce a Velikonoce.',
    generation: 1
  },
  {
    id: 'tree-tomik',
    name: 'Matyáš Novák',
    relationship: 'Syn',
    gender: 'male',
    avatar: '👦',
    birthDate: '2016-05-10',
    birthPlace: 'Ostrava',
    occupation: 'Žák 4. třídy',
    hobbies: 'Lego, florbal, Minecraft, jízda na koloběžce, programování Scratch',
    bio: 'Matyáš je neskutečně zvídavý kluk. Dokáže z Lego kostek postavit funkční stroje. Ve škole ho nejvíce baví matematika a tělocvik. Hraje florbal za místní bohumínský klub.',
    generation: 0,
    fatherId: 'tree-honza',
    motherId: 'tree-marie'
  },
  {
    id: 'tree-eliska',
    name: 'Sofie Nováková',
    relationship: 'Dcera',
    gender: 'female',
    avatar: '👧',
    birthDate: '2020-03-24',
    birthPlace: 'Ostrava',
    occupation: 'Předškolák',
    hobbies: 'Kreslení, zpívání, panenky Barbie, tancování, pohádky o jednorožcích',
    bio: 'Sofie je naše veselé sluníčko, které neustále zpívá, tancuje a vymýšlí si vlastní divadelní představení. Ráda pomáhá mamince v kuchyni s pečením.',
    generation: 0,
    fatherId: 'tree-honza',
    motherId: 'tree-marie'
  }
];

// Bidirectional linking for defaults
DEFAULT_TREE_MEMBERS[0].spouseId = 'tree-anna'; // Josef -> Anna
DEFAULT_TREE_MEMBERS[2].spouseId = 'tree-marie'; // Honza -> Marie

export default function FamilyTreeView({ coreMembers }: FamilyTreeViewProps) {
  const [treeMembers, setTreeMembers] = useState<FamilyTreeMember[]>(() => {
    const saved = localStorage.getItem('family_tree_members');
    return saved ? JSON.parse(saved) : DEFAULT_TREE_MEMBERS;
  });

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(() => {
    return DEFAULT_TREE_MEMBERS[2]?.id || null; // Select Honza by default
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [viewMode, setViewMode] = useState<'tree' | 'directory'>('tree');

  // Form edit states
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formRelationship, setFormRelationship] = useState('');
  const [formGender, setFormGender] = useState<'male' | 'female' | 'other'>('male');
  const [formAvatar, setFormAvatar] = useState('👤');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formBirthPlace, setFormBirthPlace] = useState('');
  const [formOccupation, setFormOccupation] = useState('');
  const [formHobbies, setFormHobbies] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formGeneration, setFormGeneration] = useState<number>(1);
  const [formFatherId, setFormFatherId] = useState('');
  const [formMotherId, setFormMotherId] = useState('');
  const [formSpouseId, setFormSpouseId] = useState('');

  // Persist tree to local storage
  useEffect(() => {
    localStorage.setItem('family_tree_members', JSON.stringify(treeMembers));
  }, [treeMembers]);

  const selectedMember = treeMembers.find(m => m.id === selectedMemberId);

  // Age Calculator
  const calculateAge = (birthDateStr?: string) => {
    if (!birthDateStr) return null;
    const birth = new Date(birthDateStr);
    const today = new Date('2026-07-19'); // Set relative to mock date in metadata
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id);
    setIsEditing(false);
    setIsAdding(false);
  };

  const startEdit = (member: FamilyTreeMember) => {
    setFormId(member.id);
    setFormName(member.name);
    setFormRelationship(member.relationship);
    setFormGender(member.gender);
    setFormAvatar(member.avatar);
    setFormBirthDate(member.birthDate || '');
    setFormBirthPlace(member.birthPlace || '');
    setFormOccupation(member.occupation || '');
    setFormHobbies(member.hobbies || '');
    setFormBio(member.bio || '');
    setFormGeneration(member.generation);
    setFormFatherId(member.fatherId || '');
    setFormMotherId(member.motherId || '');
    setFormSpouseId(member.spouseId || '');
    
    setIsEditing(true);
    setIsAdding(false);
  };

  const startAdd = () => {
    setFormId(`tree-${Date.now()}`);
    setFormName('');
    setFormRelationship('Příbuzný');
    setFormGender('male');
    setFormAvatar('🧑');
    setFormBirthDate('');
    setFormBirthPlace('');
    setFormOccupation('');
    setFormHobbies('');
    setFormBio('');
    setFormGeneration(1);
    setFormFatherId('');
    setFormMotherId('');
    setFormSpouseId('');

    setIsAdding(true);
    setIsEditing(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Zadejte prosím jméno rodinného příslušníka.');
      return;
    }

    const updatedMember: FamilyTreeMember = {
      id: formId,
      name: formName.trim(),
      relationship: formRelationship.trim() || 'Příbuzný',
      gender: formGender,
      avatar: formAvatar,
      birthDate: formBirthDate || undefined,
      birthPlace: formBirthPlace.trim() || undefined,
      occupation: formOccupation.trim() || undefined,
      hobbies: formHobbies.trim() || undefined,
      bio: formBio.trim() || undefined,
      generation: Number(formGeneration),
      fatherId: formFatherId || undefined,
      motherId: formMotherId || undefined,
      spouseId: formSpouseId || undefined,
    };

    if (isAdding) {
      setTreeMembers(prev => [...prev, updatedMember]);
      setSelectedMemberId(updatedMember.id);
      setIsAdding(false);
    } else {
      setTreeMembers(prev => prev.map(m => m.id === formId ? updatedMember : m));
      setIsEditing(false);
    }

    // Bidirectional partner link update if selected
    if (formSpouseId) {
      setTreeMembers(prev => prev.map(m => {
        // If this is the chosen partner, link them back to this member
        if (m.id === formSpouseId) {
          return { ...m, spouseId: formId };
        }
        // If another member previously thought they were this member's partner, clear it if changed
        if (m.spouseId === formId && m.id !== formSpouseId) {
          return { ...m, spouseId: undefined };
        }
        return m;
      }));
    }
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm('Opravdu chcete odebrat tohoto rodinného příslušníka z rodokmenu?')) {
      const updatedList = treeMembers.filter(m => m.id !== id).map(m => {
        // Clear broken relationships
        const cleaned = { ...m };
        if (cleaned.fatherId === id) cleaned.fatherId = undefined;
        if (cleaned.motherId === id) cleaned.motherId = undefined;
        if (cleaned.spouseId === id) cleaned.spouseId = undefined;
        return cleaned;
      });
      setTreeMembers(updatedList);
      
      // Auto select another member
      if (selectedMemberId === id) {
        setSelectedMemberId(updatedList[0]?.id || null);
      }
      setIsEditing(false);
      setIsAdding(false);
    }
  };

  const handleResetToDefaultTree = () => {
    if (window.confirm('Opravdu chcete obnovit rodokmen na původní hodnoty? Přijdete o všechny vlastnoručně přidané členy.')) {
      setTreeMembers(DEFAULT_TREE_MEMBERS);
      setSelectedMemberId(DEFAULT_TREE_MEMBERS[2]?.id || null);
      setIsEditing(false);
      setIsAdding(false);
    }
  };

  // Export & Import as JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(treeMembers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rodokmen_export_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].name) {
          setTreeMembers(parsed);
          setSelectedMemberId(parsed[0].id);
          alert('Rodokmen byl úspěšně naimportován!');
        } else {
          alert('Chyba: Neplatný formát souboru rodokmenu.');
        }
      } catch (err) {
        alert('Chyba při čtení souboru. Ujistěte se, že se jedná o platný JSON soubor.');
      }
    };
    reader.readAsText(file);
  };

  // Group members by generation levels
  const generation2 = treeMembers.filter(m => m.generation === 2); // Grandparents
  const generation1 = treeMembers.filter(m => m.generation === 1); // Parents/Uncles/Aunts
  const generation0 = treeMembers.filter(m => m.generation === 0); // Children/Cousins
  const otherGenerations = treeMembers.filter(m => m.generation !== 0 && m.generation !== 1 && m.generation !== 2);

  // Search filter
  const filteredDirectory = treeMembers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (m.relationship && m.relationship.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.occupation && m.occupation.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGender = filterGender === 'all' ? true : m.gender === filterGender;
    return matchesSearch && matchesGender;
  });

  // Highlight relationships helpers
  const isDirectlyRelated = (id: string) => {
    if (!selectedMember) return false;
    if (selectedMember.id === id) return true; // self
    if (selectedMember.spouseId === id) return true; // partner
    if (selectedMember.fatherId === id) return true; // father
    if (selectedMember.motherId === id) return true; // mother
    
    // Check children
    const isChild = treeMembers.some(m => m.id === id && (m.fatherId === selectedMember.id || m.motherId === selectedMember.id));
    if (isChild) return true;

    // Check siblings (same parents)
    const isSibling = treeMembers.some(m => m.id === id && 
      selectedMember.fatherId && m.fatherId === selectedMember.fatherId &&
      selectedMember.motherId && m.motherId === selectedMember.motherId
    );
    if (isSibling) return true;

    return false;
  };

  const getRelationColor = (id: string) => {
    if (!selectedMember) return '';
    if (selectedMember.id === id) return 'ring-4 ring-indigo-600 dark:ring-indigo-500 scale-102 z-10';
    if (selectedMember.spouseId === id) return 'ring-4 ring-pink-500/80 scale-101 border-pink-300';
    if (selectedMember.fatherId === id || selectedMember.motherId === id) return 'ring-4 ring-blue-500/60 border-blue-200';
    
    // Children
    const isChild = treeMembers.some(m => m.id === id && (m.fatherId === selectedMember.id || m.motherId === selectedMember.id));
    if (isChild) return 'ring-4 ring-emerald-500/60 border-emerald-200';

    // Siblings
    const isSibling = treeMembers.some(m => m.id === id && 
      selectedMember.fatherId && m.fatherId === selectedMember.fatherId &&
      selectedMember.motherId && m.motherId === selectedMember.motherId
    );
    if (isSibling) return 'ring-4 ring-amber-500/50 border-amber-200';

    return 'opacity-65 grayscale-20 hover:opacity-100 hover:grayscale-0';
  };

  const getRelationLabel = (id: string) => {
    if (!selectedMember) return '';
    if (selectedMember.id === id) return 'Vybraný člen';
    if (selectedMember.spouseId === id) return 'Manžel / Manželka';
    if (selectedMember.fatherId === id) return 'Otec';
    if (selectedMember.motherId === id) return 'Matka';
    
    const isChild = treeMembers.some(m => m.id === id && (m.fatherId === selectedMember.id || m.motherId === selectedMember.id));
    if (isChild) return 'Syn / Dcera';

    const isSibling = treeMembers.some(m => m.id === id && 
      selectedMember.fatherId && m.fatherId === selectedMember.fatherId &&
      selectedMember.motherId && m.motherId === selectedMember.motherId
    );
    if (isSibling) return 'Sourozenec';

    return '';
  };

  return (
    <div className="space-y-6">
      
      {/* Header and top control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h2 id="family-tree-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-950 dark:text-white uppercase font-display">
              Náš Rodokmen & Příbuzní
            </h2>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Prozkoumejte společný rodinný strom, doplňujte babičky, dědečky, strýce a tety s fotkami, datem narození a životními příběhy.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={startAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-3xs hover:shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Přidat Člena Rodiny
          </button>

          <button
            onClick={handleExportJSON}
            title="Exportovat rodokmen do JSON souboru pro zálohu"
            className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold uppercase bg-white dark:bg-slate-800 transition cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-500" />
            <span>Zálohovat</span>
          </button>

          <label className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold uppercase bg-white dark:bg-slate-800 transition cursor-pointer">
            <FileUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Obnovit ze zálohy</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportJSON}
            />
          </label>

          <button
            onClick={handleResetToDefaultTree}
            title="Resetovat na výchozí rodokmen"
            className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-rose-600 dark:border-slate-700 dark:hover:bg-slate-800 rounded-2xl bg-white dark:bg-slate-900 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs / Filter Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800 gap-3">
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('tree')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              viewMode === 'tree' 
                ? 'bg-indigo-600 text-white shadow-3xs' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            🌳 Rodokmen (Grafické Schéma)
          </button>
          <button
            onClick={() => setViewMode('directory')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              viewMode === 'directory' 
                ? 'bg-indigo-600 text-white shadow-3xs' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            📇 Adresář & Biografie
          </button>
        </div>

        {viewMode === 'directory' && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Hledat jméno, profesi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
            {/* Gender Filter */}
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white dark:bg-slate-900 dark:border-slate-700 w-full sm:w-auto"
            >
              <option value="all">Všechna pohlaví</option>
              <option value="male">Muži 👨</option>
              <option value="female">Ženy 👩</option>
            </select>
          </div>
        )}

        {viewMode === 'tree' && (
          <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Klikněte na člena pro zvýraznění vztahů: <span className="text-blue-500 font-bold">Rodiče</span> • <span className="text-pink-500 font-bold">Manželé</span> • <span className="text-emerald-500 font-bold">Děti</span> • <span className="text-amber-500 font-bold">Sourozenci</span>.</span>
          </div>
        )}
      </div>

      {/* Main Content Layout (Split Screen: Tree or List left, Detail side panel right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Tree or Directory List */}
        <div className="lg:col-span-8 space-y-6">
          
          {viewMode === 'tree' ? (
            
            /* TREE MODE GRAPHICAL CANVAS */
            <div className="bento-card p-6 bg-slate-50/30 dark:bg-slate-900/10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 overflow-x-auto">
              
              {/* Generation 2: Grandparents */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    👵👴 Generace II — Prarodiče
                  </span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>
                
                <div className="flex flex-wrap justify-center gap-6 py-2">
                  {generation2.map(member => (
                    <motion.div
                      key={member.id}
                      onClick={() => handleSelectMember(member.id)}
                      className={`relative w-44 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-3xs hover:shadow-md transition cursor-pointer select-none text-center ${getRelationColor(member.id)}`}
                      whileHover={{ scale: 1.02 }}
                      layoutId={`tree-node-${member.id}`}
                    >
                      {getRelationLabel(member.id) && (
                        <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-3xs ${
                          member.id === selectedMemberId ? 'bg-indigo-600 text-white' : 
                          member.id === selectedMember?.spouseId ? 'bg-pink-500 text-white' :
                          'bg-slate-500 text-white'
                        }`}>
                          {getRelationLabel(member.id)}
                        </span>
                      )}

                      {/* Photo Container */}
                      <div className="w-14 h-14 rounded-full border-2 border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden mx-auto shadow-3xs mb-2">
                        {member.avatar && (member.avatar.startsWith('data:image/') || member.avatar.startsWith('http')) ? (
                          <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-3xl">{member.avatar || '👤'}</span>
                        )}
                      </div>

                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{member.name}</h3>
                      <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase mt-0.5">{member.relationship}</p>
                      
                      {calculateAge(member.birthDate) && (
                        <p className="text-[9px] text-slate-400 mt-1 font-bold">{calculateAge(member.birthDate)} let</p>
                      )}
                    </motion.div>
                  ))}
                  
                  {generation2.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Zatím nebyly přidáni žádní prarodiče.</p>
                  )}
                </div>
              </div>

              {/* Generation 1: Parents / Aunts / Uncles */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    👨👩 Generace I — Rodiče, Tety & Strýcové
                  </span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>

                <div className="flex flex-wrap justify-center gap-6 py-2">
                  {generation1.map(member => (
                    <motion.div
                      key={member.id}
                      onClick={() => handleSelectMember(member.id)}
                      className={`relative w-44 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-3xs hover:shadow-md transition cursor-pointer select-none text-center ${getRelationColor(member.id)}`}
                      whileHover={{ scale: 1.02 }}
                      layoutId={`tree-node-${member.id}`}
                    >
                      {getRelationLabel(member.id) && (
                        <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-3xs ${
                          member.id === selectedMemberId ? 'bg-indigo-600 text-white' : 
                          member.id === selectedMember?.spouseId ? 'bg-pink-500 text-white' :
                          member.id === selectedMember?.fatherId || member.id === selectedMember?.motherId ? 'bg-blue-600 text-white' :
                          'bg-amber-500 text-white' // sibling
                        }`}>
                          {getRelationLabel(member.id)}
                        </span>
                      )}

                      {/* Photo Container */}
                      <div className="w-14 h-14 rounded-full border-2 border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden mx-auto shadow-3xs mb-2">
                        {member.avatar && (member.avatar.startsWith('data:image/') || member.avatar.startsWith('http')) ? (
                          <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-3xl">{member.avatar || '👤'}</span>
                        )}
                      </div>

                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{member.name}</h3>
                      <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase mt-0.5">{member.relationship}</p>
                      
                      {calculateAge(member.birthDate) && (
                        <p className="text-[9px] text-slate-400 mt-1 font-bold">{calculateAge(member.birthDate)} let</p>
                      )}
                    </motion.div>
                  ))}

                  {generation1.length === 0 && (
                    <p className="text-xs text-slate-400 italic font-medium">Zatím nebyly přidáni žádní rodiče nebo tety.</p>
                  )}
                </div>
              </div>

              {/* Generation 0: Children / Cousins */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    👦👧 Generace 0 — Děti & Sourozenci
                  </span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>

                <div className="flex flex-wrap justify-center gap-6 py-2">
                  {generation0.map(member => (
                    <motion.div
                      key={member.id}
                      onClick={() => handleSelectMember(member.id)}
                      className={`relative w-44 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-3xs hover:shadow-md transition cursor-pointer select-none text-center ${getRelationColor(member.id)}`}
                      whileHover={{ scale: 1.02 }}
                      layoutId={`tree-node-${member.id}`}
                    >
                      {getRelationLabel(member.id) && (
                        <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-3xs ${
                          member.id === selectedMemberId ? 'bg-indigo-600 text-white' : 
                          member.id === selectedMember?.fatherId || member.id === selectedMember?.motherId ? 'bg-blue-600 text-white' :
                          'bg-emerald-600 text-white' // child
                        }`}>
                          {getRelationLabel(member.id)}
                        </span>
                      )}

                      {/* Photo Container */}
                      <div className="w-14 h-14 rounded-full border-2 border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden mx-auto shadow-3xs mb-2">
                        {member.avatar && (member.avatar.startsWith('data:image/') || member.avatar.startsWith('http')) ? (
                          <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-3xl">{member.avatar || '👤'}</span>
                        )}
                      </div>

                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{member.name}</h3>
                      <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase mt-0.5">{member.relationship}</p>
                      
                      {calculateAge(member.birthDate) && (
                        <p className="text-[9px] text-slate-400 mt-1 font-bold">{calculateAge(member.birthDate)} let</p>
                      )}
                    </motion.div>
                  ))}

                  {generation0.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Zatím nebyly přidány žádné děti.</p>
                  )}
                </div>
              </div>

              {/* Other Generations (if any custom levels, e.g. -1 grandchildren, 3 great-grandparents) */}
              {otherGenerations.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-2 px-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      ✨ Další generace příbuzenstva
                    </span>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                  </div>

                  <div className="flex flex-wrap justify-center gap-6 py-2">
                    {otherGenerations.map(member => (
                      <motion.div
                        key={member.id}
                        onClick={() => handleSelectMember(member.id)}
                        className={`relative w-44 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-3xs hover:shadow-md transition cursor-pointer select-none text-center ${getRelationColor(member.id)}`}
                        whileHover={{ scale: 1.02 }}
                        layoutId={`tree-node-${member.id}`}
                      >
                        {getRelationLabel(member.id) && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {getRelationLabel(member.id)}
                          </span>
                        )}

                        <div className="w-14 h-14 rounded-full border-2 border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden mx-auto shadow-3xs mb-2">
                          {member.avatar && (member.avatar.startsWith('data:image/') || member.avatar.startsWith('http')) ? (
                            <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-3xl">{member.avatar || '👤'}</span>
                          )}
                        </div>

                        <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{member.name}</h3>
                        <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase mt-0.5">{member.relationship}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            
            /* DIRECTORY / CARDS LIST MODE */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDirectory.map(member => {
                const age = calculateAge(member.birthDate);
                const isSelected = member.id === selectedMemberId;

                return (
                  <motion.div
                    key={member.id}
                    onClick={() => handleSelectMember(member.id)}
                    className={`p-5 rounded-3xl bg-white dark:bg-slate-800 border transition-all duration-300 cursor-pointer relative overflow-hidden flex gap-4 ${
                      isSelected 
                        ? 'ring-4 ring-indigo-500/15 border-indigo-500 shadow-md scale-101' 
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 shadow-3xs hover:shadow-2xs'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    {/* Visual border accent */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                      member.gender === 'male' ? 'bg-blue-500' : member.gender === 'female' ? 'bg-rose-500' : 'bg-slate-400'
                    }`} />

                    {/* Avatar Photo */}
                    <div className="w-16 h-16 rounded-2xl border border-slate-100 bg-slate-50 shrink-0 overflow-hidden flex items-center justify-center shadow-3xs">
                      {member.avatar && (member.avatar.startsWith('data:image/') || member.avatar.startsWith('http')) ? (
                        <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-4xl">{member.avatar || '👤'}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight truncate leading-tight uppercase font-display">
                          {member.name}
                        </h3>
                      </div>
                      
                      <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {member.relationship}
                      </p>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {age !== null && (
                          <span className="flex items-center gap-1">
                            <Cake className="w-3 h-3 text-rose-500 shrink-0" />
                            <span>{age} let</span>
                          </span>
                        )}
                        {member.occupation && (
                          <span className="flex items-center gap-1 max-w-[140px] truncate">
                            <Briefcase className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{member.occupation}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filteredDirectory.length === 0 && (
                <div className="sm:col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-5 h-5 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Hledanému výrazu nic neodpovídá</h4>
                  <p className="text-xs text-slate-500 mt-1">Vyčistěte vyhledávací pole nebo změňte filtry pohlaví.</p>
                </div>
              )}
            </div>
          )}

          {/* Quick family stats block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Celkem Členů</p>
                <h4 className="text-lg font-black text-slate-800 dark:text-white leading-none mt-1">{treeMembers.length}</h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Počet Generací</p>
                <h4 className="text-lg font-black text-slate-800 dark:text-white leading-none mt-1">
                  {Array.from(new Set(treeMembers.map(m => m.generation))).length}
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl shrink-0">
                <Cake className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Průměrný Věk</p>
                <h4 className="text-lg font-black text-slate-800 dark:text-white leading-none mt-1">
                  {Math.round(treeMembers.reduce((sum, m) => sum + (calculateAge(m.birthDate) || 0), 0) / treeMembers.filter(m => m.birthDate).length)} let
                </h4>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Detailed Profiler Card OR Editor Form */}
        <div className="lg:col-span-4 space-y-4">
          
          <AnimatePresence mode="wait">
            
            {/* 1. EDITING / ADDING FORM VIEW */}
            {(isEditing || isAdding) ? (
              <motion.div
                key="editor-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bento-card p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-sm font-black uppercase tracking-wider text-indigo-950 dark:text-white">
                    {isAdding ? 'Nový rodinný člen' : 'Upravit informace'}
                  </h3>
                  <button 
                    onClick={() => { setIsEditing(false); setIsAdding(false); }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveForm} className="space-y-4">
                  {/* Photo / Avatar Selection & Upload */}
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-full border border-slate-200 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-3xs relative shrink-0">
                      {formAvatar && (formAvatar.startsWith('data:image/') || formAvatar.startsWith('http')) ? (
                        <img src={formAvatar} className="w-full h-full object-cover" alt="Avatar upload preview" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-3xl">{formAvatar || '👤'}</span>
                      )}
                    </div>
                    
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Foto / Avatar</span>
                      
                      <div className="flex gap-2">
                        {/* Base64 File Uploader */}
                        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition shadow-3xs flex items-center gap-1 shrink-0">
                          <Camera className="w-3 h-3" />
                          <span>Foto</span>
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
                                  setFormAvatar(base64);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        
                        {/* Or text emoji selection */}
                        <input
                          type="text"
                          value={formAvatar && (formAvatar.startsWith('data:image/') || formAvatar.startsWith('http')) ? '' : formAvatar}
                          placeholder="Zadejte Emoji"
                          onChange={(e) => setFormAvatar(e.target.value)}
                          maxLength={4}
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs text-center p-1"
                          title="Napište emoji pro zobrazení ikonky"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Celé Jméno *</label>
                    <input
                      type="text"
                      required
                      placeholder="např. Babička Marie Nováková"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>

                  {/* Relationship Pill Title */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Vztah k rodině *</label>
                    <input
                      type="text"
                      required
                      placeholder="např. Máma, Dědeček (z otcovy strany), Teta"
                      value={formRelationship}
                      onChange={(e) => setFormRelationship(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>

                  {/* Gender / Generation Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Pohlaví</label>
                      <select
                        value={formGender}
                        onChange={(e) => setFormGender(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      >
                        <option value="male">Muž 👨</option>
                        <option value="female">Žena 👩</option>
                        <option value="other">Jiné 👤</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Generace</label>
                      <select
                        value={formGeneration}
                        onChange={(e) => setFormGeneration(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      >
                        <option value={2}>2 - Prarodiče 👵👴</option>
                        <option value={1}>1 - Rodiče / Sourozenci rodičů 👨</option>
                        <option value={0}>0 - Děti / Bratranci 👦👧</option>
                        <option value={-1}>-1 - Vnoučata 👶</option>
                      </select>
                    </div>
                  </div>

                  {/* Birth Date / Place */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Datum narození</label>
                      <input
                        type="date"
                        value={formBirthDate}
                        onChange={(e) => setFormBirthDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Místo narození</label>
                      <input
                        type="text"
                        placeholder="např. Bohumín"
                        value={formBirthPlace}
                        onChange={(e) => setFormBirthPlace(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  {/* Professional & Hobbies */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Profese / Škola</label>
                    <input
                      type="text"
                      placeholder="např. Lékař, Žák 3. třídy"
                      value={formOccupation}
                      onChange={(e) => setFormOccupation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Zájmy & Koníčky (čárkami)</label>
                    <input
                      type="text"
                      placeholder="Lego, florbal, zahradničení"
                      value={formHobbies}
                      onChange={(e) => setFormHobbies(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>

                  {/* Biography Paragraph */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Krátká biografie / Životní příběh</label>
                    <textarea
                      rows={3}
                      placeholder="Napište zajímavosti ze života, vzpomínky nebo milé zážitky..."
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700 resize-none"
                    />
                  </div>

                  {/* Relationship Linkers */}
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-3">
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block">Rodinné Propojení (Zvolte ze seznamu)</span>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Partner / Manžel(ka)</label>
                        <select
                          value={formSpouseId}
                          onChange={(e) => setFormSpouseId(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                        >
                          <option value="">-- Nevybráno --</option>
                          {treeMembers.filter(m => m.id !== formId).map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.relationship})</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Otec</label>
                          <select
                            value={formFatherId}
                            onChange={(e) => setFormFatherId(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                          >
                            <option value="">-- Nevybráno --</option>
                            {treeMembers.filter(m => m.id !== formId && m.gender === 'male').map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Matka</label>
                          <select
                            value={formMotherId}
                            onChange={(e) => setFormMotherId(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                          >
                            <option value="">-- Nevybráno --</option>
                            {treeMembers.filter(m => m.id !== formId && m.gender === 'female').map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-3xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Uložit
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setIsAdding(false); }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      Zrušit
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : selectedMember ? (
              
              /* 2. PROFILER DETAIL PANEL VIEW */
              <motion.div
                key={`detail-panel-${selectedMember.id}`}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="bento-card bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-3xs overflow-hidden"
              >
                
                {/* Colored Top Header Banner */}
                <div className={`h-20 relative ${
                  selectedMember.gender === 'male' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                  selectedMember.gender === 'female' ? 'bg-gradient-to-r from-rose-400 to-pink-500' :
                  'bg-gradient-to-r from-slate-400 to-slate-500'
                }`}>
                  <div className="absolute -bottom-10 left-6">
                    {/* Visual Photo Circle */}
                    <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-800 bg-slate-50 flex items-center justify-center overflow-hidden shadow-2xs">
                      {selectedMember.avatar && (selectedMember.avatar.startsWith('data:image/') || selectedMember.avatar.startsWith('http')) ? (
                        <img src={selectedMember.avatar} className="w-full h-full object-cover" alt={selectedMember.name} referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-4xl">{selectedMember.avatar || '👤'}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-12 p-6 space-y-6">
                  
                  {/* Name and Action tools */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight leading-none uppercase font-display">
                        {selectedMember.name}
                      </h3>
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mt-1.5">
                        {selectedMember.relationship}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => startEdit(selectedMember)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition cursor-pointer"
                        title="Upravit informace"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(selectedMember.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                        title="Smazat člena"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Vital Stats details list */}
                  <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    
                    {calculateAge(selectedMember.birthDate) && (
                      <div className="flex items-center gap-3 text-xs">
                        <Cake className="w-4 h-4 text-rose-500 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none">Věk & Narození</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                            {calculateAge(selectedMember.birthDate)} let ({new Date(selectedMember.birthDate!).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })})
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedMember.birthPlace && (
                      <div className="flex items-center gap-3 text-xs">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none">Místo narození</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{selectedMember.birthPlace}</p>
                        </div>
                      </div>
                    )}

                    {selectedMember.occupation && (
                      <div className="flex items-center gap-3 text-xs">
                        <Briefcase className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none">Povolání / Škola</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{selectedMember.occupation}</p>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Biography section */}
                  {selectedMember.bio && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        O mně / Životní příběh
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/20 dark:bg-slate-900/10 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-justify">
                        {selectedMember.bio}
                      </p>
                    </div>
                  )}

                  {/* Hobbies list */}
                  {selectedMember.hobbies && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Zájmy & Koníčky
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMember.hobbies.split(',').map((hobby, i) => (
                          <span 
                            key={i} 
                            className="bg-indigo-50/60 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg border border-indigo-100/30 dark:border-indigo-500/10"
                          >
                            ⚡ {hobby.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Family ties navigation */}
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-5 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                      Rodinné vazby & Navigace
                    </h4>

                    <div className="space-y-2 text-xs">
                      {/* Spouse */}
                      {selectedMember.spouseId && (
                        (() => {
                          const spouse = treeMembers.find(m => m.id === selectedMember.spouseId);
                          if (!spouse) return null;
                          return (
                            <button
                              onClick={() => handleSelectMember(spouse.id)}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-pink-50/40 hover:bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400 border border-pink-100/30 transition text-left cursor-pointer"
                            >
                              <span className="flex items-center gap-2 font-bold text-[11px] uppercase">
                                <Heart className="w-3.5 h-3.5 fill-pink-500/30" />
                                <span>Manžel(ka):</span>
                              </span>
                              <span className="font-black flex items-center gap-1">
                                {spouse.name}
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            </button>
                          );
                        })()
                      )}

                      {/* Father */}
                      {selectedMember.fatherId && (
                        (() => {
                          const father = treeMembers.find(m => m.id === selectedMember.fatherId);
                          if (!father) return null;
                          return (
                            <button
                              onClick={() => handleSelectMember(father.id)}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50/40 hover:bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100/30 transition text-left cursor-pointer"
                            >
                              <span className="flex items-center gap-2 font-bold text-[11px] uppercase">
                                <Users className="w-3.5 h-3.5 text-blue-500" />
                                <span>Otec:</span>
                              </span>
                              <span className="font-black flex items-center gap-1">
                                {father.name}
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            </button>
                          );
                        })()
                      )}

                      {/* Mother */}
                      {selectedMember.motherId && (
                        (() => {
                          const mother = treeMembers.find(m => m.id === selectedMember.motherId);
                          if (!mother) return null;
                          return (
                            <button
                              onClick={() => handleSelectMember(mother.id)}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50/40 hover:bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100/30 transition text-left cursor-pointer"
                            >
                              <span className="flex items-center gap-2 font-bold text-[11px] uppercase">
                                <Users className="w-3.5 h-3.5 text-rose-500" />
                                <span>Matka:</span>
                              </span>
                              <span className="font-black flex items-center gap-1">
                                {mother.name}
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            </button>
                          );
                        })()
                      )}

                      {/* Children */}
                      {(() => {
                        const children = treeMembers.filter(m => m.fatherId === selectedMember.id || m.motherId === selectedMember.id);
                        if (children.length === 0) return null;
                        return (
                          <div className="space-y-1.5">
                            <span className="block text-[9px] font-black uppercase text-slate-400 px-1 mt-2">Děti:</span>
                            {children.map(child => (
                              <button
                                key={child.id}
                                onClick={() => handleSelectMember(child.id)}
                                className="w-full flex items-center justify-between p-2 rounded-xl bg-emerald-50/40 hover:bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100/30 transition text-left cursor-pointer"
                              >
                                <span className="font-bold flex items-center gap-1.5">
                                  <span>{child.avatar}</span>
                                  <span>{child.name}</span>
                                </span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Siblings */}
                      {(() => {
                        if (!selectedMember.fatherId && !selectedMember.motherId) return null;
                        const siblings = treeMembers.filter(m => 
                          m.id !== selectedMember.id && 
                          (
                            (selectedMember.fatherId && m.fatherId === selectedMember.fatherId) || 
                            (selectedMember.motherId && m.motherId === selectedMember.motherId)
                          )
                        );
                        if (siblings.length === 0) return null;
                        return (
                          <div className="space-y-1.5">
                            <span className="block text-[9px] font-black uppercase text-slate-400 px-1 mt-2">Sourozenci:</span>
                            {siblings.map(sib => (
                              <button
                                key={sib.id}
                                onClick={() => handleSelectMember(sib.id)}
                                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50/80 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 border border-slate-200/50 transition text-left cursor-pointer"
                              >
                                <span className="font-bold flex items-center gap-1.5">
                                  <span>{sib.avatar}</span>
                                  <span>{sib.name}</span>
                                </span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ))}
                          </div>
                        );
                      })()}

                    </div>
                  </div>

                </div>

              </motion.div>
            ) : (
              <div className="bento-card p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-center py-16">
                <p className="text-slate-500 text-xs">Zvolte člena rodiny ze stromu nebo tabulky pro zobrazení podrobného profilu a biografie.</p>
              </div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
