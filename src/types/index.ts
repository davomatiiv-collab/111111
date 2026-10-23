export type UserRole = 'xodim' | 'rahbar' | 'admin';

export interface User {
  id: string;
  badgeNumber: string;
  fullName: string;
  rank: string;
  role: UserRole;
  department: string;
  email: string;
  avatar: string;
  status: 'faol' | 'nofaol';
}

export type DocumentType =
  | 'xizmat_xati'
  | 'hisobot'
  | 'malumotnoma'
  | 'tushuntirish_xati'
  | 'yigilish_bayonnomasi'
  | 'qaror_loyihasi';

export type DocumentStatus = 'Qoralama' | 'Tekshiruvda' | 'Tasdiqlangan' | 'Qaytarilgan';

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  content: string;
  modifiedBy: string;
  modifiedAt: string;
  changeSummary: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  docType: DocumentType;
  docNumber: string;
  recipient: string;
  content: string;
  summary: string;
  status: DocumentStatus;
  creatorId: string;
  creatorName: string;
  creatorRank: string;
  department: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewComment?: string;
  aiAssisted: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  versions: DocumentVersion[];
}

export interface DocumentTemplate {
  id: string;
  title: string;
  docType: DocumentType;
  description: string;
  icon: string;
  defaultStructure: string;
  samplePrompt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  assignedById: string;
  assignedByName: string;
  priority: 'Yuqori' | 'O\'rta' | 'Past';
  status: 'Yangi' | 'Jarayonda' | 'Bajarildi' | 'Muddati o\'tgan';
  deadline: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: { docTitle: string; article: string; snippet: string }[];
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: 'Qonun' | 'Qaror' | 'Buyruq' | 'Yo\'riqnoma' | 'Nizom';
  numberAndDate: string;
  description: string;
  content: string;
  articles: {
    number: string;
    title: string;
    text: string;
    matchScore?: number;
  }[];
  uploadedBy?: string;
  uploadedAt: string;
}

