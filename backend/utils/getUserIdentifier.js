// Generate or retrieve a unique identifier for the user
// This uses a combination of browser fingerprinting techniques
const getUserIdentifier = (req) => {
  // Try to get from custom header (set by frontend)
  const customId = req.headers['x-user-id'];
  if (customId) {
    return customId;
  }

  // Fallback to IP + User Agent hash
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  const combined = `${ip}-${userAgent}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `user_${Math.abs(hash).toString(36)}`;
};

module.exports = getUserIdentifier;

