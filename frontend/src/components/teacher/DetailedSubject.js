import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useTheme } from '@material-ui/styles';
import { ExpandMore, NavigateNext, Queue } from '@material-ui/icons';
import { Accordion, AccordionDetails, AccordionSummary, Breadcrumbs, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, Input, List, ListItem, ListItemText, Paper, Tooltip, Typography, useMediaQuery } from '@material-ui/core';

import history from './../../helpers/history/handleHistory';
import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';
import { clearAuthData } from '../../helpers/auth/handleGetLevel';
import { showMessage } from '../../helpers/message/handleMessage';
import { deleteRefreshToken, deleteToken } from '../../helpers/token/handleToken';

import StudentListItem from '../subject/StudentListItem';

import axios from 'axios';


const DetailedSubject = () => {
    // uses
    const { id } = useParams();
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));



    // useStates
    const [subject, setSubject] = useState(null);
    const [students, setStudents] = useState(null);
    const [studentsCourse, setStudentsCourse] = useState(null);

    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(true);

    const [error,     setError] = useState(false);
    const [access,   setAccess] = useState(null);
    const [editor, setEditor] = useState(false);
    const [authorized, setAuthorized] = useState(null);

    const [studentsDialog, setStudentsDialog] = useState(false);
    const [unitsFileDialog, setUnitsFileDialog] = useState(false);
    
    const [unitName, setUnitName] = useState(null);
    const [unitNumber, setUnitNumber] = useState(null);
    const [unitId, setUnitId] = useState(null);

    const [file, setFile] = useState(null);
    const [extensions, setExtensions] = useState([".gdoc", ".gsheet", ".doc", ".docx", ".xlsx", ".ppt", ".pptx", ".pdf"]);


    
    // useCallbacks
    /**
     * useCallback para setear la imagen en el estado de react
     */
    const handleSetFile = useCallback(
        (e) => {
           if (e.target.files[0])
           {
                setFile(e.target.files[0])
           } 
        },
        [setFile],
    );


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
                if (result?.data?.data === true)
                {
                    setAuthorized(true);
                }
                else if (result?.data?.data === false)
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
                    setAccess(null);
                }
            });
        },
        [id, setAuthorized],
    );

    /**
     * useCallback para obtener el detalle de la asignatura
     */
    const handleGetDetailedSubject = useCallback(
        async () => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-detailed-course", {
                params: {
                    courseID: id
                }
            })
            .then(result => {
                console.log(result.data.data.course[0].data);
                console.log(result.data.data.units);

                if (result.data.data.course[0].data === undefined)
                {
                    setLoading(false);
                    setError(true);
                }
                else
                {
                    setLoading(false);
                    setError(false);
                    setSubject(result.data.data);
                }
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
                setError(false);
                setSubject(undefined);
            })
            .finally(() => {
                return () => {
                    setSubject(null); 
                    setError(null);
                    setLoading(null);
                }
            })
        },
        [id, setLoading, setError, setSubject],
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
            })
            .finally(() => {
                return () => {
                    setAccess(null);
                }
            });
        },
        [setAccess],
    );

    /**
     * useCallback para obtener los estudiantes de la asignatura relacionadas con el curso
     */
    const handleGetStudentsCourse = useCallback(
        async () => {
            if (id !== null && subject !== null)
            {
                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-students-courses", {
                    params: {
                        id: id
                    }
                })
                .then(result => {
                    if (result.data.code === "PROCESS_OK")
                    {   
                        setStudentsCourse(Decrypt(result.data.data));
                    }
                    else
                    {
                        setStudentsCourse([]);
                    }
                })
                .catch(error => {
                    showMessage(error.message, "error");
                    setStudentsCourse([]);
                })
                .finally(() => {
                    return () => {
                        setStudentsCourse(null);
                    }
                });
            }
        },
        [id, subject, setStudentsCourse],
    );

    /**
     * useCallback para obtener a los alumnos del sistema, que esten vinculados al curso de la asignatura
     */
    const handleGetStudents = useCallback(
        async () => {
            if (subject !== null)
            {
                setLoadingStudents(true);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-students", {
                    params: {
                        number: subject.course[0].data.number,
                        letter: subject.course[0].data.letter,
                        grade: subject.course[0].data.grade
                    }
                })
                .then(async result => {
                    if (result.data.code === "PROCESS_OK")
                    {
                        setStudents(Decrypt(result.data.data));
                        await handleGetStudentsCourse()
                    }
                    else
                    {
                        setStudents([]); 
                    }
                })
                .catch(error => {
                    showMessage(error.message, "error");
                    console.log(error);
                    setStudents([]);
                })
                .finally(() => {
                    setLoadingStudents(false);

                    return () => {
                        setStudents(null);
                    }
                });
            }
        },
        [subject, setStudents, setLoadingStudents, handleGetStudentsCourse],
    );


    /**
     * useCallback para mostrar el dialogo de estudiantes
     */
    const handleOpenStudentsDialog = useCallback(
        async () => {
            if (students === null)
            {
                await handleGetStudents();
            }
    
            setStudentsDialog(true);
        },
        [students, handleGetStudents, setStudentsDialog],
    );

    /**
     * useCallback para cerrar el dialogo de estudiantes
     */
    const handleCloseStudentsDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            return setStudentsDialog(false);
        },
        [setStudentsDialog],
    );


    /**
     * useCallback para mostrar el dialogo de estudiantes
     */
    const handleOpenFilesUnitDialog = useCallback(
        async (id, name, number) => {
            setUnitId(id);
            setUnitName(name);
            setUnitNumber(number);

            setUnitsFileDialog(true);
        },
        [setUnitsFileDialog, setUnitId, setUnitName, setUnitNumber],
    );

    /**
     * useCallback para cerrar el dialogo de estudiantes
     */
    const handleCloseFilesUnitDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setUnitId(null);
            setUnitName(null);
            setUnitNumber(null);

            return setUnitsFileDialog(false);
        },
        [setUnitsFileDialog, setUnitId, setUnitName, setUnitNumber],
    );


    /**
     * useCallback para verificar si la extensión del archivo es valida o no
     */
    const handleVerifyFileExtension = useCallback(
        () => {
            if (file !== null && extensions !== null)
            {
                return (new RegExp('(' + extensions.join('|').replace(/\./g, '\\.') + ')$', "i")).test(file.name);
            }
        },  
        [file, extensions],
    );

    /**
     * useCallback para subir un archivo que retornará el enlace y lo enviará al backend
     */
    const handleUploadFile = useCallback(
        () => {
            let xd = handleVerifyFileExtension();
            
            console.log(xd);
        },
        [handleVerifyFileExtension],
    );



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
            await handleGetDetailedSubject();
        }

        if (authorized === true)
        {
            return callQuery();
        }
    }, [authorized, handleGetDetailedSubject]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetStudentsCourse();
        }

        if (authorized === true)
        {
            callQuery();

            return () => {
                setStudentsCourse(null);
            }
        }
    }, [authorized, handleGetStudentsCourse, setStudentsCourse]);



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
                            <Typography>No tienes acceso a esta asignatura, contactese con el administrador</Typography>
                        </div>
                    </div>
                ) : (
                    loading === true ? (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Datos</Typography>
                            </div>
                        </div>
                    ) : (
                        error === true ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Typography>Ha ocurrido un error al momento de cargar la asignatura</Typography>
                                    <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={() => handleGetDetailedSubject}>
                                        <Typography>Recargar Contenido</Typography>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            subject !== null && access !== null ? (
                                <>
                                    <Paper style={{ padding: 20, marginBottom: 15 }} variant="outlined">
                                        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                                            <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                                                Home
                                            </Link>
                                            <Link to="/my-subjects" style={{ textDecoration: "none", color: "#333" }}>
                                                Mis Cursos
                                            </Link>
                                            <Typography style={{ color: "#2074d4" }}>{subject.course[0].data.code}</Typography>
                                        </Breadcrumbs>
                                    </Paper>

                                    <Grid container spacing={2}>
                                        <Grid item container md={9} style={{ marginTop: 15 }}>
                                            <Card variant="outlined" style={{ width: "100%" }}>
                                                <CardContent>
                                                    <Typography variant="h5" color="textSecondary">{Decrypt(subject.course[0].data.courseName)}</Typography>
                                                    <Typography variant="subtitle1" style={{ marginBottom: 15 }}>{Decrypt(subject.course[0].data.description)}</Typography>

                                                    <List>
                                                    {
                                                        subject.units.map(doc => (
                                                            <div key={doc.id}>
                                                                <ListItem>
                                                                    <ListItemText primary={`Unidad ${doc.unit.numberUnit} : ${doc.unit.unit}`} />
                                                                </ListItem>

                                                                {
                                                                    editor === true && (
                                                                        <Tooltip title={<Typography variant="subtitle1">{`Añadir archivos en la unidad ${doc.unit.numberUnit}`}</Typography>}>
                                                                            <IconButton onClick={() => handleOpenFilesUnitDialog(doc.id, doc.unit.unit, doc.unit.numberUnit)}>
                                                                                <Queue />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )
                                                                }

                                                                <Divider style={{ marginTop: 5, marginBottom: 15 }} /> 
                                                            </div>
                                                        ))
                                                    }
                                                    </List>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item container md={3} style={{ marginTop: 15 }}>
                                            <Card variant="outlined" style={{ width: "100%" }}>
                                                <CardContent>
                                                {
                                                    Decrypt(access) === "teacher" && (
                                                        <>
                                                            <Button fullWidth style={{ color: "#2074d4" }} onClick={handleOpenStudentsDialog}>
                                                                <Typography>Asignar Estudiantes</Typography>
                                                            </Button>

                                                            <Button fullWidth style={{ color: "#34495E", marginTop: 15 }} onClick={() => setEditor(!editor)}>
                                                            {
                                                                editor === false ? (
                                                                    <Typography>Abrir editor para subir archivos</Typography>
                                                                ) : (
                                                                    <Typography>Cerrar Editor para subir archivos</Typography>
                                                                )
                                                            }
                                                            </Button>
                                                        </>
                                                    )
                                                }
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                    
                                    {
                                        Decrypt(access) === "teacher" && (
                                            <>
                                                <Dialog open={studentsDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseStudentsDialog} fullScreen={fullScreen} scroll="paper">
                                                {
                                                    subject === null ? (
                                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            <CircularProgress style={{ color: "#2074d4" }} />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <DialogTitle>Asignar estudiantes a la asignatura {Decrypt(subject.course[0].data.courseName)}</DialogTitle>
                                                            <DialogContent>
                                                                <DialogContentText>Asigna estudiantes del curso {subject.course[0].data.grade} {`${subject.course[0].data.grade} ${subject.course[0].data.number}º${subject.course[0].data.letter}`} para la asignatura {subject.course[0].data.type}</DialogContentText>

                                                                <Accordion variant="outlined">
                                                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                                                        <Typography>Ver Alumnos</Typography>
                                                                    </AccordionSummary>
                                                                    <AccordionDetails>
                                                                        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                                                        {
                                                                            loadingStudents === true ? (
                                                                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                                    <CircularProgress style={{ color: "#2074d4" }} />
                                                                                </div>
                                                                            ) : (
                                                                                students !== null && studentsCourse !== null ? (
                                                                                    students.length > 0 ? (
                                                                                        <>
                                                                                            <List style={{ width: "100%" }}>
                                                                                            {
                                                                                                students.map(doc => (
                                                                                                    <StudentListItem key={doc.id} subjectId={id} course={Encrypt(subject.course[0].data)} student={doc} students={students} studentsCourse={studentsCourse} setStudentsCourse={setStudentsCourse} />
                                                                                                ))
                                                                                            }
                                                                                            </List> 

                                                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                                                <Button onClick={async () => await handleGetStudents()} style={{ color: "#2074d4" }}>
                                                                                                    <Typography>Recargar Estudiantes</Typography>
                                                                                                </Button>
                                                                                            </div>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <Typography style={{ textAlign: "center" }}>No existen alumnos a esta asignatura del curso</Typography>
                                                                                                    
                                                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                                                <Button onClick={async () => await handleGetStudents()} style={{ color: "#2074d4" }}>Recargar Estudiantes</Button>
                                                                                            </div>
                                                                                        </>
                                                                                    )
                                                                                ) : (
                                                                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                                        <CircularProgress style={{ color: "#2074d4" }} />
                                                                                    </div>
                                                                                )
                                                                            )
                                                                        }
                                                                        </div>
                                                                    </AccordionDetails>
                                                                </Accordion>                                       
                                                            </DialogContent>
                                                            <DialogActions>
                                                                <Button color="inherit" onClick={() => setStudentsDialog(false)}>
                                                                    <Typography>Cerrar Esta Ventana</Typography>
                                                                </Button>
                                                            </DialogActions>
                                                        </>
                                                    )
                                                }
                                                </Dialog>

                                                <Dialog open={unitsFileDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseFilesUnitDialog} fullScreen={fullScreen} scroll="paper">
                                                {
                                                    unitId === null || unitName === null || unitNumber === null ? (
                                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            <CircularProgress style={{ color: "#2074d4" }} />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <DialogTitle>Asigna archivos de estudio para la unidad Nº{unitNumber} : {unitName}</DialogTitle>
                                                            <DialogContent>
                                                                <Input aria-label="File" type="file" onChange={handleSetFile} />
                                                                <Button variant="text" color="inherit" type="submit" onClick={() => handleUploadFile()}>verify</Button>
                                                            </DialogContent>
                                                            <DialogActions>
                                                                <Button color="inherit" onClick={() => handleCloseFilesUnitDialog()}>
                                                                    <Typography>Cerrar Esta Ventana</Typography>
                                                                </Button>
                                                            </DialogActions>
                                                        </>
                                                    )
                                                }
                                                </Dialog>
                                            </>
                                        )
                                    }
                                </>
                            ) : (
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Cargando</Typography>
                                    </div>
                                </div>
                            )
                        )
                    )
                )
            )
        }
        </div>
    )
}

export default DetailedSubject;