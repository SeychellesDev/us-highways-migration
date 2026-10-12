
<?php include "endtable.php"; ?>
        </div>
        <div class="footer"></div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
        <script>
            const fullUrlPath = window.location.pathname;
            let cleanPath = fullUrlPath.replace(/^\/roads\//i, '').replace(/\.html$/i, '');
            const isLiveServer = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
            const basePrefix = isLiveServer ? '' : '/roads';
            if (!isLiveServer) cleanPath = cleanPath.replace(/^\/roads\//i, '');
            else cleanPath = cleanPath.replace(/^\//, '');
            if (cleanPath === '' || cleanPath === 'index') cleanPath = 'index';
            const currentRoadFile = cleanPath.toLowerCase() + '.json';
            const targetFetchUrl = `${basePrefix}/static/geometries/${currentRoadFile}`;
            console.log("Dynamically resolved geometry file tracking path: " + currentRoadFile);
            console.log("Active Host Domain:", window.location.hostname);
            console.log("Attempting to load asset path:", targetFetchUrl);
            const map = L.map('highway-map').setView([40.0, -74.5], 7);
            document.getElementById('map-fallback-text').style.display = 'none';
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            fetch(targetFetchUrl)
                .then(response => {
                    if (!response.ok) throw new Error('Geometry tracking asset not found.');
                    return response.json();
                })
                .then(geoJsonData => {
                    const routeLine = L.geoJSON(geoJsonData, {
                        style: {
                            color: '#ff3b30', // Bold red highway line
                            weight: 5,        // Thickness
                            opacity: 0.85
                        }
                    }).addTo(map);
                    map.fitBounds(routeLine.getBounds());
                })
                .catch(error => {
                    console.error('Error rendering highway track infrastructure:', error);
                    document.getElementById('highway-map').innerHTML = 
                        '<p style="padding: 20px; color: #ff3b30; font-weight: bold;">Map geometry path could not be loaded.</p>';
                });
        </script>
    </body>
</html>