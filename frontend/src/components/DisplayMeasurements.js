import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DisplayMeasurements = ({ refresh }) => {
    const [measurements, setMeasurements] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = () => {
            const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL;
            console.log('Backend URL:', backendApiUrl)
            axios.get(`${backendApiUrl}/measurements`)
                .then(response => {
                    console.log('Response data:', response.data);
                    setMeasurements(response.data.measurements || []);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    setError('Failed to load data');
                });
        };

        fetchData();  // Fetch the data on initial mount or when `refresh` changes
    }, [refresh]);  // Re-fetch when `refresh` changes

    return (
        <div>
            <h2>Weight Measurements</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {measurements.length === 0 ? (
                <p>No measurements found.</p>
            ) : (
                <table border="1">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Date</th>
                            <th>Weight (kg)</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {measurements.map((measurement, index) => (
                            <tr key={index}>
                                <td>{measurement.name}</td>
                                <td>{measurement.measurement_date}</td>
                                <td>{measurement.weight}</td>
                                <td>{measurement.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default DisplayMeasurements;