export interface AuditEvent {
  id: string;
  userId: string;
  userName: string;
  action:
    | 'TIZIMGA_KIRISH'
    | 'TIZIMDAN_CHIQISH'
    | 'KIRISH_RAD_ETILDI'
    | 'HUJJAT_YARATISH'
    | 'HUJJAT_TAHRIRLASH'
    | 'TEKSHIRUVGA_YUBORISH'
    | 'HUJJAT_TASDIQLASH'
    | 'HUJJAT_QAYTARISH'
    | 'HUJJAT_EKSPORT'
    | 'TOPSHIRIQ_YARATISH'
    | 'TOPSHIRIQ_YANGILASH'
    | 'AI_CHAT_MUROJAAT'
    | 'MEYORIY_QIDIRUV'
    | 'FAYL_YUKLASH'
    | 'ROL_ALMASHTIRISH'
    | 'EPATRUL_QIDIRUV'
    | 'HIMOYA_ORDERI_BERISH'
    | 'HIMOYA_ORDERI_YANGILASH'
    | 'GIS_XARITA_KORISH'
    | 'PATRUL_YOLLASH';
  objectType: 'Hujjat' | 'Topshiriq' | 'Chat' | 'MeyoriyBaza' | 'Foydalanuvchi' | 'Xavfsizlik' | 'Patrul' | 'HimoyaOrderi' | 'KriminogenXarita';
  objectId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface DashboardStats {
  totalDocuments: number;
  draftDocuments: number;
  reviewDocuments: number;
  approvedDocuments: number;
  totalTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completedTasks: number;
  recentDocuments: DocumentItem[];
  recentTasks: TaskItem[];
  recentAuditLogs: AuditEvent[];
}

export interface UserSettings {
  userId: string;
  notificationsInApp: boolean;
  notificationsEmail: boolean;
  twoFactorAuth: boolean;
  autoSaveDrafts: boolean;
  highContrast: boolean;
  fontSize: 'standard' | 'large';
}

export interface LegalArticleMatch {
  code: string;
  article: string;
  title: string;
  sanction: string;
  elements: string;
}

export interface LegalQualificationResult {
  articles: LegalArticleMatch[];
  requiredEvidence: string[];
  proceduralSteps: string[];
  draftProtocol: string;
}

export interface CitizenAppeal {
  id: string;
  registrationNumber: string;
  citizenName: string;
  address: string;
  phone: string;
  topic: string;
  appealText: string;
  receivedDate: string;
  deadlineDate: string;
  status: 'Yangi' | 'O\'rganilmoqda' | 'Javob berildi' | 'Muddati o\'tgan';
  assignedOfficerName: string;
  summaryPoints?: string[];
  responseDraft?: string;
  recommendedActions?: string[];
}

export interface QuizQuestion {
  id: string;
  category: 'O\'RQ-407' | 'Odob-axloq' | 'Yo\'riqnoma' | 'MJtK';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  legalArticle: string;
}

export interface DistrictCrimeStat {
  district: string;
  totalIncidents: number;
  prevented: number;
  minorHooliganism: number; // 183-modda
  disobedience: number; // 194-modda
  publicAlcohol: number; // 187-modda
  domesticDisputes: number;
  trend: 'kamaygan' | 'barqaror' | 'oshgan';
  officerCount: number;
}

// ==================== 1. E-PATRUL & TEZKOR QIDIRUV ====================
export interface VehicleRecord {
  id: string;
  plateNumber: string; // Masalan: "01 A 777 AA"
  model: string; // Masalan: "Chevrolet Cobalt LTZ"
  color: string;
  year: number;
  ownerFullName: string;
  ownerPinfl: string;
  techPassportNumber: string;
  engineNumber: string;
  inspectionValidUntil: string;
  insuranceValidUntil: string;
  status: 'Toza' | 'Qidiruvda' | 'Jarima_Bor' | 'Taqiq_Qoyilgan';
  violationsCount: number;
  unpaidFinesAmount: number; // so'mda
  stolenReport?: {
    date: string;
    caseNumber: string;
    details: string;
    reportedByDepartment: string;
  };
  notes?: string;
}

export interface CriminalRecordItem {
  date: string;
  article: string;
  court: string;
  punishment: string;
}

export interface ActiveWarrantItem {
  warrantNumber: string;
  issuedBy: string;
  crimeArticle: string;
  issuedDate: string;
  urgency: 'Favqulodda' | 'Tezkor' | 'Oddiy';
}

export interface CitizenDossier {
  id: string;
  pinfl: string; // 14 raqamli JSHSHIR
  passportNumber: string; // Masalan: "FA 1234567"
  fullName: string;
  birthDate: string;
  gender: 'Erkak' | 'Ayol';
  address: string;
  mahalla: string;
  district: string;
  phone: string;
  photoUrl?: string;
  status: 'Toza' | 'Qidiruvda' | 'Profilaktik_Hisobda' | 'Probatsiya_Nazoratida';
  preventativeCategory?: 'Ilgari sudlangan' | 'Spirtli ichimlikka ruju qo‘ygan' | 'Oilaviy nizo chiqaruvchi' | 'Giyohvand' | 'Yo‘q';
  assignedInspector: string;
  criminalRecords: CriminalRecordItem[];
  warrants: ActiveWarrantItem[];
  protectionOrdersCount: number;
  lastCheckedAt?: string;
}

// ==================== 2. E-HIMOYA ORDERI (O'RQ-561) ====================
export interface ProtectionOrderRestrictions {
  noViolence: boolean; // Tazyiq o‘tkazish va zo‘ravonlik sodir etishni taqiqlash
  noContact: boolean; // Jabrlanuvchi bilan har qanday muloqotni taqiqlash
  noApproach: boolean; // Jabrlanuvchi ish/yashash joyiga yaqinlashishni taqiqlash (kamida 50m)
  separateLiving: boolean; // Bir xonada yolg‘iz qolishni taqiqlash
  weaponsSurrender: boolean; // Qurol saqlash yoki olib yurish huquqini to‘xtatish
  mandatoryRehab: boolean; // Majburiy tuzatish-targ‘ibot dasturidan o‘tish
}

export interface ProtectionOrder {
  id: string;
  orderNumber: string; // Masalan: "HO-2025/104"
  victimName: string;
  victimPinfl: string;
  victimPhone: string;
  victimAddress: string;
  offenderName: string;
  offenderPinfl: string;
  offenderPhone: string;
  offenderRelationship: string; // "Turmush o'rtog'i", "Sobiq er", "Qarindoshi", "Qo'shnisi"
  mahalla: string;
  district: string;
  issuedDate: string;
  expiryDate: string; // Standart 30 kun
  status: 'Faol' | 'Uzatilgan' | 'Tugatilgan' | 'Buzilgan';
  restrictions: ProtectionOrderRestrictions;
  inspectorName: string;
  inspectorRank: string;
  inspectorPhone: string;
  incidentSummary: string;
  monitoringVisitsCount: number;
  lastVisitDate: string;
  violationsRecorded: number;
}

// ==================== 3. KRIMINOGEN GIS XARITA & MAHALLE RISK ====================
export interface MahallaRiskZone {
  id: string;
  district: string;
  mahallaName: string;
  category: 'qizil' | 'sariq' | 'yashil';
  coordinates: { x: number; y: number }; // Xarita pozitsiyasi (%)
  population: number;
  incidentCount: number;
  preventedCount: number;
  inspectorName: string;
  inspectorRank: string;
  inspectorPhone: string;
  topOffenseType: string;
  safetyScore: number; // 0 - 100
  assignedPatrol: string;
  recentTrends: string;
  preventativeMeasures: string[];
}

export interface PatrolUnit {
  id: string;
  callSign: string; // "Ekipaj-102", "YPX-Patrul 44"
  officers: string[];
  vehiclePlate: string;
  assignedMahalla: string;
  district: string;
  status: 'Navbatchilikda' | 'Chaqiruvda' | 'Zaxirada';
  location: { x: number; y: number };
  batteryLevel: number;
}

export interface EmergencyAlert {
  id: string;
  code: '102_CHAQIRUV' | 'TUGMA_SOS' | 'YPX_HODISA' | 'SHUBHALI_SHAXS';
  title: string;
  address: string;
  mahalla: string;
  district: string;
  timestamp: string;
  urgency: 'Yuqori' | 'O\'rta' | 'Oddiy';
  status: 'Yangi' | 'Ekipaj_Biriktirildi' | 'Bartaraf_Etildi';
  assignedPatrol?: string;
  callerPhone?: string;
  description: string;
}

