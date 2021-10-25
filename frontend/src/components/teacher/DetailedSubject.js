import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactDOM from 'react-dom';

import { ThemeProvider, useTheme } from '@material-ui/styles';
import { Cancel, ExpandMore, NavigateNext, Publish, Queue } from '@material-ui/icons';
import { Accordion, AccordionDetails, AccordionSummary, Breadcrumbs, Button, Card, CardContent, CircularProgress, createTheme, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, Input, LinearProgress, List, ListItem, ListItemText, Paper, TextField, Tooltip, Typography, useMediaQuery, withStyles } from '@material-ui/core';

import history from './../../helpers/history/handleHistory';
import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';
import { clearAuthData } from '../../helpers/auth/handleGetLevel';
import { showMessage } from '../../helpers/message/handleMessage';
import { deleteRefreshToken, deleteToken } from '../../helpers/token/handleToken';

import StudentListItem from '../subject/StudentListItem';

import { storage } from './../../firebase';

import axios from 'axios';

const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

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
    const [loadingUpload,     setLoadingUpload] = useState(false);

    const [error,     setError] = useState(false);

    const [access,   setAccess] = useState(null);
    const [editor, setEditor] = useState(false);
    const [authorized, setAuthorized] = useState(null);

    const [studentsDialog, setStudentsDialog] = useState(false);
    const [unitsFileDialog, setUnitsFileDialog] = useState(false);
    
    const [unitName, setUnitName] = useState(null);
    const [unitNumber, setUnitNumber] = useState(null);
    const [unitId, setUnitId] = useState(null);

    const [name, setName] = useState("");
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [description, setDescription] = useState("");

    const [cancel, setCancel] = useState(false);
    const [uploadReference, setUploadReference] = useState(null);
    
    const [extensions, setExtensions] = useState([".gdoc", ".gsheet", ".doc", ".docx", ".xlsx", ".ppt", ".pptx", ".pdf", ".zip", ".rar", ".7z", ".mp4"]);
    
    const [unitFiles, setUnitFiles] = useState(null);
    const [unitFilesError, setUnitFilesError] = useState(false);
    const [unitFilesLoading, setUnitFilesLoading] = useState(true);



    // useCallbacks
    /* ------ SUBJECT CALLBACK ------ */
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

    const handleGetUnitFiles = useCallback(
        async () => {
            let array = [];

            await subject.units.forEach(async doc => {
                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-unit-files", {
                    params: {
                        idSubjectParam: Encrypt(id),
                        idUnitParam: Encrypt(doc.id)
                    }
                })
                .then(result => {
                    array.push(result.data.data);

                    if (array.length === subject.units.length)
                    {
                        setUnitFilesError(false);
                        setUnitFilesLoading(false);

                        setUnitFiles(array);
                    }
                })
                .catch(error => {
                    if (error.response)
                    {
                        showMessage(error.response.message, "error");
                    }

                    setUnitFilesError(true);
                    setUnitFilesLoading(false);
                })
                .finally(() => {
                    return () => {
                        setUnitFiles(null);
                        setUnitFilesError(null);
                        setUnitFilesLoading(null);
                    }
                });
            })
        },
        [id, subject, setUnitFiles, setUnitFilesError, setUnitFilesLoading],
    )
    /* ------ SUBJECT CALLBACK ------ */


    
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
                    setAuthorized(null);
                }
            });
        },
        [id, setAuthorized],
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
    /* ------ ACCESS CALLBACKS ------ */



    /* ------ STUDENTS CALLBACK ------ */
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
    /* ------ STUDENTS CALLBACK ------ */



    /* ------ DIALOG CALLBACKS ------ */
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
    /* ------ DIALOG CALLBACKS ------ */



    /* ------ HANDLE FILE CALLBACKS ------ */
    /**
     * useCallback para cancelar la suba del archivo
     */
    const handleCancelUpload = useCallback(
        () => {
            if (uploadReference !== null)
            {
                uploadReference.cancel();
                setProgress(0);
            }

            return;
        },
        [uploadReference, setProgress],
    );

    /**
     * useCallback para limpiar los useState y campos de texto del formulario cargar archivo
     */
    const handleClearFileParams = useCallback(
        () => {
            setDescription("");
            setFile(null);
            setName("");

            setCancel(false);
            setLoadingUpload(false);
            setProgress(0);
        },
        [setDescription, setFile, setName, setCancel, setLoadingUpload, setProgress],
    );

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
        async () => {
            if (subject === null || id === null)
            {
                showMessage("No puede realizar esta operación, se requieren datos importantes, intentelo nuevamente", "error");
            }

            if (file === null || name === "" || description === "")
            {
                return showMessage("Complete todos los valores", "info");
            }

            if (handleVerifyFileExtension() !== true)
            {
                return showMessage("La extensión del archivo es invalido, intentelo nuevamente", "info");
            }

            let uploadFile = storage.ref(`course/${id}/unit/${unitId}/${file.name}`).put(file);
            setUploadReference(uploadFile);
            setLoadingUpload(true);
            setCancel(true);

            let object = {
                name: null,
                description: null,
                url: null
            };

            uploadFile.on('state_changed', snapshot => {
                let progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(progress);
            }, (error) => {
                if (error.code === "storage/canceled")
                {
                    showMessage("La subida del archivo ha sido cancelada", "info");
                }
                else
                {
                    showMessage(error.code, "error");
                }

                setUploadReference(null);
                setLoadingUpload(false);
                setCancel(false);
            }, async () => {
                await storage.ref(`course/${id}/unit/${unitId}`).child(file.name).getDownloadURL()
                .then(async url => {
                    object.url = Encrypt(url);
                    object.name = Encrypt(name);
                    object.description = Encrypt(description);

                    await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/post-file-course", {
                        objectData: Encrypt(object)
                    }, {
                        params: {
                            idSubjectParam: Encrypt(id),
                            idUnitParam: Encrypt(unitId)
                        }
                    })
                    .then(async () => {
                        await handleGetUnitFiles();
                    })
                    .catch(error => {
                        if (error.response)
                        {
                            showMessage(error.response.message, "error");
                        }

                        setUnitFilesError(true);
                        setUnitFilesLoading(false);
                    })
                    .finally(() => {
                        console.log("request finished");
                    });

                    handleClearFileParams();
                })
                .catch(error => {
                    showMessage(error, "error");

                    handleClearFileParams();
                    
                    return;
                });
            });
        },
        [id, subject, unitId, file, name, description, handleVerifyFileExtension, setUploadReference, setCancel, setLoadingUpload, setProgress, handleClearFileParams, handleGetUnitFiles],
    );
    /* ------ HANDLE FILE CALLBACKS ------ */



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

    useEffect(() => {
        let callQuery = async () => {
            await handleGetUnitFiles();
        }

        if (authorized === true && subject !== null)
        {
            return callQuery();
        }
    }, [authorized, subject, handleGetUnitFiles]);


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
                            subject === null || access === null ? (
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Cargando</Typography>
                                    </div>
                                </div>
                            ) : (
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

                                                                <>
                                                                {
                                                                    editor === true && (
                                                                        <Tooltip title={<Typography variant="subtitle1">{`Añadir archivos en la unidad ${doc.unit.numberUnit}`}</Typography>}>
                                                                            <IconButton onClick={() => handleOpenFilesUnitDialog(doc.id, doc.unit.unit, doc.unit.numberUnit)}>
                                                                                <Queue />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )
                                                                }
                                                                </>

                                                                <>
                                                                {
                                                                    unitFilesLoading === true ? (
                                                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: 5 }}>
                                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                                                <Typography style={{ marginTop: 15 }}>Cargando</Typography>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        unitFilesError === true ? (
                                                                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                                <Typography style={{ textAlign: "center" }}>Ha ocurrido un error al obtener las unidades</Typography>
                                                                            </div>
                                                                        ) : (
                                                                            unitFiles === null ? (
                                                                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: 5 }}>
                                                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                        <CircularProgress style={{ color: "#2074d4" }} />
                                                                                        <Typography style={{ marginTop: 15 }}>Cargando Archivos</Typography>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <ListItem>
                                                                                    <List>
                                                                                    {
                                                                                        unitFiles.filter(x => x.idUnit === doc.id)[0].data.length > 0 && (
                                                                                            unitFiles.filter(x => x.idUnit === doc.id)[0].data.map(doc => (
                                                                                                <ListItem key={doc.id} component="a" href={Decrypt(doc.data.url)} style={{ width: "fit-content", height: "fit-content" }}>
                                                                                                    <ListItemText primary={<Typography>{Decrypt(doc.data.name)}</Typography>} />
                                                                                                </ListItem>
                                                                                            ))
                                                                                        )
                                                                                    }
                                                                                    </List>
                                                                                </ListItem>
                                                                            )
                                                                        )
                                                                    )                                       
                                                                }
                                                                </>

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
                                                            <Button fullWidth style={{ color: "#2074d4", marginBottom: 15 }} onClick={handleOpenStudentsDialog}>
                                                                <Typography>Asignar Estudiantes</Typography>
                                                            </Button>

                                                            <Button fullWidth style={{ color: "#34495E", marginBottom: 15 }} onClick={() => setEditor(!editor)}>
                                                            {
                                                                editor === false ? (
                                                                    <Typography>Abrir editor para subir archivos</Typography>
                                                                ) : (
                                                                    <Typography>Cerrar Editor para subir archivos</Typography>
                                                                )
                                                            }
                                                            </Button>

                                                            <Link to={`/subject/students/${id}`} style={{ textDecoration: "none", marginBottom: 15 }}>
                                                                <Button fullWidth style={{ color: "#2074d4" }}>
                                                                    <Typography>Ver Estudiantes</Typography>
                                                                </Button>
                                                            </Link>
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

                                                <Dialog open={unitsFileDialog} maxWidth={"md"} onClose={handleCloseFilesUnitDialog} fullScreen={fullScreen} scroll="paper">
                                                {
                                                    unitId === null || unitName === null || unitNumber === null ? (
                                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            <CircularProgress style={{ color: "#2074d4" }} />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <DialogTitle>Asigna archivos de estudio para la unidad Nº{unitNumber} : {unitName}</DialogTitle>
                                                            <DialogContent>
                                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                                    {
                                                                        loadingUpload === true ? (
                                                                            <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                                                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                                                <Typography style={{ textAlign: "center", marginTop: 15 }}>El archivo se esta subiendo, espere un momento</Typography>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <Typography style={{ color: "#2074d4" }}>Datos del Archivo</Typography>
                                                                                <Divider style={{ height: 2, marginBottom: 15, backgroundColor: "#2074d4" }} />
                                                                                    
                                                                                <ThemeProvider theme={InputTheme}>
                                                                                    <TextField type="text" label="Nombre"      variant="outlined" security="true" value={name} fullWidth onChange={(e) => setName(e.target.value)} style={{ marginBottom: 15 }} />
                                                                                    <TextField type="text" label="Descripción" variant="outlined" security="true" value={description} fullWidth onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: 15 }} />
                                                                                    <TextField type="file" variant="outlined"  security="true" fullWidth onChange={handleSetFile} style={{ marginBottom: 15 }} />
                                                                                </ThemeProvider>
                                                                            </>
                                                                        )
                                                                    }
                                                                
                                                                    <Typography style={{ marginTop: 15, color: "#2074d4" }}>Progreso de la Carga</Typography>
                                                                    <Divider style={{ height: 2, backgroundColor: "#2074d4" }} />

                                                                    <ThemeProvider theme={InputTheme}>
                                                                        <div style={{ display: "flex", justifyContent: "center", marginTop: 15 }}>
                                                                            <Typography>{`${progress}%`}</Typography>
                                                                            <LinearProgress variant="determinate" style={{ marginLeft: "auto", marginTop: 8, width: "calc(100% - 50px)" }} value={progress} />
                                                                        </div>
                                                                    </ThemeProvider>
                                                                </div>
                                                            </DialogContent>
                                                            <DialogActions>
                                                            {
                                                                cancel === true ? (
                                                                    <Button style={{ color: "#34495E" }} onClick={() => handleCancelUpload()}>
                                                                        <Typography>Cancelar Subida</Typography>
                                                                    </Button>
                                                                ) : (
                                                                    <>
                                                                        <Button style={{ color: "#2074d4" }} onClick={() => handleUploadFile()}>
                                                                            <Typography>Subir Archivo</Typography>
                                                                        </Button>

                                                                        <Button color="inherit" onClick={() => handleCloseFilesUnitDialog()}>
                                                                            <Typography>Cerrar Esta Ventana</Typography>
                                                                         </Button>
                                                                    </>                    
                                                                )
                                                            }
                                                            </DialogActions>
                                                        </>
                                                    )
                                                }
                                                </Dialog>
                                            </>
                                        )
                                    }
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

export default DetailedSubject;