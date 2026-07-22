const RANGE_MAP = {
  '1h': { interval: '1 hour', bucket: '1 minute' },
  '24h': { interval: '24 hours', bucket: '5 minutes' },
  '7d': { interval: '7 days', bucket: '1 hour' },
  '30d': { interval: '30 days', bucket: '6 hours' },
  '90d': { interval: '90 days', bucket: '12 hours' },
  'all': { interval: null, bucket: '1 day' },
};

function getBucketInterval(range) {
  const config = RANGE_MAP[range];
  return config ? config.bucket : null;
}

function validateRange(range) {
  if (!range) return RANGE_MAP['24h'];
  return RANGE_MAP[range] || null;
}

module.exports = { RANGE_MAP, getBucketInterval, validateRange };
