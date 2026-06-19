const API_BASE_URL = "";

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || `Error ${response.status}`);
  }

  return data;
}

export async function registerUser(email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loginUser(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getSitios(token) {
  return request("/sitios", {
    headers: { "Authorization": `Bearer ${token}` },
  });
}

export async function createSitio(url, nombre, frecuencia, token) {
  return request("/sitios", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ url, nombre, frecuencia_minutos: frecuencia }),
  });
}

export async function deleteSitio(sitioId, token) {
  return request(`/sitios/${sitioId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
}

export async function getLogs(sitioId, token) {
  return request(`/sitios/${sitioId}/logs`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
}

export async function getSitioStats(sitioId, token) {
  return request(`/sitios/${sitioId}/stats`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
}
