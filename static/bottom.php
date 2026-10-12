
<?php include "endtable.php"; ?>
        </div>
        <div class="footer"></div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
        <script>
            const fullUrlPath = window.location.pathname;
            let cleanPath = fullUrlPath.replace(/^\/roads\//i, '').replace(/\.html$/i, '');
            const currentRoadFile = "geometries/" + cleanPath.toLowerCase() + '.json';

            console.log("Dynamically resolved geometry file tracking path: " + currentRoadFile);
            const map = L.map('highway-map').setView([40.0, -74.5], 7);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            fetch(`/roads/static/geometries/${currentRoadFile}`)
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