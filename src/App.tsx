import React, { useState, useEffect } from 'react';
import { Member, Activity, Contact, ChildDuty, ImportantAlert, FamilyMessage, HelpQuestion, HelpAnswer, MedicationLog, MedicationHistoryEntry, HomeworkTask } from './types';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Users, 
  Sparkles, 
  Home, 
  Check, 
  FileDown, 
  FileUp, 
  Smile, 
  AlertCircle,
  GraduationCap,
  BookOpen,
  Printer,
  Cake,
  Sun,
  Moon,
  ShoppingCart,
  PiggyBank,
  ClipboardList,
  MessageSquare,
  HelpCircle,
  Pill,
  Smartphone,
  Download,
  WifiOff,
  Wifi,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Subcomponents
import CalendarView from './components/CalendarView';
import HourlyPresence from './components/HourlyPresence';
import ContactsView from './components/ContactsView';
import TipsView from './components/TipsView';
import MembersView from './components/MembersView';
import SchoolTimetable from './components/SchoolTimetable';
import MonthlyPrintView from './components/MonthlyPrintView';
import CelebrationsView from './components/CelebrationsView';
import ShoppingListView from './components/ShoppingListView';
import ExpensesView from './components/ExpensesView';
import DutiesView from './components/DutiesView';
import MessageWallView from './components/MessageWallView';
import WhatToDoView from './components/WhatToDoView';
import MedicationView from './components/MedicationView';
import HomeworkView from './components/HomeworkView';
import WeatherWidget from './components/WeatherWidget';

// Default / Initial Data
import { 
  INITIAL_MEMBERS, 
  getInitialActivities, 
  INITIAL_CONTACTS 
} from './utils/defaultData';

const INITIAL_DUTIES: ChildDuty[] = [
  { id: 'duty-1', title: 'Úklid pokojíčku', emoji: '🧹', assignedTo: 'member-3', completed: false },
  { id: 'duty-2', title: 'Domácí úkoly', emoji: '📚', assignedTo: 'member-3', completed: false },
  { id: 'duty-3', title: 'Vynést odpadkový koš', emoji: '🗑️', assignedTo: 'member-3', completed: false },
  { id: 'duty-4', title: 'Příprava tašky do školy', emoji: '🎒', assignedTo: 'member-3', completed: false },
  { id: 'duty-5', title: 'Uklidit si hračky', emoji: '🧸', assignedTo: 'member-4', completed: false },
  { id: 'duty-6', title: 'Ustlat si postýlku', emoji: '🛏️', assignedTo: 'member-4', completed: false },
  { id: 'duty-7', title: 'Nakrmit kočičku/pejska', emoji: '🐱', assignedTo: 'member-4', completed: false },
  { id: 'duty-8', title: 'Vyčistit si zoubky', emoji: '🪥', assignedTo: 'member-4', completed: false },
];

const INITIAL_ALERTS: ImportantAlert[] = [
  { id: 'alert-1', content: 'Nezapomeň vyvenčit Rexe hned jak přijdeš ze školy!', memberId: 'member-3', createdAt: new Date().toISOString() },
  { id: 'alert-2', content: 'Dnes v 15:30 máš tanečky v DDM, nachystej si piškoty a sukýnku.', memberId: 'member-4', createdAt: new Date().toISOString() },
];

const INITIAL_MESSAGES: FamilyMessage[] = [
  { id: 'msg-1', senderId: 'member-1', type: 'text', content: '[BG:0]Ahoj rodino! Vítám vás na naší nové Family Centrum vzkazové zdi. Můžete zde psát zprávy, kreslit obrázky nebo nahrát 10s hlasovku! 😊', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'msg-2', senderId: 'member-3', type: 'text', content: '[BG:1]Mami, v kolik hodin budeme dneska večeřet? Mám po fotbale hlad! ⚽️', createdAt: new Date(Date.now() - 3600000).toISOString() }
];

