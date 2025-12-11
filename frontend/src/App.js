import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DisplayMeasurements from '../src/components/DisplayMeasurements';
import AddMeasurement from '../src/components/AddMeasurement';
import WeightChart from '../src/components/WeightChart';
import Goals from '../src/components/Goals';
import Login from '../src/components/Login';
import Signup from '../src/components/Signup';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    const [refresh, setRefresh] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleSignup = () => {
        setTabValue(0); // Switch to login after signup
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    // Trigger a refresh for the DisplayMeasurements component
    const handleAddMeasurement = () => {
        setRefresh(!refresh);  // Toggle the refresh state to trigger re-fetch in DisplayMeasurements
    };

    if (!isLoggedIn) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Container maxWidth="sm" sx={{ py: 4 }}>
                    <Typography variant="h3" component="h1" gutterBottom align="center">
                        Weight Tracker
                    </Typography>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                            <Tab label="Login" />
                            <Tab label="Sign Up" />
                        </Tabs>
                    </Box>
                    {tabValue === 0 && <Login onLogin={handleLogin} />}
                    {tabValue === 1 && <Signup onSignup={handleSignup} />}
                </Container>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h3" component="h1" gutterBottom>
                        Weight Tracker
                    </Typography>
                    <Button variant="outlined" onClick={handleLogout}>
                        Logout
                    </Button>
                </Box>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <AddMeasurement onAdd={handleAddMeasurement} />
                        <Goals />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <WeightChart refresh={refresh} />
                        <DisplayMeasurements refresh={refresh} />
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
}

export default App;