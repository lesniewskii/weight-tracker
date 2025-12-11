import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import DisplayMeasurements from '../src/components/DisplayMeasurements';
import AddMeasurement from '../src/components/AddMeasurement';
import WeightChart from '../src/components/WeightChart';

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

    // Trigger a refresh for the DisplayMeasurements component
    const handleAddMeasurement = () => {
        setRefresh(!refresh);  // Toggle the refresh state to trigger re-fetch in DisplayMeasurements
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    Weight Tracker
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <AddMeasurement onAdd={handleAddMeasurement} />
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