import React, { useState } from 'react';
import axios from 'axios';

const AddMeasurement = ({ onAdd }) => {
    const [userId, setUserId] = useState('');
    const [measurementDate, setMeasurementDate] = useState('');
    const [weight, setWeight] = useState('');
    const [notes, setNotes] = useState('');

    const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8000/measurements';
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newMeasurement = { 
            user_id: parseInt(userId), 
            measurement_date: measurementDate, 
            weight: parseFloat(weight), 
            notes 
        };

        try {
            await axios.post(`${backendApiUrl}/measurements`, newMeasurement);
            onAdd(); // Refresh measurements after adding
            setUserId('');
            setMeasurementDate('');
            setWeight('');
            setNotes('');
        } catch (error) {
            console.error('Error adding measurement:', error);
        }
    };

    return (
        <div>
            <h2>Add New Weight Measurement</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>User ID:</label>
                    <input 
                        type="number" 
                        value={userId} 
                        onChange={(e) => setUserId(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Measurement Date:</label>
                    <input 
                        type="date" 
                        value={measurementDate} 
                        onChange={(e) => setMeasurementDate(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Weight (kg):</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        value={weight} 
                        onChange={(e) => setWeight(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Notes:</label>
                    <textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                    />
                </div>
                <button type="submit">Add Measurement</button>
            </form>
        </div>
    );
};

export default AddMeasurement;
