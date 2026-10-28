const fs = require('fs');
const path = require('path');

// 1. Resolve your workspace folder path vectors cleanly
const pagesDir = path.resolve(__dirname, '..', 'pages');
const geometriesRootDir = path.resolve(__dirname, '..', '..', 'roads', 'static', 'geometries');

// ====================================================================
// 2. THE MASTER CONFIGURATION MAP: Add any road and its waypoints here!
// ====================================================================
const VALID_ROADS_CONFIG = {
    // US Highways (Matches filenames like 1.php)
    "1": {
        excludeMotorways: true,
        coords: [
            "-81.803889,24.555278",
            "-81.803889,24.555278",
            "-73.902264,40.845208",
            "-67.931667,47.152778",
                "-68.602222,47.248333"
        ]
    },
    // Interstates (Matches filenames like 95.php)
    "95": {
        excludeMotorways: false,
        coords: ["-80.20,25.79", "-74.17,40.73", "-67.79,46.14"]
    },
    // Auxiliary Interstates (Matches filenames like nj-195.php)
    "nj-195": {
        excludeMotorways: false,
        coords: ["-74.74,40.21", "-74.05,40.16"]
    },
    // State Highways (Matches filenames like 184.php)
    "184": {
        excludeMotorways: true,
        coords: ["-74.29,40.52", "-74.26,40.50"]
    },
    // County/Secondary Roads (Matches filenames like 2.php)
    "2": {
        excludeMotorways: true,
        coords: ["-74.03,40.21", "-74.01,40.19"]
    }
};

console.log("====================================================");
console.log("Source Pages Location: " + pagesDir);
console.log("Target Geometries Destination: " + geometriesRootDir);
console.log("====================================================");

async function scanAndGenerate(currentDir, relativeSubFolder = "") {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.join(relativeSubFolder, entry.name);

        if (entry.isDirectory()) {
            await scanAndGenerate(fullPath, relativePath);
        } else if (entry.isFile() && path.extname(entry.name) === '.php') {
            const filename = entry.name.toLowerCase();
            const roadName = path.parse(entry.name).name.toLowerCase(); 

            // Filter Check 1: Skip index, list, and directory structural layout sheets
            if (filename.includes('index') || filename.includes('list')) {
                console.log(`\x1b[33m⏭️  Skipped Layout: ${relativeSubFolder}/${entry.name}\x1b[0m`);
                continue; 
            }

            // Filter Check 2: Skip empty layout sheets to avoid empty data packets
            const fileStats = fs.statSync(fullPath);
            if (fileStats.size === 0) {
                console.log(`\x1b[33m📭 Skipped Empty: ${relativeSubFolder}/${entry.name}\x1b[0m`);
                continue; 
            }

            // ================================================================
            // Filter Check 3: Check if the road exists in our Master List configuration object map
            // ================================================================
            if (!VALID_ROADS_CONFIG[roadName]) {
                console.log(`\x1b[31m❌ Skipped (Not configured in valid master list): ${relativeSubFolder}/${entry.name}\x1b[0m`);
                continue;
            }

            // Load the clean parameter set configuration mapping settings for this specific highway key
            const roadSetup = VALID_ROADS_CONFIG[roadName];
            const coordinatesString = roadSetup.coords.join(';');
            const categoryFolder = relativeSubFolder.toLowerCase().replace(/\\/g, '/'); 
            const targetJsonPath = path.join(geometriesRootDir, categoryFolder, `${roadName}.json`);

            // Inject the custom &exclude=motorway tag dynamically based on the object setup values!
            let osrmUrl = `http://127.0.0{coordinatesString}?overview=full&geometries=geojson`;
            if (roadSetup.excludeMotorways) {
                osrmUrl += '&exclude=motorway';
            }

            try {
                const overpassQuery = `
    [out:json][timeout:90];
    relation["route"="road"]["ref"="${roadName.toUpperCase()}"](24.0,-125.0,50.0,-65.0);
    out geom;
`;

// Target the official high-speed interpreter API endpoint directly
const overpassUrl = `https://kumi.systems{encodeURIComponent(overpassQuery)}`;

try {
    console.log(`📡 Fetching authentic global metadata geometry paths for Route: ${roadName.toUpperCase()}...`);
    
    const response = await fetch(overpassUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'SeychellesHighwayProject/1.0' } // Keeps the connection clean and verified
    });
    
    const data = await response.json();

    // Overpass formats its geometry inside elements[0].members array blocks
    if (data.elements && data.elements.length > 0) {
        
        // Convert the structural Overpass payload directly into a standard Leaflet-ready GeoJSON format!
        const geojson = {
            type: "FeatureCollection",
            features: data.elements.map(element => ({
                type: "Feature",
                properties: { name: roadName, type: element.tags.ref },
                geometry: {
                    type: "LineString",
                    // Gather the exact nodes and coordinates of the road footprint automatically
                    coordinates: element.geometry ? element.geometry.map(pt => [pt.lon, pt.lat]) : []
                }
            })).filter(f => f.geometry.coordinates.length > 0)
        };

        const targetDir = path.dirname(targetJsonPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.writeFileSync(targetJsonPath, JSON.stringify(geojson, null, 2));
        console.log(`\x1b[32m✅ Flawlessly Mapped and Saved: /static/geometries/${categoryFolder}/${roadName}.json\x1b[0m`);
    } else {
        throw new Error("No real-world metadata paths matched this route number identifier inside the data tables.");
    }
} catch (error) {
    console.error(`\x1b[31m❌ Overpass API extraction failed for ${roadName}: ${error.message}\x1b[0m`);
}
            } catch (error) {
                console.error(`\x1b[31m⚠️ OSRM query failed for ${roadName}, skipping map asset creation.\x1b[0m`);
            }
        }
    }
}

scanAndGenerate(pagesDir).then(() => {
    console.log("\n\x1b[36m🏁 Data matrix architecture extraction pass completed fully!\x1b[0m\n");
});