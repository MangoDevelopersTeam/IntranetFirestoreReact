import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { Backdrop, CircularProgress, makeStyles, ThemeProvider, unstable_createMuiStrictModeTheme as MuiThemeUS } from '@material-ui/core';

import Main from './components/Main';
import Login from './components/Login';
import Dialogs from './templates/Dialogs';
import Message from './templates/Message';

import { showMessage } from './helpers/message/handleMessage';
import { clearUserRedux, setUserRedux } from './helpers/auth/handleAuth';
import { initAxiosInterceptors, getToken, deleteToken, deleteRefreshToken, getRefreshToken } from './helpers/token/handleToken';

import { SELECT_USER } from './redux/userSlice';

import axios from 'axios';

initAxiosInterceptors();

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

const App = () => {
    // uses
    const theme = MuiThemeUS();
    const classes = useStyles();
    const user = useSelector(SELECT_USER);

    // useStates
    const [loading, setLoading] = useState(true);

    // useCallbacks
    /**
     * useCallback para ejecutar la función que verifica si el usuario tiene una token valida y re asignar el objeto usuario en redux si este ha sido borrado
     */
    const verifyAuthCallback = useCallback(
        async () => {
            if (!getToken() || !getRefreshToken())
            {
                if (getToken())
                {
                    deleteToken();
                }
                else if (getRefreshToken())
                {
                    deleteRefreshToken();
                }

                clearUserRedux();
                return setLoading(false);
            }
            else
            {
                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/whoami")
                .then(result => {
                    if (result.data.code === "PROCESS_OK")
                    {                    
                        if (user === null)
                        {
                            setUserRedux(result.data.data);
                        }

                        return setLoading(false);
                    }
                    else
                    {
                        if (result.data.code === "TOKEN_MISSING")
                        {
                            clearUserRedux();
                            setLoading(false);
                                
                            return showMessage("La sesión se ha terminado debido a falta de credenciales", "info");
                        }
                        else if (result.data.code === "FIREBASE_GET_USER_ERROR")
                        {
                            clearUserRedux();   

                            if (getToken())
                            {
                                deleteToken();
                            }

                            setLoading(false);
                            return showMessage("Ha ocurrido un error al momento de obtener el usuario", "info");
                        }
                        else if (result.data.code === "FIREBASE_VERIFY_TOKEN_ERROR" || result.data.code === "TOKEN_REVOKED" || result.data.code === "TOKEN_INVALID")
                        {              
                            clearUserRedux();   
                            deleteToken();

                            setLoading(false);
                            return showMessage("La sesión ha acabado debido a que la sesión se ha vencido", "info");
                        }
                    }
                })
                .catch(error => {
                    clearUserRedux(); 
                
                    if (getToken())
                    {
                        deleteRefreshToken();
                        deleteToken();
                    }
                
                    setLoading(false);
                    return showMessage(error.message, "error");
                });
            }            
        },  
        [user, setLoading],
    );

    // useEffects
    useEffect(() => {
        let callCallback = async () => {
            await verifyAuthCallback();
        }

        callCallback();

        return () => {
            setLoading(null);
        }
    }, [verifyAuthCallback, setLoading]);

    return (    
        <ThemeProvider theme={theme}>
            <>
            {
                loading ? (
                    <Backdrop className={classes.backdrop} open={loading}>
                        <CircularProgress color="inherit" />
                    </Backdrop>        
                ) : (
                    user ? (
                        <Main />
                    ) : (
                        <>
                            <Login />
                            <Dialogs />
                            <Message />
                        </>
                    )   
                )
            }
            </>
            {/** This is a roboto font */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        </ThemeProvider>
    );
};

export default App;