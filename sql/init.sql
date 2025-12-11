-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    height NUMERIC(5, 2),
    age INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the weight_measurements table
CREATE TABLE IF NOT EXISTS weight_measurements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    measurement_date DATE NOT NULL,
    weight NUMERIC(5, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the goals table
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    target_weight NUMERIC(5, 2) NOT NULL,
    target_date DATE NOT NULL,
    start_weight NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data idempotently
INSERT INTO users (username, password_hash, email, height, age)
SELECT 'johndoe', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4fYwKjQXW', 'john@example.com', 175.0, 30
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'johndoe');

INSERT INTO weight_measurements (user_id, measurement_date, weight, notes)
SELECT 1, '2024-11-11', 70.5, 'Morning weight'
WHERE NOT EXISTS (SELECT 1 FROM weight_measurements WHERE user_id = 1 AND measurement_date = '2024-11-11');
