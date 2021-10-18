// Elementos de react
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom'

import { clearAuthData } from '../../helpers/auth/handleGetLevel';
import history from './../../helpers/history/handleHistory';

import axios from 'axios';


const HomeAdmin = () => {
    // uses
    const { id } = useParams();

    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            let responseGetAccess = await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/whoami");

            if (await responseGetAccess.data.code === "TOKEN_MISSING" || await responseGetAccess.data.code === "FIREBASE_VERIFY_TOKEN_ERROR" || await responseGetAccess.data.code === "TOKEN_REVOKED" || await responseGetAccess.data.code === "TOKEN_INVALID")
            {
                clearAuthData();
                history.push("/");

                return;
            }

            return;
        };

        return callQuery();
    }, []);

    return (
        <> 
            <div>
                access
                {id}

                En Construcción
            </div> 
        </>
    );
};

export default HomeAdmin;