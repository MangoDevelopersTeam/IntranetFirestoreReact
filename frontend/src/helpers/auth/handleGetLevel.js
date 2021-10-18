import { deleteToken, getToken } from '../token/handleToken';
import { clearUserRedux } from './handleAuth';

import axios from 'axios';

/**
 * Función para obtener el nivel de acceso del usuario
 * @returns {Object} objeto que contiene si fue exitoso la petición, el mensaje que se obtiene, y la data que es el nivel del usuario 
 */
export const getAccessLevel = async () => {
    let dataObject = {
        success: false,
        message: "",
        data: null
    };
    
    try
    {
        let getAccessResponse = await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-access/");     

        if (getAccessResponse?.data?.code === "FIREBASE_VERIFY_TOKEN_ERROR")
        {
            dataObject.message = "Hubo un error al verificar la token del usuario";
            return dataObject;
        }

        if (getAccessResponse.data.code === "PROCESS_OK")
        {
            dataObject.success = true;
            dataObject.data = getAccessResponse?.data?.level;
            return dataObject;
        }
    }
    catch(error)
    {
        if (error.code === "TOKEN_REVOKED")
        {
            dataObject.message = "La token de autenticación esta revocada";
            return dataObject;
        }
        
        if (error.code === "TOKEN_INVALID")
        {
            dataObject.message = "La token de autenticación es invalida";
            return dataObject;
        }
    }
};

/**
 * Función para limpiar el token de sesión y los datos persistentes del usuario en redux
 */
export const clearAuthData = () => {
    if (getToken())
    {   
        deleteToken();
    }   

    clearUserRedux();
};