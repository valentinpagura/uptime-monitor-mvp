const axios = require('axios');

async function fetchWithRetry(url, options = {}) {
  const { timeout = 5000, retries = 2, retryDelay = 1000, httpClient = axios } = options;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await httpClient.get(url, { timeout });
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

module.exports = { fetchWithRetry };
