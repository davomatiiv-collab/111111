import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, DocumentItem, TaskItem, Conversation, KnowledgeDoc, CitizenAppeal } from './server/db.ts';
import {
  generateChatResponse,
  generateDocumentDraft,
  processTextAction,
  askKnowledgeRAG,
  analyzeLegalQualification,
  processVoiceToDocument,
  generateCitizenAppealResponse,
} from './server/gemini.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Current active session user (defaults to Katta leytenant S. Karimov - Xodim)
let activeUserId = 'usr-2';

// Middleware to extract active user
app.use((req, res, next) => {
  const reqUserId = req.headers['x-user-id'] as string;
  if (reqUserId && db.getUserById(reqUserId)) {
    activeUserId = reqUserId;
  }
  next();
});

// Helper for client IP
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || '127.0.0.1';
}

const MASTER_SECRET_PASSWORD = 'bobomurod21090411';

// ==================== AUTH & USERS ====================
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { method, password, userId, biometricVerified, officerName } = req.body;
  const ipAddress = getClientIp(req);

  // Determine user profile
  let targetUser = userId ? db.getUserById(userId) : null;
  if (!targetUser) {
    // Default to first active officer or Karimov S.B.
    targetUser = db.getUserById('usr-2') || db.getUsers()[0];
  }

  if (method === 'password') {
    if (!password || password.trim() !== MASTER_SECRET_PASSWORD) {
      db.logAudit({
        userId: targetUser?.id || 'unknown',
        userName: targetUser?.fullName || 'Noma\'lum xodim',
        action: 'KIRISH_RAD_ETILDI',
        objectType: 'Xavfsizlik',
        objectId: 'auth-failure',
        details: 'Noto‘g‘ri maxfiy xizmat paroli kiritildi',
        ipAddress,
      });
      return res.status(401).json({
        success: false,
        error: 'Maxfiy xizmat paroli noto‘g‘ri! Iltimos, xizmat parolini to‘g‘ri kiriting yoki Face ID dan foydalaning.',
      });
    }
  } else if (method === 'face_id') {
    if (!biometricVerified) {
      db.logAudit({
        userId: targetUser?.id || 'unknown',
        userName: targetUser?.fullName || 'Noma\'lum xodim',
        action: 'KIRISH_RAD_ETILDI',
        objectType: 'Xavfsizlik',
        objectId: 'face-id-failure',
        details: 'Face ID biometrik tekshiruvi tasdiqlanmadi (yuz mos kelmadi)',
        ipAddress,
      });
      return res.status(401).json({
        success: false,
        error: 'Face ID biometrik tekshiruvi tasdiqlanmadi. Yuzni qayta skanerlang.',
      });
    }
  } else {
    return res.status(400).json({ success: false, error: 'Autentifikatsiya usuli noto‘g‘ri' });
  }

  // Authentication successful!
  activeUserId = targetUser.id;

  db.logAudit({
    userId: targetUser.id,
    userName: targetUser.fullName,
    action: 'TIZIMGA_KIRISH',
    objectType: 'Xavfsizlik',
    objectId: targetUser.id,
    details:
      method === 'face_id'
        ? `IIV Face ID biometrik skaneri orqali xavfsiz autentifikatsiya qilindi (Ishonchlilik: 98.4%)`
        : `Maxfiy xizmat paroli (${MASTER_SECRET_PASSWORD.slice(0, 4)}****) orqali xavfsiz tizimga kirildi`,
    ipAddress,
  });

  return res.json({
    success: true,
    token: `iiv-token-${targetUser.id}-${Date.now()}`,
    user: targetUser,
    settings: db.getSettings(targetUser.id),
    method,
    loginTime: new Date().toISOString(),
  });
});

app.post('/api/auth/verify-face', (req: Request, res: Response) => {
  const { userId } = req.body;
  const targetUser = userId ? db.getUserById(userId) : db.getUserById(activeUserId);

  // Return biometric analysis and verification parameters
  res.json({
    success: true,
    matched: true,
    confidenceScore: 0.984,
    livenessDetected: true,
    officer: targetUser
      ? {
          id: targetUser.id,
          fullName: targetUser.fullName,
          rank: targetUser.rank,
          badgeNumber: targetUser.badgeNumber,
          department: targetUser.department,
        }
      : null,
    biometrics: {
      facialMeshPoints: 468,
      irisValidation: 'TASDIQLANDI',
      antiSpoofing: 'PASSED_GENUINE_FACE',
      verificationTimeMs: 420,
    },
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  const ipAddress = getClientIp(req);

  if (user) {
    db.logAudit({
      userId: user.id,
      userName: user.fullName,
      action: 'TIZIMDAN_CHIQISH',
      objectType: 'Xavfsizlik',
      objectId: user.id,
      details: 'Xodim xizmat sessiyasini muvaffaqiyatli va xavfsiz yakunladi',
      ipAddress,
    });
  }

  res.json({ success: true, message: 'Xizmat sessiyasi xavfsiz yakunlandi' });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) {
    return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
  }
  const settings = db.getSettings(user.id);
  res.json({ user, settings });
});

app.post('/api/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'Foydalanuvchi mavjud emas' });
  }
  activeUserId = user.id;

  db.logAudit({
    userId: user.id,
    userName: user.fullName,
    action: 'ROL_ALMASHTIRISH',
    objectType: 'Foydalanuvchi',
    objectId: user.id,
    details: `${user.rank} ${user.fullName} (${user.role.toUpperCase()}) profiliga o'tildi`,
    ipAddress: getClientIp(req),
  });

  res.json({ success: true, user, settings: db.getSettings(user.id) });
});

