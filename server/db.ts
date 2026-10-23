import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  badgeNumber: string; // Xizmat guvohnomasi raqami, e.g. IIV-41092
  fullName: string;
  rank: string; // Mayor, Podpolkovnik, Katta leytenant, Leytenant, Safdor
  role: 'xodim' | 'rahbar' | 'admin';
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

export interface UserSettings {
  userId: string;
  notificationsInApp: boolean;
  notificationsEmail: boolean;
  twoFactorAuth: boolean;
  autoSaveDrafts: boolean;
  highContrast: boolean;
  fontSize: 'standard' | 'large';
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
  plateNumber: string;
  model: string;
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
  unpaidFinesAmount: number;
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
  pinfl: string;
  passportNumber: string;
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

// ==================== 2. E-HIMOYA ORDERI ====================
export interface ProtectionOrderRestrictions {
  noViolence: boolean;
  noContact: boolean;
  noApproach: boolean;
  separateLiving: boolean;
  weaponsSurrender: boolean;
  mandatoryRehab: boolean;
}

export interface ProtectionOrder {
  id: string;
  orderNumber: string;
  victimName: string;
  victimPinfl: string;
  victimPhone: string;
  victimAddress: string;
  offenderName: string;
  offenderPinfl: string;
  offenderPhone: string;
  offenderRelationship: string;
  mahalla: string;
  district: string;
  issuedDate: string;
  expiryDate: string;
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

// ==================== 3. KRIMINOGEN GIS XARITA ====================
export interface MahallaRiskZone {
  id: string;
  district: string;
  mahallaName: string;
  category: 'qizil' | 'sariq' | 'yashil';
  coordinates: { x: number; y: number };
  population: number;
  incidentCount: number;
  preventedCount: number;
  inspectorName: string;
  inspectorRank: string;
  inspectorPhone: string;
  topOffenseType: string;
  safetyScore: number;
  assignedPatrol: string;
  recentTrends: string;
  preventativeMeasures: string[];
}

export interface PatrolUnit {
  id: string;
  callSign: string;
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

export interface AppDatabase {
  users: User[];
  documents: DocumentItem[];
  templates: DocumentTemplate[];
  tasks: TaskItem[];
  conversations: Conversation[];
  knowledge: KnowledgeDoc[];
  auditLogs: AuditEvent[];
  settings: Record<string, UserSettings>;
  appeals: CitizenAppeal[];
  quizQuestions: QuizQuestion[];
  districtStats: DistrictCrimeStat[];
  vehicles: VehicleRecord[];
  citizenDossiers: CitizenDossier[];
  protectionOrders: ProtectionOrder[];
  mahallaRiskZones: MahallaRiskZone[];
  patrolUnits: PatrolUnit[];
  emergencyAlerts: EmergencyAlert[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'iiv_database.json');

// Initial seed data
const initialUsers: User[] = [
  {
    id: 'usr-1',
    badgeNumber: 'IIV-41092',
    fullName: 'Rustamov Alisher Xamidovich',
    rank: 'Mayor',
    role: 'rahbar',
    department: 'Huquqbuzarliklar profilaktikasi boshqarmasi',
    email: 'a.rustamov@iiv.gov.uz',
    avatar: 'AR',
    status: 'faol',
  },
  {
    id: 'usr-2',
    badgeNumber: 'IIV-77241',
    fullName: 'Karimov Sardor Baxtiyorovich',
    rank: 'Katta leytenant',
    role: 'xodim',
    department: 'Huquqbuzarliklar profilaktikasi boshqarmasi',
    email: 's.karimov@iiv.gov.uz',
    avatar: 'SK',
    status: 'faol',
  },
  {
    id: 'usr-3',
    badgeNumber: 'IIV-00105',
    fullName: 'Saidov Jamshid Shokirovich',
    rank: 'Podpolkovnik',
    role: 'admin',
    department: 'Axborot texnologiyalari va xavfsizlik boshqarmasi',
    email: 'j.saidov@iiv.gov.uz',
    avatar: 'JS',
    status: 'faol',
  },
];

const initialTemplates: DocumentTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Xizmat xati (Bildirgi)',
    docType: 'xizmat_xati',
    description: 'Xizmat faoliyati davomida aniqlangan holatlar va takliflar yuzasidan yuqori turuvchi rahbarga xabarnoma',
    icon: 'FileText',
    defaultStructure: `KIMGA: Toshkent shahar IIBB HPB boshlig'i mayor A.X. Rustamovga
KIMDAN: HPB katta inspektori katta leytenant S.B. Karimovdan

BILDIRGI

Sizga shuni ma'lum qilamanki, 2026-yil davomida profilaktik tadbirlar o'tkazish jarayonida...

Taklif va xulosa:
1. ...
2. ...

Ijrochi: HPB katta inspektori katta leytenant S.B. Karimov`,
    samplePrompt: 'Yunusobod tumanidagi tungi ko‘ngilochar maskanlarda o‘tkazilgan profilaktik reyd natijalari bo‘yicha bildirgi tayyorlash',
  },
  {
    id: 'tpl-2',
    title: 'Tushuntirish xati',
    docType: 'tushuntirish_xati',
    description: 'Xizmat intizomi yoki xizmat vazifalarini bajarishdagi holatlar yuzasidan xodimning yozma izohi',
    icon: 'FileQuestion',
    defaultStructure: `KIMGA: Bo'lim boshlig'i mayor A.X. Rustamovga
KIMDAN: Katta inspektor katta leytenant S.B. Karimovdan

TUSHUNTIRISH XATI

Men, katta leytenant S.B. Karimov, ushbu orqali 2026-yil ... kuni sodir bo'lgan holat yuzasidan quyidagilarni bayon qilaman:

...

Katta leytenant: _________ S.B. Karimov`,
    samplePrompt: '2026-yil 20-oktabr kuni navbatchilikka 15 daqiqa kechikib kelish sababi bo‘yicha tushuntirish xati qoralamasi',
  },
  {
    id: 'tpl-3',
    title: 'Ma’lumotnoma (Spravka)',
    docType: 'malumotnoma',
    description: 'Muayyan soha, hudud yoki hodisa yuzasidan xizmat ma\'lumotlarini umumlashtiruvchi tahliliy hujjat',
    icon: 'ClipboardList',
    defaultStructure: `MA'LUMOTNOMA

Toshkent shahar hududida 2026-yilning o'tgan davri mobaynida voyaga yetmaganlar o'rtasida huquqbuzarliklar profilaktikasi holati to'g'risida

1. Umumiy statistik ma'lumotlar:
2. Ko'rilgan ta'sir choralari:
3. Mavjud muammolar va ularni bartaraf etish rejalari:`,
    samplePrompt: 'Chilonzor tumanida so‘nggi oyda ro‘yxatga olingan mayda bezorilik holatlari bo‘yicha tahliliy ma’lumotnoma tuzish',
  },
  {
    id: 'tpl-4',
    title: 'Xizmat hisoboti',
    docType: 'hisobot',
    description: 'Belgilangan muddatdagi operativ-profilaktik tadbirlar ijrosi bo\'yicha to\'liq hisobot',
    icon: 'BarChart3',
    defaultStructure: `HISOBOT

O'tkazilgan "Xavfsiz hudud" maxsus profilaktik tadbiri natijalari to'g'risida

Hisobot davri: 2026-yil oktyabr oyi.
Jalb etilgan shaxsiy tarkib: ...
Natijalar: ...`,
    samplePrompt: '"Xavfsiz poytaxt" tadbiri doirasida tekshirilgan obektlar va ogohlantirilgan shaxslar bo‘yicha hisobot',
  },
  {
    id: 'tpl-5',
    title: 'Yig‘ilish bayonnomasi loyihasi',
    docType: 'yigilish_bayonnomasi',
    description: 'Tezkor yig\'ilish, muhokama yoki yo\'riqnoma majlislarining rasmiy qayd loyihasi',
    icon: 'Users',
    defaultStructure: `YIG'ILISH BAYONNOMASI № __

Sana: 2026-yil "__" __________
Joy: Boshqarma majlislar zali
Raislik qiluvchi: Mayor A.X. Rustamov
Qatnashdilar: Bo'lim shaxsiy tarkibi (14 nafar)

KUN TARTIBI:
1. Xizmat intizomi va qonuniylikka rioya etish holati.
2. Fuqarolar murojaatlari bilan ishlash samaradorligini oshirish.

ESHITILDI:
QAROR QILINDI:`,
    samplePrompt: 'Bo‘linmada xizmat intizomini mustahkamlashga bag‘ishlangan operativ yig‘ilish bayonnomasi loyihasi',
  },
];

const initialKnowledge: KnowledgeDoc[] = [
  {
    id: 'know-1',
    title: 'O‘zbekiston Respublikasining "Ichki ishlar organlari to‘g‘risida"gi Qonuni',
    category: 'Qonun',
    numberAndDate: 'O\'RQ-407-son, 16.09.2016-yil',
    description: 'Ichki ishlar organlarining huquqiy maqomi, asosiy vazifalari, faoliyat tamoyillari, xodimlarning huquq va majburiyatlari',
    content: `Ushbu Qonun ichki ishlar organlarining asosiy vazifalari, tamoyillari, xodimlarning vakolatlari hamda huquqiy maqomini belgilaydi.`,
    articles: [
      {
        number: '3-modda',
        title: 'Ichki ishlar organlarining asosiy vazifalari',
        text: 'Ichki ishlar organlarining asosiy vazifalari fuqarolarning huquqlari, erkinliklari va qonuniy manfaatlarini, jismoniy va yuridik shaxslarning mol-mulkini himoya qilish, konstitutsiyaviy tuzumni himoya qilish, qonun ustuvorligini, shaxs, jamiyat va davlat xavfsizligini ta’minlash, shuningdek huquqbuzarliklarning oldini olish hamda ularga chek qo‘yishdan iboratdir.',
      },
      {
        number: '4-modda',
        title: 'Ichki ishlar organlari faoliyatining asosiy prinsiplari',
        text: 'Ichki ishlar organlarining faoliyati qonuniylik, yagonalik, inson huquqlari, erkinliklari va qonuniy manfaatlariga rioya etish hamda ularni hurmat qilish, ochiqlik va shaffoflik prinsiplari asosida amalga oshiriladi.',
      },
      {
        number: '8-modda',
        title: 'Inson huquqlari, erkinliklari va qonuniy manfaatlariga rioya etish',
        text: 'Ichki ishlar organlari o‘z faoliyatida inson huquqlari, erkinliklari va qonuniy manfaatlarini kamsitmasligi, jinsi, irqi, millati, tili, dini, ijtimoiy kelib chiqishi, e’tiqodi, shaxsiy va ijtimoiy mavqeidan qat’i nazar, qonun oldida barcha fuqarolarning tengligini ta’minlashi shart.',
      },
      {
        number: '21-modda',
        title: 'Jismoniy kuch ishlatish, maxsus vositalarni va o‘qotar qurolni qo‘llash shartlari',
        text: 'Ichki ishlar organi xodimi jismoniy kuch ishlatishdan, maxsus vositalarni va o‘qotar qurolni qo‘llashdan oldin, ularni qo‘llash niyati haqida ogohlantirishi, shuningdek shaxslarga o‘zining qonuniy talablarini bajarish uchun yetarli vaqt berishi shart, bundan kechiktirish fuqaroning yoki xodimning hayoti va sog‘lig‘iga bevosita xavf tug‘diradigan hollar mustasno.',
      },
      {
        number: '35-modda',
        title: 'Ichki ishlar organi xodimining xizmat intizomi',
        text: 'Ichki ishlar organlarida xizmat intizomi xodim tomonidan O‘zbekiston Respublikasi Konstitutsiyasi, ushbu Qonun, boshqa qonunchilik hujjatlari, Ichki ishlar organlarining intizom ustavi, qasamyod hamda xizmat burchi talablariga og‘ishmay rioya etilishidan iboratdir.',
      },
    ],
    uploadedAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'know-2',
    title: 'IIV xodimlarining kasbiy odob-axloq va xizmat intizomi Kodeksi',
    category: 'Nizom',
    numberAndDate: 'IIV Buyrug‘i ilovasi, 2023-yil',
    description: 'Xodimlarning xizmat burchini ado etishdagi axloqiy mezonlari, fuqarolar bilan muloqot madaniyati va korrupsiyaga qarshi kurash talablari',
    content: `Ichki ishlar organi xodimi fuqarolar bilan muloyim, e'tiborli va xolis munosabatda bo'lishi, korrupsiyaviy holatlarga yo'l qo'ymasligi shart.`,
    articles: [
      {
        number: '5-band',
        title: 'Fuqarolar bilan muloqot qilish madaniyati',
        text: 'Xodim har qanday vaziyatda o‘zini bosiq, xushmuomala, xolis tutishi, fuqaro bilan suhbatda o‘z unvoni, lavozimi va familiyasini aytishi, murojaat qilish sababini aniq va tushunarli bayon qilishi kerak.',
      },
      {
        number: '9-band',
        title: 'Manfaatlar to‘qnashuvi va korrupsiyaning oldini olish',
        text: 'Xodim xizmat vazifasini bajarish chog‘ida har qanday moddiy yoki boshqa shaxsiy manfaatdorlikdan holi bo‘lishi, o‘ziga yoki yaqin qarindoshlariga noqonuniy imtiyoz yaratishga qaratilgan harakatlardan qat’iy tiyilishi shart.',
      },
      {
        number: '14-band',
        title: 'Xizmat sirlari va axborot xavfsizligiga rioya qilish',
        text: 'Xizmat faoliyati davomida olingan ma’lumotlar, fuqarolarning shaxsiy hayotiga oid sir saqlanishi kerak bo‘lgan ma’lumotlar va maxfiy hujjatlar mazmuni ruxsatsiz uchinchi shaxslarga yoki ochiq axborot resurslariga berilishi qat’iyan man etiladi.',
      },
    ],
    uploadedAt: '2026-01-20T10:30:00Z',
  },
  {
    id: 'know-3',
    title: 'Ichki ishlar organlarida hujjatlar bilan ishlash va ijro intizomi Yo‘riqnomasi',
    category: 'Yo\'riqnoma',
    numberAndDate: 'IIV-Yo‘riqnoma № 144, 2024-yil',
    description: 'Xizmat xatlari, bildirgi, ma’lumotnoma va hisobotlarni rasmiylashtirish, ro‘yxatga olish va ijro nazorati tartibi',
    content: `Barcha xizmat hujjatlari qat'iy belgilangan rekvizitlarga ega bo'lishi, ijrochi va nazorat qiluvchi shaxs tomonidan vizalanishi lozim.`,
    articles: [
      {
        number: '12-band',
        title: 'Bildirgilar (xizmat xatlari)ni rasmiylashtirish tartibi',
        text: 'Bildirgi xodim tomonidan bo‘lim boshlig‘i yoki boshqarma boshlig‘i nomiga tuziladi. Unda masalaning mohiyati, huquqiy asoslari, aniqlangan kamchiliklar hamda takliflar aniq ifodalangan bo‘lishi, ijrochining imzosi va tayyorlangan sana qo‘yilishi shart.',
      },
      {
        number: '18-band',
        title: 'Ijro muddatlari va hisobdorlik',
        text: 'Fuqarolar murojaatlari bo‘yicha topshiriqlar o‘n besh kun, qo‘shimcha o‘rganish talab etilganda bir oygacha bo‘lgan muddatda ijro etiladi. Tezkor xizmat topshiriqlari rahbariyat ko‘rsatmasida belgilangan muddatda bajarilishi shart.',
      },
      {
        number: '25-band',
        title: 'Hujjat loyihalarini kelishish va tasdiqlash',
        text: 'Tayyorlangan hujjat loyihasi (qoralama) vakolatli rahbar tomonidan tasdiqlanmaguncha yoki ro‘yxatga olish raqami berilmaguncha rasmiy kuchga ega bo‘lmaydi. Elektron tizimdagi qoralamalarda tegishli holat belgisi aks ettirilishi lozim.',
      },
    ],
    uploadedAt: '2026-02-05T14:00:00Z',
  },
  {
    id: 'know-4',
    title: 'O‘zbekiston Respublikasining "Huquqbuzarliklar profilaktikasi to‘g‘risida"gi Qonuni',
    category: 'Qonun',
    numberAndDate: 'O‘RQ-371-son, 14.05.2014-yil',
    description: 'Huquqbuzarliklarning umumiy, maxsus, yakka tartibdagi va viktimologik profilaktikasini tashkil etish mezonlari',
    content: `Huquqbuzarliklar profilaktikasi - huquqbuzarliklarning sodir etilish sabablari va ularga imkon berayotgan shart-sharoitlarni aniqlash hamda bartaraf etishga qaratilgan chora-tadbirlar tizimidir.`,
    articles: [
      {
        number: '17-modda',
        title: 'Ichki ishlar organlarining huquqbuzarliklar profilaktikasi sohasidagi vakolatlari',
        text: 'Ichki ishlar organlari huquqbuzarliklar profilaktikasini amalga oshiruvchi asosiy subyekt hisoblanadi. Ular umumiy va yakka tartibdagi profilaktika chora-tadbirlarini ishlab chiqadi, huquqbuzarlik sodir etishga moyil bo‘lgan shaxslar bilan profilaktik suhbatlar o‘tkazadi hamda hisobga oladi.',
      },
      {
        number: '23-modda',
        title: 'Profilaktik suhbat',
        text: 'Profilaktik suhbat huquqbuzarlik sodir etishga moyil bo‘lgan shaxsni jamiyatda qabul qilingan xulq-atvor normalari va qoidalariga rioya etishga ko‘ndirish, huquqbuzarlik sodir etish oqibatlarini tushuntirish maqsadida o‘tkaziladi.',
      },
      {
        number: '24-modda',
        title: 'Rasmiy ogohlantirish',
        text: 'Rasmiy ogohlantirish huquqbuzarlik sodir etishga moyil bo‘lgan shaxsga g‘ayriijtimoiy xulq-atvorning davom ettirilishiga yoki huquqbuzarlik sodir etilishiga yo‘l qo‘yilmasligi haqida yozma ravishda e’lon qilinadi.',
      },
    ],
    uploadedAt: '2026-02-18T11:20:00Z',
  },
];

const initialDocuments: DocumentItem[] = [
  {
    id: 'doc-101',
    title: 'Yunusobod tumani tungi reyd natijalari bo‘yicha bildirgi',
    docType: 'xizmat_xati',
    docNumber: 'HPB-2026/041',
    recipient: 'Toshkent shahar IIBB HPB boshlig\'i mayor A.X. Rustamovga',
    summary: 'Yunusobod tumanidagi 4 ta obektda o‘tkazilgan tungi nazorat reydi va 3 nafar fuqaroga nisbatan rasmiylashtirilgan dalolatnomalar xulosasi.',
    content: `KIMGA: Toshkent shahar IIBB HPB boshlig'i mayor A.X. Rustamovga
KIMDAN: HPB katta inspektori katta leytenant S.B. Karimovdan

BILDIRGI

Sizga shuni ma'lum qilamanki, 2026-yil 22-oktyabr tuni davomida Yunusobod tumani hududida jamoat tartibini saqlash va huquqbuzarliklarning oldini olish maqsadida "Tungi reyd" tadbiri o'tkazildi.

Reyd davomida:
1. Hududdagi 4 ta tungi faoliyat yurituvchi umumiy ovqatlanish maskanlari tekshirildi;
2. Belgilangan tartibni buzgan 3 nafar fuqaro bilan profilaktik suhbat o'tkazildi va rasmiy ogohlantirildi;
3. Voyaga yetmagan shaxslarning tungi vaqtda nazoratsiz yurishi holati aniqlanmadi.

Yuqoridagilardan kelib chiqib, mazkur yo'nalishdagi profilaktik tadbirlarni davom ettirish maqsadga muvofiqligini bildiraman.

Ijrochi: HPB katta inspektori katta leytenant S.B. Karimov
2026-yil 23-oktyabr`,
    status: 'Tekshiruvda',
    creatorId: 'usr-2',
    creatorName: 'Karimov S.B.',
    creatorRank: 'Katta leytenant',
    department: 'Huquqbuzarliklar profilaktikasi boshqarmasi',
    reviewerId: 'usr-1',
    reviewerName: 'Rustamov A.X.',
    aiAssisted: true,
    createdAt: '2026-10-23T06:30:00Z',
    updatedAt: '2026-10-23T07:15:00Z',
    tags: ['reyd', 'profilaktika', 'yunusobod', 'bildirgi'],
    versions: [
      {
        id: 'ver-1',
        documentId: 'doc-101',
        versionNumber: 1,
        content: `Dastlabki qoralama tuzildi...`,
        modifiedBy: 'Karimov S.B.',
        modifiedAt: '2026-10-23T06:30:00Z',
        changeSummary: 'AI yordamida qoralama shakllantirildi',
      },
      {
        id: 'ver-2',
        documentId: 'doc-101',
        versionNumber: 2,
        content: `Tahrirlangan va rahbar ko'rigiga yuborilgan matn.`,
        modifiedBy: 'Karimov S.B.',
        modifiedAt: '2026-10-23T07:15:00Z',
        changeSummary: 'Aniqliklar kiritildi va tekshiruvga yuborildi',
      },
    ],
  },
  {
    id: 'doc-102',
    title: '3-chorak huquqbuzarliklar statistik tahlili ma’lumotnomasi',
    docType: 'malumotnoma',
    docNumber: 'HPB-2026/039',
    recipient: 'Toshkent shahar IIBB rahbariyatiga',
    summary: '2026-yilning 3-choragi mobaynida xizmat hududida sodir etilgan ma\'muriy huquqbuzarliklar dinamikasi va natijadorligi.',
    content: `MA'LUMOTNOMA

2026-yil 3-choragi yakunlari bo'yicha profilaktika inspektorlari tomonidan amalga oshirilgan ishlar holati to'g'risida:

1. Huquqbuzarliklar umumiy soni o'tgan yilning mos davriga nisbatan 8.4% ga kamayishiga erishildi.
2. Jami 142 nafar shaxslar bilan yakka tartibda profilaktik suhbatlar o'tkazildi.
3. 28 nafar shaxsga nisbatan rasmiy ogohlantirish berildi.

Xulosa: Mahalla profilaktika xodimlari bilan hamkorlikda targ'ibot ishlari kuchaytirilmoqda.`,
    status: 'Tasdiqlangan',
    creatorId: 'usr-2',
    creatorName: 'Karimov S.B.',
    creatorRank: 'Katta leytenant',
    department: 'Huquqbuzarliklar profilaktikasi boshqarmasi',
    reviewerId: 'usr-1',
    reviewerName: 'Rustamov A.X.',
    reviewComment: 'Hujjat tahliliy jihatdan to\'liq asoslangan, tasdiqlandi.',
    aiAssisted: true,
    createdAt: '2026-10-20T11:00:00Z',
    updatedAt: '2026-10-21T09:00:00Z',
    tags: ['statistika', 'hisobot', '3-chorak', 'tasdiqlangan'],
    versions: [],
  },
  {
    id: 'doc-103',
    title: 'Xizmat avtotransport vositasidan foydalanish bo‘yicha tushuntirish xati',
    docType: 'tushuntirish_xati',
    docNumber: 'QORALAMA-08',
    recipient: 'Bo\'lim boshlig\'iga',
    summary: 'Rejali navbatchilikdan so‘ng xizmat mashinasini belgilangan vaqtdan 20 daqiqa kechiktirib topshirish sabablari yuzasidan.',
    content: `KIMGA: Bo'lim boshlig'i mayor A.X. Rustamovga
KIMDAN: HPB katta inspektori katta leytenant S.B. Karimovdan

TUSHUNTIRISH XATI

Men, katta leytenant S.B. Karimov, ushbu orqali shuni ma'lum qilamanki, 2026-yil 21-oktyabr kuni navbatchilik yakunida xizmat avtotransporti hududdagi chaqiruv sababli ushlanib qolganligi tufayli garajga 20 daqiqa kechikib topshirildi.

Bunda boshqa hech qanday qonunbuzilish yoki qoidabuzarlik sodir etilmagan.

Katta leytenant: _________ S.B. Karimov`,
    status: 'Qoralama',
    creatorId: 'usr-2',
    creatorName: 'Karimov S.B.',
    creatorRank: 'Katta leytenant',
    department: 'Huquqbuzarliklar profilaktikasi boshqarmasi',
    aiAssisted: false,
    createdAt: '2026-10-22T14:10:00Z',
    updatedAt: '2026-10-22T14:10:00Z',
    tags: ['tushuntirish', 'qoralama', 'avtotransport'],
    versions: [],
  },
];

const initialTasks: TaskItem[] = [
  {
    id: 'tsk-1',
    title: 'Yunusobod tumanidagi tungi profilaktik reyd yakuniy hisobotini tayyorlash',
    description: 'Reydda qatnashgan xodimlar ma\'lumotlarini jamlash, bayonnomalar sonini ko\'rsatish va bo\'lim boshlig\'iga taqdim etish.',
    assignedToId: 'usr-2',
    assignedToName: 'Karimov S.B.',
    assignedById: 'usr-1',
    assignedByName: 'Rustamov A.X.',
    priority: 'Yuqori',
    status: 'Jarayonda',
    deadline: '2026-10-24T18:00:00Z',
    department: 'Huquqbuzarliklar profilaktikasi boshqarmasi',
    createdAt: '2026-10-23T05:00:00Z',
    updatedAt: '2026-10-23T07:00:00Z',
  },
  {
    id: 'tsk-2',
    title: 'Fuqaro M. Aliyevning 14-oktabrdagi arizasi bo‘yicha qo‘shimcha o‘rganish o‘tkazish',
    description: 'Mahalla raisi va profilaktika inspektori ishtirokida joyiga chiqib o\'rganish va ma\'lumotnoma tuzish.',
    assignedToId: 'usr-2',
    assignedToName: 'Karimov S.B.',
    assignedById: 'usr-1',
    assignedByName: 'Rustamov A.X.',
    priority: 'O\'rta',
    status: 'Yangi',
    deadline: '2026-10-25T12:00:00Z',
    department: 'Huquqbuzarliklar profilaktikasi boshqarmasi',
    createdAt: '2026-10-22T08:30:00Z',
    updatedAt: '2026-10-22T08:30:00Z',
  },
  {
    id: 'tsk-3',
    title: 'Shaxsiy tarkib o‘rtasida xizmat intizomi Kodeksi bo‘yicha seminarni tashkil etish',
    description: 'Boshqarma xodimlari uchun 1 soatlik huquqiy o\'quv soatini o\'tkazish va bayonnomasini yuritish.',
    assignedToId: 'usr-1',
    assignedToName: 'Rustamov A.X.',
    assignedById: 'usr-3',
    assignedByName: 'Saidov J.Sh.',
    priority: 'O\'rta',
    status: 'Bajarildi',
    deadline: '2026-10-22T16:00:00Z',
    department: 'Huquqbuzarliklar profilaktikasi boshqarmasi',
    createdAt: '2026-10-20T09:00:00Z',
    updatedAt: '2026-10-22T17:00:00Z',
  },
  {
    id: 'tsk-4',
    title: 'Kvartal yakuni bo‘yicha profilaktika hisobidagi shaxslar ro‘yxatini solishtirish',
    description: 'Yashash joyidan vaqtincha ketgan yoki tuzalish yo\'liga o\'tgan shaxslar bo\'yicha ma\'lumotlar bazasini yangilash.',
    assignedToId: 'usr-2',
    assignedToName: 'Karimov S.B.',
    assignedById: 'usr-1',
    assignedByName: 'Rustamov A.X.',
    priority: 'Yuqori',
    status: 'Muddati o\'tgan',
    deadline: '2026-10-21T18:00:00Z',
    department: 'Huquqbuzarliklar profilaktikasi boshqarmasi',
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-22T00:00:00Z',
  },
];

const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    userId: 'usr-2',
    title: 'Tungi reyd bildirgisi tayyorlash bo‘yicha maslahat',
    createdAt: '2026-10-23T06:15:00Z',
    updatedAt: '2026-10-23T06:25:00Z',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        text: 'Assalomu alaykum. Kecha Yunusobod tumanida o\'tkazilgan tungi nazorat reydi bo\'yicha bildirgi tuzishda qanday standart bandlarni kiritish lozim?',
        timestamp: '2026-10-23T06:15:00Z',
      },
      {
        id: 'msg-2',
        sender: 'ai',
        text: `Vaalaykum assalom, katta leytenant Karimov.

Ichki ishlar organlari hujjat aylanishi tartibiga ko‘ra, tungi reyd natijalari bo‘yicha bildirgiga quyidagi asosiy bandlarni kiritish tavsiya etiladi:

1. **Kirish qismi**: Tadbir asosi (reja, ko‘rsatma raqami), o‘tkazilgan sana va vaqt oraliqlari, jalb etilgan kuchlar.
2. **Tekshirilgan obektlar**: Ko‘zdan kechirilgan umumiy ovqatlanish, ko‘ngilochar yoki jamoat joylari soni.
3. **Aniqlangan holatlar**: Aniqlangan huquqbuzarliklar soni, qaysi moddalar bo‘yicha (masalan, MJtK 183 yoki 187-moddalari), o‘tkazilgan profilaktik suhbatlar.
4. **Xulosa va takliflar**: Ko‘rilgan ta’sir choralari hamda keyingi profilaktik chora-tadbirlar bo‘yicha aniq taklif.

*Eslatma: Ushbu tuzilma xizmat qoralamasi hisoblanadi va rahbar ko‘rigiga taqdim etilishi shart.*`,
        timestamp: '2026-10-23T06:17:00Z',
        sources: [
          {
            docTitle: 'Hujjatlar bilan ishlash Yo‘riqnomasi',
            article: '12-band',
            snippet: 'Bildirgi tuzishda masalaning mohiyati, huquqiy asoslari va aniq takliflar aks etishi shart.',
          },
        ],
      },
    ],
  },
];

