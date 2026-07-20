import { Member, Activity, Contact, TripTip } from '../types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'member-1',
    name: 'Tomáš',
    role: 'manzel',
    color: 'blue',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-700',
    lightBgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    avatar: '🧔',
    age: 42
  },
  {
    id: 'member-2',
    name: 'Veronika',
    role: 'manzelka',
    color: 'rose',
    bgClass: 'bg-rose-500',
    textClass: 'text-rose-700',
    lightBgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
    avatar: '👩',
    age: 40
  },
  {
    id: 'member-3',
    name: 'Matyáš',
    role: 'dite1',
    color: 'emerald',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-700',
    lightBgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    avatar: '👦',
    age: 10
  },
  {
    id: 'member-4',
    name: 'Sofie',
    role: 'dite2',
    color: 'amber',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-700',
    lightBgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    avatar: '👧',
    age: 6
  }
];

// Helper to get date string for "this week" so the calendar is pre-populated with dates close to current date!
// Let's calculate dates relative to the current date.
// Current date is 2026-07-19 (Sunday) as in ADDITONAL_METADATA.
// Let's write a generator that creates dates for the current week.
function getRelativeDate(offsetDays: number): string {
  const baseDate = new Date("2026-07-19T00:00:00");
  const d = new Date(baseDate);
  d.setDate(baseDate.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const getInitialActivities = (): Activity[] => [
  // --- Monday (offset -6) ---
  {
    id: 'act-1',
    title: 'Práce - Ranní směna',
    description: 'Běžná pracovní doba',
    memberIds: ['member-2'],
    date: getRelativeDate(-6), // Monday
    startTime: '07:30',
    endTime: '15:30',
    type: 'work'
  },
  {
    id: 'act-2',
    title: 'Práce v kanceláři',
    description: 'Schůzky a maily',
    memberIds: ['member-1'],
    date: getRelativeDate(-6), // Monday
    startTime: '08:00',
    endTime: '16:00',
    type: 'work'
  },
  {
    id: 'act-3',
    title: 'Základní škola',
    description: '5 vyučovacích hodin',
    memberIds: ['member-3'],
    date: getRelativeDate(-6), // Monday
    startTime: '08:00',
    endTime: '13:30',
    type: 'school'
  },
  {
    id: 'act-4',
    title: 'Mateřská školka',
    description: 'Hraní a oběd',
    memberIds: ['member-4'],
    date: getRelativeDate(-6), // Monday
    startTime: '08:00',
    endTime: '15:00',
    type: 'school'
  },
  {
    id: 'act-5',
    title: 'Taneční kroužek v DDM',
    description: 'Sofiiny tanečky v Domě dětí a mládeže Fontána',
    memberIds: ['member-4'],
    date: getRelativeDate(-6), // Monday
    startTime: '15:30',
    endTime: '16:30',
    type: 'club',
    location: 'DDM Bohumín, ul. Janáčkova'
  },
  {
    id: 'act-5b',
    title: 'Vyzvednutí Sofie a doprovod',
    description: 'Doprovod na tanečky a zpět',
    memberIds: ['member-2'],
    date: getRelativeDate(-6), // Monday
    startTime: '15:00',
    endTime: '16:45',
    type: 'free',
    location: 'DDM Bohumín'
  },

  // --- Tuesday (offset -5) ---
  {
    id: 'act-6',
    title: 'Práce',
    memberIds: ['member-1', 'member-2'],
    date: getRelativeDate(-5),
    startTime: '08:00',
    endTime: '15:30',
    type: 'work'
  },
  {
    id: 'act-7',
    title: 'Škola a Školka',
    memberIds: ['member-3', 'member-4'],
    date: getRelativeDate(-5),
    startTime: '08:00',
    endTime: '14:30',
    type: 'school'
  },
  {
    id: 'act-8',
    title: 'Trénink florbalu Bospor',
    description: 'Matyášův florbalový zápas a trénink',
    memberIds: ['member-3'],
    date: getRelativeDate(-5),
    startTime: '15:30',
    endTime: '17:00',
    type: 'club',
    location: 'Sportovní hala Bospor, Koperníkova'
  },
  {
    id: 'act-9',
    title: 'Táta vyzvedává Matyáše z florbalu',
    memberIds: ['member-1'],
    date: getRelativeDate(-5),
    startTime: '16:50',
    endTime: '17:30',
    type: 'home'
  },

  // --- Wednesday (offset -4) ---
  {
    id: 'act-10',
    title: 'Práce a škola',
    description: 'Běžný pracovní a školní den',
    memberIds: ['member-1', 'member-2', 'member-3', 'member-4'],
    date: getRelativeDate(-4),
    startTime: '08:00',
    endTime: '15:00',
    type: 'school'
  },
  {
    id: 'act-11',
    title: 'Taneční kroužek v DDM',
    memberIds: ['member-4'],
    date: getRelativeDate(-4),
    startTime: '15:30',
    endTime: '16:30',
    type: 'club',
    location: 'DDM Bohumín'
  },

  // --- Thursday (offset -3) ---
  {
    id: 'act-12',
    title: 'Florbal Bospor',
    memberIds: ['member-3'],
    date: getRelativeDate(-3),
    startTime: '15:30',
    endTime: '17:00',
    type: 'club',
    location: 'Sportovní hala Bospor'
  },
  {
    id: 'act-13',
    title: 'Velký rodinný nákup',
    description: 'Nákup potravin na víkend v Kauflandu',
    memberIds: ['member-1', 'member-2'],
    date: getRelativeDate(-3),
    startTime: '17:30',
    endTime: '19:00',
    type: 'free',
    location: 'Kaufland Bohumín, ul. Studentská'
  },

  // --- Friday (offset -2) ---
  {
    id: 'act-14',
    title: 'Preventivní kontrola u zubaře',
    description: 'Matyáš a Sofie jdou k zubaři, doprovází máma Veronika',
    memberIds: ['member-2', 'member-3', 'member-4'],
    date: getRelativeDate(-2),
    startTime: '10:00',
    endTime: '11:00',
    type: 'doctor',
    location: 'Zubní klinika Bohumín, Studentská ul.'
  },
  {
    id: 'act-15',
    title: 'Táta má Home Office',
    description: 'Práce z domova',
    memberIds: ['member-1'],
    date: getRelativeDate(-2),
    startTime: '08:00',
    endTime: '15:00',
    type: 'work',
    location: 'Doma'
  },

  // --- Saturday (offset -1) ---
  {
    id: 'act-16',
    title: 'Sobotní cyklovýlet k meandrům Odry',
    description: 'Společný rodinný výlet na kolech, svačina s sebou!',
    memberIds: ['member-1', 'member-2', 'member-3', 'member-4'],
    date: getRelativeDate(-1),
    startTime: '13:00',
    endTime: '17:30',
    type: 'free',
    location: 'Hraniční meandry Odry / Starý Bohumín'
  },

  // --- Sunday (Today - offset 0 - 2026-07-19) ---
  {
    id: 'act-17',
    title: 'Návštěva babičky a dědy',
    description: 'Nedělní oběd a posezení na zahradě',
    memberIds: ['member-1', 'member-2', 'member-3', 'member-4'],
    date: getRelativeDate(0), // Today!
    startTime: '11:30',
    endTime: '16:00',
    type: 'free',
    location: 'Rychvald'
  },
  {
    id: 'act-18',
    title: 'Příprava věcí do školy a školky',
    description: 'Nachystat batohy, oblečení na pondělí',
    memberIds: ['member-3', 'member-4'],
    date: getRelativeDate(0),
    startTime: '19:00',
    endTime: '19:45',
    type: 'home'
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'con-1',
    name: 'MUDr. Helena Malá',
    relation: 'Dětská lékařka (Pediatr)',
    phone: '+420 596 012 345',
    email: 'mudr.mala@poliklinika-bohumin.cz',
    address: 'Poliklinika Bohumín, Čáslavská 1176',
    note: 'Ordinační hodiny po-pá: 7:30 - 12:00. Volejte předem pro objednání.',
    category: 'doctor'
  },
  {
    id: 'con-2',
    name: 'MUDr. Jan Novotný',
    relation: 'Zubní klinika (Zubař)',
    phone: '+420 596 011 222',
    address: 'Bohumín, Studentská 452',
    note: 'Kontroly 2x ročně. Drží pohotovost o víkendech dle rozpisu.',
    category: 'doctor'
  },
  {
    id: 'con-3',
    name: 'Mgr. Kateřina Veselá',
    relation: 'Třídní učitelka (Matyáš - ZŠ)',
    phone: '+420 732 987 654',
    email: 'k.vesela@zscsa.cz',
    address: 'ZŠ Čs. armády, Bohumín',
    note: 'Konzultační hodiny v úterý od 14:00.',
    category: 'school'
  },
  {
    id: 'con-4',
    name: 'Jana Krásná',
    relation: 'Učitelka ve školce (Sofie)',
    phone: '+420 731 444 555',
    note: 'Třída Berušek. Vyzvedávání po obědě (12:00-12:30) nebo po odpočinku (od 14:45).',
    category: 'school'
  },
  {
    id: 'con-5',
    name: 'Babička Marie a děda Josef',
    relation: 'Rodiče mámy (Rychvald)',
    phone: '+420 777 999 888',
    address: 'Rychvald, Na Výsluní 1420',
    note: 'Můžou pohlídat, stačí dát vědět den předem. Vyzvedávají ze školky v nouzi.',
    category: 'family'
  },
  {
    id: 'con-6',
    name: 'Dům dětí a mládeže Fontána',
    relation: 'DDM Bohumín (recepce)',
    phone: '+420 596 012 111',
    email: 'info@ddmbohumin.cz',
    address: 'Janáčkova 451, Nový Bohumín',
    note: 'Místo konání Eliščiných tanečků. Organizátor letních příměstských táborů.',
    category: 'school'
  },
  {
    id: 'con-7',
    name: 'Záchranné složky (Bohumín)',
    relation: 'Hasiči, Policie, Záchranka',
    phone: '112',
    note: 'Městská policie Bohumín: +420 596 092 156. Poliklinika pohotovost: +420 596 013 111.',
    category: 'services'
  },
  {
    id: 'con-8',
    name: 'Veterina MVDr. Tomáš Černý',
    relation: 'Veterinární lékař (pes Rex)',
    phone: '+420 608 111 222',
    address: 'Bohumín, Bezručova 142',
    note: 'Očkování a běžné prohlídky.',
    category: 'services'
  }
];

export const OFFLINE_TRIP_TIPS: TripTip[] = [
  {
    id: 'tip-1',
    title: 'Hobbypark Bohumín a Mauglího stezka',
    description: 'Nádherný bezplatný areál v parku Petra Bezruče v Novém Bohumíně. Nabízí obrovské dětské hřiště, lanovou stezku v korunách stromů (Mauglího stezka), Mauglího ranč se zvířátky (kozy, ovečky) a dopravní hřiště. Ideální místo pro celodenní rodinnou zábavu.',
    location: 'Bohumín, Park Petra Bezruče',
    distance: 'přímo v Bohumíně',
    suitableForKids: true,
    category: 'nature',
    date: '2026-07-20',
    startTime: '14:00',
    endTime: '17:00'
  },
  {
    id: 'tip-2',
    title: 'Aquacentrum Bohumín',
    description: 'Moderní aquapark s krytým 25m bazénem, tobogánem dlouhým 48 metrů, divokou řekou, vířivkami a dětským brouzdalištěm. V létě je k dispozici venkovní areál se slunící plochou. Součástí je i skvělý saunový svět pro relaxaci rodičů.',
    location: 'Bohumín, ul. Koperníkova',
    distance: 'přímo v Bohumíně',
    suitableForKids: true,
    category: 'water',
    date: '2026-07-21',
    startTime: '10:00',
    endTime: '13:00'
  },
  {
    id: 'tip-3',
    title: 'Hraniční meandry Odry',
    description: 'Chráněné území podél řeky Odry na hranici s Polskem. Úžasná cyklotrasa a naučná stezka vedoucí ze Starého Bohumína až k soutoku s Olší. Na řece je zřízena vodácká stezka se dvěma nástupními místy (ve Starém Bohumíně a v polských Zabełkowicích), kde je možnost půjčení lodí.',
    location: 'Starý Bohumín / Šunychl',
    distance: 'přímo v Bohumíně',
    suitableForKids: true,
    category: 'nature',
    date: '2026-07-22',
    startTime: '09:00',
    endTime: '12:00'
  },
  {
    id: 'tip-4',
    title: 'Kališovo a Vrbické jezero',
    description: 'Dvě velká jezera po těžbě písku. Kališovo jezero (tzv. Kališok) nabízí čistou vodu ke koupání, pláže a půjčovnu šlapadel. Okolo Vrbického jezera vede krásná nová cyklostezka vhodná i pro in-line brusle, ideální pro děti na odrážedlech.',
    location: 'Bohumín, Pudlov / Šunychl',
    distance: '2 km',
    suitableForKids: true,
    category: 'water',
    date: '2026-07-23',
    startTime: '13:00',
    endTime: '16:00'
  },
  {
    id: 'tip-5',
    title: 'Dinopark Doubrava',
    description: 'Zábavní park s desítkami robotických a statických modelů dinosaurů v životní velikosti. Součástí je 3D kino, paleontologické hřiště pro děti, dinotetování a spousta prolézaček. Skvělé dobrodružství pro mladší i starší děti.',
    location: 'Doubrava u Orlové',
    distance: '11 km',
    suitableForKids: true,
    category: 'active',
    date: '2026-07-25',
    startTime: '09:30',
    endTime: '16:30'
  }
];