const INITIAL_HELP_QUESTIONS: HelpQuestion[] = [
  {
    id: 'q-1',
    senderId: 'member-3', // Matyáš
    title: 'se ségra nechce dělit o hračky',
    content: 'Když si hraju s autodráhou, Sofie přijde a začne mi brát autíčka. Když jí řeknu, ať toho nechá, začne brečet a máma s tátou pak vynadají mně.',
    category: 'vztahy',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    answers: [
      {
        id: 'ans-1-1',
        authorId: 'member-2', // Máma (Veronika is member-2)
        authorName: 'Veronika (Máma)',
        authorAvatar: '👩',
        content: 'Matyáši, mrzí mě, že to takhle vnímáš. Zkusíme příště postavit autodráhu společně tak, aby měla Sofie své vlastní startovací místo a neměla pocit, že ji vyháníš. Promluvíme si o tom všichni u večeře.',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'ans-1-2',
        authorId: 'ai',
        authorName: 'AI Psycholog',
        authorAvatar: '🤖',
        content: 'Ahoj Matyáši! Je skvělé, že o tom píšeš. Pro starší sourozence je někdy těžké dělit se o prostor. Zkus Sofii nabídnout roli "hlavního rozhodčího" nebo jí půjčit jedno konkrétní autíčko, se kterým může závodit s tebou. Sofie tě moc obdivuje a chce si hrát právě proto, že si hraješ ty. Rodičům můžeš v klidu říct: „Mami, tati, chci si hrát s autodráhou sám, ale Sofii jsem nabídl toto autíčko a ona přesto pláče.“ Ukážeš tím, že situaci řešíš dospěle! 👍',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
      }
    ]
  },
  {
    id: 'q-2',
    senderId: 'member-2', // Máma
    title: 'mám pocit, že nestíhám kroužky a domácnost',
    content: 'Poslední dobou je toho strašně moc. Práce, vaření, vození dětí na tréninky a do kroužků. Cítím se unavená a večer už nemám na nic energii.',
    category: 'psychologie',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    answers: [
      {
        id: 'ans-2-1',
        authorId: 'member-1', // Táta
        authorName: 'Tomáš (Táta)',
        authorAvatar: '🧔',
        content: 'Veroniko, uvědomuji si to a moc se omlouvám. Od příštího týdne přebírám úterní a čtvrteční rozvoz Matyáše na florbal já a večeře v tyto dny vyřeším objednáním nebo uvařím sám. Musíš si taky odpočinout! ❤️',
        createdAt: new Date(Date.now() - 3600000 * 22).toISOString()
      }
    ]
  }
];

const INITIAL_MEDICATIONS: MedicationLog[] = [
  {
    id: 'med-1',
    childId: 'member-3', // Matyáš
    name: 'Nurofen sirup (jahodový)',
    illness: 'Horečka a zuby',
    dosage: '5 ml',
    lastGiven: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    givenBy: 'member-2', // Veronika (Máma)
    notes: 'Podávat po 6-8 hodinách, střídat případně s Paralenem. Maximálně 3x denně.',
    history: [
      {
        id: 'entry-1-1',
        time: new Date(Date.now() - 3600000 * 4).toISOString(),
        dosage: '5 ml',
        givenBy: 'member-2',
        note: 'Teplota byla 38.4 °C, podáno po jídle'
      },
      {
        id: 'entry-1-2',
        time: new Date(Date.now() - 3600000 * 12).toISOString(),
        dosage: '5 ml',
        givenBy: 'member-1',
        note: 'Teplota 38.1 °C před spaním'
      }
    ]
  },
  {
    id: 'med-2',
    childId: 'member-4', // Sofie
    name: 'Aerius sirup',
    illness: 'Silná pylová alergie',
    dosage: '2.5 ml',
    lastGiven: new Date(Date.now() - 3600000 * 20).toISOString(), // 20 hours ago
    givenBy: 'member-1', // Tomáš (Táta)
    notes: 'Podávat 1x denně večer před spaním.',
    history: [
      {
        id: 'entry-2-1',
        time: new Date(Date.now() - 3600000 * 20).toISOString(),
        dosage: '2.5 ml',
        givenBy: 'member-1',
        note: 'Hustá rýma a pálení očí'
      }
    ]
  }
];