const initialAudit: AuditEvent[] = [
  {
    id: 'aud-1',
    userId: 'usr-2',
    userName: 'Karimov S.B.',
    action: 'TIZIMGA_KIRISH',
    objectType: 'Foydalanuvchi',
    objectId: 'usr-2',
    details: 'Xavfsiz sessiya boshlandi (Xizmat guvohnomasi IIV-77241)',
    ipAddress: '192.168.10.45',
    timestamp: '2026-10-23T06:00:15Z',
  },
  {
    id: 'aud-2',
    userId: 'usr-2',
    userName: 'Karimov S.B.',
    action: 'HUJJAT_YARATISH',
    objectType: 'Hujjat',
    objectId: 'doc-101',
    details: 'Yangi xizmat xati qoralamasi tuzildi: Yunusobod tumani tungi reyd bildirgisi',
    ipAddress: '192.168.10.45',
    timestamp: '2026-10-23T06:30:00Z',
  },
  {
    id: 'aud-3',
    userId: 'usr-2',
    userName: 'Karimov S.B.',
    action: 'TEKSHIRUVGA_YUBORISH',
    objectType: 'Hujjat',
    objectId: 'doc-101',
    details: 'Hujjat holati "Tekshiruvda" deb o\'zgartirildi (Qabul qiluvchi: Mayor A. Rustamov)',
    ipAddress: '192.168.10.45',
    timestamp: '2026-10-23T07:15:00Z',
  },
  {
    id: 'aud-4',
    userId: 'usr-1',
    userName: 'Rustamov A.X.',
    action: 'HUJJAT_TASDIQLASH',
    objectType: 'Hujjat',
    objectId: 'doc-102',
    details: '3-chorak tahliliy ma\'lumotnomasi tasdiqlandi va arxivlandi',
    ipAddress: '192.168.10.12',
    timestamp: '2026-10-21T09:00:00Z',
  },
  {
    id: 'aud-5',
    userId: 'usr-3',
    userName: 'Saidov J.Sh.',
    action: 'TIZIMGA_KIRISH',
    objectType: 'Foydalanuvchi',
    objectId: 'usr-3',
    details: 'Administrator sifatida tizim nazorati ko\'zdan kechirildi',
    ipAddress: '192.168.1.5',
    timestamp: '2026-10-23T05:30:00Z',
  },
];

