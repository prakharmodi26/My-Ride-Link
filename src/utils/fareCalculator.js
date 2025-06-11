const logger = require('../config/logger');

// Vehicle type configurations
const VEHICLE_TYPES = {
  STANDARD: {
    baseFare: 5.00,
    perKmRate: 2.50,
    perMinuteRate: 0.50,
    minimumFare: 10.00
  },
  SUV: {
    baseFare: 7.00,
    perKmRate: 3.50,
    perMinuteRate: 0.75,
    minimumFare: 15.00
  },
  LUXURY: {
    baseFare: 10.00,
    perKmRate: 5.00,
    perMinuteRate: 1.00,
    minimumFare: 20.00
  }
};

// Peak hours configuration (24-hour format)
const PEAK_HOURS = [
  { start: 7, end: 9, multiplier: 1.3 },  // Morning peak
  { start: 17, end: 19, multiplier: 1.3 } // Evening peak
];

// Calculate distance in kilometers using Haversine formula
const calculateDistance = (origin, destination) => {
  const R = 6371; // Earth's radius in kilometers
  const lat1 = origin.latitude * Math.PI / 180;
  const lat2 = destination.latitude * Math.PI / 180;
  const deltaLat = (destination.latitude - origin.latitude) * Math.PI / 180;
  const deltaLon = (destination.longitude - origin.longitude) * Math.PI / 180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate estimated duration in minutes
const calculateDuration = (distance, averageSpeed = 30) => {
  // averageSpeed in km/h
  return (distance / averageSpeed) * 60;
};

// Check if current time is within peak hours
const isPeakHour = () => {
  const now = new Date();
  const currentHour = now.getHours();
  
  return PEAK_HOURS.some(peak => 
    currentHour >= peak.start && currentHour < peak.end
  );
};

// Calculate surge multiplier based on demand and time
const calculateSurgeMultiplier = (activeRides, availableDrivers, eventMultiplier = 1.0) => {
  if (availableDrivers === 0) return 2.0; // Maximum surge when no drivers available
  
  const ratio = activeRides / availableDrivers;
  let surgeMultiplier = 1.0;
  
  if (ratio >= 2) surgeMultiplier = 2.0;
  else if (ratio >= 1.5) surgeMultiplier = 1.75;
  else if (ratio >= 1) surgeMultiplier = 1.5;
  
  // Apply peak hour multiplier
  if (isPeakHour()) {
    surgeMultiplier *= 1.3;
  }
  
  // Apply event multiplier
  surgeMultiplier *= eventMultiplier;
  
  // Cap maximum surge at 3.0
  return Math.min(surgeMultiplier, 3.0);
};

// Calculate base fare without surge
const calculateBaseFare = (distance, duration, vehicleType = 'STANDARD') => {
  const config = VEHICLE_TYPES[vehicleType] || VEHICLE_TYPES.STANDARD;
  const distanceFare = distance * config.perKmRate;
  const timeFare = duration * config.perMinuteRate;
  const totalFare = config.baseFare + distanceFare + timeFare;
  return Math.max(totalFare, config.minimumFare);
};

// Convert currency (simplified version - in production, use a proper currency API)
const convertCurrency = (amount, fromCurrency, toCurrency) => {
  // This is a simplified version. In production, use a proper currency conversion API
  const rates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    INR: 83.0
  };
  
  if (fromCurrency === toCurrency) return amount;
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    throw new Error('Unsupported currency');
  }
  
  return (amount * rates[toCurrency]) / rates[fromCurrency];
};

// Main fare calculation function
const calculateFare = (origin, destination, activeRides = 0, availableDrivers = 1, vehicleType = 'STANDARD', currency = 'USD', eventMultiplier = 1.0) => {
  try {
    // Calculate distance and duration
    const distance = calculateDistance(origin, destination);
    const duration = calculateDuration(distance);

    // Calculate base fare
    const baseFare = calculateBaseFare(distance, duration, vehicleType);

    // Calculate surge multiplier
    const surgeMultiplier = calculateSurgeMultiplier(activeRides, availableDrivers, eventMultiplier);

    // Calculate final fare
    const finalFare = baseFare * surgeMultiplier;

    // Round to 2 decimal places
    const roundedFinalFare = Math.round(finalFare * 100) / 100;

    // Convert currency if needed
    const convertedFare = convertCurrency(roundedFinalFare, 'USD', currency);

    return {
      baseFare,
      distance,
      duration,
      surgeMultiplier,
      finalFare: convertedFare,
      currency,
      breakdown: {
        baseCharge: VEHICLE_TYPES[vehicleType].baseFare,
        distanceCharge: distance * VEHICLE_TYPES[vehicleType].perKmRate,
        timeCharge: duration * VEHICLE_TYPES[vehicleType].perMinuteRate,
        surgeCharge: baseFare * (surgeMultiplier - 1),
      }
    };
  } catch (error) {
    logger.error('Error calculating fare:', error);
    throw new Error('Failed to calculate fare');
  }
};

module.exports = {
  calculateFare,
  calculateDistance,
  calculateDuration,
  calculateSurgeMultiplier,
  VEHICLE_TYPES,
  PEAK_HOURS
}; 