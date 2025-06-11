/**
 * Calculate the Haversine distance between two points on Earth.
 * @param {number} lat1 - Latitude of point 1 in degrees.
 * @param {number} lon1 - Longitude of point 1 in degrees.
 * @param {number} lat2 - Latitude of point 2 in degrees.
 * @param {number} lon2 - Longitude of point 2 in degrees.
 * @returns {number} Distance in kilometers.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Validate if a coordinate is within valid bounds.
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidCoordinate(lat, lon) {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

module.exports = {
  haversineDistance,
  isValidCoordinate
}; 