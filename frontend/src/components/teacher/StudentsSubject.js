import { CircularProgress, List, ListItem, ListItemText, Typography, Divider, Paper, Breadcrumbs, Button, Card, CardContent, ListItemSecondaryAction, IconButton, Tooltip, useTheme, ThemeProvider, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, InputBase, Grid, createTheme, TextField, FormControl, MenuItem, Select, InputLabel } from '@material-ui/core';
import { GridOn, Info, NavigateNext, PlaylistAdd, PostAdd } from '@material-ui/icons';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clearAuthData } from '../../helpers/auth/handleGetLevel';
import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';
import { timeago } from '../../helpers/format/handleFormat';
import history from '../../helpers/history/handleHistory';
import { showMessage } from '../../helpers/message/handleMessage';
import { deleteRefreshToken, deleteToken } from '../../helpers/token/handleToken';

const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const StudentsSubject = () => {
    // uses
    const { id } = useParams();
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));



    // useStates
    const [students, setStudents] = useState(null);
    const [subject,   setSubject] = useState(null);
    const [helper, setHelper] = useState(null);
    const [grades, setGrades] = useState(null);
    const [annotations, setAnnotations] = useState(null);

    const [selectedStudent, setSelectedStudent] = useState(null);

    const [loading, setLoading] = useState(true);
    const [loadingGrades, setLoadingGrades] = useState(true);
    const [loadingSubject, setLoadingSubject] = useState(true);
    const [loadingAnnotation, setLoadingAnnotation] = useState(true);

    const [errorSubject, setErrorSubject] = useState(false);
    const [errorGrades, setErrorGrades] = useState(false);

    const [gradesDialog, setGradesDialog] = useState(false);
    const [annotationDialog, setAnnotationDialog] = useState(false);

    const [access, setAccess] = useState(null);
    const [authorized, setAuthorized] = useState(null);

    const [type, setType] = useState("");
    const [description, setDescription] = useState("");


    // useCallbacks
    /* ------ ACCESS CALLBACKS ------ */
    /**
     * useCallback para verificar si el alumno o profesor tiene asignación a este recurso
     */
    const handleGetAuthorizedAccess = useCallback(
        async () => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-authorized-access", {
                params: {
                    idCourse: Encrypt(id)
                }
            })
            .then(result => {
                if (result.data.data === true)
                {
                    setAuthorized(true);
                }
                else if (result.data.data === false)
                {
                    setAuthorized(false);
                }
                else
                {
                    setAuthorized(false);
                    showMessage("Ha ocurrido un error al momento de verificar el acceso a este curso");
                }
                console.log(result);
            })
            .catch(error => {
                setAuthorized(false);
                showMessage("Ha ocurrido un error al momento de verificar el acceso a este curso");
            })
            .finally(() => {
                return () => {
                    setAuthorized(null);
                }
            });
        },
        [id, setAuthorized],
    );


    /**
     * useCallback para obtener al usuario profesor en el curso actual
     */
    const handleGetTeacherCourse = useCallback(
        async () => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-teacher-course", {
                params: {
                    idCourse: Encrypt(id)
                }
            })
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    if (Decrypt(Decrypt(result.data.data)[0].data).helper === true)
                    {
                        setHelper(true);
                    }
                    else
                    {
                        setHelper(false);
                    }
                }
                else
                {
                    setHelper(true);
                }
            })
            .catch(error => {
                if (error.response)
                {
                    showMessage(error.response.message, "error");
                    setHelper(true);
                }
            })
            .finally(() => {
                return () => {
                    setHelper(null)
                }
            });
        },
        [id, setHelper],
    );


    /**
     * useCallback para obtener el nivel de acceso del usuario
     */
    const handleGetAccess = useCallback(
        async () => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-access")
            .then(result => {
                if (result.data.code === "PROCESS_OK")
                {
                    setAccess(result.data.data);
                }
            })
            .catch(error => {
                if (error.response)
                {
                    if (error.response.data.error.message === "TOKEN_MISSING")
                    {
                        clearAuthData();
                        history.push("/");
                    }
                    else if (error.response.data.error.message === "TOKEN_INVALID")
                    {
                        deleteToken();
                        deleteRefreshToken();

                        clearAuthData();
                        history.push("/");
                    }
                    else
                    {
                        console.log(error.response.data.error.message);
                    }
                }
            })
            .finally(() => {
                return () => {
                    setAccess(null);
                }
            });
        },
        [setAccess],
    );
    /* ------ ACCESS CALLBACKS ------ */


    /* ------ SUBJECT CALLBACK ------ */
    /**
     * useCallback para obtener el detalle de la asignatura
     */
    const handleGetDetailedSubject = useCallback(
        async () => {
            if (id !== null && authorized === true)
            {
                setLoadingSubject(true);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-detailed-course", {
                    params: {
                        courseID: id
                    }
                })
                .then(result => {
                    if (result.data.data.course[0].data === undefined)
                    {
                        setLoadingSubject(false);
                        setErrorSubject(true);
                    }
                    else
                    {
                        setLoadingSubject(false);
                        setErrorSubject(false);
                        setSubject(result.data.data);
                    }
                })
                .catch(error => {
                    setLoadingSubject(false);
                    setErrorSubject(true);
                    setSubject(undefined);
                })
                .finally(() => {
                    return () => {
                        setSubject(null); 
                        setErrorSubject(null);
                        setLoadingSubject(null);
                    }
                });
            }
        },
        [id, authorized, setErrorSubject, setLoadingSubject, setSubject],
    );
    /* ------ SUBJECT CALLBACK ------ */



    /* ------ STUDENTS CALLBACK ------ */
    /**
     * useCallback para obtener los estudiantes de la asignatura relacionadas con el curso
     */
    const handleGetStudentsCourse = useCallback(
        async () => {
            if (id !== null && authorized === true)
            {
                setLoading(true);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-students-courses", {
                    params: {
                        id: id
                    }
                })
                .then(result => {
                    if (result.data.code === "PROCESS_OK")
                    {   
                        setStudents(Decrypt(result.data.data));
                    }
                    else
                    {
                        setStudents([]);
                    }
                })
                .catch(error => {
                    showMessage(error.message, "error");
                    setStudents([]);
                })
                .finally(() => {
                    setLoading(false);

                    return () => {
                        setStudents(null);
                    }
                });
            }
        },
        [id, authorized, setStudents],
    );

    /**
     * useCallback para obtener las notas del estudiante seleccionado
     */
    const handleGetGradesStudentCourse = useCallback(
        async (userId) => {
            if (id !== null && userId !== null && authorized === true)
            {
                setLoadingGrades(true);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-grades-student-course", {
                    params: {
                        idCourse: Encrypt(id), 
                        idUser: Encrypt(userId)
                    }
                })
                .then(result => {
                    console.log("resultado", result);
                    if (result.status === 200 && result.data.code === "PROCESS_OK")
                    {   
                        setGrades(Decrypt(result.data.data));
                    }
                    else
                    {
                        setGrades([]);
                    }
                })
                .catch(error => {
                    if (error.response)
                    {
                        showMessage(error.response.message, "error"); 
                    }

                    setGrades([]);
                })
                .finally(() => {
                    setLoadingGrades(false);

                    return () => {
                        setGrades(null);
                    }
                });
            }
        },
        [id, authorized, setLoadingGrades, setGrades],
    );
    /* ------ STUDENTS CALLBACK ------ */



    /* ------ GRADES CALLBACK ------ */
    const handleAddGrades = useCallback(
        async (idUnit, numberUnit, nameUnit) => {
            let inputValue = document.getElementById(`grade${numberUnit}`).value;

            if (inputValue === "")
            {
                return showMessage("Complete el campo de texto", "info");
            }
            
            let intValue = parseInt(inputValue); 

            let object = {
                numberUnit: numberUnit,
                nameUnit: nameUnit,
                valueGrade: intValue
            }

            await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/post-grade-student-course", {
                gradeObject: Encrypt(object)
            }, {
                params: {
                    idCourse: Encrypt(id), 
                    idUser: Encrypt(selectedStudent.id),
                    idUnit: Encrypt(idUnit)
                }
            })
            .then(result => {
                console.log(result);
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {   
                    setGrades(Decrypt(result.data.data));

                    showMessage("Calificación añadida correctamente", "success");
                }
            })
            .catch(error => {
                if (error.response)
                {
                    showMessage(error.response.message, "error"); 
                }

                setGrades([]);
            })
            .finally(() => {
                return () => {
                    setGrades(null);
                }
            });
        },
        [id, selectedStudent, setGrades],
    );
    /* ------ GRADES CALLBACK ------ */



    /* ------ ANNOTATION CALBACKS ------ */
    const handleAddAnnotation = useCallback(
        async () => {
            let object = {
                type: Encrypt(type),
                description: Encrypt(description)
            }

            await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/post-annotation-student-course", {
                annotationObject: Encrypt(object)
            }, {
                params: {
                    idCourse: Encrypt(id), 
                    idUser: Encrypt(selectedStudent.id)
                }
            })
            .then(result => {
                console.log(result);
                /* if (result.status === 201 && result.data.code === "PROCESS_OK")
                {   
                    setGrades(Decrypt(result.data.data));

                    showMessage("Calificación añadida correctamente", "success");
                } */
            })
            .catch(error => {
                console.log(error);
                /* if (error.response)
                {
                    showMessage(error.response.message, "error"); 
                }

                setGrades([]); */
            })
            .finally(() => {
                /* return () => {
                    setGrades(null);
                } */
                console.log("FINISHED");
            });
        },
        [id, selectedStudent, type, description],
    );


    const handleGetAnnotations = useCallback(
        async (studentId) => {
            if (id !== null)
            {
                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-annotations-student-course", {
                    params: {
                        idCourse: Encrypt(id), 
                        idUser: Encrypt(studentId)
                    }
                })
                .then(result => {
                    console.log("ANOTACIONES", Decrypt(result.data.data));
                    /* if (result.status === 201 && result.data.code === "PROCESS_OK")
                    {   
                        setGrades(Decrypt(result.data.data));

                        showMessage("Calificación añadida correctamente", "success");
                    } */
                })
                .catch(error => {
                    console.log(error);
                    /* if (error.response)
                    {
                        showMessage(error.response.message, "error"); 
                    }

                    setGrades([]); */
                })
                .finally(() => {
                    /* return () => {
                        setGrades(null);
                    } */
                    console.log("FINISHED");
                });
            }
        },
        [id],
    );
    /* ------ ANNOTATION CALBACKS ------ */



    /* ------ DIALOG CALLBACKS ------ */
    /**
     * useCallback para mostrar el dialogo de asignar notas
     */
    const handleOpenSetGrades = useCallback(
        async (doc) => {
            if (grades === null)
            {
                await handleGetGradesStudentCourse(doc.id)
            }
            
            setSelectedStudent(doc);
            setGradesDialog(true);
        },
        [grades, handleGetGradesStudentCourse, setGradesDialog, setSelectedStudent],
    );

    /**
     * useCallback para cerrar el dialogo de estudiantes
     */
    const handleCloseSetGrades = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setGrades(null);
            setSelectedStudent(null);
            return setGradesDialog(false);
        },
        [setGradesDialog],
    );


    /**
     * useCallback para mostrar el dialogo de asignar notas
     */
    const handleOpenSetAnnotation = useCallback(
        async (doc) => {
            if (annotations === null)
            {
                await handleGetAnnotations(doc.id);
            }
            
            setSelectedStudent(doc);
            setAnnotationDialog(true);
        },
        [annotations, handleGetAnnotations, setAnnotationDialog, setSelectedStudent],
    );

    /**
     * useCallback para cerrar el dialogo de estudiantes
     */
    const handleCloseSetAnnotation = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setAnnotations(null);
            setSelectedStudent(null);
            setAnnotationDialog(false);

            return;
        },
        [setAnnotations, setSelectedStudent, setAnnotationDialog],
    );
    /* ------ DIALOG CALLBACKS ------ */



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
            await handleGetAccess();
        }

        if (authorized === true)
        {
            callQuery();

            return () => {
                setAccess(null);
            }
        }
    }, [authorized, handleGetAccess, setAccess]); 

    useEffect(() => {
        let callQuery = async () => {
            await handleGetStudentsCourse();
        }

        if (authorized === true)
        {
            callQuery();

            return () => {
                setStudents(null);
            }
        }
    }, [authorized, handleGetStudentsCourse, setStudents]); 

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
            await handleGetTeacherCourse();
        }

        if (authorized === true && subject !== undefined)
        {
            return callQuery();
        }
    }, [authorized, subject, handleGetTeacherCourse]);


    const handleChange = (value) => {
        document.getElementById("grade1").setAttribute("value", value)
    };


    return (
        <div>
        {
            authorized === null ? (
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
                            <Typography>No tienes acceso a estos datos, debido a que no estas asignado a este curso</Typography>
                        </div>
                    </div>
                ) : (
                    loading === true || loadingSubject === true || subject === null || access === null ? (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Datos</Typography>
                            </div>
                        </div>
                    ) : (
                        errorSubject === true || subject === undefined ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Typography>Ha ocurrido un eror al obtener los datos del sistema</Typography>
                                    <Button style={{ color: "#2074d4", marginTop: 5 }} onClick={async () => await handleGetDetailedSubject()}>
                                        <Typography>Recargar Datos</Typography>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            Decrypt(access) === "teacher" && (
                                <>
                                    <Paper style={{ padding: 20, marginBottom: 15 }} variant="outlined">
                                        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                                            <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                                                Home
                                            </Link>
                                            <Link to="/my-subjects" style={{ textDecoration: "none", color: "#333" }}>
                                                Mis Cursos
                                            </Link>
                                            <Link to={`/subject/${id}`} style={{ textDecoration: "none", color: "#333" }}>
                                                {subject.course[0].data.code}
                                            </Link>
                                            <Typography style={{ color: "#2074d4" }}>Estudiantes</Typography>
                                        </Breadcrumbs>
                                    </Paper>

                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6">Todos los estudiantes de la asignatura {Decrypt(subject.course[0].data.courseName)}</Typography>

                                            <Divider style={{ marginTop: 15, marginBottom: 15 }} />

                                            <List>
                                            {
                                                students.map(doc => (
                                                    <div key={doc.id}>
                                                        <ListItem>
                                                            <ListItemText primary={`${Decrypt(Decrypt(doc.data).name)} ${Decrypt(Decrypt(doc.data).surname)}`} secondary={`Asignado a este Curso ${timeago(new Date(Decrypt(doc.data).created_at._seconds * 1000))}`} security="true" />
                                                            
                                                            <ListItemSecondaryAction>
                                                            {
                                                                helper === null ? (
                                                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                                                        <CircularProgress style={{ color: "#2074d4" }} />
                                                                    </div>
                                                                ) : (
                                                                    helper === false && (
                                                                        <>
                                                                            <Tooltip title={<Typography>Asignar Notas a este Estudiante</Typography>}>
                                                                                <IconButton edge="end" onClick={() => handleOpenSetGrades(doc)} style={{ marginRight: 5 }}>
                                                                                    <GridOn />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title={<Typography>Asignar Anotaciones a este estudiante</Typography>}>
                                                                                <IconButton edge="end" onClick={() => {handleOpenSetAnnotation(doc)}} style={{ marginRight: 5 }}>
                                                                                    <PlaylistAdd />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title={<Typography>Mas Información de esto</Typography>}>
                                                                                <IconButton edge="end">
                                                                                    <Info />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </>
                                                                    )
                                                                )
                                                            }
                                                            </ListItemSecondaryAction>
                                                        </ListItem>
                                                        
                                                        <Divider />
                                                    </div>
                                                ))
                                            }
                                            </List>
                                        </CardContent>
                                    </Card>



                                    <Dialog open={gradesDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseSetGrades} fullScreen={fullScreen} scroll="paper">
                                    {
                                        grades === null || selectedStudent === null ? (
                                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                            </div>
                                        ) : (
                                            <>
                                                <DialogTitle>Asignar Calificaciones al estudiante {Decrypt(Decrypt(selectedStudent.data).name)} {Decrypt(Decrypt(selectedStudent.data).surname)}</DialogTitle>
                                                <DialogContent>
                                                    <DialogContentText>Asigna calificaciones al usuario {Decrypt(Decrypt(selectedStudent.data).name)} {Decrypt(Decrypt(selectedStudent.data).surname)} en el curso {subject.course[0].data.grade} {subject.course[0].data.number}º{subject.course[0].data.letter} para la asignatura {subject.course[0].data.type}</DialogContentText>
                                                    <DialogContentText variant="subtitle1" style={{ textDecoration: "underline" }}>Nota: los campos de texto que no completes con calificaciones no se van a añadir</DialogContentText>

                                                    <TableContainer component={Paper} elevation={0} variant="outlined">
                                                        <Table>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Nº Calificación</TableCell>
                                                                    <TableCell align="right">Nº de la Unidad</TableCell>
                                                                    <TableCell align="right">Nombre de la Unidad</TableCell>
                                                                    <TableCell align="center">Nota</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                            {
                                                                subject.units.map((doc, index) => (
                                                                    <TableRow key={doc.id}>
                                                                        <TableCell component="th" scope="row">
                                                                            {index + 1}
                                                                        </TableCell>
                                                                        <TableCell align="right">{doc.unit.numberUnit}</TableCell>
                                                                        <TableCell align="right">{doc.unit.unit}</TableCell>
                                                                        <TableCell align="right">
                                                                            <InputBase id={`grade${doc.unit.numberUnit}`} placeholder="Inserte una calificación" inputProps={{ 'aria-label': 'naked' }} defaultValue={grades.find(x => x.id === doc.id) !== undefined ? grades.find(x => x.id === doc.id).data.valueGrade : ""} onChange={(e) => handleChange(e.target.value)} security="true" />
                                                                        </TableCell>
                                                                        <TableCell align="right">
                                                                            <Tooltip title={<Typography>Añadir Calificación en {doc.unit.unit}</Typography>}>
                                                                                <IconButton onClick={() => handleAddGrades(doc.id, doc.unit.numberUnit, doc.unit.unit)}>
                                                                                    <PostAdd />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            }
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button color="inherit" onClick={handleCloseSetGrades}>
                                                        <Typography>Cerrar Esta Ventana</Typography>
                                                    </Button>
                                                </DialogActions>
                                            </>
                                        )
                                    }
                                    </Dialog>


                                    <Dialog open={annotationDialog} maxWidth={"xl"} fullWidth={true} onClose={handleCloseSetAnnotation} fullScreen={fullScreen} scroll="paper">
                                    {
                                        selectedStudent === null ? (
                                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                            </div>
                                        ) : (
                                            <>
                                                <DialogTitle>Asignar Anotaciones al estudiante {Decrypt(Decrypt(selectedStudent.data).name)} {Decrypt(Decrypt(selectedStudent.data).surname)}</DialogTitle>
                                                <DialogContent>
                                                    <DialogContentText>Crea anotaciones al usuario {Decrypt(Decrypt(selectedStudent.data).name)} {Decrypt(Decrypt(selectedStudent.data).surname)}</DialogContentText>
                                                    
                                                    <Grid container direction="row" alignItems="flex-start">
                                                        <Grid item container md={7} alignItems="center" justifyContent="center">
                                                            <Card variant="outlined" style={{ width: "100%", marginLeft: 5, marginRight: 5, marginTop: 15 }}>
                                                                <CardContent>
                                                                    <Typography variant="h6">Todas las anotaciones del estudiante {Decrypt(Decrypt(selectedStudent.data).name)} {Decrypt(Decrypt(selectedStudent.data).surname)}</Typography>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>

                                                        <Grid item container md={5} alignItems="center" justifyContent="center">
                                                            <Card variant="outlined" style={{ width: "100%", marginLeft: 5, marginRight: 5, marginTop: 15 }}>
                                                                <CardContent>
                                                                    <Typography variant="h6">Crear una nueva anotación</Typography>

                                                                    <Typography style={{ color: "#2074d4" }}>Datos de la anotación</Typography>
                                                                    <Divider style={{ height: 2, marginBottom: 15, backgroundColor: "#2074d4" }} />
                                                                                    
                                                                    <ThemeProvider theme={InputTheme}>
                                                                        <FormControl style={{ marginBottom: 15 }} variant="outlined" fullWidth>
                                                                            <InputLabel>Tipo de Anotación</InputLabel>
                                                                            <Select value={type} label="Tipo de Anotación" onChange={(e) => setType(e.target.value)}>
                                                                                <MenuItem value="positive">Positiva</MenuItem>
                                                                                <MenuItem value="negative">Negativa</MenuItem>  
                                                                            </Select>
                                                                        </FormControl>

                                                                        <TextField type="text" label="Descripción" variant="outlined" security="true" value={description} fullWidth multiline onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: 15 }} />
                                                                    </ThemeProvider>

                                                                    <Button fullWidth style={{ color: "#2074d4" }} onClick={handleAddAnnotation}>
                                                                        <Typography>Crear Anotación</Typography>
                                                                    </Button>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    </Grid>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button color="inherit" onClick={handleCloseSetAnnotation}>
                                                        <Typography>Cerrar Esta Ventana</Typography>
                                                    </Button>
                                                </DialogActions>
                                            </>
                                        )
                                    }
                                    {/* {
                                        grades === null || selectedStudent === null ? (
                                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                            </div>
                                        ) : (
                                            <>
                                                <DialogTitle>Asignar Calificaciones al estudiante {Decrypt(Decrypt(selectedStudent.data).name)} {Decrypt(Decrypt(selectedStudent.data).surname)}</DialogTitle>
                                                <DialogContent>
                                                    <DialogContentText>Asigna calificaciones al usuario {Decrypt(Decrypt(selectedStudent.data).name)} {Decrypt(Decrypt(selectedStudent.data).surname)} en el curso {subject.course[0].data.grade} {subject.course[0].data.number}º{subject.course[0].data.letter} para la asignatura {subject.course[0].data.type}</DialogContentText>
                                                    <DialogContentText variant="subtitle1" style={{ textDecoration: "underline" }}>Nota: los campos de texto que no completes con calificaciones no se van a añadir</DialogContentText>

                                                    <TableContainer component={Paper} elevation={0} variant="outlined">
                                                        <Table>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Nº Calificación</TableCell>
                                                                    <TableCell align="right">Nº de la Unidad</TableCell>
                                                                    <TableCell align="right">Nombre de la Unidad</TableCell>
                                                                    <TableCell align="center">Nota</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                            {
                                                                subject.units.map((doc, index) => (
                                                                    <TableRow key={doc.id}>
                                                                        <TableCell component="th" scope="row">
                                                                            {index + 1}
                                                                        </TableCell>
                                                                        <TableCell align="right">{doc.unit.numberUnit}</TableCell>
                                                                        <TableCell align="right">{doc.unit.unit}</TableCell>
                                                                        <TableCell align="right">
                                                                            <InputBase id={`grade${doc.unit.numberUnit}`} placeholder="Inserte una calificación" inputProps={{ 'aria-label': 'naked' }} defaultValue={grades.find(x => x.id === doc.id) !== undefined ? grades.find(x => x.id === doc.id).data.valueGrade : ""} onChange={(e) => handleChange(e.target.value)} security="true" />
                                                                        </TableCell>
                                                                        <TableCell align="right">
                                                                            <Tooltip title={<Typography>Añadir Calificación en {doc.unit.unit}</Typography>}>
                                                                                <IconButton onClick={() => handleAddGrades(doc.id, doc.unit.numberUnit, doc.unit.unit)}>
                                                                                    <PostAdd />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            }
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button color="inherit" onClick={handleCloseSetGrades}>
                                                        <Typography>Cerrar Esta Ventana</Typography>
                                                    </Button>
                                                </DialogActions>
                                            </>
                                        )
                                    } */}
                                    </Dialog>
                                </>
                            )
                        )
                    )
                )
            )
        }
        </div>
    )
}

export default StudentsSubject
