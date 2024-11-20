-- init.sql

-- Create the weight_tracker database
CREATE DATABASE weight_tracker;

-- Connect to the weight_tracker database
\c weight_tracker;

-- Create the users table (optional)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the weight_measurements table
CREATE TABLE weight_measurements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    measurement_date DATE NOT NULL,
    weight NUMERIC(5, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name) VALUES ('John Doe');
INSERT INTO weight_measurements (user_id, measurement_date, weight, notes) 
VALUES (1, '2024-11-11', 70.5, 'Morning weight');
