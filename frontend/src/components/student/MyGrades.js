import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ThemeProvider } from '@material-ui/styles';
import { NavigateNext } from '@material-ui/icons';
import { Breadcrumbs, Button, CardContent, CircularProgress, createTheme, Paper, Typography, useMediaQuery, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Divider } from '@material-ui/core';

import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';

import axios from 'axios';

const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const MyGrades = () => {
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

    const [grades, setGrades] = useState(null);
    const [errorGrades, setErrorGrades] = useState(false);
    const [loadingGrades, setLoadingGrades] = useState(true);

    const [average, setAverage] = useState(null);
    const [situation, setSituation] = useState(null);

    

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



    /* ------ GRADES CALLBACK ------ */
    /**
     * useCallback para obtener las calificaciones del alumno
     */
    const handleGetGrades = useCallback(
        async () => {
            if (id !== null)
            {
                setLoadingGrades(true);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-my-grades-student", {
                    params: {
                        idSubjectParam: Encrypt(id)
                    }
                })
                .then(result => {
                    console.log(Decrypt(result.data.data));
                    if (result.status === 200 && result.data.code === "PROCESS_OK")
                    {
                        setErrorGrades(false);
                        setGrades(Decrypt(result.data.data));
                        setErrorCode(null);
                    }
                    else
                    {
                        setErrorGrades(true);
                        setGrades(null);
                        setErrorCode(result.data.code);
                    }
                    
                    setLoadingGrades(false);
                })
                .catch(error => {
                    setErrorGrades(true);
                    setGrades(null);
                    
                    if (error.response)
                    {
                        console.log(error.response);
                        setErrorCode(error.response.data.code);
                    }
                    else
                    {
                        setErrorCode("GET_DETAILED_SUBJECT_ERROR");
                    }

                    setLoadingGrades(false);   
                })
                .finally(() => {
                    return () => {
                        setGrades(null); 
                        setErrorGrades(null);
                        setErrorCode(null);
                        setLoadingGrades(null);
                    }
                });
            }
        },
        [id, setGrades, setErrorGrades, setErrorCode, setLoadingGrades],
    );

    /**
     * useCallback que calcula el promedio y la situación que tiene
     */
    const calculateAverage = useCallback(
        async () => {
            if (grades !== null)
            {
                let numberGrades = grades.length;
                let plusNumbers = 0;

                await grades.forEach((doc, index) => {
                    plusNumbers += doc.data.valueGrade;

                    if (index === numberGrades - 1)
                    {
                        setAverage(Math.round(plusNumbers/numberGrades));

                        console.log("THE AVERAGE IS ", plusNumbers/numberGrades);

                        if (plusNumbers/numberGrades >= 40)
                        {
                            setSituation("Aprobado");
                        }
                        else
                        {
                            setSituation("Reprobado");
                        }
                    }
                })
            }
        },
        [grades, setAverage, setSituation],
    );
    /* ------ GRADES CALLBACK ------ */



    /* ------ ACCESS CALLBACKS ------ */
    /**
     * useCallback para verificar si el alumno o profesor tiene asignación a este recurso
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
            await handleGetGrades();
        }

        if (authorized === true)
        {
            return callQuery();
        }
    }, [authorized, handleGetGrades]);

    useEffect(() => {
        let callQuery = async () => {
            await calculateAverage();
        }

        if (authorized === true)
        {
            return callQuery();
        }
    }, [authorized, calculateAverage]);

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
                                            <Typography style={{ color: "#2074d4" }}>Mis Notas</Typography>
                                        </Breadcrumbs>
                                    </Paper>

                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" style={{ marginBottom: 15 }}>Todas tus Calificaciones en la Asignatura {Decrypt(Decrypt(subject.subject)[0].data.courseName)}</Typography>
                                            
                                            <React.Fragment>
                                            {
                                                loadingGrades === true ? (
                                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", margin: 15 }}>
                                                        <CircularProgress style={{ color: "#2074d4" }} />
                                                    </div>
                                                ) : (
                                                    errorGrades === true ? (
                                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                <Typography>Ha ocurrido un error al momento de cargar las notas</Typography>
                                                                <Button onClick={handleGetGrades} style={{ color: "#2074d4" }}>
                                                                    <Typography variant="button">Recargar Calificaciones</Typography>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        grades === null ? (
                                                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", margin: 15 }}>
                                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                            </div>
                                                        ) : (
                                                            <React.Fragment>
                                                                <TableContainer component={Paper} style={{ marginBottom: 15 }} elevation={0} variant="outlined">
                                                                    <Table>
                                                                        <TableHead security="true" style={{ backgroundColor: "#2074d4" }}>
                                                                            <TableRow>
                                                                                <TableCell align="center" style={{ color: "#FFF" }}>Nº Calificación</TableCell>
                                                                                <TableCell align="center" style={{ color: "#FFF" }}>Nº de la Unidad</TableCell>
                                                                                <TableCell align="center" style={{ color: "#FFF" }}>Nombre de la Unidad</TableCell>
                                                                                <TableCell align="center" style={{ color: "#FFF" }}>Nota</TableCell>
                                                                            </TableRow>
                                                                        </TableHead>

                                                                        <TableBody>
                                                                            <React.Fragment>
                                                                            {
                                                                                Decrypt(subject.units).map((doc, index) => (
                                                                                    <TableRow key={doc.id}>
                                                                                        <TableCell align="center" component="th" scope="row">{index + 1}</TableCell>
                                                                                        <TableCell align="center">{doc.data.numberUnit}</TableCell>
                                                                                        <TableCell align="center">{doc.data.unit}</TableCell>
                                                                                        <TableCell align="center">
                                                                                            <Typography color={grades.length > 0 ? grades.find(x => x.id === doc.id) !== undefined && grades.find(x => x.id === doc.id).data.valueGrade >= 40 ? `primary` : `error` : `inherit`}>{grades.length > 0 ? grades.find(x => x.id === doc.id) !== undefined ? grades.find(x => x.id === doc.id).data.valueGrade : "" : "?"}</Typography>
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                ))
                                                                            }
                                                                            </React.Fragment>

                                                                            <TableRow>
                                                                                <TableCell rowSpan={1} />
                                                                                <TableCell align="right" colSpan={2}>Promedio</TableCell>
                                                                                <TableCell align="center">
                                                                                    <Typography color={grades.length > 0 && average !== null ? average >= 40 ? `primary` : `error` : `inherit`}>{grades.length > 0 ? average !== null ? average : "Cargando" : "?"}</Typography>
                                                                                </TableCell>
                                                                            </TableRow>

                                                                            <TableRow>
                                                                                <TableCell rowSpan={1} />
                                                                                <TableCell align="right" colSpan={2}>Situación</TableCell>
                                                                                <TableCell align="center">
                                                                                    <Typography>{grades.length > 0 ? situation !== null ? situation : "Cargando" : "?"}</Typography>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        </TableBody>
                                                                    </Table>
                                                                </TableContainer>

                                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                    <Button onClick={handleGetGrades} style={{ color: "#2074d4" }}>
                                                                        <Typography variant="button">Recargar Calificaciones</Typography>
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

export default MyGrades;