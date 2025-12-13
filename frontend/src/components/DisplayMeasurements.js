import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const DisplayMeasurements = ({ refresh }) => {
    const [measurements, setMeasurements] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editDialog, setEditDialog] = useState({ open: false, measurement: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, measurement: null });
    const [editForm, setEditForm] = useState({ measurement_date: '', weight: '', notes: '' });

    const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://backend:8000';
    const token = localStorage.getItem('token');

    const fetchData = () => {
        setLoading(true);
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

    useEffect(() => {
        fetchData();
    }, [refresh]);

    const handleEdit = (measurement) => {
        setEditForm({
            measurement_date: measurement.measurement_date,
            weight: measurement.weight.toString(),
            notes: measurement.notes
        });
        setEditDialog({ open: true, measurement });
    };

    const handleEditSubmit = async () => {
        try {
            await axios.put(`${backendApiUrl}/measurements/${editDialog.measurement.id}`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditDialog({ open: false, measurement: null });
            fetchData(); // Refresh the list
        } catch (error) {
            console.error('Error updating measurement:', error);
            setError('Failed to update measurement');
        }
    };

    const handleDelete = (measurement) => {
        setDeleteDialog({ open: true, measurement });
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`${backendApiUrl}/measurements/${deleteDialog.measurement.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeleteDialog({ open: false, measurement: null });
            fetchData(); // Refresh the list
        } catch (error) {
            console.error('Error deleting measurement:', error);
            setError('Failed to delete measurement');
        }
    };

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
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {measurements.map((measurement) => (
                                <TableRow key={measurement.id}>
                                    <TableCell>{measurement.measurement_date}</TableCell>
                                    <TableCell>{measurement.weight}</TableCell>
                                    <TableCell>{measurement.notes}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEdit(measurement)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(measurement)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, measurement: null })}>
                <DialogTitle>Edit Measurement</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Measurement Date"
                        type="date"
                        value={editForm.measurement_date}
                        onChange={(e) => setEditForm({ ...editForm, measurement_date: e.target.value })}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Weight (kg)"
                        type="number"
                        step="0.01"
                        value={editForm.weight}
                        onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Notes"
                        multiline
                        rows={3}
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog({ open: false, measurement: null })}>Cancel</Button>
                    <Button onClick={handleEditSubmit} variant="contained">Update</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, measurement: null })}>
                <DialogTitle>Delete Measurement</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the measurement from {deleteDialog.measurement?.measurement_date}?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, measurement: null })}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default DisplayMeasurements;
