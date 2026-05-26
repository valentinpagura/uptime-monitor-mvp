//Guardar token en localStorage
export const saveToken = (token) => { //Exporta una función para que otros archivos la usen
    localStorage.setItem('token', token); //clave-valor  //"token" narajana es el token en si.
};                                      //saveToken("abc123xyz") → localStorage:{ token: "abc123xyz" }

//Leer token desde localStorage
export const getToken = () => { 
    return localStorage.getItem('token'); //devuelve el valor asociado a la clave 'token'
    //Si no existe, devuelve null
}

//Eliminar token de localStorage
export const removeToken = () => {
    localStorage.removeItem('token'); //elimina la clave 'token' y su valor asociado
    //después de removeToken(), localStorage ya no tiene nada guardado
}