const initialAppeals: CitizenAppeal[] = [
  {
    id: 'app-1',
    registrationNumber: 'MUR-2026/089',
    citizenName: 'Xoliqov Bobur Anvarovich',
    address: 'Toshkent sh., Yunusobod tumani, 11-mavze, 45-uy, 12-xonadon',
    phone: '+998 90 123-45-67',
    topic: 'Tungi vaqtda ko‘p qavatli uy hovlisida shovqin va spirtli ichimlik iste’mol qilish',
    appealText: 'Assalomu alaykum. Bizning 45-uy oldidagi bolalar maydonchasida har kuni soat 23:00 dan keyin notanish shaxslar yig\'ilib, baqir-chaqir qilishmoqda va spirtli ichimlik ichib, aholining tinchligini buzmoqda. Ushbu holat yuzasidan profilaktika inspektori tomonidan tungi nazoratni kuchaytirishingizni va qonuniy chora ko\'rishingizni so\'rayman.',
    receivedDate: '2026-10-20T10:00:00Z',
    deadlineDate: '2026-11-04T18:00:00Z',
    status: 'O\'rganilmoqda',
    assignedOfficerName: 'Katta leytenant S.B. Karimov',
    summaryPoints: [
      'Bolalar maydonchasida tungi vaqtda jamoat tartibini buzish holatlari',
      'Spirtli ichimlik iste\'mol qiluvchi shaxslarga chora ko\'rish talabi',
      'Yunusobod 11-mavzeda tungi patrullikni kuchaytirish so\'rovi',
    ],
    recommendedActions: [
      'Hududiy profilaktika inspektori tomonidan joyiga chiqib o\'rganish',
      'Tungi reyd yo\'nalishiga 45-uy bolalar maydonchasini kiritish',
      'Aholi vakillari bilan profilaktik suhbat o\'tkazish',
    ],
  },
  {
    id: 'app-2',
    registrationNumber: 'MUR-2026/092',
    citizenName: 'Rahimova Nargiza Shuhratovna',
    address: 'Toshkent sh., Chilonzor tumani, 9-mavze, 18-uy',
    phone: '+998 93 987-65-43',
    topic: 'Ko‘p qavatli uy yo‘lagiga noqonuniy to‘siq o‘rnatish va nizoli holat',
    appealText: 'Hurmatli IIV rahbariyati. Qo\'shnimiz 1-qavatdagi umumiy foydalanishdagi yo\'lakka o\'zboshimchalik bilan temir panjara o\'rnatib olgan. Bu bo\'yicha bir necha bor ogohlantirsak ham janjal ko\'tarmoqda. Profilaktika inspektori aralashib, qonuniy tushuntirish berishini so\'raymiz.',
    receivedDate: '2026-10-22T14:30:00Z',
    deadlineDate: '2026-11-06T18:00:00Z',
    status: 'Yangi',
    assignedOfficerName: 'Mayor A.X. Rustamov',
  },
];

