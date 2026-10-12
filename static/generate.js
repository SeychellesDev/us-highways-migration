// Save this as I:\seychelles-hub\us-highways-migration\generator.js
const fs = require('fs');
const path = require('path');

// 1. Path references pointing across your hub environment folders
const jsonPath = path.join(__dirname, 'completed.json');
const frontendOutputDir = path.join(__dirname, '..', '..', 'roads', 'static', 'geometries');

// Ensure the frontend output directory exists
if (!fs.existsSync(frontendOutputDir)){
    fs.mkdirSync(frontendOutputDir, { recursive: true });
}

// 2. Read your highway queue
const rawData = fs.readFileSync(jsonPath, 'utf8');
const roadsToProcess = JSON.parse(rawData); // Assumes ["US 1", "I-95", "NJ Monmouth 2"]

async function generateRouteGeometries() {
    for (const road of roadsToProcess) {
        console.log(`Querying OSRM server profile for highway: ${road}`);
        
        // Replace coordinates below with your route's approximate start and end bounding markers
        // Format: http://localhost:5000/route/v1/driving/startLng,startLat;endLng,endLat?overview=full&geometries=geojson
        const osrmApiUrl = `http://localhost:5000/route/v1/driving/-74.07,40.22;-74.02,40.27?overview=full&geometries=geojson`;
        
        try {
            const response = await fetch(osrmApiUrl);
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                const geometry = data.routes[0].geometry;
                
                // 3. Export the processed route structure clean to your frontend website folder
                const safeFileName = road.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
                fs.writeFileSync(path.join(frontendOutputDir, safeFileName), JSON.stringify(geometry, null, 2));
                console.log(`Successfully migrated ${road} -> front-end: /geometries/${safeFileName}`);
            }
        } catch (error) {
            console.error(`Failed to map routing infrastructure metrics for ${road}:`, error);
        }
    }
}

generateRouteGeometries();