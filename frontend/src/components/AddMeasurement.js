import React, { useState } from 'react';
import axios from 'axios';
import { Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';

const AddMeasurement = ({ onAdd }) => {
    const [userId, setUserId] = useState('');
    const [measurementDate, setMeasurementDate] = useState('');
    const [weight, setWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const newMeasurement = {
            user_id: parseInt(userId),
            measurement_date: measurementDate,
            weight: parseFloat(weight),
            notes
        };

        try {
            await axios.post(`${backendApiUrl}/measurements`, newMeasurement);
            onAdd(); // Refresh measurements after adding
            setUserId('');
            setMeasurementDate('');
            setWeight('');
            setNotes('');
        } catch (error) {
            console.error('Error adding measurement:', error);
            setError('Failed to add measurement. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Add New Weight Measurement
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="User ID"
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label="Measurement Date"
                    type="date"
                    value={measurementDate}
                    onChange={(e) => setMeasurementDate(e.target.value)}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Weight (kg)"
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label="Notes"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                />
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Measurement'}
                </Button>
            </Box>
        </Paper>
    );
};

export default AddMeasurement;
