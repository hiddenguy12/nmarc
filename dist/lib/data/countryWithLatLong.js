"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.countryCoordinates = void 0;
exports.calculateDistance = calculateDistance;
exports.getCountriesNearby = getCountriesNearby;
exports.countryCoordinates = [
    { name: "Bangladesh", latitude: 23.6850, longitude: 90.3563 },
    { name: "Afghanistan", latitude: 33.9391, longitude: 67.7100 },
    { name: "Albania", latitude: 41.1533, longitude: 20.1683 },
    { name: "Algeria", latitude: 28.0339, longitude: 1.6596 },
    { name: "Andorra", latitude: 42.5063, longitude: 1.5218 },
    { name: "Angola", latitude: -11.2027, longitude: 17.8739 },
    { name: "Argentina", latitude: -38.4161, longitude: -63.6167 },
    { name: "Armenia", latitude: 40.0691, longitude: 45.0382 },
    { name: "Australia", latitude: -25.2744, longitude: 133.7751 },
    { name: "Austria", latitude: 47.5162, longitude: 14.5501 },
    { name: "Azerbaijan", latitude: 40.1431, longitude: 47.5769 },
    { name: "Bahamas", latitude: 25.0343, longitude: -77.3963 },
    { name: "Bahrain", latitude: 26.0275, longitude: 50.5500 },
    { name: "Belarus", latitude: 53.7098, longitude: 27.9534 },
    { name: "Belgium", latitude: 50.8333, longitude: 4.0000 },
    { name: "Belize", latitude: 17.1899, longitude: -88.4976 },
    { name: "Bhutan", latitude: 27.5142, longitude: 90.4336 },
    { name: "Bolivia", latitude: -16.2902, longitude: -63.5887 },
    { name: "Botswana", latitude: -22.3285, longitude: 24.6849 },
    { name: "Brazil", latitude: -14.2350, longitude: -51.9253 },
    { name: "Brunei", latitude: 4.5353, longitude: 114.7277 },
    { name: "Bulgaria", latitude: 42.7339, longitude: 25.4858 },
    { name: "Cambodia", latitude: 12.5657, longitude: 104.9910 },
    { name: "Cameroon", latitude: 7.3697, longitude: 12.3547 },
    { name: "Canada", latitude: 56.1304, longitude: -106.3468 },
    { name: "Chile", latitude: -35.6751, longitude: -71.5430 },
    { name: "China", latitude: 35.8617, longitude: 104.1954 },
    { name: "Colombia", latitude: 4.5709, longitude: -74.2973 },
    { name: "Costa Rica", latitude: 9.7489, longitude: -83.7534 },
    { name: "Croatia", latitude: 45.1000, longitude: 15.2000 },
    { name: "Cuba", latitude: 22.0000, longitude: -79.5000 },
    { name: "Cyprus", latitude: 35.1264, longitude: 33.4299 },
    { name: "Czech Republic", latitude: 49.8175, longitude: 15.4730 },
    { name: "Denmark", latitude: 56.2639, longitude: 9.5018 },
    { name: "Dominican Republic", latitude: 18.7357, longitude: -70.1627 },
    { name: "Ecuador", latitude: -1.8312, longitude: -78.1834 },
    { name: "Egypt", latitude: 26.8206, longitude: 30.8025 },
    { name: "El Salvador", latitude: 13.7942, longitude: -88.8965 },
    { name: "Estonia", latitude: 59.4370, longitude: 24.7536 },
    { name: "Ethiopia", latitude: 9.1450, longitude: 40.4897 },
    { name: "Fiji", latitude: -17.7134, longitude: 178.0650 },
    { name: "Finland", latitude: 61.9241, longitude: 25.7482 },
    { name: "France", latitude: 46.2276, longitude: 2.2137 },
    { name: "Georgia", latitude: 42.3154, longitude: 43.3569 },
    { name: "Germany", latitude: 51.1657, longitude: 10.4515 },
    { name: "Ghana", latitude: 7.9465, longitude: -1.0232 },
    { name: "Greece", latitude: 39.0742, longitude: 21.8243 },
    { name: "Guatemala", latitude: 15.7835, longitude: -90.2307 },
    { name: "Haiti", latitude: 18.9712, longitude: -72.2852 },
    { name: "Honduras", latitude: 15.2000, longitude: -86.2419 },
    { name: "Hungary", latitude: 47.1625, longitude: 19.5033 },
    { name: "Iceland", latitude: 64.9631, longitude: -19.0208 },
    { name: "India", latitude: 20.5937, longitude: 78.9629 },
    { name: "Indonesia", latitude: -0.7893, longitude: 113.9213 },
    { name: "Iran", latitude: 32.4279, longitude: 53.6880 },
    { name: "Iraq", latitude: 33.2232, longitude: 43.6793 },
    { name: "Ireland", latitude: 53.1424, longitude: -7.6921 },
    { name: "Israel", latitude: 31.0461, longitude: 34.8516 },
    { name: "Italy", latitude: 41.8719, longitude: 12.5674 },
    { name: "Jamaica", latitude: 18.1096, longitude: -77.2975 },
    { name: "Japan", latitude: 36.2048, longitude: 138.2529 },
    { name: "Jordan", latitude: 31.2453, longitude: 36.5103 },
    { name: "Kazakhstan", latitude: 48.0196, longitude: 66.9237 },
    { name: "Kenya", latitude: -0.0236, longitude: 37.9062 },
    { name: "Kuwait", latitude: 29.3117, longitude: 47.4818 },
    { name: "Kyrgyzstan", latitude: 41.2044, longitude: 74.7661 },
    { name: "Laos", latitude: 19.8563, longitude: 102.4955 },
    { name: "Latvia", latitude: 56.8796, longitude: 24.6032 },
    { name: "Lebanon", latitude: 33.8547, longitude: 35.8623 },
    { name: "Lithuania", latitude: 55.1694, longitude: 23.8813 },
    { name: "Luxembourg", latitude: 49.8153, longitude: 6.1296 },
    { name: "Madagascar", latitude: -18.7669, longitude: 46.8691 },
    { name: "Malaysia", latitude: 4.2104, longitude: 101.9758 },
    { name: "Maldives", latitude: 3.2028, longitude: 73.2207 },
    { name: "Mali", latitude: 17.5708, longitude: -3.9962 },
    { name: "Malta", latitude: 35.9375, longitude: 14.5001 },
    { name: "Mexico", latitude: 23.6345, longitude: -102.5528 },
    { name: "Moldova", latitude: 47.4116, longitude: 28.3699 },
    { name: "Monaco", latitude: 43.7333, longitude: 7.4167 },
    { name: "Mongolia", latitude: 46.8625, longitude: 103.8467 },
    { name: "Morocco", latitude: 31.7917, longitude: -7.0926 },
    { name: "Myanmar", latitude: 21.9139, longitude: 95.9560 },
    { name: "Nepal", latitude: 28.3949, longitude: 84.1240 },
    { name: "Netherlands", latitude: 52.1326, longitude: 5.2913 },
    { name: "New Zealand", latitude: -40.9006, longitude: 174.8860 },
    { name: "Nicaragua", latitude: 12.8654, longitude: -85.2072 },
    { name: "Nigeria", latitude: 9.0820, longitude: 8.6753 },
    { name: "North Korea", latitude: 40.3399, longitude: 127.5101 },
    { name: "Norway", latitude: 60.4720, longitude: 8.4689 },
    { name: "Oman", latitude: 21.5126, longitude: 55.9232 },
    { name: "Pakistan", latitude: 30.3753, longitude: 69.3451 },
    { name: "Panama", latitude: 8.5379, longitude: -80.7821 },
    { name: "Paraguay", latitude: -23.4425, longitude: -58.4438 },
    { name: "Peru", latitude: -9.1899, longitude: -75.0152 },
    { name: "Philippines", latitude: 12.8797, longitude: 121.7740 },
    { name: "Poland", latitude: 51.9194, longitude: 19.1451 },
    { name: "Portugal", latitude: 39.3999, longitude: -8.2245 },
    { name: "Qatar", latitude: 25.3548, longitude: 51.1839 },
    { name: "Romania", latitude: 45.9432, longitude: 24.9668 },
    { name: "Russia", latitude: 61.5240, longitude: 105.3188 },
    { name: "Saudi Arabia", latitude: 23.8859, longitude: 45.0792 },
    { name: "Singapore", latitude: 1.3521, longitude: 103.8198 },
    { name: "South Africa", latitude: -30.5595, longitude: 22.9375 },
    { name: "South Korea", latitude: 35.9078, longitude: 127.7669 },
    { name: "Spain", latitude: 40.4637, longitude: -3.7492 },
    { name: "Sri Lanka", latitude: 7.8731, longitude: 80.7718 },
    { name: "Sweden", latitude: 60.1282, longitude: 18.6435 },
    { name: "Switzerland", latitude: 46.8182, longitude: 8.2275 },
    { name: "Thailand", latitude: 15.8700, longitude: 100.9925 },
    { name: "Turkey", latitude: 38.9637, longitude: 35.2433 },
    { name: "Ukraine", latitude: 48.3794, longitude: 31.1656 },
    { name: "United Arab Emirates", latitude: 23.4241, longitude: 53.8478 },
    { name: "United Kingdom", latitude: 55.3781, longitude: -3.4360 },
    { name: "United States", latitude: 37.0902, longitude: -95.7129 },
    { name: "Uruguay", latitude: -32.5228, longitude: -55.7658 },
    { name: "Venezuela", latitude: 6.4238, longitude: -66.5897 },
    { name: "Vietnam", latitude: 14.0583, longitude: 108.2772 },
    { name: "Yemen", latitude: 15.5527, longitude: 48.5164 },
    { name: "Zimbabwe", latitude: -19.0154, longitude: 29.1549 },
];
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function toRad(value) {
    return value * Math.PI / 180;
}
function getCountriesNearby(userLat, userLon, maxDistance = 2000 // Default 2000km radius
) {
    return exports.countryCoordinates
        .map(country => ({
        name: country.name,
        distance: calculateDistance(userLat, userLon, country.latitude, country.longitude)
    }))
        .filter(country => country.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance)
        .map(country => country.name);
}