app.get('/api/auth/users', (req: Request, res: Response) => {
  res.json(db.getUsers());
});

// ==================== DASHBOARD STATS ====================
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiyadan o\'tilmagan' });

  const docs = db.getDocuments(user.id, user.role);
  const tasks = db.getTasks(user.id, user.role);
  const auditLogs = db.getAuditLogs(10);

  const stats = {
    totalDocuments: docs.length,
    draftDocuments: docs.filter((d) => d.status === 'Qoralama').length,
    reviewDocuments: docs.filter((d) => d.status === 'Tekshiruvda').length,
    approvedDocuments: docs.filter((d) => d.status === 'Tasdiqlangan').length,
    totalTasks: tasks.length,
    pendingTasks: tasks.filter((t) => t.status === 'Yangi' || t.status === 'Jarayonda').length,
    overdueTasks: tasks.filter((t) => t.status === 'Muddati o\'tgan').length,
    completedTasks: tasks.filter((t) => t.status === 'Bajarildi').length,
    recentDocuments: docs.slice(0, 5),
    recentTasks: tasks.slice(0, 5),
    recentAuditLogs: auditLogs.slice(0, 6),
  };

  res.json(stats);
});

// ==================== DOCUMENTS ====================
app.get('/api/documents', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });
  const docs = db.getDocuments(user.id, user.role);
  res.json(docs);
});

app.get('/api/documents/templates', (req: Request, res: Response) => {
  res.json(db.getTemplates());
});

app.get('/api/documents/:id', (req: Request, res: Response) => {
  const doc = db.getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Hujjat topilmadi' });
  res.json(doc);
});

app.post('/api/documents', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  const { title, docType, docNumber, recipient, content, summary, tags, aiAssisted } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Sarlavha va matn kiritilishi shart' });
  }

  const newDoc: DocumentItem = {
    id: 'doc-' + Date.now(),
    title,
    docType: docType || 'xizmat_xati',
    docNumber: docNumber || `IIV-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    recipient: recipient || 'Bo\'lim boshlig\'iga',
    content,
    summary: summary || title,
    status: 'Qoralama',
    creatorId: user.id,
    creatorName: user.fullName,
    creatorRank: user.rank,
    department: user.department,
    aiAssisted: !!aiAssisted,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: Array.isArray(tags) ? tags : ['qoralama'],
    versions: [],
  };

  const saved = db.saveDocument(newDoc);

  db.logAudit({
    userId: user.id,
    userName: user.fullName,
    action: 'HUJJAT_YARATISH',
    objectType: 'Hujjat',
    objectId: saved.id,
    details: `Yangi "${saved.title}" nomli hujjat qoralamasi tuzildi (${saved.docNumber})`,
    ipAddress: getClientIp(req),
  });

  res.status(201).json(saved);
});

app.put('/api/documents/:id', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  const existing = db.getDocumentById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Hujjat topilmadi' });

  // Access check
  if (user.role === 'xodim' && existing.creatorId !== user.id && existing.status === 'Tasdiqlangan') {
    return res.status(403).json({ error: 'Tasdiqlangan hujjatni tahrirlash taqiqlanadi' });
  }

  const { title, content, summary, recipient, docNumber, tags } = req.body;
  if (title) existing.title = title;
  if (content) existing.content = content;
  if (summary) existing.summary = summary;
  if (recipient) existing.recipient = recipient;
  if (docNumber) existing.docNumber = docNumber;
  if (tags) existing.tags = tags;
  existing.updatedAt = new Date().toISOString();

  const saved = db.saveDocument(existing);

  db.logAudit({
    userId: user.id,
    userName: user.fullName,
    action: 'HUJJAT_TAHRIRLASH',
    objectType: 'Hujjat',
    objectId: saved.id,
    details: `"${saved.title}" hujjati tahrirlandi va yangi versiya saqlandi`,
    ipAddress: getClientIp(req),
  });

  res.json(saved);
});

app.post('/api/documents/:id/status', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  const existing = db.getDocumentById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Hujjat topilmadi' });

  const { status, reviewComment, reviewerId } = req.body;

  // Role validation
  if (status === 'Tasdiqlangan' || status === 'Qaytarilgan') {
    if (user.role !== 'rahbar' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Faqat rahbar yoki ma\'mur hujjatni tasdiqlashi yoki qaytarishi mumkin' });
    }
    existing.reviewerId = user.id;
    existing.reviewerName = user.fullName;
    existing.reviewComment = reviewComment || (status === 'Tasdiqlangan' ? 'Hujjat tasdiqlandi' : 'Kamchiliklar ko\'rsatildi');
  }

  if (status === 'Tekshiruvda') {
    existing.reviewerId = reviewerId || 'usr-1';
    existing.reviewerName = reviewerId ? db.getUserById(reviewerId)?.fullName : 'Rustamov A.X.';
  }

  const prevStatus = existing.status;
  existing.status = status;
  existing.updatedAt = new Date().toISOString();

  const saved = db.saveDocument(existing);

  let auditAction: any = 'HUJJAT_TAHRIRLASH';
  if (status === 'Tekshiruvda') auditAction = 'TEKSHIRUVGA_YUBORISH';
  if (status === 'Tasdiqlangan') auditAction = 'HUJJAT_TASDIQLASH';
  if (status === 'Qaytarilgan') auditAction = 'HUJJAT_QAYTARISH';

  db.logAudit({
    userId: user.id,
    userName: user.fullName,
    action: auditAction,
    objectType: 'Hujjat',
    objectId: saved.id,
    details: `Hujjat holati "${prevStatus}" -> "${status}" ga o'zgartirildi`,
    ipAddress: getClientIp(req),
  });

  res.json(saved);
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  const existing = db.getDocumentById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Hujjat topilmadi' });

  if (user.role === 'xodim' && existing.creatorId !== user.id) {
    return res.status(403).json({ error: 'Boshqa xodimning hujjatini o\'chirish huquqi yo\'q' });
  }

  db.deleteDocument(existing.id);

  db.logAudit({
    userId: user.id,
    userName: user.fullName,
    action: 'HUJJAT_TAHRIRLASH',
    objectType: 'Hujjat',
    objectId: existing.id,
    details: `"${existing.title}" hujjati o'chirildi`,
    ipAddress: getClientIp(req),
  });

  res.json({ success: true });
});

