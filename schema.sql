-- =====================================================================
-- O'ZBEKISTON RESPUBLIKASI ICHKI ISHLAR VAZIRLIGI
-- "IIV AI Yordamchi" Tizimi — PostgreSQL Ma'lumotlar Bazasi Sxemasi
-- Versiya: 1.0.0
-- =====================================================================

-- 1. ROLLAR VA FOYDALANUVCHILAR (Users & RBAC)
CREATE TYPE user_role AS ENUM ('xodim', 'rahbar', 'admin');
CREATE TYPE user_status AS ENUM ('faol', 'nofaol', 'bloklangan');

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    badge_number VARCHAR(32) NOT NULL UNIQUE, -- Masalan: IIV-41092
    full_name VARCHAR(128) NOT NULL,
    rank VARCHAR(64) NOT NULL,                -- Mayor, Podpolkovnik, Katta leytenant va h.k.
    role user_role NOT NULL DEFAULT 'xodim',
    department VARCHAR(256) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    status user_status NOT NULL DEFAULT 'faol',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_badge ON users(badge_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);

-- 2. HUJJATLAR TURLARI VA HOLATLARI (Documents)
CREATE TYPE document_status AS ENUM ('Qoralama', 'Tekshiruvda', 'Tasdiqlangan', 'Qaytarilgan');
CREATE TYPE document_type AS ENUM (
    'xizmat_xati',
    'hisobot',
    'malumotnoma',
    'tushuntirish_xati',
    'yigilish_bayonnomasi',
    'qaror_loyihasi'
);

CREATE TABLE documents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(256) NOT NULL,
    doc_type document_type NOT NULL DEFAULT 'xizmat_xati',
    doc_number VARCHAR(64) NOT NULL,
    recipient VARCHAR(256) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    status document_status NOT NULL DEFAULT 'Qoralama',
    creator_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reviewer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    review_comment TEXT,
    ai_assisted BOOLEAN NOT NULL DEFAULT FALSE,
    department VARCHAR(256) NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_creator ON documents(creator_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(doc_type);
CREATE INDEX idx_documents_created ON documents(created_at DESC);

-- 3. HUJJAT SHABLONLARI (Document Templates)
CREATE TABLE document_templates (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    doc_type document_type NOT NULL,
    description TEXT,
    icon VARCHAR(64),
    default_structure TEXT NOT NULL,
    sample_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. HUJJAT VERSIYALARI VA TAHRIRLAR TARIXI (Document Versions)
CREATE TABLE document_versions (
    id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    modified_by VARCHAR(128) NOT NULL,
    change_summary VARCHAR(256),
    modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doc_versions_doc_id ON document_versions(document_id);

-- 5. TOPSHIRIQLAR VA VAZIFALAR (Tasks & Assignments)
CREATE TYPE task_priority AS ENUM ('Yuqori', 'O''rta', 'Past');
CREATE TYPE task_status AS ENUM ('Yangi', 'Jarayonda', 'Bajarildi', 'Muddati o''tgan');

CREATE TABLE tasks (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(256) NOT NULL,
    description TEXT,
    assigned_to_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_by_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    priority task_priority NOT NULL DEFAULT 'O''rta',
    status task_status NOT NULL DEFAULT 'Yangi',
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    department VARCHAR(256) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- 6. AI CHAT SUHBAT VA XABARLAR (Conversations & Messages)
CREATE TABLE conversations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR(16) NOT NULL CHECK (sender IN ('user', 'ai')),
    text TEXT NOT NULL,
    sources JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conv_id ON messages(conversation_id);

-- 7. ME'YORIY BAZA VA RAG HUJJATLAR (Knowledge Base)
CREATE TABLE knowledge_sources (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(256) NOT NULL,
    category VARCHAR(64) NOT NULL, -- Qonun, Qaror, Buyruq, Yo'riqnoma, Nizom
    number_and_date VARCHAR(128) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    uploaded_by VARCHAR(128),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_articles (
    id VARCHAR(64) PRIMARY KEY,
    source_id VARCHAR(64) NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    article_number VARCHAR(64) NOT NULL,
    article_title VARCHAR(256) NOT NULL,
    article_text TEXT NOT NULL
);

CREATE INDEX idx_articles_source_id ON knowledge_articles(source_id);
-- Full-text search index for PostgreSQL:
CREATE INDEX idx_articles_fts ON knowledge_articles USING gin(to_tsvector('simple', article_title || ' ' || article_text));

-- 8. AUDIT VA XAVFSIZLIK JURNALI (Audit Events)
CREATE TABLE audit_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    action VARCHAR(64) NOT NULL,
    object_type VARCHAR(64) NOT NULL,
    object_id VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_events(user_id);
CREATE INDEX idx_audit_action ON audit_events(action);
CREATE INDEX idx_audit_created ON audit_events(created_at DESC);

-- 9. FOYDALANUVCHI SOZLAMALARI (User Settings)
CREATE TABLE user_settings (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    notifications_in_app BOOLEAN DEFAULT TRUE,
    notifications_email BOOLEAN DEFAULT TRUE,
    two_factor_auth BOOLEAN DEFAULT TRUE,
    auto_save_drafts BOOLEAN DEFAULT TRUE,
    high_contrast BOOLEAN DEFAULT FALSE,
    font_size VARCHAR(16) DEFAULT 'standard'
);
