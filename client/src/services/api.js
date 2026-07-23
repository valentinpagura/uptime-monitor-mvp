//Este archivo centraliza TODAS las llamadas HTTP al backend:
//loginUser(email, password)	POST /auth/login	{ token, usuario }
//registerUser(email, password)	POST /auth/register	{ token, usuario }
//getSitios(token)	GET /sitios	Lista de sitios
//createSitio(url, nombre, frecuencia, token)	POST /sitios	Sitio creado
//deleteSitio(sitioId, token)	DELETE /sitios/:id	Confirmación

const API_BASE_URL = "http://localhost:5000"; //Asegúrate de que esta URL coincida con la del backend



//REGISTER
export async function registerUser(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
             email,
             password })
    });

    const data = await response.json();
    return data;
}

//LOGIN
export async function loginUser(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
             email,
             password })
    });

    const data = await response.json();
    return data;
}

//CREAR SITIO
//Enviar los datos al Backend de forma correcta.
export async function createSitio(url, nombre, frecuencia, token) {  //lo usamos en CreateSitioForm.jsx
    const response = await fetch(`${API_BASE_URL}/sitios`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Usamos token para autenticar la solicitud
        },
        body: JSON.stringify({
           url: url,
            nombre: nombre,
            frecuencia_minutos: frecuencia
        })
    });

    const data = await response.json();
    return data;
}



//LISTAR SITIOS
export async function getSitios(token) {
    const response = await fetch(`${API_BASE_URL}/sitios`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Usamos token para autenticar la solicitud
        }
    });

    const data = await response.json();
    return data;
}


//ELIMINAR SITIO
export async function deleteSitio(sitioId, token) {
    const response = await fetch(`${API_BASE_URL}/sitios/${sitioId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Usamos token para autenticar la solicitud
        }

    });

    const data = await response.json();
    return data;
}

// GET /sitios/:id/logs
export async function getLogs(sitioId, token, range) {
  const url = range
    ? `${API_BASE_URL}/sitios/${sitioId}/logs?range=${encodeURIComponent(range)}`
    : `${API_BASE_URL}/sitios/${sitioId}/logs`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
}

// GET /sitios/:id/dashboard - Dashboard con timeline bucketed y resumen agregado
export async function getSitioDashboard(sitioId, token, range = '24h') {
  const response = await fetch(`${API_BASE_URL}/sitios/${sitioId}/dashboard?range=${encodeURIComponent(range)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
}

// GET /sitios/summary - Obtener resumen global de todos los sitios del usuario
export async function getDashboardSummary(token, range = '24h') {
  const response = await fetch(`${API_BASE_URL}/sitios/summary?range=${encodeURIComponent(range)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
}

// GET /sitios/:id/stats - Obtener estadísticas de un sitio específico
export async function getSitioStats(sitioId, token) {
  const response = await fetch(`${API_BASE_URL}/sitios/${sitioId}/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
}