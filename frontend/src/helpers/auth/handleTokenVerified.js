import axios from 'axios';

import { getToken } from '../token/handleToken';

/**
 * Función para verificar si el token esta valido o no
 * @returns {Boolean} verificación del token
 */
export const verifyValidToken = async () => {
    let verified = false;

    if (!getToken())
    {
        return verified;
    }
            
    await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/whoami")
    .then((result) => {
        if(result.data.code === "FIREBASE_VERIFY_TOKEN_ERROR")
        {
            return verified;
        }

        if(result.data.code === "MISING_TOKEN")
        {              
            return verified;
        }
        
        verified = true;
        
        return verified;
    })
    .catch(() => {
        return verified;
    });

    return verified;
};