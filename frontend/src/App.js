import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { Backdrop, CircularProgress, makeStyles, ThemeProvider, unstable_createMuiStrictModeTheme as MuiThemeUS } from '@material-ui/core';

import { initAxiosInterceptors, getToken, deleteToken } from './helpers/token/handleToken';
import { clearUserRedux, setUserRedux } from './helpers/auth/handleAuth';
import { showMessage } from './helpers/message/handleMessage';

import Main from './components/Main';
import Login from './components/Login';
import Dialogs from './templates/Dialogs';
import Message from './templates/Message';

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
            if (!getToken())
            {
                clearUserRedux();
                setLoading(false);

                return;
            }

            await axios.get(`${process.env.REACT_APP_API_URI}/whoami`)
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    if (user === null)
                    {
                        setUserRedux(result.data.data);
                    }

                    return setLoading(false);
                }

                if (result.data.code === "TOKEN_MISSING")
                {
                    clearUserRedux();

                    showMessage("La sesión se ha terminado debido a falta de credenciales", "info");
                    return setLoading(false);
                }
                else if (result.data.code === "FIREBASE_GET_USER_ERROR")
                {
                    clearUserRedux();
                    
                    if (getToken())
                    {
                        deleteToken();
                    }

                    showMessage("Ha ocurrido un error al momento de obtener el usuario", "info");
                    return setLoading(false);
                }
                else if (result.data.code === "FIREBASE_VERIFY_TOKEN_ERROR" || result.data.code === "TOKEN_REVOKED" || result.data.code === "TOKEN_INVALID")
                {              
                    clearUserRedux();   
                    
                    if (getToken())
                    {
                        deleteToken();
                    }

                    showMessage("La sesión ha acabado debido a que la sesión se ha vencido", "info");
                    return setLoading(false);
                }
            })
            .catch(error => {
                if (error.response)
                {
                    if (error.response.data.code === "FIREBASE_VERIFY_TOKEN_ERROR")
                    {
                        showMessage("Necesita iniciar sesión nuevamente, debido a que la sesión se ha vencido", "error");
                    }
                }

                clearUserRedux(); 

                if (getToken())
                {
                    deleteToken();
                }
                
                return setLoading(false);
            });
        },  
        [user, setLoading],
    );

    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await verifyAuthCallback();
        }

        callQuery();

        return () => {
            setLoading(null);
        }
    }, [verifyAuthCallback, setLoading]);


    return (    
        <ThemeProvider theme={theme}>
            <React.Fragment>
            {
                loading === true ? (
                    <Backdrop className={classes.backdrop} open={loading}>
                        <CircularProgress color="inherit" />
                    </Backdrop>        
                ) : (
                    user === null ? (
                        <React.Fragment>
                            <Login />
                            <Dialogs />
                            <Message />
                        </React.Fragment>
                    ) : (
                        <Main />
                    )   
                )
            }
            </React.Fragment>
            
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        </ThemeProvider>
    );
};

export default App;