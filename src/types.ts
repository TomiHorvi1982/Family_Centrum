export type ActivityType = 'work' | 'school' | 'club' | 'doctor' | 'free' | 'home' | 'birthday' | 'holiday' | 'other';

export interface Member {
  id: string;
  name: string;
  role: 'manzel' | 'manzelka' | 'dite1' | 'dite2';
  color: string; // Tailwind color name like 'blue', 'rose', 'emerald', 'amber'
  bgClass: string; // e.g. 'bg-blue-500'
  textClass: string; // e.g. 'text-blue-700'
  lightBgClass: string; // e.g. 'bg-blue-50'
  borderClass: string; // e.g. 'border-blue-200'
  avatar: string; // E.g. emoji or icon name
  age?: number;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  memberIds: string[]; // Can involve multiple family members!
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: ActivityType;
  location?: string;
  isHomePresence?: boolean; // If true, indicates this activity specifically sets location (e.g. 'Doma' vs 'Pryč')
}

export type ContactCategory = 'family' | 'doctor' | 'school' | 'services' | 'other';

export interface Contact {
  id: string;
  name: string;
  relation: string; // Description like 'Pediatr', 'Třídní učitelka', 'Babička'
  phone: string;
  email?: string;
  address?: string;
  note?: string;
  category: ContactCategory;
}

export interface TripTip {
  id: string;
  title: string;
  description: string;
  location: string;
  distance: string; // e.g. 'Bohumín', '5 km', '15 km'
  suitableForKids: boolean;
  category: 'nature' | 'water' | 'indoor' | 'culture' | 'active';
  link?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type CelebrationType = 'birthday' | 'nameday' | 'anniversary' | 'holiday' | 'other';

export interface CelebrationEvent {
  id: string;
  name: string;
  type: CelebrationType;
  date: string; // MM-DD or YYYY-MM-DD
  memberId?: string; // Reference to Member
  notes?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string; // e.g. "2 ks", "1l", "1 balení"
  category: 'potraviny' | 'drogerie' | 'ovoce-zelenina' | 'pecivo' | 'ostatni';
  requestedBy: string; // Member ID
  completed: boolean;
  completedBy?: string; // Member ID
  priority: 'low' | 'medium' | 'high';
  createdAt: string; // YYYY-MM-DD
}

export interface Expense {
  id: string;
  amount: number;
  purpose: string;
  category: 'nakup' | 'sluzby' | 'vylet' | 'ostatni';
  paidBy: string; // Member ID
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface FamilyTreeMember {
  id: string;
  name: string;
  birthDate?: string; // YYYY-MM-DD
  birthPlace?: string;
  gender: 'male' | 'female' | 'other';
  avatar: string; // Emoji or base64 photo URL
  relationship: string; // "Táta", "Máma", "Babička", "Dědeček", "Prastrýc", "Sestřenice" etc.
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  bio?: string;
  hobbies?: string; // Comma separated hobbies
  occupation?: string;
  generation: number; // 0 for children, 1 for parents, 2 for grandparents, -1 for grandchildren etc.
}

export interface ChildDuty {
  id: string;
  title: string;
  emoji: string;
  assignedTo: string; // Member ID of the child
  completed: boolean;
}

export interface ImportantAlert {
  id: string;
  content: string;
  memberId: string; // Member ID for whom the alert is highlighted
  createdAt: string;
}

export interface HelpAnswer {
  id: string;
  authorId: string; // Member ID OR 'ai'
  authorName: string; // Member name OR 'AI Psycholog'
  authorAvatar: string; // Member avatar OR '🤖'
  content: string;
  createdAt: string;
}

export interface HelpQuestion {
  id: string;
  senderId: string; // Member ID
  title: string; // e.g. "se ségra nechce dělit o hračky"
  content: string; // detailed context
  category: 'vychova' | 'puberta' | 'vztahy' | 'skola' | 'psychologie' | 'emoce';
  createdAt: string;
  answers: HelpAnswer[];
  aiAnswerRequested?: boolean;
}

export interface FamilyMessage {
  id: string;
  senderId: string;
  type: 'text' | 'drawing' | 'voice';
  content: string; // text message OR base64 image data URL OR base64 audio data URL
  createdAt: string;
  duration?: number; // for voice messages, in seconds
}

export interface MedicationHistoryEntry {
  id: string;
  time: string; // ISO String
  dosage: string;
  givenBy: string; // Member ID
  note?: string;
}

export interface MedicationLog {
  id: string;
  childId: string; // Reference to a child Member
  name: string; // e.g., "Nurofen sirup"
  illness: string; // e.g., "Horečka a zuby"
  dosage: string; // e.g., "5 ml"
  lastGiven: string; // ISO String of last time given
  givenBy: string; // Member ID (who gave it last)
  notes?: string;
  history: MedicationHistoryEntry[];
  intervalHours?: number; // Dose interval in hours (e.g. 4, 6, 8, 12, 24)
  remindersEnabled?: boolean; // True if automatic reminders are enabled
}

export interface HomeworkTask {
  id: string;
  childId: string; // Reference to a child Member (Member ID)
  subject: string; // e.g. "Matematika", "Český jazyk", "Prvouka", "Básnička"
  title: string; // e.g. "Pracovní sešit str. 12 / cv. 3"
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  isPoem: boolean; // if it's a poem to train
  poemText?: string; // lines of the poem
  notes?: string;
  createdAt: string;
}

export interface PocketMoneyTransaction {
  id: string;
  childId: string; // The child receiving or spending
  type: 'credit' | 'debit'; // credit = given by parent, debit = spent by child
  amount: number;
  purpose: string; // e.g. "Kapesné", "Zmrzlina"
  date: string; // YYYY-MM-DD
  recordedBy: string; // Member ID who recorded this (parent or child)
  notes?: string;
}