const initialQuizQuestions: QuizQuestion[] = [
  {
    id: 'qz-1',
    category: 'O\'RQ-407',
    question: 'Ichki ishlar organi xodimi jismoniy kuch ishlatishdan oldin qanday harakatni amalga oshirishi shart?',
    options: [
      'Darhol jismoniy kuch ishlatishi mumkin, ogohlantirish shart emas',
      'Ularni qo‘llash niyati haqida ogohlantirishi va qonuniy talabni bajarish uchun yetarli vaqt berishi shart',
      'Faqat xizmat guvohnomasini ko‘rsatishi kifoya',
      'Bo‘lim boshlig‘idan telefon orqali og‘zaki ruxsat olishi shart',
    ],
    correctIndex: 1,
    explanation: 'O‘zbekiston Respublikasining "Ichki ishlar organlari to‘g‘risida"gi Qonuni 21-moddasiga muvofiq, xodim jismoniy kuch ishlatishdan oldin o‘z niyati haqida ogohlantirishi va talabni bajarish uchun yetarli vaqt berishi shart (kechiktirish xavf tug‘diradigan hollar bundan mustasno).',
    legalArticle: 'O‘RQ-407, 21-modda',
  },
  {
    id: 'qz-2',
    category: 'MJtK',
    question: 'Jamoat joylarida uyatli so‘zlar bilan so‘kinish, fuqarolarga haqoratomuz shilqimlik qilish qaysi modda bilan kvalifikatsiya qilinadi?',
    options: [
      'MJtK 183-modda (Mayda bezorilik)',
      'MJtK 194-modda (Qonuniy talabni bajarmaslik)',
      'MJtK 187-modda (Alkogol iste’mol qilish)',
      'MJtK 54-modda (Epidemiyalarga qarshi kurash)',
    ],
    correctIndex: 0,
    explanation: 'MJtK 183-moddasiga ko‘ra, jamoat joylarida uyatli so‘zlar bilan so‘kinish, haqoratomuz tegajoqlik qilish mayda bezorilik hisoblanadi.',
    legalArticle: 'MJtK 183-modda',
  },
  {
    id: 'qz-3',
    category: 'Odob-axloq',
    question: 'IIV xodimi fuqaro bilan muloqotga kirishishdan avval qanday ma’lumotlarni aytishi kerak?',
    options: [
      'Faqat fuqaroning pasportini talab qilishi lozim',
      'O‘z unvoni, lavozimi va familiyasini aytishi, murojaat sababini aniq bayon qilishi kerak',
      'Hech qanday ma’lumot berishi shart emas',
      'Faqat xizmat bo‘limi manzilini aytishi kifoya',
    ],
    correctIndex: 1,
    explanation: 'IIV xodimlarining kasbiy odob-axloq Kodeksining 5-bandiga binoan xodim fuqaro bilan suhbatda o‘z unvoni, lavozimi va familiyasini ma’lum qilishi shart.',
    legalArticle: 'Odob-axloq Kodeksi, 5-band',
  },
  {
    id: 'qz-4',
    category: 'Yo\'riqnoma',
    question: 'Fuqarolarning arizalari va murojaatlarini ko‘rib chiqishning standart ijro muddati qancha?',
    options: [
      '3 kun',
      '15 kun (qo‘shimcha o‘rganish talab etilganda 1 oygacha)',
      '2 oy',
      '45 kun',
    ],
    correctIndex: 1,
    explanation: 'Hujjatlar bilan ishlash va murojaatlar to‘g‘risidagi qonunchilikka ko‘ra, murojaatlar 15 kun, qo‘shimcha tekshiruv talab etilsa 1 oygacha ko‘rib chiqiladi.',
    legalArticle: 'Yo‘riqnoma № 144, 18-band',
  },
  {
    id: 'qz-5',
    category: 'MJtK',
    question: 'Ichki ishlar organi xodimining qonuniy talablarini bajarmaslik qaysi modda bilan javobgarlikka tortiladi?',
    options: [
      'MJtK 131-modda',
      'MJtK 194-modda',
      'MJtK 201-modda',
      'MJtK 185-modda',
    ],
    correctIndex: 1,
    explanation: 'O‘zbekiston Respublikasi MJtK 194-moddasi ichki ishlar organi xodimining qonuniy talablarini bajarmaslik uchun javobgarlikni belgilaydi.',
    legalArticle: 'MJtK 194-modda',
  },
];

const initialDistrictStats: DistrictCrimeStat[] = [
  {
    district: 'Yunusobod tumani',
    totalIncidents: 142,
    prevented: 118,
    minorHooliganism: 48,
    disobedience: 22,
    publicAlcohol: 54,
    domesticDisputes: 18,
    trend: 'kamaygan',
    officerCount: 64,
  },
  {
    district: 'Chilonzor tumani',
    totalIncidents: 168,
    prevented: 135,
    minorHooliganism: 56,
    disobedience: 31,
    publicAlcohol: 62,
    domesticDisputes: 19,
    trend: 'barqaror',
    officerCount: 72,
  },
  {
    district: 'Mirzo Ulug‘bek tumani',
    totalIncidents: 115,
    prevented: 98,
    minorHooliganism: 34,
    disobedience: 14,
    publicAlcohol: 49,
    domesticDisputes: 18,
    trend: 'kamaygan',
    officerCount: 58,
  },
  {
    district: 'Shayxontohur tumani',
    totalIncidents: 154,
    prevented: 122,
    minorHooliganism: 51,
    disobedience: 28,
    publicAlcohol: 58,
    domesticDisputes: 17,
    trend: 'barqaror',
    officerCount: 66,
  },
  {
    district: 'Olmazor tumani',
    totalIncidents: 138,
    prevented: 110,
    minorHooliganism: 42,
    disobedience: 25,
    publicAlcohol: 53,
    domesticDisputes: 18,
    trend: 'kamaygan',
    officerCount: 60,
  },
  {
    district: 'Yakkasaroy tumani',
    totalIncidents: 89,
    prevented: 76,
    minorHooliganism: 26,
    disobedience: 11,
    publicAlcohol: 38,
    domesticDisputes: 14,
    trend: 'kamaygan',
    officerCount: 44,
  },
];

