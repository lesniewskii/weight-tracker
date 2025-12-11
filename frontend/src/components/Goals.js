import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, TextField, Button, Box, Alert, List, ListItem, ListItemText, Divider, Switch, FormControlLabel } from '@mui/material';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [targetWeight, setTargetWeight] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [startWeight, setStartWeight] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [importFile, setImportFile] = useState(null);
    const [reminderEnabled, setReminderEnabled] = useState(false);

    const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${backendApiUrl}/goals`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGoals(response.data.goals || []);
        } catch (err) {
            setError('Failed to load goals');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${backendApiUrl}/goals`, {
                target_weight: parseFloat(targetWeight),
                target_date: targetDate,
                start_weight: parseFloat(startWeight)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchGoals();
            setTargetWeight('');
            setTargetDate('');
            setStartWeight('');
        } catch (err) {
            setError('Failed to add goal');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${backendApiUrl}/export`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const blob = new Blob([response.data.csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'weight_measurements.csv';
            a.click();
        } catch (err) {
            setError('Failed to export data');
        }
    };

    const handleImport = async () => {
        if (!importFile) return;
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', importFile);
        try {
            await axios.post(`${backendApiUrl}/import`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setError('Import completed');
            // Refresh measurements
            window.location.reload();
        } catch (err) {
            setError('Failed to import data');
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Weight Goals
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                <TextField
                    label="Start Weight (kg)"
                    type="number"
                    step="0.01"
                    value={startWeight}
                    onChange={(e) => setStartWeight(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label="Target Weight (kg)"
                    type="number"
                    step="0.01"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label="Target Date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Goal'}
                </Button>
                <FormControlLabel
                    control={<Switch checked={reminderEnabled} onChange={(e) => setReminderEnabled(e.target.checked)} />}
                    label="Enable daily weighing reminders"
                />
            </Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Data Management
                </Typography>
                <Button variant="outlined" onClick={handleExport} sx={{ mr: 2 }}>
                    Export CSV
                </Button>
                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    style={{ display: 'none' }}
                    id="import-file"
                />
                <label htmlFor="import-file">
                    <Button variant="outlined" component="span" sx={{ mr: 2 }}>
                        Select CSV
                    </Button>
                </label>
                {importFile && (
                    <Button variant="contained" onClick={handleImport}>
                        Import
                    </Button>
                )}
            </Box>
            <Typography variant="h6" gutterBottom>
                Your Goals
            </Typography>
            <List>
                {goals.map((goal) => (
                    <div key={goal.id}>
                        <ListItem>
                            <ListItemText
                                primary={`Target: ${goal.target_weight} kg by ${goal.target_date}`}
                                secondary={`Started from: ${goal.start_weight} kg`}
                            />
                        </ListItem>
                        <Divider />
                    </div>
                ))}
            </List>
        </Paper>
    );
};

export default Goals;