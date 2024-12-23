import React, { useState } from 'react';
import DisplayMeasurements from '../src/components/DisplayMeasurements';
import AddMeasurement from '../src/components/AddMeasurement';

function App() {
    const [refresh, setRefresh] = useState(false);

    // Trigger a refresh for the DisplayMeasurements component
    const handleAddMeasurement = () => {
        setRefresh(!refresh);  // Toggle the refresh state to trigger re-fetch in DisplayMeasurements
    };

    return (
        <div className="App">
            <h1>Weight Tracker</h1>
            <AddMeasurement onAdd={handleAddMeasurement} />
            <DisplayMeasurements refresh={refresh} />  {/* Pass refresh as a prop */}
        </div>
    );
}

export default App;