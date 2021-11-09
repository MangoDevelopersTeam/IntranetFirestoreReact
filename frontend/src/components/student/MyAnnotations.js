import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ThemeProvider } from '@material-ui/styles';
import { NavigateNext } from '@material-ui/icons';
import { Breadcrumbs, Button, CardContent, CircularProgress, createTheme, Paper, Typography, useMediaQuery, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Divider, List, ListItem, ListItemText } from '@material-ui/core';

import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';

import axios from 'axios';

const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const MyAnnotations = () => {
    // uses
    const { id } = useParams();



    // useStates
    const [subject, setSubject] = useState(null);
    const [errorSubject, setErrorSubject] = useState(false);
    const [loadingSubject, setLoadingSubject] = useState(true);
    // eslint-disable-next-line
    const [errorCode, setErrorCode] = useState(null);

    const [authorized,   setAuthorized] = useState(null);
    const [errorAuthorized, setErrorAuthorized] = useState(false);
    const [loadingAuthorized, setLoadingAuthorized] = useState(true);

    const [annotations, setAnnotations] = useState(null);
    const [errorAnnotations, setErrorAnnotations] = useState(false);
    const [loadingAnnotations, setLoadingAnnotations] = useState(true);
    
    

    // useCallbacks
    /* ------ SUBJECT CALLBACK ------ */
    /**
     * useCallback para obtener el detalle de la asignatura
     */
    const handleGetDetailedSubject = useCallback(
        async () => {
            if (id !== null)
            {
                setLoadingSubject(true);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-detailed-course", {
                    params: {
                        courseID: Encrypt(id)
                    }
                })
                .then(result => {
                    if (Decrypt(Decrypt(result.data.data).subject)[0].data === undefined)
                    {
                        setErrorSubject(true);
                        setSubject(undefined);
                        setErrorCode(result.data.code);
                    }
                    else
                    {
                        setErrorSubject(false);
                        setSubject(Decrypt(result.data.data));
                        setErrorCode(null);
                    }

                    setLoadingSubject(false);
                })
                .catch(error => {
                    setErrorSubject(true);
                    setSubject(undefined);
                    
                    if (error.response)
                    {
                        setErrorCode(error.response.data.code);
                    }
                    else
                    {
                        setErrorCode("GET_DETAILED_SUBJECT_ERROR");
                    }

                    setLoadingSubject(false);   
                })
                .finally(() => {
                    return () => {
                        setSubject(null); 
                        setErrorSubject(null);
                        setErrorCode(null);
                        setLoadingSubject(null);
                    }
                });
            }
        },
        [id, setSubject, setErrorSubject, setErrorCode, setLoadingSubject],
    );
    /* ------ SUBJECT CALLBACK ------ */



    /* ------ ANNOTATIONS CALLBACK ------ */
    /**
     * useCallback para obtener las calificaciones del alumno
     */
    const handleGetAnnotations = useCallback(
        async () => {
            if (id !== null)
            {
                setLoadingAnnotations(true);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-my-annotations-student", {
                    params: {
                        idSubjectParam: Encrypt(id)
                    }
                })
                .then(result => {
                    console.log(Decrypt(result.data.data));
                    if (result.status === 200 && result.data.code === "PROCESS_OK")
                    {
                        setErrorAnnotations(false);
                        setAnnotations(Decrypt(result.data.data));
                        setErrorCode(null);
                    }
                    else
                    {
                        setErrorAnnotations(true);
                        setAnnotations(null);
                        setErrorCode(result.data.code);
                    }
                    
                    setLoadingAnnotations(false);
                })
                .catch(error => {
                    setErrorAnnotations(true);
                    setAnnotations(null);
                    
                    if (error.response)
                    {
                        console.log(error.response);
                        setErrorCode(error.response.data.code);
                    }
                    else
                    {
                        setErrorCode("GET_DETAILED_SUBJECT_ERROR");
                    }

                    setLoadingAnnotations(false);
                })
                .finally(() => {
                    return () => {
                        setAnnotations(null); 
                        setErrorAnnotations(null);
                        setErrorCode(null);
                        setLoadingAnnotations(null);
                    }
                });
            }
        },
        [id, setAnnotations, setErrorAnnotations, setErrorCode, setLoadingAnnotations],
    );
    /* ------ ANNOTATIONS CALLBACK ------ */



    /* ------ ACCESS CALLBACKS ------ */
    /**
     * useCallback para verificar si el alumno tiene asignación a este recurso
     */
    const handleGetAuthorizedAccess = useCallback(
        async () => {
            if (id !== null)
            {
                setLoadingAuthorized(true);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-authorized-access", {
                    params: {
                        idCourse: Encrypt(id)
                    }
                })
                .then(result => {
                    console.log("the result is:", result);
                    if (result.data.data !== null && typeof(result.data.data) === "boolean")
                    {
                        setErrorAuthorized(false);
                        setAuthorized(result.data.data);
                        setErrorCode(null);
                    }
                    else
                    {
                        setErrorAuthorized(true);
                        setAuthorized(false);
                        setErrorCode(result.data.code);
                    }

                    setLoadingAuthorized(false);
                })
                .catch(error => {
                    setErrorAuthorized(true);
                    setAuthorized(false);

                    if (error.response)
                    {
                        setErrorCode(error.response.data.code);
                    }
                    else
                    {
                        setErrorCode("GET_UNIT_FILES_ERROR");
                    }

                    setLoadingAuthorized(false);
                })
                .finally(() => {
                    return () => {
                        setAuthorized(null);
                        setErrorAuthorized(null);
                        setErrorCode(null);
                    }
                });
            }
        },
        [id, setAuthorized, setErrorAuthorized, setErrorCode],
    );
    /* ------ ACCESS CALLBACKS ------ */



    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetAuthorizedAccess();
        }

        callQuery();

        return () => {
            setAuthorized(null)
        }
    }, [handleGetAuthorizedAccess, setAuthorized]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetDetailedSubject();
        }

        if (authorized === true)
        {
            return callQuery();
        }
    }, [authorized, handleGetDetailedSubject]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetAnnotations();
        }

        if (authorized === true)
        {
            return callQuery();
        }
    }, [authorized, handleGetAnnotations]);


    return (
        <div>
        {
            authorized === null || loadingAuthorized === true ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <CircularProgress style={{ color: "#2074d4" }} />
                        <Typography style={{ marginTop: 15 }}>Cargando</Typography>
                    </div>
                </div>
            ) : (
                authorized === false ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Typography>No tienes acceso a esta asignatura, contactese con el administrador</Typography>
                        </div>
                    </div>
                ) : (
                    loadingSubject === true ? (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Datos</Typography>
                            </div>
                        </div>
                    ) : (
                        errorSubject === true || errorAuthorized === true ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Typography>Ha ocurrido un error al momento de cargar la asignatura</Typography>
                                    <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={handleGetDetailedSubject}>
                                        <Typography>Recargar Contenido</Typography>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            subject === null ? (
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Cargando</Typography>
                                    </div>
                                </div>
                            ) : (
                                <React.Fragment>
                                    <Paper style={{ padding: 20, marginBottom: 15 }} variant="outlined">
                                        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                                            <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                                                Home
                                            </Link>
                                            <Link to="/my-subjects" style={{ textDecoration: "none", color: "#333" }}>
                                                Mis Asignaturas
                                            </Link>
                                            <Link to={`/subject/${Decrypt(subject.subject)[0].id}`} style={{ textDecoration: "none", color: "#333" }}>
                                                {Decrypt(subject.subject)[0].data.code}
                                            </Link>
                                            <Typography style={{ color: "#2074d4" }}>Mis Anotaciones</Typography>
                                        </Breadcrumbs>
                                    </Paper>

                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" style={{ marginBottom: 15 }}>Todas tus Anotaciones en la Asignatura {Decrypt(Decrypt(subject.subject)[0].data.courseName)}</Typography>
                                            
                                            <React.Fragment>
                                            {
                                                loadingAnnotations === true ? (
                                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", margin: 15 }}>
                                                        <CircularProgress style={{ color: "#2074d4" }} />
                                                    </div>
                                                ) : (
                                                    errorAnnotations === true ? (
                                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                <Typography>Ha ocurrido un error al momento de cargar las anotaciones</Typography>
                                                                <Button onClick={handleGetAnnotations} style={{ color: "#2074d4" }}>
                                                                    <Typography variant="button">Recargar Anotaciones</Typography>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        annotations === null ? (
                                                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", margin: 15 }}>
                                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                            </div>
                                                        ) : (
                                                            <React.Fragment>
                                                                <List>
                                                                {
                                                                    annotations.map(doc => (
                                                                        <ListItem key={doc.id}>
                                                                            <ListItemText primary={doc.data.description} secondary={doc.data.type} />
                                                                        </ListItem>
                                                                    ))
                                                                }
                                                                </List>

                                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                    <Button onClick={handleGetAnnotations} style={{ color: "#2074d4" }}>
                                                                        <Typography variant="button">Recargar Anotaciones</Typography>
                                                                    </Button>
                                                                </div>
                                                            </React.Fragment>
                                                        )
                                                    )
                                                )
                                            }
                                            </React.Fragment>
                                        </CardContent>
                                    </Card>
                                </React.Fragment>
                            )
                        )
                    )
                )
            )
        }
        </div>
    );
};

export default MyAnnotations;