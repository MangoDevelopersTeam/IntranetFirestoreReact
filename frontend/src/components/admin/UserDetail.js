// Elementos de react
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom'

import axios from 'axios';
import { Avatar, Breadcrumbs, Button, Card, CardContent, CircularProgress, createTheme, ThemeProvider, Divider, Paper, Typography, useMediaQuery, useTheme, TextField, Grid, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';
import { NavigateNext, Person } from '@material-ui/icons';
import { myArrayRegions } from '../../utils/allCourses';
import { checkRun, checkRut } from '../../helpers/format/handleFormat';
import { user } from '../../classes/user';
import { showMessage } from '../../helpers/message/handleMessage';

const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const HomeAdmin = () => {
    // uses
    const { id } = useParams();
    const history = useHistory();
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));


    // useStates
    const [userSelected, setUserSelected] = useState(null);
    const [errorUser, setErrorUser] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);

    const [editEmail, setEditEmail] = useState(false);
    const [editPassword, setEditPassword] = useState(false);
    const [editRegionCommune, setEditRegionCommune] = useState(false);

    const [rut, setRut] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [region, setRegion] = useState("");
    const [commune, setCommune] = useState("");
    const [communes, setCommunes] = useState([]);


    const [loadingProcessUser, setLoadingProcessUser] = useState(false);
    const [errorProcessUser, setErrorProcessUser] = useState(false);

    const [errorCode, setErrorCode] = useState(null);

    

    // useCallbacks
    const handleGetDetailedUser = useCallback(
        async () => {
            if (id == null)
            {
                return;
            }

            setLoadingUser(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-detailed-user`, {
                params: {
                    userIdParam: Encrypt(id)
                }
            })
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setRut(Decrypt(Decrypt(result.data.data)[0].data.rut));
                    setName(Decrypt(Decrypt(result.data.data)[0].data.name));
                    setSurname(Decrypt(Decrypt(result.data.data)[0].data.surname));
                    setEmail(Decrypt(Decrypt(result.data.data)[0].data.email));
                    setRegion(Decrypt(Decrypt(result.data.data)[0].data.region));
                    setCommune(Decrypt(Decrypt(result.data.data)[0].data.commune));
                    setCommunes([]);

                    let finded = myArrayRegions.find(x => x.id === Decrypt(Decrypt(result.data.data)[0].data.region));
                    setCommunes(finded.communes);

                    setErrorUser(false);
                    setUserSelected(Decrypt(result.data.data));
                    setErrorCode(null);
                }
                else
                {
                    setErrorUser(true);
                    setUserSelected(undefined);
                    setErrorCode(result.data.code);
                }

                setLoadingUser(false);
            })
            .catch(error => {
                setErrorUser(true);
                setUserSelected(undefined);
                    
                if (error.response)
                {
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("GET_DETAILED_USER_ERROR");
                }

                setLoadingUser(false);   
            })
            .finally(() => {
                return () => {
                    setUserSelected(null); 
                    setErrorUser(null);
                    setErrorCode(null);
                    setLoadingUser(null);
                }
            });
        },
        [id, setUserSelected, setErrorUser, setErrorCode, setLoadingUser, setRut, setName, setSurname, setEmail, setRegion, setCommune, setCommunes],
    );

    const handleEditUser = useCallback(
        async () => {
            if (id === null)
            {
                return;
            }

            if (rut === "" || name === "" || surname === "")
            {
                return showMessage("Complete todos los campos requeridos", "info");
            }

            if (/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(email) === false)
            {
                return showMessage("Ingresa un formato valido de correo", "info");
            }

            if (editEmail === true)
            {
                if (email === "")
                {
                    return showMessage("Complete todos los campos requeridos", "info");
                }
            }

            if (editPassword === true)
            {
                if (password === "" || passwordRepeat === "")
                {
                    return showMessage("Complete todos los campos requeridos", "info");
                }

                if (password !== passwordRepeat)
                {
                    return showMessage("Las contraseñas no coinciden", "info");
                }
            }

            if (editRegionCommune === true)
            {
                if (region === "" || commune === "")
                {
                    return showMessage("Complete todos los campos requeridos", "info");
                }
            }

            if (checkRut(rut) === false)
            {
                return showMessage("Verifique el run ingresado", "warning");
            }

            let userIntranet = new user(Encrypt(rut), Encrypt(name), Encrypt(surname), Encrypt(region), Encrypt(commune), Encrypt(email), Encrypt("none"), Encrypt(password), Encrypt(passwordRepeat));
            
            let userParams = {
                editEmail: editEmail,
                editPassword: editPassword,
                editRegionCommune: editRegionCommune
            }

            setLoadingProcessUser(true);
            
            await axios.put(`${process.env.REACT_APP_API_URI}/edit-user`, {
                objectData: Encrypt(userIntranet),
                objectParams: Encrypt(userParams)
            }, {
                params: {
                    userIdParam: Encrypt(id)
                }
            })
            .then(result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    setLoadingProcessUser(false);
                    setErrorProcessUser(false);
                    setErrorCode(null);

                    history.push("/users");
                    return showMessage(result.data.message, result.data.type);
                }
                else
                {
                    setLoadingProcessUser(false);
                    setErrorProcessUser(true);
                    setErrorCode(result.data.code);
                }
            })
            .catch(error => {
                setLoadingProcessUser(false);
                setErrorProcessUser(true);

                if (error.response)
                {
                    console.log(error.response);
                }     
                else
                {
                    setErrorCode("UPDATE_USER_ERROR");
                }
            })
            .finally(() => {
                setLoadingProcessUser(null);
                setErrorProcessUser(null);
                setErrorCode(null);
            });
        },
        [id, rut, name, surname, editEmail, email, editPassword, password, passwordRepeat, editRegionCommune, region, commune, setLoadingProcessUser, setErrorProcessUser, setErrorCode],
    );

    const handleDeleteUser = useCallback(
        async () => {
            if (id === null)
            {
                return;
            }

            setLoadingProcessUser(true);
            
            await axios.delete(`${process.env.REACT_APP_API_URI}/delete-user`, {
                params: {
                    userIdParam: Encrypt(id)
                }
            })
            .then(result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    setLoadingProcessUser(false);
                    setErrorProcessUser(false);
                    setErrorCode(null);

                    history.push("/users");
                    return showMessage(result.data.message, result.data.type);
                }
                else
                {
                    setLoadingProcessUser(false);
                    setErrorProcessUser(true);
                    setErrorCode(result.data.code);
                }
            })
            .catch(error => {
                setLoadingProcessUser(false);
                setErrorProcessUser(true);

                if (error.response)
                {
                    console.log(error.response);
                }     
                else
                {
                    setErrorCode("UPDATE_USER_ERROR");
                }
            })
            .finally(() => {
                setLoadingProcessUser(null);
                setErrorProcessUser(null);
                setErrorCode(null);
            });
        },
        [id, setLoadingProcessUser, setErrorProcessUser, setErrorCode],
    );



    const handleChangeRegionCommune = useCallback(
        (region) => {
            setCommune("");
            setCommunes([]);
            setRegion(region); 

            let finded = myArrayRegions.find(x => x.id === region);
            return setCommunes(finded.communes);
        },
        [setCommune, setCommunes, setRegion],
    );

    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetDetailedUser();
        }

        callQuery();

        return () => {
            setUserSelected(null);
            setErrorUser(null);
            setLoadingUser(null);
            setErrorCode(null);
        }
    }, [handleGetDetailedUser, setUserSelected, setErrorUser, setLoadingUser, setErrorCode]);


    return (
        <Paper elevation={0} itemType="div">
        {
            loadingUser === true ? (
                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 180 }}>
                    <CircularProgress style={{ color: "#2074d4" }} />
                    <Typography style={{ marginTop: 15 }}>Cargando Usuario</Typography>
                </Paper>
            ) : errorUser === true ? (
                <React.Fragment>
                    <Typography style={{ textAlign: "center" }}>
                    {
                        errorCode !== null ? (
                            errorCode === "PARAMS_BAD_FORMATING" ? (
                                "Verifique que los parametros enviados sean correctos, e intentelo nuevamente"
                            ) : errorCode === "BAD_TYPES_PARAM" ? (
                                "Verifique que el paramtro enviado sea el correcto, intentelo nuevamente"
                            ) : errorCode === "PARAMS_EMPTY" ? (
                                "Asegurese de enviar los paramtros al servidor"
                            ) : errorCode === "USER_NOT_FOUND" ? (
                                "El usuario no ha sido encontrado, verifique el identificador, o bien, este usuario ha sido borrado, intentelo nuevamente"
                            ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                            ) : (
                                "Ha ocurrido un error, intente obtener los estudiantes nuevamente"
                            )
                        ) : (
                            "Ha ocurrido algo inesperado al obtener el usuario, intente el proceso nuevamente"
                        )
                    }
                    </Typography>

                    <React.Fragment>
                    {
                        errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                <Button onClick={async () => await handleGetDetailedUser()} style={{ color: "#2074d4" }}>
                                    <Typography variant="button">Recargar Usuario</Typography>
                                </Button>
                            </Paper>
                        )
                    }
                    </React.Fragment>
                </React.Fragment>
            ) : userSelected === null ? (
                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 180 }}>
                    <CircularProgress style={{ color: "#2074d4" }} />
                    <Typography style={{ marginTop: 15 }}>Cargando Usuario</Typography>
                </Paper>
            ) : userSelected === undefined ? (
                <React.Fragment>
                    <Typography style={{ textAlign: "center" }}>
                    {
                        errorCode !== null ? (
                            errorCode === "PARAMS_BAD_FORMATING" ? (
                                "Verifique que los parametros enviados sean correctos, e intentelo nuevamente"
                            ) : errorCode === "BAD_TYPES_PARAM" ? (
                                "Verifique que el paramtro enviado sea el correcto, intentelo nuevamente"
                            ) : errorCode === "PARAMS_EMPTY" ? (
                                "Asegurese de enviar los paramtros al servidor"
                            ) : errorCode === "USER_NOT_FOUND" ? (
                                "El usuario no ha sido encontrado, verifique el identificador, o bien, este usuario ha sido borrado, intentelo nuevamente"
                            ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                            ) : (
                                "Ha ocurrido un error, intente obtener los estudiantes nuevamente"
                            )
                        ) : (
                            "Ha ocurrido algo inesperado al obtener el usuario, intente el proceso nuevamente"
                        )
                    }
                    </Typography>

                    <React.Fragment>
                    {
                        errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                <Button onClick={async () => await handleGetDetailedUser()} style={{ color: "#2074d4" }}>
                                    <Typography variant="button">Recargar Usuario</Typography>
                                </Button>
                            </Paper>
                        )
                    }
                    </React.Fragment>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Paper variant="outlined" itemType="div" style={{ padding: 20, marginBottom: 15 }}>
                        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                            <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                                Home
                            </Link>
                            <Link to="/users" style={{ textDecoration: "none", color: "#333" }}>
                                Usuarios
                            </Link>
                            <Typography style={{ color: "#2074d4" }}>{`Usuario ${Decrypt(userSelected[0].data.name)} ${Decrypt(userSelected[0].data.surname)}`}</Typography>
                        </Breadcrumbs>
                    </Paper>

                    <Card variant="outlined" elevation={0} style={{ marginBottom: 15 }}>
                        <CardContent>
                            <Paper elevation={0} style={{ display: "inline-flex", alignItems: "center" }}>
                                <Avatar>
                                    <Person />
                                </Avatar>

                                <Typography style={{ marginLeft: 15 }}>Usuario {`${Decrypt(userSelected[0].data.name)} ${Decrypt(userSelected[0].data.surname)}`}</Typography>
                            </Paper>
                        </CardContent>
                    </Card>

                    <Card variant="outlined" elevation={0}>
                        <CardContent>
                            <Typography variant="h6">Información personal acerca del usuario {`${Decrypt(userSelected[0].data.name)} ${Decrypt(userSelected[0].data.surname)}`}</Typography>

                            <Paper elevation={0} style={{ marginTop: 15 }}>
                                <Grid container direction="row" justifyContent="space-evenly" alignItems="flex-start">
                                    <Grid item container md={9}>
                                        <Paper elevation={0} variant="outlined" style={{ display: "flex", justifyContent: "center", flexDirection: "column", padding: 15, margin: "auto", width: "100%" }}>
                                            <ThemeProvider theme={InputTheme}>
                                                <TextField label="Rut" variant="outlined" value={rut} onChange={(e) => setRut(e.target.value)} style={{ marginBottom: 15 }} security="true" />
                                                <TextField label="Nombre" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 15 }} security="true" />
                                                <TextField label="Apellido" variant="outlined" value={surname} onChange={(e) => setSurname(e.target.value)} style={{ marginBottom: 15 }} security="true" />
                                                <TextField label="Email" variant="outlined" value={email} disabled={!editEmail} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 15 }} security="true" />
                                                <TextField label="Contraseña" variant="outlined" value={password} disabled={!editPassword} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: 15 }} security="true" />
                                                <TextField label="Repetir Contraseña" variant="outlined" value={passwordRepeat} disabled={!editPassword} onChange={(e) => setPasswordRepeat(e.target.value)} style={{ marginBottom: 15 }} security="true" />

                                                <Paper elevation={0}>
                                                {
                                                    myArrayRegions !== null && (
                                                        <FormControl variant="outlined" fullWidth disabled={!editRegionCommune} style={{ marginBottom: 15 }}>
                                                            <InputLabel>Región</InputLabel>
                                                            <Select value={region} label="Región" onChange={(e) => handleChangeRegionCommune(e.target.value)} security="true">
                                                            {
                                                                myArrayRegions.length > 0 ? (
                                                                    myArrayRegions.map(doc => (
                                                                        <MenuItem key={doc.id} value={doc.data.numero}>{doc.data.region}</MenuItem>
                                                                    ))
                                                                ) : (
                                                                    <MenuItem disabled={true}>No hay Regiones acá aún</MenuItem>
                                                                )
                                                            }            
                                                            </Select>
                                                        </FormControl>
                                                    )
                                                }
                                                </Paper>

                                                <Paper elevation={0}>
                                                {
                                                    communes !== null && (
                                                        <FormControl variant="outlined" fullWidth disabled={!editRegionCommune} style={{ marginBottom: 15 }}>
                                                            <InputLabel>Comuna</InputLabel>
                                                            <Select value={commune} label="Comuna" onChange={(e) => setCommune(e.target.value)} security="true">                    
                                                            {
                                                                communes.length > 0 ? (
                                                                    communes.map(commune => (
                                                                        <MenuItem key={commune.name} value={commune.name}>{commune.name}</MenuItem>
                                                                    ))
                                                                ) : (
                                                                    <MenuItem disabled={true}>No hay comunas aquí aún</MenuItem>
                                                                )
                                                            }
                                                            </Select>
                                                        </FormControl>
                                                    )
                                                }    
                                                </Paper>
                                            </ThemeProvider>
                                        </Paper>
                                    </Grid>

                                    <Grid item container md={3} alignItems="center" justifyContent="center">
                                        <Paper elevation={0} variant="outlined" style={{ display: "flex", justifyContent: "center", flexDirection: "column", padding: 15, margin: "auto", maxWidth: "100%" }}>
                                        {
                                            loadingProcessUser === true ? (
                                                <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <CircularProgress style={{ color: "#2074d4" }} />
                                                        <Typography style={{ marginTop: 15 }}>Procesando solicitud</Typography>
                                                    </Paper>
                                                </Paper>
                                            ) : errorProcessUser === true ? (
                                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(2% + 10px)" }}>
                                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <React.Fragment>
                                                        {
                                                            errorCode !== null && (
                                                                <React.Fragment>
                                                                    <Typography style={{ textAlign: "center" }}>
                                                                    {
                                                                        errorCode === "DATA_SENT_NULL" ? (
                                                                            "Verifique que los datos los haya enviado correctamente, porfavor, intentelo nuevamente"
                                                                        ) : errorCode === "DATA_SENT_INVALID" ? (
                                                                            "Verifique que los datos enviados sean correctos, intentelo nuevamente"
                                                                        ) : errorCode === "BODY_SENT_NULL" ? (
                                                                            "Verifique que los datos los haya enviado correctamente, porfavor, intentelo nuevamente"
                                                                        ) : errorCode === "BAD_TYPE_BODY_VALUES" ? (
                                                                            "Verifique los datos enviados, e intentelo nuevamente"
                                                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                                                        ) : (
                                                                            "Ha ocurrido un error al procesar la solicitud, intentelo nuevamente"
                                                                        )
                                                                    }
                                                                    </Typography>

                                                                    <React.Fragment>
                                                                    {
                                                                        errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                                <Button onClick={() => setErrorProcessUser(false)} style={{ color: "#2074d4" }}>
                                                                                    <Typography variant="button">Intentar Nuevamente</Typography>
                                                                                </Button>
                                                                            </Paper>
                                                                        )
                                                                    }
                                                                    </React.Fragment>
                                                                </React.Fragment>
                                                            )
                                                        }
                                                        </React.Fragment>
                                                    </Paper>
                                                </Paper>
                                            ) : (
                                                <React.Fragment>
                                                    <FormControlLabel
                                                        control={<Checkbox checked={editEmail} onChange={(e) => setEditEmail(e.target.checked)} name="Editar Correo" style={{ color: "#2074d4" }} />}
                                                        label="Editar Correo" style={{ marginBottom: 15 }} />

                                                    <FormControlLabel
                                                        control={<Checkbox checked={editPassword} onChange={(e) => setEditPassword(e.target.checked)} name="Editar Contraseña" style={{ color: "#2074d4" }} />}
                                                        label="Editar Contraseña" style={{ marginBottom: 15 }} />

                                                    <FormControlLabel
                                                        control={<Checkbox checked={editRegionCommune} onChange={(e) => setEditRegionCommune(e.target.checked)} name="Editar Región/Comuna" style={{ color: "#2074d4" }} />}
                                                        label="Editar Región/Comuna" style={{ marginBottom: 15 }} />

                                                    <Button onClick={async () => await handleEditUser()} style={{ color: "#2074d4", marginBottom: 15 }}>Editar Usuario</Button>
                                                    <Button onClick={async () => await handleDeleteUser()}>Eliminar Usuario</Button>
                                                </React.Fragment>
                                            )
                                        }
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </CardContent>
                    </Card>
                </React.Fragment>
            )
        }
        </Paper>
    );
};

export default HomeAdmin;