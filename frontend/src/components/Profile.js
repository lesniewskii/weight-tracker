import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, TextField, Button, Box, Alert, Avatar, Grid } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editForm, setEditForm] = useState({
        email: '',
        height: '',
        age: ''
    });

    const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://backend:8000';
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${backendApiUrl}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
            setEditForm({
                email: response.data.email || '',
                height: response.data.height ? response.data.height.toString() : '',
                age: response.data.age ? response.data.age.toString() : ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const updateData = {
                username: user.username, // Keep existing username
                password: 'dummy', // Not updating password
                email: editForm.email,
                height: editForm.height ? parseFloat(editForm.height) : null,
                age: editForm.age ? parseInt(editForm.age) : null
            };

            const response = await axios.put(`${backendApiUrl}/auth/me`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(response.data);
            setSuccess('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
                <Typography>Loading profile...</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                </Avatar>
                <Typography variant="h4" component="h1">
                    User Profile
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={user?.username || ''}
                            disabled
                            helperText="Username cannot be changed"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Height (cm)"
                            type="number"
                            value={editForm.height}
                            onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                            inputProps={{ min: 50, max: 250 }}
                            helperText="Used for BMI calculations"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Age"
                            type="number"
                            value={editForm.age}
                            onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                            inputProps={{ min: 1, max: 120 }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" gap={2}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={saving}
                                size="large"
                            >
                                {saving ? 'Saving...' : 'Update Profile'}
                            </Button>
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => {
                                    setEditForm({
                                        email: user.email || '',
                                        height: user.height ? user.height.toString() : '',
                                        age: user.age ? user.age.toString() : ''
                                    });
                                    setError('');
                                    setSuccess('');
                                }}
                            >
                                Reset Changes
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Profile Summary */}
            <Box mt={4} p={3} bgcolor="grey.50" borderRadius={2}>
                <Typography variant="h6" gutterBottom>
                    Profile Summary
                </Typography>
                <Typography><strong>Username:</strong> {user?.username}</Typography>
                <Typography><strong>Email:</strong> {user?.email}</Typography>
                <Typography><strong>Height:</strong> {user?.height ? `${user.height} cm` : 'Not set'}</Typography>
                <Typography><strong>Age:</strong> {user?.age ? `${user.age} years` : 'Not set'}</Typography>
                {user?.height && user?.age && (
                    <Typography><strong>BMI:</strong> {(user.weight / ((user.height / 100) ** 2)).toFixed(1)} (based on latest weight)</Typography>
                )}
            </Box>
        </Paper>
    );
};

export default Profile;