const INITIAL_TASKS: HomeworkTask[] = [
  {
    id: 'task-1',
    childId: 'member-3', // Matyáš
    subject: 'Matematika',
    title: 'Pracovní sešit str. 34 / cv. 5 a 6',
    dueDate: new Date(Date.now() + 3600000 * 24).toISOString().split('T')[0], // tomorrow
    completed: false,
    isPoem: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    childId: 'member-4', // Sofie
    subject: 'Básnička / Recitace',
    title: 'Naučit se básničku "Lesní studánka" od J. V. Sládka',
    dueDate: new Date(Date.now() + 3600000 * 72).toISOString().split('T')[0], // in 3 days
    completed: false,
    isPoem: true,
    poemText: 'Znám křišťálovou studánku,\nkde nejhlubší je les,\ntam roste tmavé kapradí\na vůkol tmavý vřes.\n\nTam ptáci, laně chodí pít\npod javorový klen,\nty ptáčku nesmíš zašumět,\nať neprobudíš sen.',
    notes: 'Paní učitelka bude zkoušet ve středu před celou třídou. Dbát na správný přednes a pauzy!',
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  // --- STATE ---
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [duties, setDuties] = useState<ChildDuty[]>([]);
  const [alerts, setAlerts] = useState<ImportantAlert[]>([]);
  const [messages, setMessages] = useState<FamilyMessage[]>([]);
  const [helpQuestions, setHelpQuestions] = useState<HelpQuestion[]>([]);
  const [medications, setMedications] = useState<MedicationLog[]>([]);
  const [tasks, setTasks] = useState<HomeworkTask[]>([]);
  
  // --- DARK MODE STATE & EFFECT ---
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dark_mode', 'false');
    }
  }, [darkMode]);
  
  const [activeTab, setActiveTab] = useState<'calendar' | 'presence' | 'school' | 'homework' | 'print' | 'celebrations' | 'tips' | 'shopping' | 'expenses' | 'contacts' | 'family' | 'duties' | 'wall' | 'what-to-do' | 'medication'>('calendar');

  // --- PWA & OFFLINE STATES ---
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(() => {
    return localStorage.getItem('family_hide_pwa_banner') !== 'true';
  });
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Detect online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      triggerNotification('Připojení k internetu obnoveno! 🌐', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerNotification('Jste offline. Kalendář a data uložená v telefonu zůstávají k dispozici. 📴', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture browser PWA installation trigger
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
        localStorage.setItem('family_hide_pwa_banner', 'true');
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismissPWA = () => {
    setShowInstallBanner(false);
    localStorage.setItem('family_hide_pwa_banner', 'true');
    triggerNotification('Návod skryt. Aplikaci lze na plochu přidat také ručně přes menu prohlížeče.', 'info');
  };

  const [selectedDate, setSelectedDate] = useState<string>('2026-07-19'); // Today relative to mock week
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Quick action from HourlyPresence grid to pre-open add form in Calendar
  const [quickAddState, setQuickAddState] = useState<{ memberId: string; date: string; hour: number } | null>(null);

  // --- LOCAL STORAGE SYNC ---
  useEffect(() => {
    // Load family members
    const storedMembers = localStorage.getItem('family_members');
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    } else {
      setMembers(INITIAL_MEMBERS);
      localStorage.setItem('family_members', JSON.stringify(INITIAL_MEMBERS));
    }

    // Load activities
    const storedActivities = localStorage.getItem('family_activities');
    if (storedActivities) {
      setActivities(JSON.parse(storedActivities));
    } else {
      const initialAct = getInitialActivities();
      setActivities(initialAct);
      localStorage.setItem('family_activities', JSON.stringify(initialAct));
    }

    // Load contacts
    const storedContacts = localStorage.getItem('family_contacts');
    if (storedContacts) {
      setContacts(JSON.parse(storedContacts));
    } else {
      setContacts(INITIAL_CONTACTS);
      localStorage.setItem('family_contacts', JSON.stringify(INITIAL_CONTACTS));
    }

    // Load duties
    const storedDuties = localStorage.getItem('family_duties');
    if (storedDuties) {
      setDuties(JSON.parse(storedDuties));
    } else {
      setDuties(INITIAL_DUTIES);
      localStorage.setItem('family_duties', JSON.stringify(INITIAL_DUTIES));
    }

    // Load alerts
    const storedAlerts = localStorage.getItem('family_alerts');
    if (storedAlerts) {
      setAlerts(JSON.parse(storedAlerts));
    } else {
      setAlerts(INITIAL_ALERTS);
      localStorage.setItem('family_alerts', JSON.stringify(INITIAL_ALERTS));
    }

    // Load messages
    const storedMessages = localStorage.getItem('family_messages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages(INITIAL_MESSAGES);
      localStorage.setItem('family_messages', JSON.stringify(INITIAL_MESSAGES));
    }

    // Load help questions
    const storedHelpQuestions = localStorage.getItem('family_help_questions');
    if (storedHelpQuestions) {
      setHelpQuestions(JSON.parse(storedHelpQuestions));
    } else {
      setHelpQuestions(INITIAL_HELP_QUESTIONS);
      localStorage.setItem('family_help_questions', JSON.stringify(INITIAL_HELP_QUESTIONS));
    }

    // Load medications
    const storedMedications = localStorage.getItem('family_medications');
    if (storedMedications) {
      setMedications(JSON.parse(storedMedications));
    } else {
      setMedications(INITIAL_MEDICATIONS);
      localStorage.setItem('family_medications', JSON.stringify(INITIAL_MEDICATIONS));
    }

    // Load tasks
    const storedTasks = localStorage.getItem('family_tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem('family_tasks', JSON.stringify(INITIAL_TASKS));
    }
  }, []);

  const triggerNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- MUTATORS & SYNC BACK TO LOCALSTORAGE ---
  const handleAddMessage = (newMsgData: Omit<FamilyMessage, 'id' | 'createdAt'>) => {
    const newMsg: FamilyMessage = {
      ...newMsgData,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newMsg, ...messages];
    setMessages(updated);
    localStorage.setItem('family_messages', JSON.stringify(updated));
    triggerNotification(`Vzkaz od ${members.find(m => m.id === newMsg.senderId)?.name || 'člena rodiny'} byl vyvěšen!`);
  };

  const handleDeleteMessage = (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    localStorage.setItem('family_messages', JSON.stringify(updated));
    triggerNotification(`Vzkaz byl odstraněn ze zdi.`);
  };

  const handleAddQuestion = (newQData: Omit<HelpQuestion, 'id' | 'createdAt' | 'answers'>) => {
    const newQ: HelpQuestion = {
      ...newQData,
      id: `q-${Date.now()}`,
      createdAt: new Date().toISOString(),
      answers: []
    };
    const updated = [newQ, ...helpQuestions];
    setHelpQuestions(updated);
    localStorage.setItem('family_help_questions', JSON.stringify(updated));
    triggerNotification(`Otázka byla položena!`);
  };

  const handleAddAnswer = (questionId: string, newAnsData: Omit<HelpAnswer, 'id' | 'createdAt'>) => {
    const newAns: HelpAnswer = {
      ...newAnsData,
      id: `ans-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = helpQuestions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: [...q.answers, newAns]
        };
      }
      return q;
    });
    setHelpQuestions(updated);
    localStorage.setItem('family_help_questions', JSON.stringify(updated));
    triggerNotification(`Rada byla uložena!`);
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = helpQuestions.filter(q => q.id !== id);
    setHelpQuestions(updated);
    localStorage.setItem('family_help_questions', JSON.stringify(updated));
    triggerNotification(`Otázka byla smazána.`);
  };

  const handleGetAiAdvice = async (questionId: string) => {
    const targetQ = helpQuestions.find(q => q.id === questionId);
    if (!targetQ) return;

    const sender = members.find(m => m.id === targetQ.senderId);

    try {
      const response = await fetch('/api/ai-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: targetQ.title,
          content: targetQ.content,
          category: targetQ.category,
          senderName: sender?.name || 'člen rodiny',
          senderRole: sender?.role || 'rodina'
        })
      });

      if (!response.ok) throw new Error('Chyba při volání serveru');
      const data = await response.json();

      const aiAns: HelpAnswer = {
        id: `ans-ai-${Date.now()}`,
        authorId: 'ai',
        authorName: 'AI Psycholog',
        authorAvatar: '🤖',
        content: data.content || "Omlouvám se, ale nepodařilo se mi vygenerovat radu.",
        createdAt: new Date().toISOString()
      };

      const updated = helpQuestions.map(q => {
        if (q.id === questionId) {
          const cleanAnswers = q.answers.filter(ans => ans.authorId !== 'ai');
          return {
            ...q,
            answers: [...cleanAnswers, aiAns]
          };
        }
        return q;
      });

      setHelpQuestions(updated);
      localStorage.setItem('family_help_questions', JSON.stringify(updated));
      triggerNotification('AI psycholožka vypracovala radu! ✨');
    } catch (err) {
      console.error('Chyba při stahování rady:', err);
      triggerNotification('Nepodařilo se získat AI radu.', 'info');
    }
  };

  const handleAddMedication = (newMedData: Omit<MedicationLog, 'id' | 'lastGiven' | 'givenBy' | 'history'>) => {
    const newMed: MedicationLog = {
      ...newMedData,
      id: `med-${Date.now()}`,
      lastGiven: '',
      givenBy: '',
      history: []
    };
    const updated = [newMed, ...medications];
    setMedications(updated);
    localStorage.setItem('family_medications', JSON.stringify(updated));
    triggerNotification('Lék byl úspěšně zařazen do seznamu! 🩺');
  };

  const handleGiveMedication = (medId: string, parentId: string, dosage: string, note?: string) => {
    const timeNow = new Date().toISOString();
    const newHistoryEntry: MedicationHistoryEntry = {
      id: `entry-${Date.now()}`,
      time: timeNow,
      dosage,
      givenBy: parentId,
      note
    };
    const updated = medications.map(m => {
      if (m.id === medId) {
        return {
          ...m,
          lastGiven: timeNow,
          givenBy: parentId,
          dosage,
          history: [newHistoryEntry, ...m.history]
        };
      }
      return m;
    });
    setMedications(updated);
    localStorage.setItem('family_medications', JSON.stringify(updated));
    
    const medName = medications.find(m => m.id === medId)?.name || 'lék';
    const parent = members.find(m => m.id === parentId);
    const parentName = parent ? parent.name.split(' ')[0] : 'Rodič';
    triggerNotification(`Rodič ${parentName} podal lék ${medName}! ✓`);
  };

  const handleDeleteMedication = (medId: string) => {
    const updated = medications.filter(m => m.id !== medId);
    setMedications(updated);
    localStorage.setItem('family_medications', JSON.stringify(updated));
    triggerNotification('Lék byl odstraněn ze seznamu.');
  };

  const handleAddTask = (newTaskData: Omit<HomeworkTask, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: HomeworkTask = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString()
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    localStorage.setItem('family_tasks', JSON.stringify(updated));
    triggerNotification('Úkol/básnička byl úspěšně zadán! 📚');
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted
        };
      }
      return t;
    });
    setTasks(updated);
    localStorage.setItem('family_tasks', JSON.stringify(updated));
    
    const task = tasks.find(t => t.id === id);
    if (task) {
      if (!task.completed) {
        triggerNotification('Úkol byl označen jako SPLNĚNÝ! Skvělá práce! 🎉');
      } else {
        triggerNotification('Úkol byl vrácen mezi aktivní.');
      }
    }
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    localStorage.setItem('family_tasks', JSON.stringify(updated));
    triggerNotification('Úkol byl smazán.');
  };

  const handleUpdateMember = (updatedMember: Member) => {
    const updated = members.map(m => m.id === updatedMember.id ? updatedMember : m);
    setMembers(updated);
    localStorage.setItem('family_members', JSON.stringify(updated));
    triggerNotification(`Člen rodiny "${updatedMember.name}" byl upraven.`);
  };

  const handleResetFamily = () => {
    if (confirm('Opravdu chcete obnovit rodinné složení a jména na výchozí nastavení?')) {
      setMembers(INITIAL_MEMBERS);
      localStorage.setItem('family_members', JSON.stringify(INITIAL_MEMBERS));
      triggerNotification('Složení rodiny bylo resetováno na výchozí.', 'info');
    }
  };

  const handleAddDuty = (newDutyData: Omit<ChildDuty, 'id' | 'completed'>) => {
    const newDuty: ChildDuty = {
      ...newDutyData,
      id: `duty-${Date.now()}`,
      completed: false
    };
    const updated = [...duties, newDuty];
    setDuties(updated);
    localStorage.setItem('family_duties', JSON.stringify(updated));
    triggerNotification(`Úkol "${newDuty.title}" byl uložen.`);
  };

  const handleToggleDuty = (id: string) => {
    const updated = duties.map(d => {
      if (d.id === id) {
        const nextCompleted = !d.completed;
        if (nextCompleted) {
          triggerNotification(`Skvělá práce! Úkol "${d.title}" byl splněn! 🎉`);
        }
        return { ...d, completed: nextCompleted };
      }
      return d;
    });
    setDuties(updated);
    localStorage.setItem('family_duties', JSON.stringify(updated));
  };

  const handleDeleteDuty = (id: string) => {
    const updated = duties.filter(d => d.id !== id);
    setDuties(updated);
    localStorage.setItem('family_duties', JSON.stringify(updated));
    triggerNotification(`Úkol byl odstraněn.`);
  };

  const handleAddAlert = (content: string, memberId: string) => {
    const newAlert: ImportantAlert = {
      id: `alert-${Date.now()}`,
      content,
      memberId,
      createdAt: new Date().toISOString()
    };
    const updated = [newAlert, ...alerts];
    setAlerts(updated);
    localStorage.setItem('family_alerts', JSON.stringify(updated));
    triggerNotification(`Důležitá zpráva byla zveřejněna.`);
  };

  const handleDeleteAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    localStorage.setItem('family_alerts', JSON.stringify(updated));
    triggerNotification(`Zpráva byla přečtena a odstraněna.`);
  };

  const handleAddActivity = (newAct: Activity) => {
    const updated = [...activities, newAct];
    setActivities(updated);
    localStorage.setItem('family_activities', JSON.stringify(updated));
    triggerNotification(`Nová aktivita "${newAct.title}" byla uložena do kalendáře.`);
  };

  const handleUpdateActivity = (updatedAct: Activity) => {
    const updated = activities.map(act => act.id === updatedAct.id ? updatedAct : act);
    setActivities(updated);
    localStorage.setItem('family_activities', JSON.stringify(updated));
    triggerNotification(`Plán "${updatedAct.title}" byl úspěšně upraven.`);
  };

  const handleDeleteActivity = (id: string) => {
    const updated = activities.filter(act => act.id !== id);
    setActivities(updated);
    localStorage.setItem('family_activities', JSON.stringify(updated));
    triggerNotification('Plán byl odstraněn z kalendáře.');
  };

  const handleAddContact = (newContact: Contact) => {
    const updated = [...contacts, newContact];
    setContacts(updated);
    localStorage.setItem('family_contacts', JSON.stringify(updated));
    triggerNotification(`Kontakt "${newContact.name}" byl uložen.`);
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    const updated = contacts.map(c => c.id === updatedContact.id ? updatedContact : c);
    setContacts(updated);
    localStorage.setItem('family_contacts', JSON.stringify(updated));
    triggerNotification(`Kontakt "${updatedContact.name}" byl úspěšně upraven.`);
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    localStorage.setItem('family_contacts', JSON.stringify(updated));
    triggerNotification('Kontakt byl smazán.');
  };

  // --- IMPORT / EXPORT BACKUPS ---
  const handleExportBackup = () => {
    const backupData = {
      members,
      activities,
      contacts,
      version: 1,
      createdAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bohumin_planner_backup_${selectedDate}.json`;
    link.click();
    URL.revokeObjectURL(url);
    triggerNotification('Záloha dat byla stažena do vašeho zařízení.', 'info');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.members && parsed.activities && parsed.contacts) {
          setMembers(parsed.members);
          setActivities(parsed.activities);
          setContacts(parsed.contacts);
          
          localStorage.setItem('family_members', JSON.stringify(parsed.members));
          localStorage.setItem('family_activities', JSON.stringify(parsed.activities));
          localStorage.setItem('family_contacts', JSON.stringify(parsed.contacts));
          
          triggerNotification('Všechna data rodinného plánovače byla úspěšně obnovena ze zálohy!');
        } else {
          alert('Chyba: Neplatný formát souboru zálohy.');
        }
      } catch (err) {
        alert('Chyba při zpracování souboru.');
      }
    };
    reader.readAsText(file);
  };

  const handleOpenQuickAddInCalendar = (memberId: string, date: string, hour: number) => {
    setQuickAddState({ memberId, date, hour });
    setActiveTab('calendar');
  };

  const handleClearQuickAdd = () => {
    setQuickAddState(null);
  };

  // --- RENDER DYNAMIC WHATS HAPPENING NOW (STATUS OVERVIEW) ---
  const getActiveStateForMemberNow = (m: Member): { label: string; bgClass: string; textClass: string } => {
    const nowHour = 15; // Simulated active hour 15:00 for Sunday demonstration, or relative to selectedDate.
    // Let's filter today's activities
    const dayActs = activities.filter(act => act.date === selectedDate && act.memberIds.includes(m.id));
    
    const currentAct = dayActs.find(act => {
      const [sh, sm] = act.startTime.split(':').map(Number);
      const [eh, em] = act.endTime.split(':').map(Number);
      const startDec = sh + sm/60;
      const endDec = eh + em/60;
      return nowHour >= startDec && nowHour < endDec;
    });

    if (currentAct) {
      if (currentAct.type === 'work') return { label: 'V práci', bgClass: 'bg-rose-500', textClass: 'text-white' };
      if (currentAct.type === 'school') return { label: 'Škola/Školka', bgClass: 'bg-indigo-500', textClass: 'text-white' };
      if (currentAct.type === 'club') return { label: 'Na kroužku', bgClass: 'bg-amber-500', textClass: 'text-slate-900 font-bold' };
      if (currentAct.type === 'doctor') return { label: 'U doktora', bgClass: 'bg-red-500', textClass: 'text-white' };
      if (currentAct.type === 'home') return { label: 'Doma', bgClass: 'bg-emerald-500', textClass: 'text-white' };
      return { label: currentAct.title, bgClass: 'bg-blue-500', textClass: 'text-white' };
    }

    return { label: 'Doma / Volno', bgClass: 'bg-emerald-500', textClass: 'text-white' };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      
      {/* Offline Status Indicator */}
      {!isOnline && (
        <div id="offline-bar" className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-inner z-50 no-print">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Právě pracujete offline. Všechny změny v kalendáři se ukládají v telefonu a kalendář je plně dostupný.</span>
        </div>
      )}

      {/* PWA Install Prompts and Instructions */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            id="pwa-install-banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-indigo-900 text-white border-b border-indigo-950 overflow-hidden no-print z-50 relative"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 p-1 flex items-center justify-center border border-white/15 shadow-inner shrink-0">
                  <img src="/family_centrum_icon.png" className="w-full h-full object-cover rounded-xl" alt="Family Centrum" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                    Přidejte si Family Centrum na plochu mobilu
                    <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded-md uppercase font-black tracking-wider">Aplikace</span>
                  </h4>
                  <p className="text-xs text-indigo-200 mt-0.5 max-w-xl">
                    Funguje jako nativní mobilní aplikace! Rychlé spouštění přímo z plochy, plný offline přístup k rodinnému kalendáři a blesková odezva.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {deferredPrompt ? (
                  <button
                    id="pwa-install-btn"
                    onClick={handleInstallPWA}
                    className="cursor-pointer flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-indigo-950 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-sm hover:scale-105 duration-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Instalovat aplikaci
                  </button>
                ) : isIOS ? (
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-[11px] font-medium text-indigo-200 border border-white/5 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                    <span>Na Safari klikněte na <strong className="text-white">Sdílet</strong> a poté na <strong className="text-white">Přidat na plochu</strong></span>
                  </div>
                ) : (
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-[11px] font-medium text-indigo-200 border border-white/5 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                    <span>V menu prohlížeče zvolte <strong className="text-white">Instalovat aplikaci</strong> nebo <strong className="text-white">Přidat na plochu</strong></span>
                  </div>
                )}
                
                <button
                  id="pwa-close-btn"
                  onClick={handleDismissPWA}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-300 hover:text-white transition cursor-pointer"
                  title="Zavřít"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            id="toast-notification"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl border shadow-lg flex items-center gap-2 font-semibold text-xs transition duration-300 ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}
          >
            <Check className="w-4 h-4 text-emerald-600" />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Brand - Bento Styled */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-4">
            <div>
              <h1 id="app-title" className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-950 uppercase font-display">
                Family Centrum
              </h1>
            </div>
          </div>

          {/* Quick status dashboard of family members at 15:00 today */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Stav dnes v 15:00:</span>
            <div className="flex gap-2">
              {members.map(m => {
                const status = getActiveStateForMemberNow(m);
                return (
                  <div key={m.id} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1" title={`${m.name}: ${status.label}`}>
                    <span className="text-base select-none">{m.avatar}</span>
                    <span className="text-[10px] font-bold text-slate-700">{m.name.split(' ')[0]}</span>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${status.bgClass} ${status.textClass}`}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Backup Action buttons */}
          <div className="flex items-center gap-2">
            <WeatherWidget />

            <button
              id="btn-toggle-dark-mode"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 border border-slate-200 hover:border-slate-300 rounded-2xl bg-white text-slate-500 hover:text-slate-800 hover:shadow-xs transition flex items-center justify-center cursor-pointer"
              title={darkMode ? "Přepnout do světlého režimu" : "Přepnout do tmavého režimu"}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-500 animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            <button
              id="btn-export-backup"
              onClick={handleExportBackup}
              className="p-2.5 border border-slate-200 hover:border-slate-300 rounded-2xl bg-white text-slate-500 hover:text-slate-800 hover:shadow-xs transition"
              title="Zálohovat (Stáhnout JSON)"
            >
              <FileDown className="w-4 h-4" />
            </button>
            <label
              htmlFor="import-backup-file"
              className="p-2.5 border border-slate-200 hover:border-slate-300 rounded-2xl bg-white text-slate-500 hover:text-slate-800 hover:shadow-xs transition cursor-pointer"
              title="Obnovit ze zálohy (Nahrát JSON)"
            >
              <FileUp className="w-4 h-4" />
              <input
                id="import-backup-file"
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

        </div>
      </header>

      {/* Navigation Tabs Bar - Bento Rounded Capsules */}
      <div className="bg-slate-50 border-b border-slate-200 py-4 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2.5 overflow-x-auto py-2 no-scrollbar" aria-label="Hlavní navigace">
            
            <button
              id="tab-btn-calendar"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'calendar' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Týdenní kalendář
            </button>

            <button
              id="tab-btn-presence"
              onClick={() => setActiveTab('presence')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'presence' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <Clock className="w-4 h-4" />
              Kdo je doma?
            </button>

            <button
              id="tab-btn-school"
              onClick={() => setActiveTab('school')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'school' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Rozvrh hodin
            </button>

            <button
              id="tab-btn-homework"
              onClick={() => setActiveTab('homework')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'homework' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Úkoly & Básničky
            </button>

            <button
              id="tab-btn-print"
              onClick={() => setActiveTab('print')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'print' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <Printer className="w-4 h-4" />
              Měsíční tisk
            </button>

            <button
              id="tab-btn-celebrations"
              onClick={() => setActiveTab('celebrations')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'celebrations' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <Cake className="w-4 h-4 text-pink-500" />
              Oslavy & Narozeniny
            </button>

            <button
              id="tab-btn-tips"
              onClick={() => setActiveTab('tips')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'tips' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Výlety & Rádce
            </button>

            <button
              id="tab-btn-medications"
              onClick={() => setActiveTab('medication')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'medication' 
                  ? 'bg-rose-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <Pill className="w-4 h-4 text-rose-500" />
              Léky dětí (Rodiče)
            </button>

            <button
              id="tab-btn-what-to-do"
              onClick={() => setActiveTab('what-to-do')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'what-to-do' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              Co mám dělat, když...
            </button>

            <button
              id="tab-btn-shopping"
              onClick={() => setActiveTab('shopping')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'shopping' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-emerald-500" />
              Nákupní Seznam
            </button>

            <button
              id="tab-btn-duties"
              onClick={() => setActiveTab('duties')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'duties' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-indigo-550" />
              Povinnosti & Úkoly
            </button>

            <button
              id="tab-btn-wall"
              onClick={() => setActiveTab('wall')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'wall' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-amber-500" />
              Vzkazová zeď
            </button>

            <button
              id="tab-btn-expenses"
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'expenses' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <PiggyBank className="w-4 h-4 text-rose-500" />
              Rodinné Výdaje
            </button>

            <button
              id="tab-btn-contacts"
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'contacts' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <Phone className="w-4 h-4" />
              Důležité kontakty
            </button>

            <button
              id="tab-btn-family"
              onClick={() => setActiveTab('family')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
                activeTab === 'family' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:text-slate-900 shadow-3xs'
              }`}
            >
              <Users className="w-4 h-4" />
              Naše Rodina
            </button>

          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Prominent "Nezapomeň!" Alerts Board */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  📌 Rodinná nástěnka: Nezapomeň!
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alerts.map((alert) => {
                  const m = members.find(member => member.id === alert.memberId);
                  if (!m) return null;
                  return (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`relative rounded-2xl border ${m.borderClass} ${m.lightBgClass} p-4 shadow-2xs overflow-hidden flex items-start justify-between gap-3 dark:bg-slate-900/60 dark:border-slate-800`}
                    >
                      {/* Left thick bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${m.bgClass}`} />
                      
                      <div className="pl-2 space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xl select-none">{m.avatar}</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${m.textClass}`}>
                            {m.name}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-250 leading-relaxed break-words font-display">
                          {alert.content}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className={`flex-shrink-0 p-1.5 rounded-xl border border-slate-200/65 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 shadow-3xs cursor-pointer transition text-slate-400 hover:text-emerald-600 ${m.textClass}`}
                        title="Označit za přečtené / splněné"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'calendar' && (
              <CalendarView 
                members={members}
                activities={activities}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onAddActivity={handleAddActivity}
                onUpdateActivity={handleUpdateActivity}
                onDeleteActivity={handleDeleteActivity}
                quickAddState={quickAddState}
                onClearQuickAdd={handleClearQuickAdd}
              />
            )}

            {activeTab === 'presence' && (
              <HourlyPresence 
                members={members}
                activities={activities}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onOpenQuickAdd={handleOpenQuickAddInCalendar}
              />
            )}

            {activeTab === 'school' && (
              <SchoolTimetable />
            )}

            {activeTab === 'homework' && (
              <HomeworkView 
                members={members}
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {activeTab === 'print' && (
              <MonthlyPrintView 
                members={members}
                activities={activities}
              />
            )}

            {activeTab === 'celebrations' && (
              <CelebrationsView 
                members={members}
              />
            )}

            {activeTab === 'tips' && (
              <TipsView 
                members={members}
                activities={activities}
                onAddActivity={handleAddActivity}
              />
            )}

            {activeTab === 'medication' && (
              <MedicationView 
                members={members}
                medications={medications}
                onAddMedication={handleAddMedication}
                onGiveMedication={handleGiveMedication}
                onDeleteMedication={handleDeleteMedication}
              />
            )}

            {activeTab === 'what-to-do' && (
              <WhatToDoView 
                members={members}
                questions={helpQuestions}
                onAddQuestion={handleAddQuestion}
                onAddAnswer={handleAddAnswer}
                onDeleteQuestion={handleDeleteQuestion}
                onGetAiAdvice={handleGetAiAdvice}
              />
            )}

            {activeTab === 'shopping' && (
              <ShoppingListView 
                members={members}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpensesView 
                members={members}
              />
            )}

            {activeTab === 'contacts' && (
              <ContactsView 
                contacts={contacts}
                onAddContact={handleAddContact}
                onUpdateContact={handleUpdateContact}
                onDeleteContact={handleDeleteContact}
              />
            )}

            {activeTab === 'family' && (
              <MembersView 
                members={members}
                onUpdateMember={handleUpdateMember}
                onResetToDefaults={handleResetFamily}
              />
            )}

            {activeTab === 'duties' && (
              <DutiesView 
                members={members}
                duties={duties}
                alerts={alerts}
                onAddDuty={handleAddDuty}
                onToggleDuty={handleToggleDuty}
                onDeleteDuty={handleDeleteDuty}
                onAddAlert={handleAddAlert}
                onDeleteAlert={handleDeleteAlert}
              />
            )}

            {activeTab === 'wall' && (
              <MessageWallView 
                members={members}
                messages={messages}
                onAddMessage={handleAddMessage}
                onDeleteMessage={handleDeleteMessage}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Family Centrum Bohumín. Všechna data jsou bezpečně uložena přímo ve vašem prohlížeči.</p>
          <div className="flex gap-4">
            <span className="text-slate-500 font-semibold">Vyrobeno pro spokojenou rodinu</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
