import React, { useCallback, useEffect, useState } from 'react';

import { Button, Card, CardContent, CardMedia, CircularProgress, Grid, TextField, Typography } from '@material-ui/core';

import { setRefreshToken, setToken } from '../helpers/token/handleToken';
import { showNewAdminDialog } from '../helpers/dialogs/handleDialogs';
import { showMessage } from '../helpers/message/handleMessage';
import { setUserRedux } from '../helpers/auth/handleAuth';
import { Decrypt } from '../helpers/cipher/cipher';

import axios from 'axios';

const Login = () => {
    // useStates
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [enable, setEnable] = useState(false);
    const [loading, setLoading] = useState(false);
    

    // useCallbacks
    /**
     * useCallback para loguearse en el sistema
     */
    const handleSignIn = useCallback(
        async () => {
            if (email === "" || password === "")
            {
                return showMessage("Complete todos los campos de texto", "info");
            }

            if (/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(email) === false)
            {
                return showMessage("Ingresa un formato valido de correo", "info");
            }
        
            setLoading(true);

            await axios.post("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCxtlob-iIvGtuz6Syc0kexsKW8Es_NIT8", {
                email: email,
                password: password,
                returnSecureToken: true
            })
            .then(async result => {
                setToken(result.data.idToken);
                setRefreshToken(result.data.refreshToken);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/whoami")
                .then(result => {
                    if (result.data.code === "PROCESS_OK")
                    {
                        setUserRedux(result.data.data);

                        showMessage(`Bienvenido/a ${Decrypt(Decrypt(result.data.data).displayName)}`, result.data.type);
                        setLoading(false);

                        return () => {
                            setEmail(null);
                            setPassword(null);
                            setLoading(null);
                        }
                    }
                    else
                    {
                        showMessage(result.data.message, result.data.type); 
                        setLoading(false);

                        return;
                    }  
                })
                .catch(error => {
                    showMessage(error.response.data.message, error.response.data.type);

                    setLoading(false);
                    return;
                });
            })
            .catch(error => {
                if (error.response.data.error.message === "EMAIL_NOT_FOUND")
                {
                    showMessage("El email que ha ingresado no existe en el sistema", "error");
                }
                else if (error.response.data.error.message === "INVALID_PASSWORD")
                {
                    showMessage("Datos Incorrectos", "error");
                }
                else
                {
                    console.log(error);
                }

                setLoading(false);
                return;
            });
        },
        [email, password, setLoading, setEmail, setPassword],
    );

    /**
     * useCallback para obtener el numero de administradores
     */
    const handleGetNumberAdmins = useCallback(
        async () => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-numbers-admin")
            .then(result => {
                if (result.data.code === "PROCESS_OK")
                {
                    console.log(result);
                    if (result.data.data > 0)
                    {
                        setEnable(false);
                    }
                    else
                    {
                        setEnable(true);
                    }
                }
            })
            .catch(error => {
                console.log(error);
                setEnable(false);
            })
            .finally(() => {
                return () => {
                    setEnable(null);
                }
            });
        },
        [setEnable],
    );

    
    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetNumberAdmins();
        }

        callQuery();

        return () => {
            setEnable(null);
        }
    }, [setEnable, handleGetNumberAdmins]);

    return (
        <>
            <Grid container direction="row" justifyContent="space-evenly" alignItems="flex-start">
                <Grid item container md={7} alignItems="center" justifyContent="center">
                    <Card variant="outlined" style={{ maxWidth: 640, margin: 7 }}>
                        <CardMedia image={`${process.env.PUBLIC_URL}/images/banner.jpg`} style={{ height: 340, objectFit: "cover" }} />
                        <CardContent>
                            <Typography>OpenIntranet comienza su desarrollo bajo el equipo de OpenMango. Estamos creando algo que sera grande!</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item container md={4} alignItems="center" justifyContent="center">
                    <Card variant="outlined" style={{ width: 500, height: "calc(100% - 358px)", margin: 7 }}>
                        <CardContent>
                            <Typography variant="h6" style={{ flexGrow: 1, marginBottom: 5 }}>Inicio de Sesión</Typography>
                            
                            <TextField type="email"    label="Email"      variant="outlined" security="true" value={email}    disabled={loading} fullWidth onChange={(e) => setEmail(e.target.value)}    style={{ marginBottom: 15 }} />
                            <TextField type="password" label="Contraseña" variant="outlined" security="true" value={password} disabled={loading} fullWidth onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: 15 }} />

                            <>
                            {
                                loading === false ? (
                                    <div>
                                        <Button fullWidth style={{ color: "#2074d4", marginTop: 5 }} onClick={() => handleSignIn()}>Iniciar Sesión</Button>
                                        
                                        <>
                                        {
                                            enable === true && (
                                                <Button fullWidth onClick={() => enable === true ? showNewAdminDialog() : {}} style={{ color: "#E74C3C", marginTop: 5 }}>Crear un Administrador</Button>
                                            )
                                        }
                                        </>

                                        <Button fullWidth style={{ color: "#34495E", marginTop: 5 }} onClick={() => {}}>Reestablecer mi Contraseña</Button>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", justifyContent: "end", alignItems: "center", marginTop: 45 }}>
                                        <CircularProgress style={{ color: "#2074d4", margin: "auto" }} />
                                    </div>
                                )
                            }   
                            </>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
};

export default Login;