const initialVehicles: VehicleRecord[] = [
  {
    id: 'veh-1',
    plateNumber: '01 A 777 AA',
    model: 'Chevrolet Tracker 2 Premier',
    color: 'Qora metallik',
    year: 2024,
    ownerFullName: 'Azimov Sardor Rashidovich',
    ownerPinfl: '31504910120038',
    techPassportNumber: 'AAB 7819201',
    engineNumber: 'B10XFT240189',
    inspectionValidUntil: '2026-05-15',
    insuranceValidUntil: '2025-11-20',
    status: 'Toza',
    violationsCount: 0,
    unpaidFinesAmount: 0,
    notes: 'Hujjatlari qonuniy, taqiq yoki qidiruv belgilanmagan',
  },
  {
    id: 'veh-2',
    plateNumber: '01 707 ABC',
    model: 'Chevrolet Lacetti 1.5 MT',
    color: 'Oq (Gaza)',
    year: 2021,
    ownerFullName: 'Mansurov Eldor Baxtiyorovich',
    ownerPinfl: '32009890180052',
    techPassportNumber: 'AAC 3109482',
    engineNumber: 'B15D298104',
    inspectionValidUntil: '2024-08-10',
    insuranceValidUntil: '2024-09-01',
    status: 'Qidiruvda',
    violationsCount: 4,
    unpaidFinesAmount: 2450000,
    stolenReport: {
      date: '2025-02-14',
      caseNumber: 'J-QID-2025/119',
      details: 'Mirobod tumani hududidan noqonuniy olib qochilgan deb e’lon qilingan. Jinoyat ishi JK 267-modda 1-qismi.',
      reportedByDepartment: 'Toshkent shahar Mirobod tumani IIO FMB',
    },
    notes: 'DIQQAT: To‘xtatilganda ekipaj xavfsizligini ta’minlagan holda zudlik bilan navbatchilik qismiga xabar berilsin!',
  },
  {
    id: 'veh-3',
    plateNumber: '10 B 456 BA',
    model: 'Chevrolet Cobalt LTZ',
    color: 'To‘q kulrang',
    year: 2023,
    ownerFullName: 'Karimov Jasur Alisherovich',
    ownerPinfl: '32501930210041',
    techPassportNumber: 'AAE 9021844',
    engineNumber: 'B15D390184',
    inspectionValidUntil: '2025-01-20',
    insuranceValidUntil: '2024-12-15',
    status: 'Jarima_Bor',
    violationsCount: 8,
    unpaidFinesAmount: 4800000,
    notes: 'Kamera radarlari qayd etgan tezlikni oshirish va qizil chiroq qoidabuzarliklari. Sug‘urta muddati o‘tgan.',
  },
  {
    id: 'veh-4',
    plateNumber: '40 A 123 AA',
    model: 'BYD Song Plus Champion DM-i',
    color: 'Kulrang (Time Grey)',
    year: 2024,
    ownerFullName: 'To‘xtayev Shavkat Ilhomovich',
    ownerPinfl: '31806870190011',
    techPassportNumber: 'BYD 4490182',
    engineNumber: 'BYD476ZQC019',
    inspectionValidUntil: '2027-03-01',
    insuranceValidUntil: '2026-03-01',
    status: 'Taqiq_Qoyilgan',
    violationsCount: 1,
    unpaidFinesAmount: 375000,
    notes: 'MIB Yunusobod tumani bo‘limi tomonidan ijro hujjati asosida begonalashtirish va qayta ro‘yxatdan o‘tkazishga taqiq qo‘yilgan.',
  },
  {
    id: 'veh-5',
    plateNumber: '01 M 888 MM',
    model: 'Chevrolet Malibu 2 Premier 2.0 Turbo',
    color: 'Qora marvarid',
    year: 2023,
    ownerFullName: 'Rahmonov Akmal Xolmatovich',
    ownerPinfl: '31203850110099',
    techPassportNumber: 'AAF 8920194',
    engineNumber: 'LTG208912',
    inspectionValidUntil: '2026-09-10',
    insuranceValidUntil: '2025-10-18',
    status: 'Toza',
    violationsCount: 0,
    unpaidFinesAmount: 0,
    notes: 'Qoidabuzarlik va taqiqlar mavjud emas.',
  },
  {
    id: 'veh-6',
    plateNumber: '80 K 912 BA',
    model: 'Nexia 3 LTZ',
    color: 'Oq tutun',
    year: 2020,
    ownerFullName: 'Qosimov Sanjar Ulug‘bekovich',
    ownerPinfl: '32811960240015',
    techPassportNumber: 'AAB 1920491',
    engineNumber: 'B15D190284',
    inspectionValidUntil: '2025-06-12',
    insuranceValidUntil: '2025-07-01',
    status: 'Jarima_Bor',
    violationsCount: 3,
    unpaidFinesAmount: 1125000,
    notes: '128-prim modda (telefon) va 128-5 modda bo‘yicha jarimalar.',
  },
];

const initialCitizenDossiers: CitizenDossier[] = [
  {
    id: 'cit-1',
    pinfl: '31508920120014',
    passportNumber: 'FA 1234567',
    fullName: 'Ergashev Botir Olimovich',
    birthDate: '1988-08-15',
    gender: 'Erkak',
    address: 'Toshkent sh., Yunusobod tumani, Amir Temur ko‘chasi 45-uy, 18-xonadon',
    mahalla: 'Xiyobonbog‘ MFY',
    district: 'Yunusobod tumani',
    phone: '+998 90 123-45-67',
    status: 'Qidiruvda',
    preventativeCategory: 'Ilgari sudlangan',
    assignedInspector: 'Katta leytenant Karimov Sardor',
    criminalRecords: [
      {
        date: '2019-04-12',
        article: 'JK 169-modda 2-qismi (O‘g‘rilik)',
        court: 'Jinoyat ishlari bo‘yicha Yunusobod tuman sudi',
        punishment: '3 yil muddatga ozodlikdan mahrum qilish (Jazo to‘liq o‘talgan)',
      },
      {
        date: '2023-10-05',
        article: 'JK 168-modda 1-qismi (Firibgarlik)',
        court: 'Jinoyat ishlari bo‘yicha Shayxontohur tuman sudi',
        punishment: 'BHMning 100 baravari miqdorida jarima',
      },
    ],
    warrants: [
      {
        warrantNumber: 'QID-YUN-2025/412',
        issuedBy: 'Toshkent shahar prokuraturasi tergov bo‘limi',
        crimeArticle: 'JK 168-modda 3-qismi "a" bandi (Yirik miqdordagi firibgarlik)',
        issuedDate: '2025-01-18',
        urgency: 'Favqulodda',
      },
    ],
    protectionOrdersCount: 1,
    lastCheckedAt: '2025-02-23T14:20:00Z',
  },
  {
    id: 'cit-2',
    pinfl: '32104950150021',
    passportNumber: 'KA 9876543',
    fullName: 'Yusupov Jasur Farhodovich',
    birthDate: '1995-04-21',
    gender: 'Erkak',
    address: 'Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko‘chasi 12-uy, 4-xonadon',
    mahalla: 'Navoiy MFY',
    district: 'Chilonzor tumani',
    phone: '+998 94 987-65-43',
    status: 'Profilaktik_Hisobda',
    preventativeCategory: 'Spirtli ichimlikka ruju qo‘ygan',
    assignedInspector: 'Kapitan Mamatov Dilshod',
    criminalRecords: [
      {
        date: '2022-09-15',
        article: 'MJtK 183-modda (Mayda bezorilik)',
        court: 'Chilonzor tuman ma’muriy sudi',
        punishment: '10 sutka ma’muriy qamoq',
      },
    ],
    warrants: [],
    protectionOrdersCount: 1,
    lastCheckedAt: '2025-02-22T10:15:00Z',
  },
  {
    id: 'cit-3',
    pinfl: '40209880190035',
    passportNumber: 'AA 5544332',
    fullName: 'Karimov Nodir Mansurovich',
    birthDate: '1990-09-02',
    gender: 'Erkak',
    address: 'Toshkent sh., Shayxontohur tumani, Navoiy ko‘chasi 78-uy',
    mahalla: 'Guliston MFY',
    district: 'Shayxontohur tumani',
    phone: '+998 93 554-43-32',
    status: 'Probatsiya_Nazoratida',
    preventativeCategory: 'Ilgari sudlangan',
    assignedInspector: 'Katta leytenant Saidov Akrom',
    criminalRecords: [
      {
        date: '2023-05-18',
        article: 'JK 169-modda 1-qismi',
        court: 'Jinoyat ishlari bo‘yicha Shayxontohur tuman sudi',
        punishment: '2 yil muddatga ozodlikni cheklash (Probatsiya hisobida)',
      },
    ],
    warrants: [],
    protectionOrdersCount: 0,
    lastCheckedAt: '2025-02-20T09:00:00Z',
  },
  {
    id: 'cit-4',
    pinfl: '31902010180049',
    passportNumber: 'AB 1029384',
    fullName: 'Mamatov Dilshod Rustamovich',
    birthDate: '2001-02-19',
    gender: 'Erkak',
    address: 'Toshkent sh., Mirzo Ulug‘bek tumani, Buyuk Ipak Yo‘li ko‘chasi 105-uy, 22-xonadon',
    mahalla: 'Bog‘ishamol MFY',
    district: 'Mirzo Ulug‘bek tumani',
    phone: '+998 97 701-02-03',
    status: 'Toza',
    preventativeCategory: 'Yo‘q',
    assignedInspector: 'Mayor Rustamov Alisher',
    criminalRecords: [],
    warrants: [],
    protectionOrdersCount: 0,
    lastCheckedAt: '2025-02-23T11:45:00Z',
  },
  {
    id: 'cit-5',
    pinfl: '41208940220078',
    passportNumber: 'AC 8899776',
    fullName: 'Toshmatov Dilshod Bobirovich',
    birthDate: '1994-08-12',
    gender: 'Erkak',
    address: 'Toshkent sh., Chilonzor tumani, Muqimiy ko‘chasi 33-uy, 10-xonadon',
    mahalla: 'Do‘stlik MFY',
    district: 'Chilonzor tumani',
    phone: '+998 90 889-97-76',
    status: 'Profilaktik_Hisobda',
    preventativeCategory: 'Oilaviy nizo chiqaruvchi',
    assignedInspector: 'Leytenant Jo‘rayev Sherzod',
    criminalRecords: [
      {
        date: '2024-03-10',
        article: 'MJtK 52-modda (Yengil tan jarohati yetkazish)',
        court: 'Chilonzor tuman sudi',
        punishment: 'BHMning 2 baravari jarima',
      },
    ],
    warrants: [],
    protectionOrdersCount: 1,
    lastCheckedAt: '2025-02-21T16:30:00Z',
  },
];