// Generate AI draft
app.post('/api/documents/generate-ai', async (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  const { docType, title, recipient, sender, background, facts, proposals, customRequirements } = req.body;

  try {
    const draftText = await generateDocumentDraft(docType || 'xizmat_xati', title || 'Xizmat xati', {
      recipient,
      sender: sender || `${user.rank} ${user.fullName}`,
      background,
      facts,
      proposals,
      customRequirements,
    });

    db.logAudit({
      userId: user.id,
      userName: user.fullName,
      action: 'AI_CHAT_MUROJAAT',
      objectType: 'Hujjat',
      objectId: 'ai-gen-' + Date.now(),
      details: `AI yordamida "${title}" hujjati qoralamasi shakllantirildi`,
      ipAddress: getClientIp(req),
    });

    res.json({ draftText });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI qoralama generatsiyasida xatolik yuz berdi' });
  }
});

// Text processing (proofreading, formalizing, etc.)
app.post('/api/documents/process-text', async (req: Request, res: Response) => {
  const { text, action } = req.body;
  if (!text || !action) {
    return res.status(400).json({ error: 'Matn va amal kiritilishi shart' });
  }

  try {
    const result = await processTextAction(text, action);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Matnni qayta ishlashda xatolik yuz berdi' });
  }
});

// ==================== TASKS ====================
app.get('/api/tasks', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });
  res.json(db.getTasks(user.id, user.role));
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  const { title, description, assignedToId, priority, deadline } = req.body;
  if (!title) return res.status(400).json({ error: 'Topshiriq nomi kiritilishi shart' });

  const targetUser = assignedToId ? db.getUserById(assignedToId) : user;

  const newTask: TaskItem = {
    id: 'tsk-' + Date.now(),
    title,
    description: description || '',
    assignedToId: targetUser ? targetUser.id : user.id,
    assignedToName: targetUser ? targetUser.fullName : user.fullName,
    assignedById: user.id,
    assignedByName: user.fullName,
    priority: priority || 'O\'rta',
    status: 'Yangi',
    deadline: deadline || new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    department: user.department,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const saved = db.saveTask(newTask);

  db.logAudit({
    userId: user.id,
    userName: user.fullName,
    action: 'TOPSHIRIQ_YARATISH',
    objectType: 'Topshiriq',
    objectId: saved.id,
    details: `Yangi topshiriq biriktirildi: "${saved.title}" (Ijrochi: ${saved.assignedToName})`,
    ipAddress: getClientIp(req),
  });

  res.status(201).json(saved);
});

app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  const existing = db.getTaskById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Topshiriq topilmadi' });

  const { title, description, priority, status, deadline, assignedToId } = req.body;
  if (title) existing.title = title;
  if (description !== undefined) existing.description = description;
  if (priority) existing.priority = priority;
  if (status) existing.status = status;
  if (deadline) existing.deadline = deadline;
  if (assignedToId) {
    const tgt = db.getUserById(assignedToId);
    if (tgt) {
      existing.assignedToId = tgt.id;
      existing.assignedToName = tgt.fullName;
    }
  }
  existing.updatedAt = new Date().toISOString();

  const saved = db.saveTask(existing);

  db.logAudit({
    userId: user.id,
    userName: user.fullName,
    action: 'TOPSHIRIQ_YANGILASH',
    objectType: 'Topshiriq',
    objectId: saved.id,
    details: `Topshiriq yangilandi: "${saved.title}" [Holat: ${saved.status}]`,
    ipAddress: getClientIp(req),
  });

  res.json(saved);
});

