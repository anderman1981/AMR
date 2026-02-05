-- Migration for Books and Cards

-- Books
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    size INTEGER,
    format VARCHAR(20),
    category VARCHAR(100),
    content TEXT,
    processed INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    category_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated Cards
CREATE TABLE IF NOT EXISTS generated_cards (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    category_id VARCHAR(50),
    type VARCHAR(50),
    content TEXT,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book Chats
CREATE TABLE IF NOT EXISTS book_chats (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book Chat Messages
CREATE TABLE IF NOT EXISTS book_chat_messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES book_chats(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book Forms
CREATE TABLE IF NOT EXISTS book_forms (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    title VARCHAR(255),
    page_number INTEGER,
    questions JSONB,
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
