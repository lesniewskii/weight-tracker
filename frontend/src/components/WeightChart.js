import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import axios from 'axios';
import { Paper, Typography, Grid, Box } from '@mui/material';

const WeightChart = ({ refresh }) => {
    const [data, setData] = useState([]);
    const [trends, setTrends] = useState({});
    const [goals, setGoals] = useState([]);

    useEffect(() => {
        const fetchData = () => {
            const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://backend:8000';
            const token = localStorage.getItem('token');

            // Fetch measurements
            axios.get(`${backendApiUrl}/measurements`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    const measurements = response.data.measurements || [];
                    // Sort by date and format for chart
                    const sortedData = measurements
                        .sort((a, b) => new Date(a.measurement_date) - new Date(b.measurement_date))
                        .map(m => ({
                            date: new Date(m.measurement_date).toLocaleDateString(),
                            weight: m.weight
                        }));
                    setData(sortedData);
                })
                .catch(error => {
                    console.error('Error fetching data for chart:', error);
                });

            // Fetch trends
            axios.get(`${backendApiUrl}/trends`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    setTrends(response.data.trends || {});
                })
                .catch(error => {
                    console.error('Error fetching trends:', error);
                });

            // Fetch goals
            axios.get(`${backendApiUrl}/goals`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    setGoals(response.data.goals || []);
                })
                .catch(error => {
                    console.error('Error fetching goals:', error);
                });
        };

        fetchData();
    }, [refresh]);

    return (
        <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
                Weight Trend & Goals
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} />
                            {goals.map((goal, index) => (
                                <ReferenceLine
                                    key={goal.id}
                                    y={goal.target_weight}
                                    stroke="#ff7300"
                                    strokeDasharray="5 5"
                                    label={{ value: `Goal: ${goal.target_weight}kg`, position: "topRight" }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box>
                        <Typography variant="h6">Trends</Typography>
                        <Typography>Average Weight: {trends.average_weight || 'N/A'} kg</Typography>
                        <Typography>BMI: {trends.bmi || 'N/A'}</Typography>
                        <Typography>Trend Slope: {trends.trend_slope || 'N/A'} kg/measurement</Typography>
                        <Typography>Total Measurements: {trends.total_measurements || 0}</Typography>
                        <Typography>Current Streak: {trends.current_streak || 0} days</Typography>
                        <Typography>Date Range: {trends.date_range || 'N/A'}</Typography>
                        <Typography variant="h6" sx={{ mt: 2 }}>Goals</Typography>
                        {goals.length > 0 ? (
                            goals.map(goal => (
                                <Typography key={goal.id}>
                                    Target: {goal.target_weight}kg by {goal.target_date}
                                </Typography>
                            ))
                        ) : (
                            <Typography>No goals set</Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default WeightChart;