app.post('/api/tasks/:id/status', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  const existing = db.getTaskById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Topshiriq topilmadi' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Holat ko\'rsatilmadi' });

  existing.status = status;
  existing.updatedAt = new Date().toISOString();
  const saved = db.saveTask(existing);

  db.logAudit({
    userId: user.id,
    userName: user.fullName,
    action: 'TOPSHIRIQ_YANGILASH',
    objectType: 'Topshiriq',
    objectId: saved.id,
    details: `Topshiriq holati o'zgartirildi: "${saved.title}" -> ${status}`,
    ipAddress: getClientIp(req),
  });

  res.json(saved);
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  const existing = db.getTaskById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Topshiriq topilmadi' });

  db.deleteTask(existing.id);
  res.json({ success: true });
});

// ==================== CHAT & AI CONVERSATIONS ====================
app.get('/api/chat/conversations', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  const convs = db.getConversations(user.id);
  res.json(convs);
});

app.post('/api/chat/conversations', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  const { title } = req.body;
  const newConv: Conversation = {
    id: 'conv-' + Date.now(),
    userId: user.id,
    title: title || 'Yangi xizmat suhbati',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: `Assalomu alaykum, ${user.rank} ${user.fullName}. IIV AI Yordamchi xizmatingizda. Qanday hujjat yoki me'yoriy masala bo‘yicha ko‘mak bera olaman?`,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const saved = db.saveConversation(newConv);
  res.status(201).json(saved);
});

app.delete('/api/chat/conversations/:id', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  db.deleteConversation(req.params.id);
  res.json({ success: true });
});

app.post('/api/chat/conversations/:id/messages', async (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  const conv = db.getConversationById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Suhbat topilmadi' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Xabar matni bo\'sh bo\'lishi mumkin emas' });

  // Add user message
  const userMsg = {
    id: 'msg-' + Date.now(),
    sender: 'user' as const,
    text,
    timestamp: new Date().toISOString(),
  };
  conv.messages.push(userMsg);

  // Search relevant knowledge for RAG context
  const allKnowledge = db.getKnowledge();
  const matchedSources: { docTitle: string; article: string; snippet: string }[] = [];
  const words = text.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);

  for (const doc of allKnowledge) {
    for (const art of doc.articles) {
      const artCombined = (art.title + ' ' + art.text + ' ' + art.number).toLowerCase();
      if (words.some((w: string) => artCombined.includes(w))) {
        matchedSources.push({
          docTitle: doc.title,
          article: `${art.number}: ${art.title}`,
          snippet: art.text.length > 180 ? art.text.substring(0, 180) + '...' : art.text,
        });
      }
    }
  }

  const sourcesToSend = matchedSources.slice(0, 3);

  // Generate AI reply
  const aiResult = await generateChatResponse(
    text,
    conv.messages.map((m) => ({ sender: m.sender, text: m.text })),
    sourcesToSend
  );

  const aiMsg = {
    id: 'msg-' + (Date.now() + 1),
    sender: 'ai' as const,
    text: aiResult.text,
    sources: aiResult.sources,
    timestamp: new Date().toISOString(),
  };
  conv.messages.push(aiMsg);
  conv.updatedAt = new Date().toISOString();

  // Auto update title if first user turn
  if (conv.messages.length <= 3 && text.length < 50) {
    conv.title = text;
  }

  db.saveConversation(conv);

  db.logAudit({
    userId: user.id,
    userName: user.fullName,
    action: 'AI_CHAT_MUROJAAT',
    objectType: 'Chat',
    objectId: conv.id,
    details: `AI yordamchiga murojaat qilindi: "${text.substring(0, 60)}..."`,
    ipAddress: getClientIp(req),
  });

  res.json({ conversation: conv, reply: aiMsg });
});

// ==================== KNOWLEDGE BASE & SMART RAG SEARCH ====================
app.get('/api/knowledge', (req: Request, res: Response) => {
  res.json(db.getKnowledge());
});

