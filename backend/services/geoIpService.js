const geoip = require("geoip-lite");

/**
 * Resolve an IP address to a coarse geographic location.
 * Uses the offline geoip-lite database — no external API call needed.
 *
 * Returns { latitude, longitude, city, region, country } or null.
 */
function lookupIp(ip) {
  if (!ip) return null;

  // Strip IPv6-mapped IPv4 prefix
  const cleanIp = ip.replace(/^::ffff:/, "");

  const geo = geoip.lookup(cleanIp);
  if (!geo || !geo.ll) return null;

  return {
    latitude: geo.ll[0],
    longitude: geo.ll[1],
    city: geo.city || null,
    region: geo.region || null,
    country: geo.country || null,
  };
}

module.exports = { lookupIp };
