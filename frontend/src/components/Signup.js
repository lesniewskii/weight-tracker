import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';

const Signup = ({ onSignup }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [error, setError] = useState('');
    const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${backendApiUrl}/auth/register`, {
                username,
                password,
                email,
                height: height ? parseFloat(height) : null,
                age: age ? parseInt(age) : null
            });
            onSignup();
        } catch (err) {
            setError('Registration failed');
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Sign Up
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Height (cm)"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    margin="normal"
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
                    Sign Up
                </Button>
            </Box>
        </Paper>
    );
};

export default Signup;