app.post('/api/knowledge/search', (req: Request, res: Response) => {
  const { query, category } = req.body;
  if (!query) return res.json({ results: [] });

  const user = db.getUserById(activeUserId);
  const all = db.getKnowledge();
  const q = query.toLowerCase().trim();
  const qWords = q.split(/\s+/).filter((w: string) => w.length > 1);

  const results: any[] = [];

  for (const doc of all) {
    if (category && category !== 'Barchasi' && doc.category !== category) {
      continue;
    }

    let docMatched = false;
    // Check main title & description
    if (doc.title.toLowerCase().includes(q) || doc.description.toLowerCase().includes(q)) {
      docMatched = true;
    }

    // Check articles
    const matchedArticles: any[] = [];
    for (const art of doc.articles) {
      const artText = (art.number + ' ' + art.title + ' ' + art.text).toLowerCase();
      const matchScore = qWords.reduce((score: number, w: string) => score + (artText.includes(w) ? 1 : 0), 0);
      if (matchScore > 0 || docMatched) {
        matchedArticles.push({
          number: art.number,
          title: art.title,
          text: art.text,
          matchScore,
        });
      }
    }

    if (docMatched || matchedArticles.length > 0) {
      matchedArticles.sort((a, b) => b.matchScore - a.matchScore);
      results.push({
        ...doc,
        matchedArticles: matchedArticles.length > 0 ? matchedArticles : doc.articles,
      });
    }
  }

  if (user) {
    db.logAudit({
      userId: user.id,
      userName: user.fullName,
      action: 'MEYORIY_QIDIRUV',
      objectType: 'MeyoriyBaza',
      objectId: 'search-' + Date.now(),
      details: `Me'yoriy baza bo'yicha qidiruv: "${query}" (${results.length} ta natija)`,
      ipAddress: getClientIp(req),
    });
  }

  res.json({ results });
});

app.post('/api/knowledge/ask', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Savol matni kiritilishi shart' });

  const user = db.getUserById(activeUserId);
  const allKnowledge = db.getKnowledge();

  try {
    const ragResponse = await askKnowledgeRAG(query, allKnowledge);

    if (user) {
      db.logAudit({
        userId: user.id,
        userName: user.fullName,
        action: 'MEYORIY_QIDIRUV',
        objectType: 'MeyoriyBaza',
        objectId: 'rag-' + Date.now(),
        details: `RAG aqlli tahlil so'rovi: "${query}"`,
        ipAddress: getClientIp(req),
      });
    }

    res.json(ragResponse);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'RAG tahlilda xatolik yuz berdi' });
  }
});

// Upload and index new normative file (Admin / Authorized only)
app.post('/api/knowledge/upload', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  if (user.role !== 'admin' && user.role !== 'rahbar') {
    return res.status(403).json({ error: 'Hujjatlar bazasiga yangi me\'yoriy akt yuklash faqat vakolatli xodimlar va ma\'murlar uchun ruxsat etilgan' });
  }

  const { title, category, numberAndDate, description, rawContent } = req.body;
  if (!title || !rawContent) {
    return res.status(400).json({ error: 'Hujjat nomi va matni talab qilinadi' });
  }

  // Parse articles from text (looks for "X-modda" or "X-band")
  const lines = rawContent.split('\n');
  const articles: { number: string; title: string; text: string }[] = [];
  let currentArticle: { number: string; title: string; text: string } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const moddaMatch = trimmed.match(/^(\d+-(?:modda|band|bob))[:.\s-]*(.*)$/i);
    if (moddaMatch) {
      if (currentArticle) {
        articles.push(currentArticle);
      }
      currentArticle = {
        number: moddaMatch[1],
        title: moddaMatch[2] || 'Bo\'lim',
        text: '',
      };
    } else if (currentArticle) {
      currentArticle.text += (currentArticle.text ? '\n' : '') + trimmed;
    }
  }
  if (currentArticle) {
    articles.push(currentArticle);
  }

  // If no articles parsed, treat whole content as Article 1
  if (articles.length === 0) {
    articles.push({
      number: '1-band',
      title: 'Umumiy qoidalar',
      text: rawContent,
    });
  }

  const newDoc: KnowledgeDoc = {
    id: 'know-' + Date.now(),
    title,
    category: category || 'Yo\'riqnoma',
    numberAndDate: numberAndDate || `№ ${Math.floor(10 + Math.random() * 90)}, ${new Date().getFullYear()}-yil`,
    description: description || title,
    content: rawContent,
    articles,
    uploadedBy: `${user.rank} ${user.fullName}`,
    uploadedAt: new Date().toISOString(),
  };

  const added = db.addKnowledge(newDoc);

  db.logAudit({
    userId: user.id,
    userName: user.fullName,
    action: 'FAYL_YUKLASH',
    objectType: 'MeyoriyBaza',
    objectId: added.id,
    details: `Yangi me'yoriy hujjat indekslandi: "${added.title}" (${added.articles.length} ta modda/band)`,
    ipAddress: getClientIp(req),
  });

  res.status(201).json(added);
});

// ==================== AUDIT LOGS ====================
app.get('/api/audit', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  // Regular xodim can see their own audit events; rahbar and admin can see all
  const allLogs = db.getAuditLogs(300);
  if (user.role === 'xodim') {
    return res.json(allLogs.filter((l) => l.userId === user.id));
  }
  res.json(allLogs);
});

// ==================== USER SETTINGS ====================
app.get('/api/settings', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });
  res.json(db.getSettings(user.id));
});

