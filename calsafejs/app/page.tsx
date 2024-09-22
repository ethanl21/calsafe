// app/page.tsx

'use client';

import { useState } from 'react';

// List of Southern California counties
const southernCaliforniaCounties = [
  'San Luis Obispo',
  'Kern',
  'San Bernardino',
  'Ventura',
  'Los Angeles',
  'Orange',
  'Riverside',
  'San Diego',
  'Imperial',
];

const AccidentQueryPage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [county, setCounty] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Reset error

    // Construct the base query URL
    let queryUrl = `http://localhost:8000/api/accidents/?`;
    const params = [];

    // Only add query parameters if they exist
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (county) params.push(`county=${county}`);

    // Join the parameters with '&' and append to the base URL
    queryUrl += params.join('&');

    // Log the constructed query URL for debugging
    console.log("Query URL:", queryUrl);

    try {
        const response = await fetch(queryUrl);

        // Handle 404 errors
        if (response.status === 404) {
            setError('No accident data found for the specified query.');
            setResults([]);
            return;
        }

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setResults(data);
    } catch (err) {
        setError('An error occurred while fetching the data.');
        console.error("Fetch error:", err);
    } finally {
        setLoading(false); // Stop loading spinner
    }
};




  return (
    <div>
      <h1>Accident Query Form</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label>County:</label>
          <select
            value={county}
            onChange={(e) => setCounty(e.target.value)}
          >
            <option value="">Select a county</option>
            {southernCaliforniaCounties.map((countyName) => (
              <option key={countyName} value={countyName}>
                {countyName}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <h2>Results:</h2>
        {results.length > 0 ? (
          <ul>
            {results.map((result: any, index) => (
              <li key={index}>
                <p>
                  <strong>Date:</strong> {result.collision_date}
                  <br />
                  <strong>Location:</strong> {result.location.city}, {result.location.county}
                  <br />
                  <strong>Severity:</strong> {result.severity.collision_severity}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p>No results found for the specified query.</p>
        )}
      </div>
    </div>
  );
};

export default AccidentQueryPage;

