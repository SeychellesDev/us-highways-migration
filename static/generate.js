// osrm-routed --algorithm mld ./osrm/us-highways-only.osrm
// node .\us-highways-migration\static\generate.js

const fs = require('fs');
const path = require('path');

const pagesDir = path.resolve(__dirname, '..', 'pages');
const geometriesRootDir = path.resolve(__dirname, '..', '..', 'roads', 'static', 'geometries');

console.log("Looking for source templates inside: " + pagesDir);
console.log("Outputting sorted JSON models out to: " + geometriesRootDir);

console.log("Syncing geometry folder matrices with local OSRM server engine...");

async function scanAndGenerate(currentDir, relativeSubFolder = "") {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.join(relativeSubFolder, entry.name);

        if (entry.isDirectory()) {
            await scanAndGenerate(fullPath, relativePath);
        } else if (entry.isFile() && path.extname(entry.name) === '.php') {
            const roadName = path.parse(entry.name).name; 
            const categoryFolder = relativeSubFolder.toLowerCase().replace(/\\/g, '/'); 
            if(entry.name.includes('index') || entry.name.includes('list')){
                // console.log(`Skipping index or list file: ${entry.name}`);
                continue;
            }
            const fileStats = fs.statSync(fullPath);
            if (fileStats.size === 0) {
                // console.log(`Skipping empty page template: ${relativeSubFolder}/${entry.name}`);
                continue; // Instantly advances to the next file in your queue
            }
            // Mirror the exact file tree layout
            const targetJsonPath = path.join(geometriesRootDir, categoryFolder, `${roadName.toLowerCase()}.json`);

            // Check if this road needs custom coordinate boxes (Format: Lng,Lat)
            // Defaulting to a safe central mid-atlantic highway tracking box as fallback
            let coordinates = "-74.07,40.22;-74.02,40.27"; 

            // Custom coordinate lookups to ensure maps pinpoint reality
            if (roadName.toLowerCase() === '1') coordinates = [
                "-81.803889,24.555278", // mile 0 
                "-80.198777,25.753784", // miami, fl
                "-80.188884,25.770932", // miami, fl
                "-73.90379519387754,40.84454039141515", // new york, ny
                "-67.931667,47.152778", // van buren, me
                "-68.602222,47.248333"  // mile final
             ].join(';'); // Full US-1 tracking bounds
            if (roadName.toLowerCase() === '95') coordinates = "-80.20,25.79;-67.79,46.14"; // Full I-95 tracking bounds
            if (roadName.toLowerCase() === 'nj-195') coordinates = "-74.74,40.21;-74.05,40.16"; // NJ I-195 bounds
            if (roadName.toLowerCase() === '184') coordinates = "-74.29,40.52;-74.26,40.50"; // NJ-184 bounds
            if (roadName.toLowerCase() === '2') coordinates = "-74.03,40.21;-74.01,40.19"; // Monmouth CR-2 bounds

            const osrmUrl = `http://127.0.0.1:5000/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

            try {
                const response = await fetch(osrmUrl);
                const data = await response.json();

                if (data.routes && data.routes.length > 0) {
                    const geometry = data.routes[0].geometry;

                    // Build missing subdirectories safely
                    const targetDir = path.dirname(targetJsonPath);
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                    }

                    fs.writeFileSync(targetJsonPath, JSON.stringify(geometry, null, 2));
                    console.log(`Generated: /static/geometries/${categoryFolder}/${roadName.toLowerCase()}.json`);
                } else {
                    console.log(`OSRM returned empty route tracking bounds for: ${roadName}`);
                }
            } catch (error) {
                console.error(`OSRM connection failure on route ${roadName}:`, error.message);
                const fallbackLine = {
                    type: "Feature",
                    properties: { name: roadName },
                    geometry: { 
                        type: "LineString", 
                        coordinates: [[-74.07, 40.22], [-74.02, 40.27]] 
                    }
                };

                const targetDir = path.dirname(targetJsonPath);
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                fs.writeFileSync(targetJsonPath, JSON.stringify(fallbackLine, null, 2));
                console.log(`Saved Fallback: /static/geometries/${categoryFolder}/${roadName.toLowerCase()}.json`);
            }
        }
    }
}

scanAndGenerate(pagesDir).then(() => {
    console.log("All infrastructure track files updated successfully!");
});