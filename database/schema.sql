-- Script SQL para criar o banco de dados SQLite do Time Ledger

-- Tabela de usuários simplificada
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  displayName TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índice para username
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT 0,
  userId TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(userId, date);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);

-- Tabela de timers
CREATE TABLE IF NOT EXISTS timers (
  id TEXT PRIMARY KEY,
  taskId TEXT NOT NULL,
  startTime DATETIME NOT NULL,
  endTime DATETIME,
  duration INTEGER DEFAULT 0, -- Duração em segundos
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Índices para timers
CREATE INDEX IF NOT EXISTS idx_timers_task ON timers(taskId);
CREATE INDEX IF NOT EXISTS idx_timers_start_time ON timers(startTime);

-- Tabela de tags das tarefas
CREATE TABLE IF NOT EXISTS task_tags (
  id TEXT PRIMARY KEY,
  taskId TEXT NOT NULL,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  color TEXT DEFAULT '#6b7280',
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE(taskId, type, value)
);

-- Índices para task_tags
CREATE INDEX IF NOT EXISTS idx_task_tags_task ON task_tags(taskId);
CREATE INDEX IF NOT EXISTS idx_task_tags_type ON task_tags(type);
