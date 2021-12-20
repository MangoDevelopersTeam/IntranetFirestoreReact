import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Breadcrumbs, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { FormatListNumbered, NavigateNext } from '@material-ui/icons';

import { Decrypt, Encrypt } from './../../helpers/cipher/cipher';

import axios from 'axios';

const MyAllGrades = () => {
    // uses
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));


    // useStates
    const [courses, setCourses] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errorCourses, setErrorCourses] = useState(false);
    const [errorCode, setErrorCode] = useState(null);

    const [grades, setGrades] = useState(null);
    const [errorGrades, setErrorGrades] = useState(false);
    const [loadingGrades, setLoadingGrades] = useState(false);

    const [units, setUnits] = useState(null);
    const [errorUnits, setErrorUnits] = useState(false);
    const [loadingUnits, setLoadingUnits] = useState(false);
    
    const [average, setAverage] = useState(null);
    const [situation, setSituation] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);

    const [gradesDialog, setGradesDialog] = useState(false);



    // useCallbacks
    /**
     * useCallback para obtener los cursos del profesor actual
     */
    const handleGetTeacherStudentCourses = useCallback(
        async () => {
            setLoadingCourses(true);

            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-user-courses")
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setCourses(Decrypt(result.data.data));
                    setErrorCourses(false);
                }
                else
                {
                    setErrorCourses(true);
                }

                setLoadingCourses(false);
            })
            .catch(error => {
                if (error.response)
                {
                    setErrorCode(error.response.data.code);
                    setLoadingCourses(false);
                    setErrorCourses(true);

                    console.log(error.response);
                }
            })
            .finally(() => {
                return () => {
                    setLoadingCourses(null);
                    setErrorCourses(null);
                    setErrorCode(null);
                    setCourses(null);
                }
            });
        },
        [setCourses, setErrorCode, setErrorCourses, setLoadingCourses],
    );

    /**
     * useCallback para obtener las unidades de la asignatura
     */
    const handleGetUnits = useCallback(
        async (id) => {
            if (id !== null)
            {
                setLoadingUnits(true);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-units-course", {
                    params: {
                        subjectIdParam: Encrypt(id)
                    }
                })
                .then(result => {
                    if (result.status === 200 && result.data.code === "PROCESS_OK")
                    {
                        console.log("UNITS : ", Decrypt(result.data.data));
                        setErrorUnits(false);
                        setUnits(Decrypt(result.data.data));
                        setErrorCode(null);
                    }
                    else
                    {
                        setErrorUnits(true);
                        setUnits(null);
                        setErrorCode(result.data.code);
                    }

                    setLoadingUnits(false);
                })
                .catch(error => {
                    setErrorUnits(true);
                    setUnits(null);
                    
                    if (error.response)
                    {
                        console.log(error.response);
                        setErrorCode(error.response.data.code);
                    }
                    else
                    {
                        setErrorCode("GET_DETAILED_SUBJECT_ERROR");
                    }

                    setLoadingUnits(false);   
                })
                .finally(() => {
                    return () => {
                        setUnits(null); 
                        setErrorUnits(null);
                        setErrorCode(null);
                        setLoadingUnits(null);
                    }
                });
            }
        },
        [setUnits, setErrorUnits, setErrorCode, setLoadingUnits],
    );


    /* ------ GRADES CALLBACK ------ */
    /**
     * useCallback para obtener las calificaciones del alumno
     */
    const handleGetGrades = useCallback(
        async (id) => {
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
        [setGrades, setErrorGrades, setErrorCode, setLoadingGrades],
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

    // get-units-course
    /* ------ GRADES CALLBACK ------ */


    /**
     * useCallback para mostrar el dialogo de asignar notas
     */
    const handleOpenStudentGrades = useCallback(
        async (doc) => {
            if (doc !== null)
            {
                setSelectedSubject(doc);
                setGradesDialog(true);

                if (grades === null)
                {   
                    await handleGetGrades(doc.id);
                    await handleGetUnits(doc.id);
                }
            }
            
        },
        [grades, handleGetGrades, setGradesDialog, setSelectedSubject],
    );

    /**
     * useCallback para cerrar el dialogo de estudiantes
     */
    const handleCloseStudentGrades = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setGradesDialog(false);
            setGrades(null);
            setUnits(null);
            setAverage(null);
            setSituation(null);
            setSelectedSubject(null);

            return;
        },
        [setGradesDialog, setGrades, setUnits, setAverage, setSituation, setSelectedSubject],
    );
    

    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetTeacherStudentCourses();
        }

        
        callQuery();
        
        return () => {
            setCourses(null);
        }
    }, [setCourses, handleGetTeacherStudentCourses]);

    useEffect(() => {
        let callQuery = async () => {
            await calculateAverage();
        }

        if (grades !== null)
        {
            return callQuery();
        }
    }, [grades, calculateAverage]);

    
    return (
        <div>
            <Paper style={{ padding: 20, marginBottom: 15 }} variant="outlined">
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                    <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                        Home
                    </Link>
                    <Typography style={{ color: "#2074d4" }}>Mis Notas</Typography>
                </Breadcrumbs>
            </Paper>

            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6">Todas las asignaturas Asignadas a Tí</Typography>    

                    <Divider style={{ marginTop: 15, marginBottom: 15 }} />

                    {/* HACER QUE EL APODERADO PUEDA VER  LOS ALUMNOS ASIGNADOS A EL, QUE PUEDA VER LAS ANOTACIONES DEL ALUMNO Y SUS NOTAS */}

                    {/** HACER QUE SE PUEDAN HACER TAREAS, RESPONDER TAREAS Y QUE PUEDAN DESCARGAR TAREAS */}

                    <div>
                    {
                        loadingCourses === true ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <CircularProgress style={{ color: "#2074d4" }} />
                                    <Typography style={{ marginTop: 15 }}>Cargando Asignaturas</Typography>
                                </div>
                            </div>
                        ) : (
                            errorCourses === true ? (
                                <React.Fragment>
                                    <Typography style={{ textAlign: "center" }}>
                                    {
                                        errorCode !== null && (
                                            errorCode === "NO_COURSES" ? (
                                                "No existen asignaturas asignados a ti aún"
                                            ) : errorCode === "FIREBASE_GET_COURSES_ERROR" ? (
                                                "Ha ocurrido un error al obtener las asignaturas asignados a tí"
                                            ) : (
                                                "Ha ocurrido un error, intente obtener las asignaturas nuevamente"
                                            )
                                        )
                                    }
                                    </Typography>
                                    
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                        <Button onClick={() => handleGetTeacherStudentCourses()} style={{ color: "#2074d4" }}>Recargar Asignaturas</Button>
                                    </div>
                                </React.Fragment>
                            ) : (
                                courses === null ? (
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <CircularProgress style={{ color: "#2074d4" }} />
                                            <Typography style={{ marginTop: 15 }}>Cargando</Typography>
                                        </div>
                                    </div>
                                ) : (
                                    <React.Fragment>
                                        <List>
                                        {
                                            courses.map(doc => (
                                                <div key={doc.id}>
                                                    <ListItem>
                                                        <ListItemText primary={Decrypt(Decrypt(doc.data).name)} secondary={Decrypt(doc.data).code} />
                                                        <ListItemSecondaryAction>
                                                            <Tooltip title={<Typography>Ver las notas de este curso</Typography>}>
                                                                <IconButton edge="end" onClick={() => handleOpenStudentGrades(doc)}>
                                                                    <FormatListNumbered />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </ListItemSecondaryAction>
                                                    </ListItem>

                                                    <Divider />
                                                </div>
                                            ))
                                        }
                                        </List>
                                    
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={() => handleGetTeacherStudentCourses()} style={{ color: "#2074d4" }}>Recargar Asignaturas</Button>
                                        </div>

                                        <Dialog open={gradesDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseStudentGrades} fullScreen={fullScreen} scroll="paper">
                                            <DialogTitle>{selectedSubject === null ? "Tus calificaciones en esta asignatura" : `Tus calificaciones de la asignatura ${Decrypt(Decrypt(selectedSubject.data).name)}`}</DialogTitle>
                                            <DialogContent>
                                                <React.Fragment>
                                                {
                                                    selectedSubject === null ? (
                                                        <div style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            <Typography style={{ marginTop: 15 }}>Cargando Datos de la asignatura Seleccionada</Typography>
                                                        </div>
                                                    ) : (
                                                        <React.Fragment>
                                                        {
                                                            loadingUnits === true ? (
                                                                <div style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                    <Typography style={{ marginTop: 15 }}>Cargando Unidades</Typography>
                                                                </div>
                                                            ) : (
                                                                errorUnits === true ? (
                                                                    <div style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                        <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener las unidades del curso</Typography>
                                                                        
                                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                        <Button onClick={async () => await handleGetUnits(selectedSubject.id)} style={{ color: "#2074d4" }}>Recargar Unidades</Button>
                                                                    </div>
                                                                ) : (
                                                                    units === null ? (
                                                                        <div style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                            <Typography style={{ marginTop: 15 }}>Cargando Unidades</Typography>
                                                                        </div>
                                                                    ) : (
                                                                        loadingGrades === true ? (
                                                                            <div style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                                <Typography style={{ marginTop: 15 }}>Cargando Calificaciones</Typography>
                                                                            </div>
                                                                        ) : (
                                                                            errorGrades === true ? (
                                                                                <div style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                                    <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener tus calificaciones de la asignatura</Typography>
                                                                                    
                                                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                                    <Button onClick={async () => await handleGetGrades(selectedSubject.id)} style={{ color: "#2074d4" }}>Recargar Calificaciones</Button>
                                                                                </div>
                                                                            ) : (
                                                                                grades === null ? (
                                                                                    <div style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                                        <Typography style={{ marginTop: 15 }}>Cargando Calificaciones</Typography>
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
                                                                                                        units.map((doc, index) => (
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
                                                                                            <Button onClick={async () => await handleGetGrades(selectedSubject.id)} style={{ color: "#2074d4" }}>
                                                                                                <Typography variant="button">Recargar Calificaciones</Typography>
                                                                                            </Button>
                                                                                        </div>
                                                                                    </React.Fragment>
                                                                                )
                                                                            )
                                                                        )
                                                                    )
                                                                )
                                                            )
                                                        }
                                                        </React.Fragment>
                                                    )
                                                }
                                                </React.Fragment>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button color="inherit" onClick={handleCloseStudentGrades}>
                                                    <Typography variant="button">Cerrar Esta Ventana</Typography>
                                                </Button>
                                            </DialogActions>
                                        </Dialog>
                                    </React.Fragment>
                                )
                            )
                        )
                    }
                    </div>              
                </CardContent>
            </Card>
        </div>
    );
};

export default MyAllGrades;