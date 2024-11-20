import React, { useState } from 'react';
import DisplayMeasurements from '../weight-tracker-app/src/components/DisplayMeasurements';
import AddMeasurement from '../weight-tracker-app/src/components/AddMeasurement';

function App() {
    const [refresh, setRefresh] = useState(false);

    // Trigger a refresh for the DisplayMeasurements component
    const handleAddMeasurement = () => {
        setRefresh(!refresh);
    };

    return (
        <div className="App">
            <h1>Weight Tracker</h1>
            <AddMeasurement onAdd={handleAddMeasurement} />
            <DisplayMeasurements key={refresh} />
        </div>
    );
}

export default App;