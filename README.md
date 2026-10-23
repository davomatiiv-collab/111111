# IIV AI Yordamchi — Ichki Ishlar Organlari Xodimlari Uchun Aqlli Platforma

> **O‘zbekiston Respublikasi Ichki ishlar vazirligi tizimi uchun maxsus ishlab chiqilgan sun’iy intellekt asosidagi xizmat yordamchisi va hujjatlar boshqaruvi tizimi.**

Mazkur platforma ichki ishlar organlari xodimlarining kundalik ish faoliyatini yengillashtirish, takroriy xizmat hujjatlarini tayyorlash jarayonlarini avtomatlashtirish, ruxsat etilgan me’yoriy hujjatlar va yo‘riqnomalar bo‘yicha tezkor qidiruv hamda huquqiy tahlilni amalga oshirish uchun mo‘ljallangan.

---

## 🏛️ Asosiy Modullar va Imkoniyatlar

### 1. Boshqaruv Paneli (Dashboard)
- **Shaxsiy salomlashuv:** Xodimning lavozimi, xizmat unvoni va guvohnoma raqami (masalan, *Mayor A. Rustamov*, *Katta leytenant S. Karimov*).
- **Statistik ko‘rsatkichlar:** Jami hujjatlar, qoralamalar, tekshiruvdagi va tasdiqlangan hujjatlar hamda kutilayotgan topshiriqlar soni (real tizim ma’lumotlari asosida).
- **AI Tezkor Murojaat:** Bir bosish orqali tungi reyd bildirgisi, tushuntirish xati, me’yoriy modda tahlili va matnni rasmiy uslubga solish.
- **Ijro nazorati:** Yaqinlashayotgan muddatlar va nazoratdagi vazifalar.

### 2. AI Chat Yordamchisi (ChatGPT Uslubida)
- **Rasmiy-idoraviy til:** O‘zbek tilida (lotin yozuvida) yuritiladigan muloqot.
- **Server-Side Gemini 3.8 Flash:** API kalitlari hech qachon brauzerga uzatilmaydi, server tomonida himoyalangan.
- **Suhbatlar tarixi:** Yangi suhbat ochish, nomlash, o‘chirish, matnni nusxalash va qayta yaratish.
- **Tezkor AI vositalari:** 
  - *Imlo va grammatikani tekshirish*
  - *Matnni rasmiy idoraviy uslubga o‘tkazish*
  - *Uzun matnlarni qisqartirish (tezislar chiqarish)*
  - *Me’yoriy band va qoidalarni tushuntirish*
- **Hujjatga o‘tkazish:** AI tayyorlagan javobni bir tugma bilan "Hujjat yaratish" moduliga yo‘naltirish.
- **Qonuniylik kafolati:** AI mavjud bo‘lmagan qonun moddalarini to‘qimaydi. Manba bo‘lmaganda aniq ogohlantiradi.

### 3. Hujjat Yaratish Moduli (Konstruktor)
- **Tasdiqlangan shablonlar:** 
  - *Xizmat xati (Bildirgi)*
  - *Tushuntirish xati*
  - *Ma’lumotnoma (Spravka)*
  - *Xizmat hisoboti*
  - *Yig‘ilish bayonnomasi loyihasi*
- **AI Aqlli Qoralama Generator:** Asos, faktlar va takliflar asosida rasmiy rekvizitlarga ega hujjat matnini tuzadi.
- **Hujjat holatlari (Workflow):** `Qoralama` &rarr; `Tekshiruvda` &rarr; `Tasdiqlangan` / `Qaytarilgan`.
- **Eksport va Chop etish:** Rasmiy gerbli idoraviy blanka ko‘rinishi, elektron tasdiq shtampi, TXT yuklab olish va qog‘ozga chop etish (`Print / PDF`).
- **Tahrirlar tarixi (Versiyalar):** Hujjatning har bir o‘zgarishi versiyalanadi va qayta tiklash imkoni mavjud.

### 4. Me’yoriy Baza va Aqlli Qidiruv (RAG)
- **Ruxsat etilgan me’yoriy baza:**
  - *O‘zbekiston Respublikasining "Ichki ishlar organlari to‘g‘risida"gi Qonuni (O‘RQ-407)*
  - *IIV xodimlarining kasbiy odob-axloq va xizmat intizomi Kodeksi*
  - *Hujjatlar bilan ishlash va ijro intizomi Yo‘riqnomasi (№ 144)*
  - *O‘zbekiston Respublikasining "Huquqbuzarliklar profilaktikasi to‘g‘risida"gi Qonuni (O‘RQ-371)*