app.put('/api/settings', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  if (!user) return res.status(401).json({ error: 'Avtorizatsiya xatosi' });

  const updated = db.updateSettings(user.id, req.body);
  res.json(updated);
});

// ==================== 1. LEGAL QUALIFICATION (MJtK & JK) ====================
app.post('/api/legal-qualification/analyze', async (req: Request, res: Response) => {
  const { incidentDescription } = req.body;
  if (!incidentDescription) {
    return res.status(400).json({ error: 'Hodisa bayoni kiritilishi shart' });
  }

  const user = db.getUserById(activeUserId);

  try {
    const result = await analyzeLegalQualification(incidentDescription);

    if (user) {
      db.logAudit({
        userId: user.id,
        userName: user.fullName,
        action: 'AI_CHAT_MUROJAAT',
        objectType: 'Hujjat',
        objectId: 'legal-eval-' + Date.now(),
        details: `Huquqiy kvalifikatsiya tahlili: "${incidentDescription.substring(0, 50)}..."`,
        ipAddress: getClientIp(req),
      });
    }

    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Huquqiy tahlilda xatolik' });
  }
});

// ==================== 2. VOICE-TO-DOCUMENT ====================
app.post('/api/documents/voice-to-doc', async (req: Request, res: Response) => {
  const { voiceTranscript, docType } = req.body;
  if (!voiceTranscript) {
    return res.status(400).json({ error: 'Ovozli transkript matni bo\'sh bo\'lishi mumkin emas' });
  }

  const user = db.getUserById(activeUserId);
  const officerName = user ? `${user.rank} ${user.fullName}` : 'Katta leytenant S.B. Karimov';

  try {
    const draftText = await processVoiceToDocument(voiceTranscript, docType || 'xizmat_xati', officerName);

    if (user) {
      db.logAudit({
        userId: user.id,
        userName: user.fullName,
        action: 'HUJJAT_YARATISH',
        objectType: 'Hujjat',
        objectId: 'voice-doc-' + Date.now(),
        details: `Ovozli diktovka asosida xizmat bildirgisi tuzildi`,
        ipAddress: getClientIp(req),
      });
    }

    res.json({ draftText });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ovozli matnni qayta ishlashda xatolik' });
  }
});

// ==================== 3. CITIZEN APPEALS ====================
app.get('/api/citizen-appeals', (req: Request, res: Response) => {
  res.json(db.getAppeals());
});

