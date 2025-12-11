-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the weight_measurements table
CREATE TABLE IF NOT EXISTS weight_measurements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    measurement_date DATE NOT NULL,
    weight NUMERIC(5, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data idempotently
INSERT INTO users (name)
SELECT 'John Doe'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE name = 'John Doe');

INSERT INTO weight_measurements (user_id, measurement_date, weight, notes)
SELECT 1, '2024-11-11', 70.5, 'Morning weight'
WHERE NOT EXISTS (SELECT 1 FROM weight_measurements WHERE user_id = 1 AND measurement_date = '2024-11-11');
