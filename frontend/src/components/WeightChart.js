import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts';
import axios from 'axios';
import { Paper, Typography, Grid, Box } from '@mui/material';

const WeightChart = ({ refresh }) => {
    const [data, setData] = useState([]);
    const [changeData, setChangeData] = useState([]);
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
                    // Sort by date
                    const sortedMeasurements = measurements
                        .sort((a, b) => new Date(a.measurement_date) - new Date(b.measurement_date));

                    // Format for weight chart
                    const chartData = sortedMeasurements.map(m => ({
                        date: new Date(m.measurement_date).toLocaleDateString(),
                        weight: m.weight
                    }));
                    setData(chartData);

                    // Calculate weight changes for change chart
                    const changes = [];
                    for (let i = 1; i < sortedMeasurements.length; i++) {
                        const prev = sortedMeasurements[i - 1];
                        const curr = sortedMeasurements[i];
                        const change = curr.weight - prev.weight;
                        changes.push({
                            date: new Date(curr.measurement_date).toLocaleDateString(),
                            change: parseFloat(change.toFixed(2)),
                            period: `${new Date(prev.measurement_date).toLocaleDateString()} to ${new Date(curr.measurement_date).toLocaleDateString()}`
                        });
                    }
                    setChangeData(changes);
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
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Weight Over Time
                        </Typography>
                        <ResponsiveContainer width="100%" height={250}>
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
                    </Box>

                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Weight Change Between Measurements
                        </Typography>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={changeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => [value + ' kg', 'Weight Change']}
                                    labelFormatter={(label) => `Period: ${changeData.find(d => d.date === label)?.period || label}`}
                                />
                                <Legend />
                                <Bar
                                    dataKey="change"
                                    fill="#8884d8"
                                    name="Weight Change"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
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