- **RAG (Retrieval-Augmented Generation):** Savolga javob berishda me’yoriy bazadagi moddalar tahlil qilinib, aniq manbalar va iqtiboslar bilan beriladi.
- **Hujjat indekslash:** Vakolatli xodimlar yangi idoraviy buyruq va yo‘riqnomalarni tizimga yuklab, indekslashi mumkin.

### 5. Topshiriqlar va Vazifalar Moduli
- Topshiriq yaratish, ijrochini belgilash, ustuvorlik (`Yuqori`, `O‘rta`, `Past`), deadline muddati.
- Holatlar: `Yangi`, `Jarayonda`, `Bajarildi`, `Muddati o‘tgan`.
- Filtrlash va tezkor yangilash.

### 6. Rollar va Ruxsatlar (RBAC)
- **Xodim (Inspektor):** O‘z hujjatlari va topshiriqlari bilan ishlaydi, qoralamalar tuzadi, AI yordamchidan foydalanadi.
- **Rahbar (Bo‘lim boshlig‘i):** Bo‘lim hujjatlarini tekshiradi, tasdiqlaydi yoki qaytaradi, topshiriq biriktiradi.
- **Administrator:** Texnik parametrlar, audit jurnali va me’yoriy baza indeksatsiyasini boshqaradi.
- *Interfeysdagi tezkor almashtirgich orqali 1 bosishda istalgan rolda tizimni sinovdan o‘tkazish mumkin.*

### 7. Audit va Xavfsizlik Jurnali
- Har bir amal (kirish, hujjat yaratish, tasdiqlash, AI so‘rovi, qidiruv) o‘zgarmas reyestrga qayd etiladi.
- Yozuvlar: foydalanuvchi, vaqt, amal, ob’ekt ID, IP manzil.
- CSV formatida eksport qilish imkoniyati.

---

## 🛠️ Texnik Arxitektura va Texnologiyalar

| Qatlam | Texnologiya |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion |
| **Backend** | Node.js, Express, REST API, TSX |
| **AI Dvigateli** | `@google/genai` (Gemini 3.8 Flash, Server-Side) |
| **Ma’lumotlar bazasi** | Persistent JSON store (ishlab chiqishda) + PostgreSQL sxemasi (`schema.sql`) |
| **Xavfsizlik** | TLS 1.3, RBAC, Server-Side Proxy, Audit Trail |

---

## 🚀 O‘rnatish va Ishga Tushirish

### 1. Talablar
- Node.js (v20 yoki undan yuqori)
- npm yoki yarn

### 2. O‘rnatish
```bash
# Bog'liqliklarni o'rnatish
npm install
```

### 3. Konfiguratsiya (.env)
`.env.example` faylidan nusxa olib, `.env` faylini yarating:
```bash
GEMINI_API_KEY="SIZNING_GEMINI_API_KALITINGIZ"
PORT=3000
```

### 4. Ishga tushirish (Development)
```bash
npm run dev
```
Tizim avtomatik ravishda `http://localhost:3000` manzilida ishga tushadi.

### 5. Ishlab chiqarish muhiti (Production)
```bash
npm run build
npm start
```

---

## 🗄️ PostgreSQL Ma’lumotlar Bazasi Migratsiyasi

Tizimning to‘liq relyatsion sxemasi `schema.sql` faylida taqdim etilgan:
```bash
# PostgreSQL bazasiga yuklash
psql -U postgres -d iiv_assistant -f schema.sql
```

Jadvallar tarkibi:
- `users`, `roles`, `permissions`
- `documents`, `document_templates`, `document_versions`
- `tasks`
- `conversations`, `messages`
- `knowledge_sources`, `knowledge_articles` (FTS index)
- `audit_events`
- `user_settings`

---

## 🔒 Xavfsizlik va Maxfiylik Kafolati
1. **API kalitlari himoyasi:** AI API kaliti mijoz (brauzer) kodiga aslo chiqmaydi; faqat server orqali proksi qilinadi.
2. **Davlat sirlari va tergov ma’lumotlari:** Haqiqiy maxfiy xizmat sirlari, tergov hujjatlari sinov muhitiga kiritilmaydi.
3. **Audit daxlsizligi:** Audit qaydlari oddiy foydalanuvchilar tomonidan o‘zgartirilishi yoki o‘chirilishi mumkin emas.
4. **Rasmiy maqom:** AI yaratgan matnlar avtomatik yuridik kuchga ega bo‘lmaydi; mas’ul xodim imzosi va vakolatli rahbar tasdig‘i talab etiladi.