app.post('/api/citizen-appeals', (req: Request, res: Response) => {
  const { citizenName, address, phone, topic, appealText } = req.body;
  if (!citizenName || !appealText) {
    return res.status(400).json({ error: 'Fuqaro ismi va murojaat matni talab etiladi' });
  }

  const user = db.getUserById(activeUserId);
  const now = new Date();
  const deadline = new Date(Date.now() + 15 * 24 * 3600 * 1000);

  const newAppeal: CitizenAppeal = {
    id: 'app-' + Date.now(),
    registrationNumber: `MUR-${now.getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    citizenName,
    address: address || 'Toshkent shahri',
    phone: phone || '+998 90 000-00-00',
    topic: topic || 'Jamoat tartibi va xavfsizlik',
    appealText,
    receivedDate: now.toISOString(),
    deadlineDate: deadline.toISOString(),
    status: 'Yangi',
    assignedOfficerName: user ? `${user.rank} ${user.fullName}` : 'Katta leytenant S.B. Karimov',
  };

  const saved = db.saveAppeal(newAppeal);
  res.status(201).json(saved);
});

app.post('/api/citizen-appeals/analyze', async (req: Request, res: Response) => {
  const { appealId, appealText, citizenName, applicantAddress } = req.body;
  if (!appealText || !citizenName) {
    return res.status(400).json({ error: 'Murojaat matni va fuqaro ismi kiritilishi shart' });
  }

  try {
    const analysis = await generateCitizenAppealResponse(appealText, citizenName, applicantAddress);

    if (appealId) {
      const existing = db.getAppealById(appealId);
      if (existing) {
        existing.summaryPoints = analysis.summaryPoints;
        existing.responseDraft = analysis.responseDraft;
        existing.recommendedActions = analysis.recommendedActions;
        existing.status = 'O\'rganilmoqda';
        db.saveAppeal(existing);
      }
    }

    res.json({ analysis });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Murojaat tahlilida xatolik' });
  }
});

// ==================== 4. ANALYTICS & KRIMINOGEN MONITORING ====================
app.get('/api/analytics/kriminogen', (req: Request, res: Response) => {
  const stats = db.getDistrictStats();
  const totals = {
    totalIncidents: stats.reduce((acc, s) => acc + s.totalIncidents, 0),
    totalPrevented: stats.reduce((acc, s) => acc + s.prevented, 0),
    minorHooliganismTotal: stats.reduce((acc, s) => acc + s.minorHooliganism, 0),
    disobedienceTotal: stats.reduce((acc, s) => acc + s.disobedience, 0),
    publicAlcoholTotal: stats.reduce((acc, s) => acc + s.publicAlcohol, 0),
    domesticDisputesTotal: stats.reduce((acc, s) => acc + s.domesticDisputes, 0),
    activeOfficers: stats.reduce((acc, s) => acc + s.officerCount, 0),
  };

  res.json({ stats, totals });
});

// ==================== 5. SERVICE EXAM & TRAINING ====================
app.get('/api/training/questions', (req: Request, res: Response) => {
  res.json(db.getQuizQuestions());
});

app.post('/api/training/submit', (req: Request, res: Response) => {
  const { answers } = req.body; // array of { questionId, selectedIndex }
  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: 'Javoblar massiv ko\'rinishida yuborilishi shart' });
  }

  const questions = db.getQuizQuestions();
  let correctCount = 0;
  const detailedResults = answers.map((ans) => {
    const q = questions.find((item) => item.id === ans.questionId);
    if (!q) return null;
    const isCorrect = q.correctIndex === ans.selectedIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      question: q.question,
      userAnswer: q.options[ans.selectedIndex],
      correctAnswer: q.options[q.correctIndex],
      isCorrect,
      explanation: q.explanation,
      legalArticle: q.legalArticle,
    };
  }).filter(Boolean);

  const totalQuestions = questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  let grade = 'Qoniqarsiz';
  if (percentage >= 85) grade = 'A’lo (Topshirildi)';
  else if (percentage >= 70) grade = 'Yaxshi (Topshirildi)';
  else if (percentage >= 60) grade = 'Qoniqarli';

  const user = db.getUserById(activeUserId);
  if (user) {
    db.logAudit({
      userId: user.id,
      userName: user.fullName,
      action: 'AI_CHAT_MUROJAAT',
      objectType: 'Foydalanuvchi',
      objectId: 'training-' + Date.now(),
      details: `Xizmat attestatsiya testi topshirildi: ${correctCount}/${totalQuestions} (${percentage}%) - ${grade}`,
      ipAddress: getClientIp(req),
    });
  }

  res.json({
    correctCount,
    totalQuestions,
    percentage,
    grade,
    detailedResults,
  });
});

// ==================== 6. QR VERIFICATION ====================
app.get('/api/verify/:docId', (req: Request, res: Response) => {
  const doc = db.getDocumentById(req.params.docId);
  if (!doc) {
    return res.status(404).json({ error: 'Bunday raqamli hujjat tizimda topilmadi' });
  }

  res.json({
    verified: true,
    docNumber: doc.docNumber,
    title: doc.title,
    docType: doc.docType,
    department: doc.department,
    status: doc.status,
    creator: `${doc.creatorRank} ${doc.creatorName}`,
    reviewer: doc.reviewerName ? doc.reviewerName : 'Tekshiruv kutilmoqda',
    createdAt: doc.createdAt,
    verificationCode: `IIV-SEC-${doc.id.replace('doc-', '')}-UZ`,
    systemNotice: 'Ushbu hujjat O‘zbekiston Respublikasi IIV yagona elektron hujjat aylanishi tizimida ro‘yxatdan o‘tgan.',
  });
});

// ==================== 7. E-PATRUL & TEZKOR QIDIRUV API ====================
app.get('/api/epatrol/search', (req: Request, res: Response) => {
  const query = String(req.query.query || '').trim();
  const type = String(req.query.type || 'all');

  let vehicles: any[] = [];
  let citizens: any[] = [];

  if (type === 'all' || type === 'vehicle') {
    vehicles = db.searchVehicles(query);
  }
  if (type === 'all' || type === 'citizen') {
    citizens = db.searchCitizens(query);
  }

  const user = db.getUserById(activeUserId);
  if (user && query.length >= 2) {
    db.logAudit({
      userId: user.id,
      userName: user.fullName,
      action: 'EPATRUL_QIDIRUV',
      objectType: 'Patrul',
      objectId: 'search-' + Date.now(),
      details: `E-Patrul qidiruvi: so‘rov "${query}", natijalar: ${vehicles.length} avto, ${citizens.length} fuqaro`,
      ipAddress: getClientIp(req),
    });
  }

  res.json({
    query,
    vehicles,
    citizens,
    totalCount: vehicles.length + citizens.length,
  });
});

// ==================== 8. E-HIMOYA ORDERI API (O‘RQ-561) ====================
app.get('/api/protection-orders', (req: Request, res: Response) => {
  res.json(db.getProtectionOrders());
});

app.post('/api/protection-orders', (req: Request, res: Response) => {
  const user = db.getUserById(activeUserId);
  const {
    victimName,
    victimPinfl,
    victimPhone,
    victimAddress,
    offenderName,
    offenderPinfl,
    offenderPhone,
    offenderRelationship,
    mahalla,
    district,
    restrictions,
    incidentSummary,
  } = req.body;

  if (!victimName || !offenderName) {
    return res.status(400).json({ error: 'Jabrlanuvchi va tazyiq o‘tkazgan shaxs ma’lumotlari to‘liq kiritilishi shart' });
  }

  const today = new Date();
  const expiry = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const issuedDate = today.toISOString().split('T')[0];
  const expiryDate = expiry.toISOString().split('T')[0];

  const orderNumber = `HO-2025/${Math.floor(Math.random() * 900 + 100)}`;
  const newOrder = {
    id: 'ho-' + Date.now(),
    orderNumber,
    victimName,
    victimPinfl: victimPinfl || '4' + Math.floor(1000000000000 + Math.random() * 9000000000000),
    victimPhone: victimPhone || '+998 90 000-00-00',
    victimAddress: victimAddress || 'Toshkent shahri',
    offenderName,
    offenderPinfl: offenderPinfl || '3' + Math.floor(1000000000000 + Math.random() * 9000000000000),
    offenderPhone: offenderPhone || '+998 90 000-00-00',
    offenderRelationship: offenderRelationship || 'Turmush o‘rtog‘i',
    mahalla: mahalla || 'Mahalla',
    district: district || 'Toshkent shahar',
    issuedDate,
    expiryDate,
    status: 'Faol' as const,
    restrictions: restrictions || {
      noViolence: true,
      noContact: true,
      noApproach: true,
      separateLiving: false,
      weaponsSurrender: false,
      mandatoryRehab: true,
    },
    inspectorName: user ? `${user.rank} ${user.fullName}` : 'Profilaktika inspektori',
    inspectorRank: user ? user.rank : 'Leytenant',
    inspectorPhone: '+998 71 230-00-00',
    incidentSummary: incidentSummary || 'Oilaviy nizo va ruhiy tazyiq holati yuzasidan rasmiylashtirildi.',
    monitoringVisitsCount: 1,
    lastVisitDate: issuedDate,
    violationsRecorded: 0,
  };

  db.saveProtectionOrder(newOrder);

  if (user) {
    db.logAudit({
      userId: user.id,
      userName: user.fullName,
      action: 'HIMOYA_ORDERI_BERISH',
      objectType: 'HimoyaOrderi',
      objectId: newOrder.id,
      details: `Yangi himoya orderi rasmiylashtirildi: ${orderNumber} (${victimName} / ${offenderName})`,
      ipAddress: getClientIp(req),
    });
  }

  res.status(201).json(newOrder);
});

app.patch('/api/protection-orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = db.getUserById(activeUserId);
  const current = db.getProtectionOrderById(id);
  if (!current) {
    return res.status(404).json({ error: 'Himoya orderi topilmadi' });
  }

  const updates: any = { ...req.body };

  // Extend 30 days logic
  if (req.body.extend30Days) {
    const curExp = new Date(current.expiryDate);
    const newExp = new Date(curExp.getTime() + 30 * 24 * 60 * 60 * 1000);
    updates.expiryDate = newExp.toISOString().split('T')[0];
    updates.status = 'Uzatilgan';
    delete updates.extend30Days;
  }

  const updated = db.updateProtectionOrder(id, updates);

  if (user && updated) {
    db.logAudit({
      userId: user.id,
      userName: user.fullName,
      action: 'HIMOYA_ORDERI_YANGILASH',
      objectType: 'HimoyaOrderi',
      objectId: id,
      details: `Himoya orderi ${current.orderNumber} yangilandi: holati -> ${updated.status}`,
      ipAddress: getClientIp(req),
    });
  }

  res.json(updated);
});

// ==================== 9. KRIMINOGEN GIS XARITA API ====================
app.get('/api/gis/data', (req: Request, res: Response) => {
  const mahallas = db.getMahallaRiskZones();
  const patrols = db.getPatrolUnits();
  const alerts = db.getEmergencyAlerts();

  const user = db.getUserById(activeUserId);
  if (user) {
    db.logAudit({
      userId: user.id,
      userName: user.fullName,
      action: 'GIS_XARITA_KORISH',
      objectType: 'KriminogenXarita',
      objectId: 'gis-' + Date.now(),
      details: 'Toshkent shahri bo‘yicha kriminogen GIS xaritasi ko‘zdan kechirildi',
      ipAddress: getClientIp(req),
    });
  }

  res.json({ mahallas, patrols, alerts });
});

app.post('/api/gis/alerts/:id/dispatch', (req: Request, res: Response) => {
  const { id } = req.params;
  const { patrolCallSign } = req.body;
  const user = db.getUserById(activeUserId);

  const updated = db.updateAlertStatus(id, 'Ekipaj_Biriktirildi', patrolCallSign);
  if (!updated) {
    return res.status(404).json({ error: 'Chaqiruv signali topilmadi' });
  }

  if (user) {
    db.logAudit({
      userId: user.id,
      userName: user.fullName,
      action: 'PATRUL_YOLLASH',
      objectType: 'Patrul',
      objectId: id,
      details: `Tezkor chaqiruvga patrul yo‘llandi: ${patrolCallSign || 'Patrul guruhi'} -> ${updated.title}`,
      ipAddress: getClientIp(req),
    });
  }

  res.json({ success: true, alert: updated });
});


// ==================== VITE & STATIC HANDLING ====================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[IIV AI Yordamchi] Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
});
