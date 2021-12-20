import React, { useCallback, useEffect, useState } from 'react';

import { Button, Card, CardContent, CardMedia, CircularProgress, createTheme, ThemeProvider, Grid, Paper, TextField, Typography, useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@material-ui/core';

import { setToken } from '../helpers/token/handleToken';
import { showNewAdminDialog } from '../helpers/dialogs/handleDialogs';
import { showMessage } from '../helpers/message/handleMessage';
import { setUserRedux } from '../helpers/auth/handleAuth';
import { Encrypt } from '../helpers/cipher/cipher';

import axios from 'axios';

const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const Login = () => {
    // uses
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));


    // useStates
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [enable, setEnable] = useState(false);
    const [loading, setLoading] = useState(false);

    const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
    const [emailResetPassword, setEmailResetPassword] = useState("");
    

    // useCallbacks
    /* ------ SIGNIN CALLBACKS ------ */
    /**
     * useCallback para manejar el inicio de sesión
     */
    const handleSignIn = useCallback(
        async (e) => {
            e.preventDefault();

            if (email === "" || password === "")
            {
                return showMessage("Complete todos los campos de texto", "info");
            }

            if (/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(email) === false)
            {
                return showMessage("Ingresa un formato valido de correo", "info");
            }

            setLoading(true);

            await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.REACT_APP_API_KEY}`, {
                email: email,
                password: password,
                returnSecureToken: true
            }, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            })
            .then(result => {
                if (result.status === 200)
                {
                    setToken(result.data.idToken);

                    let object = {
                        email: Encrypt(result.data.email),
                        displayName: Encrypt(result.data.displayName)
                    };
                    setUserRedux(Encrypt(object));

                    showMessage(`Bienvenido/a ${result.data.displayName}`, "success");
                    return setLoading(false);
                }
            })
            .catch(error => {
                if (error.response)
                {
                    if (error.response.data.error.message === "INVALID_PASSWORD")
                    {
                        showMessage("La contraseña que ha ingresado ha sido incorrecta", "error");
                    }
                    else if (error.response.data.error.message === "EMAIL_NOT_FOUND")
                    {
                        showMessage("El email que ha ingresado no existe", "error");
                    }
                    else if (error.response.data.error.message.startsWith("TOO_MANY_ATTEMPTS_TRY_LATER"))
                    {
                        showMessage("Se ha fallado en el intento de loguearse, el acceso se ha bloqueado temporalmente, espere a que se habilite nuevamente e intenelo nuevamente, o bien, puede reestablecer su contraseña", "error");
                    }
                    else
                    {                
                        showMessage("Ha ocurrido un error al procesar la solicitud, intentelo nuevamente", "error");
                    }

                    return setLoading(false);
                }
            })
            .finally(() => {
                return () => {
                    setLoading(null);
                    setEmail(null);
                    setPassword(null);
                }
            });
        },
        [email, password, setLoading, setEmail, setPassword],
    );

    /**
     * useCallback para obtener el numero de administradores creados
     */
    const handleGetCountAdmins = useCallback(
        async () => {
            await axios.get(`${process.env.REACT_APP_API_URI}/get-numbers-admin`)
            .then(result => {
                console.log(result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    if (result.data.data > 0)
                    {
                        setEnable(false);
                    }
                    else
                    {
                        setEnable(true);
                    }
                }
                else
                {
                    setEnable(false);
                }
            })
            .catch(() => {
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
    /* ------ SIGNIN CALLBACKS ------ */

    /* ------ RESET PASSWORD CALLBACKS ------ */
    /**
     * useCallback para cerrar el dialogo de resetear contraseña
     */
    const handleCloseResetPassword = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setEmailResetPassword("");
            setResetPasswordDialog(false);
        },
        [setResetPasswordDialog, setEmailResetPassword],
    );

    /**
     * useCallback para resetar la contraseña
     */
    const handleResetPassword = useCallback(
        async () => {
            if (emailResetPassword === "")
            {
                return showMessage("Complete el campo Email", "info");
            }

            if (/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(emailResetPassword) === false)
            {
                return showMessage("Ingresa un formato valido de correo", "info");
            }

            await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.REACT_APP_API_KEY}`, {
                requestType: "PASSWORD_RESET",
                email: emailResetPassword
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(result => {
                if (result.status === 200)
                {
                    handleCloseResetPassword();           
                    return showMessage("El correo de cambiar contraseña ha sido enviado a su correo", "success");
                }
            })
            .catch(error => {
                if (error.response)
                {
                    if (error.response.data.error.message === "MISSING_EMAIL")
                    {
                        return showMessage("Complete el campo Email", "info");
                    }
                    else if (error.response.data.error.message === "EMAIL_NOT_FOUND")
                    {
                        return showMessage("El correo ingresado no existe en el sistema", "warning");
                    }
                    else
                    {
                        return showMessage("Ha ocurrido un error al enviar el correo de recuperar contraseña", "error");
                    }
                }
            });
        },
        [emailResetPassword, handleCloseResetPassword],
    );
    /* ------ RESET PASSWORD CALLBACKS ------ */


    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetCountAdmins();
        }

        callQuery();

        return () => {
            setEnable(null);
        }
    }, [setEnable, handleGetCountAdmins]);

    
    return (
        <Paper elevation={0} itemType="div">
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
                            
                            <form>
                                <ThemeProvider theme={InputTheme}>
                                    <TextField type="email" label="Email" variant="outlined" security="true" value={email} disabled={loading} fullWidth onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 15 }} />
                                    <TextField type="password" label="Contraseña" variant="outlined" security="true" value={password} disabled={loading} fullWidth onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: 15 }} />
                                </ThemeProvider>                       

                                <Paper elevation={0} itemType="div">
                                {
                                    loading === true ? (
                                        <Paper elevation={0} itemType="div" style={{ display: "flex", justifyContent: "end", alignItems: "center", marginTop: 45 }}>
                                            <CircularProgress style={{ color: "#2074d4", margin: "auto" }} />
                                        </Paper>
                                    ) : (
                                        <Paper elevation={0} itemType="div">
                                            <Button fullWidth type="submit" onClick={handleSignIn} style={{ color: "#2074d4", marginTop: 15 }}>Iniciar Sesión</Button>
                                            
                                            <React.Fragment>
                                            {
                                                enable === true && (
                                                    <Button fullWidth onClick={showNewAdminDialog} style={{ color: "#E74C3C", marginTop: 5 }}>Crear un Administrador</Button>
                                                )
                                            }
                                            </React.Fragment>

                                            <Button fullWidth onClick={() => setResetPasswordDialog(true)} style={{ color: "#34495E", marginTop: 5 }}>Reestablecer mi Contraseña</Button>
                                        </Paper>
                                    )
                                }
                                </Paper>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Dialog open={resetPasswordDialog} onClose={handleCloseResetPassword} fullWidth={false} maxWidth="sm" fullScreen={fullScreen} scroll="paper">
                <DialogTitle>Reestablecer Contraseña</DialogTitle>
                <DialogContent>
                    <DialogContentText>Complete el campo de correo a continuación y luego se le enviará un correo con el enlace para reestablecer su contraseña</DialogContentText>

                    <Paper elevation={0} itemType="div">
                        <ThemeProvider theme={InputTheme}>
                            <TextField style={{ marginBottom: 15 }} type="email" label="Email" variant="outlined" security="true" onChange={(e) => setEmailResetPassword(e.target.value)} value={emailResetPassword} fullWidth />
                        </ThemeProvider>
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={handleCloseResetPassword}>
                        Cerrar Ventana
                    </Button>
                    <Button style={{ color: "#2074d4" }} onClick={handleResetPassword}>
                        Reestablecer Contraseña
                    </Button>
                </DialogActions>           
            </Dialog>
        </Paper>
    );
};

export default Login;