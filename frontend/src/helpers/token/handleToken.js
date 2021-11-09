import axios from 'axios';

const TOKEN_KEY = "REST_TOKEN";

/**
 * Función para guardar una token de inicio de sesión
 * @param {String} token token de incio se sesión
 */
export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Función para obtener el token almacenado en localStorage
 * @returns token almacenado en localStorage
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Función para eliminar la token almacenada en el localStorage
 */
export const deleteToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Interceptors que estarán a la escucha del token, par establecer una cabecera authorization
 */
export const initAxiosInterceptors = () => {
    axios.interceptors.request.use(config => {
        const token = getToken();

        if (token)
        {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });

    axios.interceptors.response.use(response => {
        return response;
    }, async error => {
        return Promise.reject(error);

        // Se rechaza la petición si es que se recibe un error inusual
        /* if (error.response.status !== 401) {
            return Promise.reject(error);
        }

            // Cuando el codigo sea 401 se intentará refrescar el token
            axios.interceptors.response.eject(interceptor);

            return await axios.post('https://securetoken.googleapis.com/v1/token?key=AIzaSyCxtlob-iIvGtuz6Syc0kexsKW8Es_NIT8', {
                grant_type: "refresh_token",
                refresh_token: getRefreshToken()
            })
            .then(result => {
                console.log("EL ACCESS_TOKEN ES: ", result.data.access_token, ", EL REFRESH_TOKEN ES: ", result.data.refresh_token);
                setToken(result.data.access_token);
                setRefreshToken(result.data.refresh_token);
                error.response.config.headers['authorization'] = `Bearer ${result.data.access_token}`;
                return axios(error.response.config);
            })
            .catch(error => {
                deleteToken();
                deleteRefreshToken();
                clearUserRedux();
                return Promise.reject(error);
            })
            .finally(initAxiosInterceptors); */
    });
};