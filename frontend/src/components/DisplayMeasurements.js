import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, Box } from '@mui/material';

const DisplayMeasurements = ({ refresh }) => {
    const [measurements, setMeasurements] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = () => {
            setLoading(true);
            const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            axios.get(`${backendApiUrl}/measurements`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    setMeasurements(response.data.measurements || []);
                    setError(null);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    setError('Failed to load data');
                })
                .finally(() => {
                    setLoading(false);
                });
        };

        fetchData();
    }, [refresh]);

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Weight Measurements
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : measurements.length === 0 ? (
                <Typography>No measurements found.</Typography>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Weight (kg)</TableCell>
                                <TableCell>Notes</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {measurements.map((measurement) => (
                                <TableRow key={measurement.id}>
                                    <TableCell>{measurement.measurement_date}</TableCell>
                                    <TableCell>{measurement.weight}</TableCell>
                                    <TableCell>{measurement.notes}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

export default DisplayMeasurements;
