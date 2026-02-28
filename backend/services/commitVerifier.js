/**
 * Haversine distance (km) between two lat/lon points.
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Check whether a commit timestamp falls within the hackathon window.
 */
function verifyTime(commitTimestamp, hackathonStart, hackathonEnd) {
  const t = new Date(commitTimestamp).getTime();
  return t >= new Date(hackathonStart).getTime() && t <= new Date(hackathonEnd).getTime();
}

/**
 * Determine location status relative to the venue geo-fence.
 *
 * @param {{ latitude: number, longitude: number } | null} commitLocation
 * @param {{ latitude: number, longitude: number, radiusKm: number }} venue
 * @returns {"on-site" | "outside" | "unknown"}
 */
function verifyLocation(commitLocation, venue) {
  if (
    !commitLocation ||
    commitLocation.latitude == null ||
    commitLocation.longitude == null
  ) {
    return "unknown";
  }

  const dist = haversineKm(
    commitLocation.latitude,
    commitLocation.longitude,
    venue.latitude,
    venue.longitude
  );

  return dist <= venue.radiusKm ? "on-site" : "outside";
}

module.exports = { verifyTime, verifyLocation, haversineKm };
