import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { Paper, Typography } from '@mui/material';

const WeightChart = ({ refresh }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = () => {
            const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8000';
            axios.get(`${backendApiUrl}/measurements`)
                .then(response => {
                    const measurements = response.data.measurements || [];
                    // Sort by date and format for chart
                    const sortedData = measurements
                        .sort((a, b) => new Date(a.measurement_date) - new Date(b.measurement_date))
                        .map(m => ({
                            date: new Date(m.measurement_date).toLocaleDateString(),
                            weight: m.weight,
                            user: m.name
                        }));
                    setData(sortedData);
                })
                .catch(error => {
                    console.error('Error fetching data for chart:', error);
                });
        };

        fetchData();
    }, [refresh]);

    return (
        <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
                Weight Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default WeightChart;