const initialProtectionOrders: ProtectionOrder[] = [
  {
    id: 'ho-1',
    orderNumber: 'HO-2025/089',
    victimName: 'Yusupova Malika Shavkatovna',
    victimPinfl: '42503970180012',
    victimPhone: '+998 91 234-56-78',
    victimAddress: 'Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko‘chasi 12-uy, 4-xonadon',
    offenderName: 'Yusupov Jasur Farhodovich',
    offenderPinfl: '32104950150021',
    offenderPhone: '+998 94 987-65-43',
    offenderRelationship: 'Turmush o‘rtog‘i',
    mahalla: 'Navoiy MFY',
    district: 'Chilonzor tumani',
    issuedDate: '2025-02-06',
    expiryDate: '2025-03-08',
    status: 'Faol',
    restrictions: {
      noViolence: true,
      noContact: true,
      noApproach: true,
      separateLiving: true,
      weaponsSurrender: false,
      mandatoryRehab: true,
    },
    inspectorName: 'Kapitan Mamatov Dilshod',
    inspectorRank: 'Kapitan',
    inspectorPhone: '+998 71 230-02-02',
    incidentSummary: 'Muntazam spirtli ichimlik iste’mol qilib, turmush o‘rtog‘iga jismoniy va ruhiy tazyiq o‘tkazganligi holati bo‘yicha berilgan.',
    monitoringVisitsCount: 3,
    lastVisitDate: '2025-02-20',
    violationsRecorded: 0,
  },
  {
    id: 'ho-2',
    orderNumber: 'HO-2025/094',
    victimName: 'Toshmatova Nilufar Akramovna',
    victimPinfl: '41910960230044',
    victimPhone: '+998 93 456-78-90',
    victimAddress: 'Toshkent sh., Chilonzor tumani, Muqimiy ko‘chasi 33-uy, 10-xonadon',
    offenderName: 'Toshmatov Dilshod Bobirovich',
    offenderPinfl: '41208940220078',
    offenderPhone: '+998 90 889-97-76',
    offenderRelationship: 'Sobiq eri',
    mahalla: 'Do‘stlik MFY',
    district: 'Chilonzor tumani',
    issuedDate: '2025-01-26',
    expiryDate: '2025-02-25',
    status: 'Faol',
    restrictions: {
      noViolence: true,
      noContact: true,
      noApproach: true,
      separateLiving: true,
      weaponsSurrender: false,
      mandatoryRehab: true,
    },
    inspectorName: 'Leytenant Jo‘rayev Sherzod',
    inspectorRank: 'Leytenant',
    inspectorPhone: '+998 71 230-04-04',
    incidentSummary: 'Ajrashishdan keyin doimiy ta’qib qilish va tahdid solish harakatlari bo‘yicha berilgan. Muddat tugashiga 2 kun qoldi.',
    monitoringVisitsCount: 5,
    lastVisitDate: '2025-02-22',
    violationsRecorded: 0,
  },
  {
    id: 'ho-3',
    orderNumber: 'HO-2025/071',
    victimName: 'Sobirova Ra’no Azimovna',
    victimPinfl: '40801650190022',
    victimPhone: '+998 97 111-22-33',
    victimAddress: 'Toshkent sh., Olmazor tumani, Qorasaroy ko‘chasi 19-uy',
    offenderName: 'Sobirov Sherzod Anvarovich',
    offenderPinfl: '32007930140081',
    offenderPhone: '+998 90 333-44-55',
    offenderRelationship: 'O‘g‘li',
    mahalla: 'Qorasaroy MFY',
    district: 'Olmazor tumani',
    issuedDate: '2025-01-15',
    expiryDate: '2025-02-14',
    status: 'Buzilgan',
    restrictions: {
      noViolence: true,
      noContact: true,
      noApproach: true,
      separateLiving: false,
      weaponsSurrender: false,
      mandatoryRehab: true,
    },
    inspectorName: 'Katta leytenant Rahimov Baxtiyor',
    inspectorRank: 'Katta leytenant',
    inspectorPhone: '+998 71 240-01-01',
    incidentSummary: 'Himoya orderi cheklovlarini buzib, jabrlanuvchi xonadoniga bostirib kirgan. MJtK 206-1 moddasi bilan 7 sutka ma’muriy qamoq qo‘llanilgan.',
    monitoringVisitsCount: 4,
    lastVisitDate: '2025-02-13',
    violationsRecorded: 1,
  },
  {
    id: 'ho-4',
    orderNumber: 'HO-2025/062',
    victimName: 'Qosimova Gulbahor Shuhratovna',
    victimPinfl: '41604900150033',
    victimPhone: '+998 94 555-66-77',
    victimAddress: 'Toshkent sh., Mirzo Ulug‘bek tumani, Ziyolilar ko‘chasi 8-uy',
    offenderName: 'Qosimov Rustam Ilhomovich',
    offenderPinfl: '31502880190014',
    offenderPhone: '+998 90 777-88-99',
    offenderRelationship: 'Turmush o‘rtog‘i',
    mahalla: 'Ziyolilar MFY',
    district: 'Mirzo Ulug‘bek tumani',
    issuedDate: '2025-01-05',
    expiryDate: '2025-02-04',
    status: 'Tugatilgan',
    restrictions: {
      noViolence: true,
      noContact: false,
      noApproach: false,
      separateLiving: false,
      weaponsSurrender: false,
      mandatoryRehab: true,
    },
    inspectorName: 'Mayor Rustamov Alisher',
    inspectorRank: 'Mayor',
    inspectorPhone: '+998 71 268-01-02',
    incidentSummary: 'Mahalla xotin-qizlar faoli va psixolog ishtirokida oila yarashtirildi, 30 kunlik muddat mobaynida nizolar kuzatilmadi.',
    monitoringVisitsCount: 6,
    lastVisitDate: '2025-02-04',
    violationsRecorded: 0,
  },
];

const initialMahallaRiskZones: MahallaRiskZone[] = [
  {
    id: 'm-1',
    district: 'Yunusobod tumani',
    mahallaName: 'Xiyobonbog‘ MFY',
    category: 'qizil',
    coordinates: { x: 34, y: 24 },
    population: 4850,
    incidentCount: 42,
    preventedCount: 31,
    inspectorName: 'Katta leytenant Karimov Sardor',
    inspectorRank: 'Katta leytenant',
    inspectorPhone: '+998 90 772-41-00',
    topOffenseType: 'MJtK 183-modda (Bezorilik), tungi shovqin',
    safetyScore: 54,
    assignedPatrol: 'Patrul-104',
    recentTrends: 'Tungi klublar atrofida hodisalar soni ko‘paygan',
    preventativeMeasures: [
      'Soat 22:00 dan so‘ng tungi ko‘chma patrul kuchaytirilgan',
      'Ko‘ngilochar maskan rahbarlariga rasmiy ogohlantirish berilgan',
      'Videokuzatuv kameralari 8 ta yangi nuqtaga o‘rnatilmoqda',
    ],
  },
  {
    id: 'm-2',
    district: 'Chilonzor tumani',
    mahallaName: 'Do‘stlik MFY',
    category: 'qizil',
    coordinates: { x: 26, y: 64 },
    population: 5200,
    incidentCount: 38,
    preventedCount: 29,
    inspectorName: 'Leytenant Jo‘rayev Sherzod',
    inspectorRank: 'Leytenant',
    inspectorPhone: '+998 93 112-23-34',
    topOffenseType: 'Oilaviy-maishiy nizolar, MJtK 187-modda',
    safetyScore: 58,
    assignedPatrol: 'YPX-Ekipaj 203',
    recentTrends: 'Ichkilikbozlik oqibatidagi mayda bezoriliklar',
    preventativeMeasures: [
      'Profilaktik hisobdagi 14 nafar shaxs xonadonlari tekshirildi',
      'Mahalla oqsoqollari bilan birgalikda 6 ta oila yarashuvi o‘tkazildi',
    ],
  },
  {
    id: 'm-3',
    district: 'Shayxontohur tumani',
    mahallaName: 'Eski Shahar MFY',
    category: 'qizil',
    coordinates: { x: 42, y: 44 },
    population: 4100,
    incidentCount: 35,
    preventedCount: 27,
    inspectorName: 'Mayor Alimov Tohir',
    inspectorRank: 'Mayor',
    inspectorPhone: '+998 97 889-01-02',
    topOffenseType: 'Bozor atrofidagi o‘g‘rilik va noqonuniy savdo',
    safetyScore: 61,
    assignedPatrol: 'Tezkor-301',
    recentTrends: 'Chorsu bozori yonida cho‘ntakkesarlik holatlari',
    preventativeMeasures: [
      'Piyoda patrul yo‘nalishlari bozor ichiga yo‘naltirildi',
      'Ovoz kuchaytirgich orqali ogohlik targ‘iboti yo‘lga qo‘yildi',
    ],
  },
  {
    id: 'm-4',
    district: 'Olmazor tumani',
    mahallaName: 'Qorasaroy MFY',
    category: 'qizil',
    coordinates: { x: 28, y: 32 },
    population: 5900,
    incidentCount: 39,
    preventedCount: 28,
    inspectorName: 'Katta leytenant Rahimov Baxtiyor',
    inspectorRank: 'Katta leytenant',
    inspectorPhone: '+998 90 445-56-67',
    topOffenseType: 'Avtomobillardan buyum o‘g‘irlanishi',
    safetyScore: 56,
    assignedPatrol: 'Guruh-05',
    recentTrends: 'Qorong‘u ko‘chalarda avtomashina oynalarini sindirish',
    preventativeMeasures: [
      'Tuman obodonlashtirish bo‘limi bilan 24 ta chiroq o‘rnatildi',
      'Avtoturargohlarga tungi qo‘riqchi va signalizatsiya talab qilindi',
    ],
  },
  {
    id: 'm-5',
    district: 'Chilonzor tumani',
    mahallaName: 'Navoiy MFY',
    category: 'sariq',
    coordinates: { x: 30, y: 74 },
    population: 6300,
    incidentCount: 21,
    preventedCount: 18,
    inspectorName: 'Kapitan Mamatov Dilshod',
    inspectorRank: 'Kapitan',
    inspectorPhone: '+998 94 987-65-43',
    topOffenseType: 'Yo‘l harakati qoidalarini buzish, tezlik',
    safetyScore: 72,
    assignedPatrol: 'YPX-Ekipaj 203',
    recentTrends: 'Katta ko‘chalarda noqonuniy poygalar xavfi',
    preventativeMeasures: [
      'YPX bilan hamkorlikda 2 ta statsionar fotoradar o‘rnatildi',
    ],
  },
  {
    id: 'm-6',
    district: 'Shayxontohur tumani',
    mahallaName: 'Guliston MFY',
    category: 'sariq',
    coordinates: { x: 48, y: 52 },
    population: 4600,
    incidentCount: 19,
    preventedCount: 15,
    inspectorName: 'Katta leytenant Saidov Akrom',
    inspectorRank: 'Katta leytenant',
    inspectorPhone: '+998 93 554-43-32',
    topOffenseType: 'Qo‘shnilararo nizo va erkin savdo',
    safetyScore: 75,
    assignedPatrol: 'Tezkor-301',
    recentTrends: 'Vaziyat barqaror, profilaktik hisobdagilar nazoratda',
    preventativeMeasures: [
      'Probatsiya xodimlari bilan haftalik suhbatlar o‘tkazilmoqda',
    ],
  },
  {
    id: 'm-7',
    district: 'Mirobod tumani',
    mahallaName: 'Shahrisabz MFY',
    category: 'sariq',
    coordinates: { x: 55, y: 62 },
    population: 3900,
    incidentCount: 18,
    preventedCount: 16,
    inspectorName: 'Leytenant Ahmedov Bobur',
    inspectorRank: 'Leytenant',
    inspectorPhone: '+998 90 119-20-30',
    topOffenseType: 'Tungi restoranlar oldidagi tortishuvlar',
    safetyScore: 74,
    assignedPatrol: 'Patrul-104',
    recentTrends: 'Oylik ko‘rsatkich 12% ga pasaydi',
    preventativeMeasures: [
      'Muassasalar qo‘riqlash xizmati bilan tezkor aloqa tugmasi o‘rnatildi',
    ],
  },
  {
    id: 'm-8',
    district: 'Sergeli tumani',
    mahallaName: 'Yangi Sergeli MFY',
    category: 'sariq',
    coordinates: { x: 38, y: 88 },
    population: 7100,
    incidentCount: 22,
    preventedCount: 19,
    inspectorName: 'Mayor Qodirov Aziz',
    inspectorRank: 'Mayor',
    inspectorPhone: '+998 97 770-01-09',
    topOffenseType: 'Yangi ko‘p qavatli uylarda ta’mirlash shovqini',
    safetyScore: 76,
    assignedPatrol: 'YPX-Ekipaj 203',
    recentTrends: 'Yangi ko‘chib kelganlar orasida huquqiy tushuntirish talab etiladi',
    preventativeMeasures: [
      'Telegram mahalla guruhida huquqiy eslatmalar tarqatilmoqda',
    ],
  },
  {
    id: 'm-9',
    district: 'Bektemir tumani',
    mahallaName: 'Qo‘yliq Ota MFY',
    category: 'sariq',
    coordinates: { x: 74, y: 82 },
    population: 5100,
    incidentCount: 24,
    preventedCount: 20,
    inspectorName: 'Kapitan Sobirov Kamol',
    inspectorRank: 'Kapitan',
    inspectorPhone: '+998 91 334-55-66',
    topOffenseType: 'Jamoat transporti bekatlarida janjallar',
    safetyScore: 71,
    assignedPatrol: 'Tezkor-301',
    recentTrends: 'Metro bekati atrofida tartib o‘rnatildi',
    preventativeMeasures: [
      'Transport xavfsizligi xodimlari bilan reydlar olib borilmoqda',
    ],
  },
  {
    id: 'm-10',
    district: 'Mirzo Ulug‘bek tumani',
    mahallaName: 'Bog‘ishamol MFY',
    category: 'yashil',
    coordinates: { x: 62, y: 28 },
    population: 5400,
    incidentCount: 6,
    preventedCount: 6,
    inspectorName: 'Mayor Rustamov Alisher',
    inspectorRank: 'Mayor',
    inspectorPhone: '+998 71 268-01-02',
    topOffenseType: 'Yo‘q (Namunali xavfsiz mahalla)',
    safetyScore: 94,
    assignedPatrol: 'Patrul-104',
    recentTrends: 'So‘nggi 6 oyda og‘ir va o‘ta og‘ir jinoyatlar qayd etilmagan',
    preventativeMeasures: [
      '100% xonadonlar videodomofon va kameralar bilan qamrab olingan',
      'Mahalla posboni va ko‘ngilli yoshlar guruhi faoliyati namunali',
    ],
  },
  {
    id: 'm-11',
    district: 'Mirzo Ulug‘bek tumani',
    mahallaName: 'Ziyolilar MFY',
    category: 'yashil',
    coordinates: { x: 68, y: 38 },
    population: 4300,
    incidentCount: 4,
    preventedCount: 4,
    inspectorName: 'Mayor Rustamov Alisher',
    inspectorRank: 'Mayor',
    inspectorPhone: '+998 71 268-01-02',
    topOffenseType: 'Mayda yo‘l qoidabuzarligi',
    safetyScore: 96,
    assignedPatrol: 'Patrul-104',
    recentTrends: 'Talabalar shaharchasida namunali intizom',
    preventativeMeasures: [
      'Institut rektoratlari bilan haftalik profilaktik monitoring',
    ],
  },
  {
    id: 'm-12',
    district: 'Yakkasaroy tumani',
    mahallaName: 'Mustaqillik MFY',
    category: 'yashil',
    coordinates: { x: 45, y: 70 },
    population: 3800,
    incidentCount: 5,
    preventedCount: 5,
    inspectorName: 'Kapitan Yusupov Anvar',
    inspectorRank: 'Kapitan',
    inspectorPhone: '+998 90 999-11-22',
    topOffenseType: 'Yo‘q (Tinch va osoyishta)',
    safetyScore: 95,
    assignedPatrol: 'Guruh-05',
    recentTrends: 'Xorijiy elchixonalar joylashgan hudud, to‘liq xavfsiz',
    preventativeMeasures: [
      'Diplomatik patrul xizmati 24/7 rejimida xizmat olib bormoqda',
    ],
  },
];

