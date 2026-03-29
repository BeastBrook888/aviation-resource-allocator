import React, { useState, useEffect } from 'react';
import AllocationMap from './AllocationMap';
import './App.css';

function App() {
    const [metrics, setMetrics] = useState({ greedy: null, hungarian: null});
    const [activeView, setActiveView] = useState('none');

    //State to hold our permanent dots
    const [rawData, setRawData] = useState({ trucks: [], flights: [] });
    
    //trigger resize event 200 milliseconds after page loads
    //to prevent map from loading halfway at certain window sizes
    useEffect(() => {
        //get dots once when page first loads
        fetchRawData();

        //force Leaflet to recalculate container size and fill in the gray space
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 200)
    }, []);

    const fetchRawData = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/data");
            const data = await response.json();
            setRawData(data);
        } catch(error) {
            console.error("Error fetching raw data:", error);
        }
    };

    const runAlgorithm = async (type) => {
        try {
            //Call either algorithm
            const response = await fetch(`http://localhost:8000/api/allocate/${type}`)
            const data = await response.json();

            //Update React state with results
            setMetrics(prev => ({ ...prev, [type]: data}))
            setActiveView(type);
        } catch(error) {
            console.error("Error fetching data. Is FastAPI running?", error);
        }
    };

    const generateNewData = async () => {
        try {
            await fetch('http://localhost:8000/api/data/generate', {method: 'POST'});

            //Clear old results from screen
            setMetrics({ greedy: null, hungarian: null});
            setActiveView('none')

            await fetchRawData();

            alert("New data generated! Run algorithms again to see new routes.")
        } catch(error) {
            console.error("Error generating new data:", error)
        }
    };

    //Determines which lines to draw on map based on what user clicked last
    //for warning to show user if greedy and hungarian algorithms
    //output same assignments due to same distances
    const currentAssignments = activeView === 'none' ? [] : metrics[activeView].assignments;
    const distancesMatch = metrics.greedy && metrics.hungarian && (metrics.greedy.total_distance === metrics.hungarian.total_distance);
    return (
        <div style = {{ display: 'flex', flexDirection: 'column', padding: '20px'}}>
            <div style = {{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1 style={{marginBottom: 0}}>Aviation Resource Allocation Engine</h1>
                <button
                    onClick = {generateNewData}
                    style={{padding:'10px 20px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight:'bold'}}>
                    Generate New Data
                </button>
            </div>

            <div>
                <h3 style={{marginTop:'5px', marginBottom: 0}}>by Colin Rondon, UC Berkeley Data Science '26, former NASA Ames Data Science intern</h3>
                <p style={{marginTop: '5px'}}>Map the flights at the SFO airport to the "best" fuel truck using the buttons below</p>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                <div style = {{ height:'310px', width:'55%', marginBottom:'5px', marginBottom: '20px', border:'2px solid #ccc'}}>
                    <AllocationMap rawData={rawData} assignments={currentAssignments}/> 
                </div>

                <div style = {{height:'310px', width: '35%', border: '1px solid #ccc', padding: '10px', backgroundColor: '#fdfdfd'}}>
                        <p>Notes:</p>
                        <p>Red dots = Flights</p>
                        <p>Green dots = Trucks</p>
                        <p>Hover over a dot to see its label</p>
                        {distancesMatch && (
                            <div style = {{backgroundColor: "#fff3cd", color: "#856404", borderRadius: '5px', border: '1px solid #ffeeba'}}>
                                <strong>Warning:</strong> The assignments did not change because the 2 algorithms found solutions with the exact same total distance! Click <strong>"Generate New Data"</strong> to test the algorithms on a different scenario.
                            </div>
                        )}
                </div>
            </div>

            {/* Algorithm Comparison Panels */}
            <div style = {{display: 'flex', justifyContent: 'space-between'}}>
                <div style = {{width: '45%', border: '1px solid #ccc', padding: '10px'}}>
                    <h2 style = {{ marginTop: 0 }}>Greedy Algorithm</h2>
                    <ul style = {{ listStyleType: 'none', padding: 0, lineHeight: '1.6'}}>
                        <li><strong>Total Distance:</strong> {metrics.greedy ? metrics.greedy.total_distance.toFixed(4) : '???'}</li>
                        <li><strong>Average Distance:</strong> {metrics.greedy ? metrics.greedy.avg_distance.toFixed(4) : '???'}</li>
                        <li><strong>Worst-Case (Max Distance):</strong> <span style = {{color: "#d9534f", fontWeight: "bold"}}>{metrics.greedy ? metrics.greedy.max_distance.toFixed(4) : '???'}</span></li>
                        <li><strong>Execution Time: </strong>{metrics.greedy ? `${metrics.greedy.execution_time_ms.toFixed(4)} ms` : '???'}</li>
                    </ul>
                    <button onClick = {() => runAlgorithm('greedy')}>Run Greedy</button>
                </div>

                <div style = {{width: '45%', border: '1px solid #ccc', padding: '10px'}}>
                <h2 style = {{ marginTop: 0 }}>Hungarian Algorithm</h2>
                    <ul style = {{ listStyleType: 'none', padding: 0, lineHeight: '1.6'}}>
                        <li><strong>Total Distance:</strong> {metrics.hungarian ? metrics.hungarian.total_distance.toFixed(4) : '???'}</li>
                        <li><strong>Average Distance:</strong> {metrics.hungarian ? metrics.hungarian.avg_distance.toFixed(4) : '???'}</li>
                        <li><strong>Worst-Case (Max Distance):</strong> <span style = {{color: "#d9534f", fontWeight: "bold"}}>{metrics.hungarian ? metrics.hungarian.max_distance.toFixed(4) : '???'}</span></li>
                        <li><strong>Execution Time: </strong>{metrics.hungarian ? `${metrics.hungarian.execution_time_ms.toFixed(4)} ms` : '???'}</li>
                    </ul>
                    <button onClick = {() => runAlgorithm('hungarian')}>Run Hungarian</button>
                </div>
            </div>
        </div>
    );
}

export default App;