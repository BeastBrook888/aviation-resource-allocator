import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip} from 'react-leaflet';
import 'leaflet/dist/leaflet.css'

function AllocationMap( {rawData, assignments }) {
    const airportCenter = [37.621, -122.379]

    //State to control when lines appear 
    //(have dots on map and only lines appear when algorithms run)
    const [showLines, setShowLines] = useState(false);

    useEffect(() => {
        //Hide lines immediately when new data comes in
        setShowLines(false);

        //if we have actual assignment data, wait 1 second, then show the lines
        if (assignments && assignments.length > 0) {
            const timer = setTimeout(() => {
                setShowLines(true);
            }, 1000);

            //clean up timer if component unmounts or data changes quickly
            return () => clearTimeout(timer)
        }
    }, [assignments])

    return (
        <MapContainer center = {airportCenter} zoom={14} style= {{height: '100%', width: '100%'}}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Layer 1: Fuel Truck Markers */}
            {rawData.trucks && rawData.trucks.map((truck) => (
                <CircleMarker key={`truck-${truck.id}`} center = {truck.loc} radius = {8} color="green" fillColor = "green" fillOpacity = {0.8}>
                    <Tooltip>Fuel Truck #{truck.id + 1}</Tooltip>
                </CircleMarker>
            ))}

            {/* Layer 2: Flight Markers */}
            {rawData.flights && rawData.flights.map((flight) => (
                <CircleMarker key={`flight-${flight.id}`} center = {flight.loc} radius = {8} color="red" fillColor = "red" fillOpacity = {0.8}>
                    <Tooltip>Flight #{flight.id + 1}</Tooltip>
                </CircleMarker>
            ))}

            {/* Layer 3: Assignment Lines (only drawn at algorithm button clicks) */}
            {assignments && assignments.map((assignment, index) => (
                <Polyline 
                    key = {`line-${index}`}
                    positions = {[assignment.truck_loc, assignment.flight_loc]}
                    color = "blue"
                    weight = {3}
                    dashArray = "5, 10"
                />
            ))}

        </MapContainer>
    );
}

export default AllocationMap;