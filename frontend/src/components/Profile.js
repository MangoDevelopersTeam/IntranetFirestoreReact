// Elementos de react
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import axios from 'axios';
import { Avatar, Breadcrumbs, Button, Card, CardContent, Paper, Typography, Divider, CircularProgress, Tooltip } from '@material-ui/core';
import { Decrypt } from '../helpers/cipher/cipher';
import { Info, NavigateNext, Person } from '@material-ui/icons';

const Profile = () => {
    // uses
    const history = useHistory();

    // useStates
    const [userSelected, setUserSelected] = useState(null);
    const [errorUser, setErrorUser] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [errorCode, setErrorCode] = useState(null);

    // useCallbacks
    const handleGetDetailedUser = useCallback(
        async () => {
            setLoadingUser(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-detailed-user`)
            .then(result => {
                console.log(result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
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
        [setUserSelected, setErrorUser, setErrorCode, setLoadingUser],
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
                            <Typography style={{ color: "#2074d4" }}>{`Profile ${Decrypt(userSelected[0].data.name)} ${Decrypt(userSelected[0].data.surname)}`}</Typography>
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

                    <Card variant="outlined" elevation={0} style={{ marginBottom: 15 }}>
                        <CardContent>
                            <Typography variant="h6">Hola {`${Decrypt(userSelected[0].data.name)} ${Decrypt(userSelected[0].data.surname)}`}</Typography>

                        </CardContent>
                    </Card>

                    <Card variant="outlined" elevation={0}>
                        <CardContent>
                        {
                            userSelected[0].data.level === "admin" ? (
                                <React.Fragment>
                                    <Typography>{`Su correo actual: ${Decrypt(userSelected[0].data.email)}`}</Typography>
                                </React.Fragment>
                            ) : userSelected[0].data.level === "student" ? (
                                <React.Fragment>
                                    <Typography style={{ marginBottom: 10 }}>{`Su correo actual: ${Decrypt(userSelected[0].data.email)}`}</Typography>
                                    <Typography style={{ marginBottom: 10 }}>{`Usted está asignado al curso: ${userSelected[0].data.number}º${userSelected[0].data.letter} ${userSelected[0].data.grade}`}</Typography>
                                    <Button variant="outlined" onClick={() => history.push("/my-subjects")}>Ver mis cursos</Button>
                                </React.Fragment>
                            ) : userSelected[0].data.level === "teacher" ? (
                                <React.Fragment>
                                    <Typography style={{ marginBottom: 10 }}>{`Su correo actual: ${Decrypt(userSelected[0].data.email)}`}</Typography>
                                    <Typography style={{ marginBottom: 10 }}>
                                        {`Usted esta impartiendo : ${userSelected[0].data.courses.length} tipos de clases`}
                                        <Tooltip title={`${userSelected[0].data.courses.map(doc => doc)}`}>
                                            <Info />
                                        </Tooltip>
                                    </Typography>
                                    <Button variant="outlined" onClick={() => history.push("/my-subjects")}>Ver mis cursos</Button>
                                </React.Fragment>
                            ) : userSelected[0].data.level === "proxie" ? (
                                <React.Fragment>
                                    <Typography style={{ marginBottom: 10 }}>{`Su correo actual: ${Decrypt(userSelected[0].data.email)}`}</Typography>
                                    <Typography style={{ marginBottom: 10 }}>{`Usted tiene ${userSelected[0].data.students.length} alumnos asignados`}</Typography>
                                    <Button variant="outlined" onClick={() => history.push("/my-students")}>Ver mis estudiantes asignados</Button>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                </React.Fragment>
                            )
                        }
                        </CardContent>
                    </Card>
                </React.Fragment>
            )
        }
        </Paper>
    );
};

export default Profile;