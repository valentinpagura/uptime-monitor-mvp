//Estado global: user,token,loading,error. Funciones para login, register y logout. useEffect para restaurar sesión al recargar la página.
import { createContext, useState, useEffect } from 'react'; //almacén global
import { saveToken, getToken, removeToken } from '../utils/token'; //importamos funnciones de token.js
import { loginUser, registerUser } from '../services/api'; //importamos funciones de api.js

// 1. Crear el Context
export const AuthContext = createContext();

// 2. Crear el Provider (el "almacén")
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getToken()); // se inicializa LEYENDO de localStorage
  const [loading, setLoading] = useState(false); //para mostrar "cargando..." mientras hace la petición
  const [error, setError] = useState(null);


  // 🔴 NUEVO: useEffect para restaurar la sesión al recargar la página
  useEffect(() => {
  if(token){
    try{
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(atob(base64Payload));

      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        logout(); // Si el token ha expirado, cerramos sesión
      }else {
        setUser({ id: payload.id, email: payload.email, fecha_registro: payload.fecha_registro });
      }
    }catch(err){
      console.error("Error al decodificar token:", err);
      logout(); // Si el token es inválido, cerramos sesión
    }
  }
}, []); // // El array vacío asegura que esto solo corra una vez al montar la aplicación

  // Función para LOGIN
async function login(email, password) {
    setLoading(true);  // Inicia "cargando"
    setError(null);    // Limpia errores previos
    
    try {
        const data = await loginUser(email, password);
        if (data.token) {
            saveToken(data.token);  //usamos funciones de token.js para guardar el token en localStorage
            setToken(data.token);   //guardamos el token en el state para usarlo en las peticiones al backend
            setUser(data.usuario);  //guardamos los datos del usuario en el state para mostrar su información en la UI
        } else {
            setError(data.message || "Error desconocido");
        }
    } catch (err) {
        setError("Error conectando con el servidor");
    } finally {
        setLoading(false);  // Termina "cargando"
    }
}

  // Función para REGISTER
  async function register(email, password) {
    setLoading(true);  // Inicia "cargando"
    setError(null);    // Limpia errores previos

    try {
      const data = await registerUser(email, password);
      if (data.token) {
        saveToken(data.token);
        setToken(data.token);
        setUser(data.usuario);  //contiene id, email y fecha_registro
      } else {
        setError(data.message || "Error desconocido");
      }
    } catch (err) {
      setError("Error conectando con el servidor");
    } finally {
      setLoading(false);  // Termina "cargando"
    }
  }

  // Función para LOGOUT
  function logout() {
    removeToken();           // Elimina token de localStorage
    setToken(null);          // Limpia token del state
    setUser(null);           // Limpia usuario del state
    setError(null);          // Limpia errores
  }

  // Valor que compartimos
  const value = {
    user,           // Datos del usuario { id, email, fecha_registro }
    token,          // JWT token para autenticar peticiones
    loading,        // true mientras se hace login/register/logout
    error,          // Mensaje de error si algo falla
    login,          // Función para hacer login
    register,       // Función para registrarse
    logout          // Función para cerrar sesión
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}