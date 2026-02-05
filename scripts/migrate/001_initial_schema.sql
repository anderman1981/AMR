-- Migration for AMROIS System Tables

-- Deployment Tokens
CREATE TABLE IF NOT EXISTS deployment_tokens (
    token VARCHAR(255) PRIMARY KEY,
    current_uses INTEGER DEFAULT 0,
    max_uses INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Development Token
INSERT INTO deployment_tokens (token, max_uses, is_active) 
VALUES ('dev-token', 9999, true)
ON CONFLICT (token) DO NOTHING;

-- Devices
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    department VARCHAR(255),
    device_token VARCHAR(255),
    status VARCHAR(50) DEFAULT 'offline',
    cpu_usage INTEGER DEFAULT 0,
    memory_usage INTEGER DEFAULT 0,
    security_score INTEGER DEFAULT 100,
    is_banned BOOLEAN DEFAULT false,
    last_heartbeat TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Global Chats
CREATE TABLE IF NOT EXISTS global_chats (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Global Chat Messages
CREATE TABLE IF NOT EXISTS global_chat_messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES global_chats(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) REFERENCES devices(id),
    agent_type VARCHAR(100),
    priority INTEGER DEFAULT 0,
    payload JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    result JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Performance
CREATE TABLE IF NOT EXISTS agent_performance (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(100),
    task_type VARCHAR(100),
    execution_time INTEGER,
    success BOOLEAN,
    metrics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
