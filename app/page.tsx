// app/page.tsx
'use client';

import { useState } from 'react';
import './styles.css';

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

// Helper functions to generate year, month, and day options
const generateYears = () => {
  const years = [];
  for (let i = 2018; i <= 2023; i++) {
    years.push(i);
  }
  return years;
};

const generateMonths = () => {
  return [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
};

const generateDays = () => {
  const days = [];
  for (let i = 1; i <= 31; i++) {
    days.push(i < 10 ? `0${i}` : `${i}`); // Add leading zero for single digits
  }
  return days;
};

const AccidentQueryPage = () => {
  // State for date selections
  const [startYear, setStartYear] = useState('2018');
  const [startMonth, setStartMonth] = useState('01');
  const [startDay, setStartDay] = useState('01');
  
  const [endYear, setEndYear] = useState('2023');
  const [endMonth, setEndMonth] = useState('12');
  const [endDay, setEndDay] = useState('31');

  // State for county
  const [county, setCounty] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Track the expanded item
  const [expanded, setExpanded] = useState<number | null>(null);

  // Combine the dropdown values into a single date string (YYYY-MM-DD)
  const buildDate = (year, month, day) => `${year}-${month}-${day}`;

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Reset error

    const startDate = buildDate(startYear, startMonth, startDay);
    const endDate = buildDate(endYear, endMonth, endDay);

    // Construct the base query URL
    let queryUrl = `http://localhost:8000/api/accidents/?start_date=${startDate}&end_date=${endDate}&county=${county}`;
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

    // Function to toggle expansion of a specific data point
    const toggleExpand = (index: number) => {
      setExpanded(expanded === index ? null : index); // Collapse if already expanded
    };


    return (
      <div>
        <h1>Accident Query Form</h1>
        <form onSubmit={handleSubmit}>
          {/* Start Date */}
          <div className="form-group">
            <label>Start Date:</label>
            <select value={startYear} onChange={(e) => setStartYear(e.target.value)}>
              {[2018, 2019, 2020, 2021, 2022, 2023].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select value={startDay} onChange={(e) => setStartDay(e.target.value)}>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
    
          {/* End Date */}
          <div className="form-group">
            <label>End Date:</label>
            <select value={endYear} onChange={(e) => setEndYear(e.target.value)}>
              {[2018, 2019, 2020, 2021, 2022, 2023].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select value={endMonth} onChange={(e) => setEndMonth(e.target.value)}>
              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select value={endDay} onChange={(e) => setEndDay(e.target.value)}>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
    
          {/* County */}
          <div className="form-group">
            <label>County:</label>
            <select value={county} onChange={(e) => setCounty(e.target.value)}>
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
    
        <div className="results-container">
          <h2>Results:</h2>
          {results.length > 0 ? (
            <ul>
              {results.map((result: any, index) => (
                <li key={index} className="result-box" onClick={() => toggleExpand(index)} style={{ cursor: 'pointer' }}>
                  <p>
                    <strong>Date:</strong> {result.collision_date}
                    <br />
                    <strong>Location:</strong> {result.location.city}, {result.location.county}
                    <br />
                    <strong>Severity:</strong> {result.severity.collision_severity}
                  </p>
    
                  {/* Conditionally render more details if this item is expanded */}
                  {expanded === index && (
                    <div className="expanded-details">
                      <h3>Location Details</h3>
                      <p><strong>Primary Road:</strong> {result.location.primary_rd}</p>
                      <p><strong>Secondary Road:</strong> {result.location.secondary_rd}</p>
                      <p><strong>City:</strong> {result.location.city}</p>
                      <p><strong>County:</strong> {result.location.county}</p>
                      <p><strong>Point X:</strong> {result.location.point_x}</p>
                      <p><strong>Point Y:</strong> {result.location.point_y}</p>
    
                      <h3>Severity Details</h3>
                      <p><strong>Collision Severity:</strong> {result.severity.collision_severity}</p>
                      <p><strong>Number Killed:</strong> {result.severity.number_killed}</p>
                      <p><strong>Number Injured:</strong> {result.severity.number_injured}</p>
                      <p><strong>Severe Injuries:</strong> {result.severity.count_severe_inj}</p>
                      <p><strong>Visible Injuries:</strong> {result.severity.count_visible_inj}</p>
                      <p><strong>Complaint of Pain Injuries:</strong> {result.severity.count_complaint_pain}</p>
    
                      <h3>Accident Details</h3>
                      <p><strong>Accident Year:</strong> {result.accident_year}</p>
                      <p><strong>Collision Time:</strong> {result.collision_time}</p>
                      <p><strong>Type of Collision:</strong> {result.type_of_collision}</p>
                      <p><strong>Hit and Run:</strong> {result.hit_and_run === 'Y' ? 'Yes' : 'No'}</p>
                      <p><strong>Pedestrian Involved:</strong> {result.pedestrian_accident === 'Y' ? 'Yes' : 'No'}</p>
                      <p><strong>Bicycle Involved:</strong> {result.bicycle_accident === 'Y' ? 'Yes' : 'No'}</p>
                      <p><strong>Motorcycle Involved:</strong> {result.motorcycle_accident === 'Y' ? 'Yes' : 'No'}</p>
                      <p><strong>Truck Involved:</strong> {result.truck_accident === 'Y' ? 'Yes' : 'No'}</p>
                      <p><strong>Alcohol Involved:</strong> {result.alcohol_involved === 'Y' ? 'Yes' : 'No'}</p>
    
                      <h3>Environment Details</h3>
                      <p><strong>Weather 1:</strong> {result.environment.weather_1}</p>
                      <p><strong>Weather 2:</strong> {result.environment.weather_2}</p>
                      <p><strong>Road Surface:</strong> {result.environment.road_surface}</p>
                      <p><strong>Lighting:</strong> {result.environment.lighting}</p>
                      <p><strong>State Highway Indicator:</strong> {result.environment.state_hwy_ind}</p>
    
                      <h3>Party Details</h3>
                      {result.parties && result.parties.length > 0 ? (
                        result.parties.map((party: any, idx: number) => (
                          <div key={idx}>
                            <p><strong>Party Number:</strong> {party.party_number}</p>
                            <p><strong>Party Type:</strong> {party.party_type}</p>
                            <p><strong>At Fault:</strong> {party.at_fault === 'Y' ? 'Yes' : 'No'}</p>
                            <p><strong>Party Age:</strong> {party.party_age}</p>
                            <p><strong>Party Sex:</strong> {party.party_sex}</p>
                          </div>
                        ))
                      ) : (
                        <p>No party data available for this accident.</p>
                      )}
    
                      <h3>Victim Details</h3>
                      {result.victims && result.victims.length > 0 ? (
                        result.victims.map((victim: any, idx: number) => (
                          <div key={idx}>
                            <p><strong>Victim Role:</strong> {victim.victim_role}</p>
                            <p><strong>Victim Age:</strong> {victim.victim_age}</p>
                            <p><strong>Victim Sex:</strong> {victim.victim_sex}</p>
                            <p><strong>Degree of Injury:</strong> {victim.victim_degree_of_injury}</p>
                          </div>
                        ))
                      ) : (
                        <p>No victim data available for this accident.</p>
                      )}
                    </div>
                  )}
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