const initialPatrolUnits: PatrolUnit[] = [
  {
    id: 'pat-1',
    callSign: 'Patrul-104',
    officers: ['Katta leytenant S. Karimov', 'Safdor U. Bozorov'],
    vehiclePlate: '01 104 VSC',
    assignedMahalla: 'Xiyobonbog‘ MFY',
    district: 'Yunusobod tumani',
    status: 'Navbatchilikda',
    location: { x: 35, y: 25 },
    batteryLevel: 94,
  },
  {
    id: 'pat-2',
    callSign: 'YPX-Ekipaj 203',
    officers: ['Katta leytenant M. Toshmatov', 'Kichik serjant D. Aliqulov'],
    vehiclePlate: '01 203 VSC',
    assignedMahalla: 'Do‘stlik MFY',
    district: 'Chilonzor tumani',
    status: 'Chaqiruvda',
    location: { x: 27, y: 63 },
    batteryLevel: 82,
  },
  {
    id: 'pat-3',
    callSign: 'Tezkor-301',
    officers: ['Mayor T. Alimov', 'Leytenant Sh. Nazarov'],
    vehiclePlate: '01 301 VSC',
    assignedMahalla: 'Eski Shahar MFY',
    district: 'Shayxontohur tumani',
    status: 'Navbatchilikda',
    location: { x: 43, y: 45 },
    batteryLevel: 91,
  },
  {
    id: 'pat-4',
    callSign: 'Guruh-05',
    officers: ['Kapitan A. Yusupov', 'Safdor N. To‘rayev'],
    vehiclePlate: '01 005 VSC',
    assignedMahalla: 'Mustaqillik MFY',
    district: 'Yakkasaroy tumani',
    status: 'Zaxirada',
    location: { x: 46, y: 69 },
    batteryLevel: 100,
  },
];

const initialEmergencyAlerts: EmergencyAlert[] = [
  {
    id: 'alt-1',
    code: '102_CHAQIRUV',
    title: 'Ko‘p qavatli uy hovlisida janjal va tartibbuzarlik',
    address: 'Amir Temur ko‘chasi 45-uy oldi',
    mahalla: 'Xiyobonbog‘ MFY',
    district: 'Yunusobod tumani',
    timestamp: '2 daqiqa oldin',
    urgency: 'Yuqori',
    status: 'Yangi',
    callerPhone: '+998 90 123-99-88',
    description: '3 nafar noma’lum shaxs jamoat joyida baqir-chaqir qilib, fuqarolarga xalaqit bermoqda.',
  },
  {
    id: 'alt-2',
    code: 'TUGMA_SOS',
    title: 'Dorixona favqulodda qo‘riqlash trevoga signali',
    address: 'Bunyodkor shoh ko‘chasi 14-uy',
    mahalla: 'Do‘stlik MFY',
    district: 'Chilonzor tumani',
    timestamp: '7 daqiqa oldin',
    urgency: 'Yuqori',
    status: 'Ekipaj_Biriktirildi',
    assignedPatrol: 'YPX-Ekipaj 203',
    callerPhone: '+998 71 277-00-11',
    description: 'Kassa xodimi tomonidan trevoga tugmasi bosildi, ekipaj hodisa joyiga harakatlanmoqda.',
  },
  {
    id: 'alt-3',
    code: 'SHUBHALI_SHAXS',
    title: 'Avtomashina eshiklarini tekshirayotgan shubhali shaxs',
    address: 'Buyuk Ipak Yo‘li 105-uy avtoturargohi',
    mahalla: 'Bog‘ishamol MFY',
    district: 'Mirzo Ulug‘bek tumani',
    timestamp: '15 daqiqa oldin',
    urgency: 'O\'rta',
    status: 'Yangi',
    callerPhone: '+998 93 777-66-55',
    description: 'Qora kiyimdagi shaxs mashinalarni birma-bir ko‘zdan kechirib yurganligi haqida qo‘riqchi xabar qildi.',
  },
  {
    id: 'alt-4',
    code: 'YPX_HODISA',
    title: 'Chorrahada to‘qnashuv, transport qatnovi to‘silgan',
    address: 'Qorasaroy va Sag‘bon chorrahasi',
    mahalla: 'Qorasaroy MFY',
    district: 'Olmazor tumani',
    timestamp: '35 daqiqa oldin',
    urgency: 'Oddiy',
    status: 'Bartaraf_Etildi',
    assignedPatrol: 'Guruh-05',
    callerPhone: '+998 71 240-55-44',
    description: 'Moddiy zarar yetgan YTH, tomonlar o‘zaro kelishuv tuzdi va harakat to‘liq tiklandi.',
  },
];

class DatabaseEngine {
  private data: AppDatabase;

  constructor() {
    this.data = this.load();
  }

