// var map = L.map('map', {
//         center: [51.505, -0.09],
//         zoom: 13
//     });

//     // 2. Add the free OpenStreetMap tile view layer
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         maxZoom: 19,
//         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     }).addTo(map);

//     // 3. Drop the marker pin
//     const marker = L.marker([51.505, -0.09]).addTo(map);
// Safety Check: Only run the map code if the 'coordinates' variable was handed off from EJS
if (typeof coordinates !== 'undefined') {
    
    // Extract the dynamic coordinates (GeoJSON is [longitude, latitude])
    const lng = coordinates[0];
    const lat = coordinates[1];

    // Initialize the map with the real coordinates
    var map = L.map('map', {
        center: [lat, lng], // Leaflet expects [latitude, longitude]
        zoom: 11
    });

    // Add the visual tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Drop the marker pin at the exact location
    const marker = L.marker([lat, lng]).addTo(map);

    // Add the popup with the real listing title
    marker.bindPopup(`<h4>${listingTitle}</h4><p>Exact location provided after booking.</p>`).openPopup();
}