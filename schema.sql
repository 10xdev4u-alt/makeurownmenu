CREATE TABLE IF NOT EXISTS menu_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    room TEXT NOT NULL,
    menu_feedback TEXT NOT NULL, -- Storing as JSON string
    created_at TEXT NOT NULL
);