  private load(): AppDatabase {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.appeals || parsed.appeals.length === 0) parsed.appeals = initialAppeals;
        if (!parsed.quizQuestions || parsed.quizQuestions.length === 0) parsed.quizQuestions = initialQuizQuestions;
        if (!parsed.districtStats || parsed.districtStats.length === 0) parsed.districtStats = initialDistrictStats;
        if (!parsed.vehicles || parsed.vehicles.length === 0) parsed.vehicles = initialVehicles;
        if (!parsed.citizenDossiers || parsed.citizenDossiers.length === 0) parsed.citizenDossiers = initialCitizenDossiers;
        if (!parsed.protectionOrders || parsed.protectionOrders.length === 0) parsed.protectionOrders = initialProtectionOrders;
        if (!parsed.mahallaRiskZones || parsed.mahallaRiskZones.length === 0) parsed.mahallaRiskZones = initialMahallaRiskZones;
        if (!parsed.patrolUnits || parsed.patrolUnits.length === 0) parsed.patrolUnits = initialPatrolUnits;
        if (!parsed.emergencyAlerts || parsed.emergencyAlerts.length === 0) parsed.emergencyAlerts = initialEmergencyAlerts;
        return parsed;
      }
    } catch (err) {
      console.error('Failed to load DB file, using initial data:', err);
    }

    const defaultDb: AppDatabase = {
      users: initialUsers,
      documents: initialDocuments,
      templates: initialTemplates,
      tasks: initialTasks,
      conversations: initialConversations,
      knowledge: initialKnowledge,
      auditLogs: initialAudit,
      appeals: initialAppeals,
      quizQuestions: initialQuizQuestions,
      districtStats: initialDistrictStats,
      vehicles: initialVehicles,
      citizenDossiers: initialCitizenDossiers,
      protectionOrders: initialProtectionOrders,
      mahallaRiskZones: initialMahallaRiskZones,
      patrolUnits: initialPatrolUnits,
      emergencyAlerts: initialEmergencyAlerts,
      settings: {
        'usr-1': {
          userId: 'usr-1',
          notificationsInApp: true,
          notificationsEmail: true,
          twoFactorAuth: true,
          autoSaveDrafts: true,
          highContrast: false,
          fontSize: 'standard',
        },
        'usr-2': {
          userId: 'usr-2',
          notificationsInApp: true,
          notificationsEmail: false,
          twoFactorAuth: true,
          autoSaveDrafts: true,
          highContrast: false,
          fontSize: 'standard',
        },
        'usr-3': {
          userId: 'usr-3',
          notificationsInApp: true,
          notificationsEmail: true,
          twoFactorAuth: true,
          autoSaveDrafts: true,
          highContrast: false,
          fontSize: 'standard',
        },
      },
    };

    this.saveDirect(defaultDb);
    return defaultDb;
  }

  private saveDirect(dataToSave: AppDatabase) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save DB file:', err);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getDocuments(userId?: string, role?: string): DocumentItem[] {
    if (!userId || role === 'rahbar' || role === 'admin') {
      return this.data.documents;
    }
    return this.data.documents.filter(
      (d) => d.creatorId === userId || d.reviewerId === userId
    );
  }

  public getDocumentById(id: string): DocumentItem | undefined {
    return this.data.documents.find((d) => d.id === id);
  }

  public saveDocument(doc: DocumentItem): DocumentItem {
    const idx = this.data.documents.findIndex((d) => d.id === doc.id);
    if (idx >= 0) {
      const oldDoc = this.data.documents[idx];
      if (oldDoc.content !== doc.content) {
        const verNumber = (oldDoc.versions?.length || 0) + 1;
        const newVersion: DocumentVersion = {
          id: 'ver-' + Date.now(),
          documentId: doc.id,
          versionNumber: verNumber,
          content: oldDoc.content,
          modifiedBy: doc.creatorName,
          modifiedAt: new Date().toISOString(),
          changeSummary: `Tahrir #${verNumber}`,
        };
        doc.versions = [newVersion, ...(oldDoc.versions || [])];
      }
      this.data.documents[idx] = doc;
    } else {
      this.data.documents.unshift(doc);
    }
    this.save();
    return doc;
  }

  public deleteDocument(id: string): boolean {
    const idx = this.data.documents.findIndex((d) => d.id === id);
    if (idx >= 0) {
      this.data.documents.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  public getTemplates(): DocumentTemplate[] {
    return this.data.templates;
  }

  public getTasks(userId?: string, role?: string): TaskItem[] {
    if (!userId || role === 'rahbar' || role === 'admin') {
      return this.data.tasks;
    }
    return this.data.tasks.filter(
      (t) => t.assignedToId === userId || t.assignedById === userId
    );
  }

  public getTaskById(id: string): TaskItem | undefined {
    return this.data.tasks.find((t) => t.id === id);
  }

  public saveTask(task: TaskItem): TaskItem {
    const idx = this.data.tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      this.data.tasks[idx] = task;
    } else {
      this.data.tasks.unshift(task);
    }
    this.save();
    return task;
  }

  public deleteTask(id: string): boolean {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx >= 0) {
      this.data.tasks.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  public getConversations(userId: string): Conversation[] {
    return this.data.conversations.filter((c) => c.userId === userId);
  }

  public getConversationById(id: string): Conversation | undefined {
    return this.data.conversations.find((c) => c.id === id);
  }

  public saveConversation(conv: Conversation): Conversation {
    const idx = this.data.conversations.findIndex((c) => c.id === conv.id);
    if (idx >= 0) {
      this.data.conversations[idx] = conv;
    } else {
      this.data.conversations.unshift(conv);
    }
    this.save();
    return conv;
  }

  public deleteConversation(id: string): boolean {
    const idx = this.data.conversations.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.data.conversations.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  public getKnowledge(): KnowledgeDoc[] {
    return this.data.knowledge;
  }

  public addKnowledge(item: KnowledgeDoc): KnowledgeDoc {
    this.data.knowledge.unshift(item);
    this.save();
    return item;
  }

  public getAuditLogs(limit = 100): AuditEvent[] {
    return this.data.auditLogs.slice(0, limit);
  }

  public logAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
    const logItem: AuditEvent = {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.data.auditLogs.unshift(logItem);
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
    this.save();
    return logItem;
  }

  public getSettings(userId: string): UserSettings {
    if (!this.data.settings[userId]) {
      this.data.settings[userId] = {
        userId,
        notificationsInApp: true,
        notificationsEmail: true,
        twoFactorAuth: true,
        autoSaveDrafts: true,
        highContrast: false,
        fontSize: 'standard',
      };
      this.save();
    }
    return this.data.settings[userId];
  }

  public updateSettings(userId: string, partial: Partial<UserSettings>): UserSettings {
    const cur = this.getSettings(userId);
    this.data.settings[userId] = { ...cur, ...partial };
    this.save();
    return this.data.settings[userId];
  }

  public getAppeals(): CitizenAppeal[] {
    return this.data.appeals || [];
  }

  public getAppealById(id: string): CitizenAppeal | undefined {
    return (this.data.appeals || []).find((a) => a.id === id);
  }

  public saveAppeal(appeal: CitizenAppeal): CitizenAppeal {
    if (!this.data.appeals) this.data.appeals = [];
    const idx = this.data.appeals.findIndex((a) => a.id === appeal.id);
    if (idx >= 0) {
      this.data.appeals[idx] = appeal;
    } else {
      this.data.appeals.unshift(appeal);
    }
    this.save();
    return appeal;
  }

  public getQuizQuestions(): QuizQuestion[] {
    return this.data.quizQuestions || [];
  }

  public getDistrictStats(): DistrictCrimeStat[] {
    return this.data.districtStats || [];
  }

  // ==================== 1. E-PATRUL & SEARCH METHODS ====================
  public getVehicles(): VehicleRecord[] {
    return this.data.vehicles || [];
  }

  public searchVehicles(query: string): VehicleRecord[] {
    const clean = query.trim().toUpperCase().replace(/\s+/g, '');
    if (!clean) return this.data.vehicles || [];
    return (this.data.vehicles || []).filter((v) => {
      const vPlate = v.plateNumber.toUpperCase().replace(/\s+/g, '');
      const vOwner = v.ownerFullName.toUpperCase();
      const vPinfl = v.ownerPinfl;
      const vTech = v.techPassportNumber.toUpperCase().replace(/\s+/g, '');
      return (
        vPlate.includes(clean) ||
        vOwner.includes(clean) ||
        vPinfl.includes(clean) ||
        vTech.includes(clean)
      );
    });
  }

  public getCitizenDossiers(): CitizenDossier[] {
    return this.data.citizenDossiers || [];
  }

  public searchCitizens(query: string): CitizenDossier[] {
    const clean = query.trim().toUpperCase();
    if (!clean) return this.data.citizenDossiers || [];
    const stripped = clean.replace(/\s+/g, '');
    return (this.data.citizenDossiers || []).filter((c) => {
      const cPinfl = c.pinfl;
      const cPass = c.passportNumber.toUpperCase().replace(/\s+/g, '');
      const cName = c.fullName.toUpperCase();
      const cAddress = c.address.toUpperCase();
      return (
        cPinfl.includes(stripped) ||
        cPass.includes(stripped) ||
        cName.includes(clean) ||
        cAddress.includes(clean)
      );
    });
  }

  // ==================== 2. E-HIMOYA ORDERI METHODS ====================
  public getProtectionOrders(): ProtectionOrder[] {
    return this.data.protectionOrders || [];
  }

  public getProtectionOrderById(id: string): ProtectionOrder | undefined {
    return (this.data.protectionOrders || []).find((o) => o.id === id);
  }

  public saveProtectionOrder(order: ProtectionOrder): ProtectionOrder {
    if (!this.data.protectionOrders) this.data.protectionOrders = [];
    const idx = this.data.protectionOrders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      this.data.protectionOrders[idx] = order;
    } else {
      this.data.protectionOrders.unshift(order);
    }
    this.save();
    return order;
  }

  public updateProtectionOrder(
    id: string,
    partial: Partial<ProtectionOrder>
  ): ProtectionOrder | undefined {
    if (!this.data.protectionOrders) this.data.protectionOrders = [];
    const idx = this.data.protectionOrders.findIndex((o) => o.id === id);
    if (idx >= 0) {
      this.data.protectionOrders[idx] = { ...this.data.protectionOrders[idx], ...partial };
      this.save();
      return this.data.protectionOrders[idx];
    }
    return undefined;
  }

  // ==================== 3. GIS XARITA & PATRUL METHODS ====================
  public getMahallaRiskZones(): MahallaRiskZone[] {
    return this.data.mahallaRiskZones || [];
  }

  public getPatrolUnits(): PatrolUnit[] {
    return this.data.patrolUnits || [];
  }

  public getEmergencyAlerts(): EmergencyAlert[] {
    return this.data.emergencyAlerts || [];
  }

  public updateAlertStatus(
    id: string,
    status: EmergencyAlert['status'],
    patrol?: string
  ): EmergencyAlert | undefined {
    if (!this.data.emergencyAlerts) this.data.emergencyAlerts = [];
    const alert = this.data.emergencyAlerts.find((a) => a.id === id);
    if (alert) {
      alert.status = status;
      if (patrol) alert.assignedPatrol = patrol;
      this.save();
      return alert;
    }
    return undefined;
  }
}

export const db = new DatabaseEngine();
