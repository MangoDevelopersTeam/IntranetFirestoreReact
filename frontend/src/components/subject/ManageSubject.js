import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Breadcrumbs, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, InputLabel, List, ListItem, ListItemText, MenuItem, Paper, Select, TextField, Typography, useMediaQuery, useTheme, createTheme, ThemeProvider, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import { Delete, NavigateNext } from '@material-ui/icons';

import { hideNewCourseDialog, showNewCourseDialog } from '../../helpers/dialogs/handleDialogs';
import { showMessage } from '../../helpers/message/handleMessage';
import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';

import { myGrades, myLetterGrades, myNumberGrades } from '../../utils/allGrades';
import { myArrayCourses } from '../../utils/allCourses';

import { SELECT_NEW_COURSE } from '../../redux/dialogsSlice';

import { course } from './../../classes/course';

import axios from 'axios';

const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const ManageSubject = () => {
    // uses
    const themeApp = useTheme();
    const history = useHistory();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));
    const newCourse = useSelector(SELECT_NEW_COURSE);


    // useStates
    const [subjects, setSubjects] = useState(null);
    const [errorSubjects, setErrorSubjects] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [errorCode, setErrorCode] = useState(null);

    const [type, setType] = useState("");
    const [courseName, setCourseName] = useState("");
    const [description, setDescription] = useState("");

    const [grade, setGrade] = useState("");
    const [number, setNumber] = useState(1);
    const [letter, setLetter] = useState("");
    const [disabled, setDisabled] = useState(true);

    const [loadingPostSubject, setLoadingPostSubject] = useState(false);
    const [errorPostSubject, setErrorPostSubject] = useState(false);

    const [loadingDeleteSubject, setLoadingDeleteSubject] = useState(false);
    const [errorDeleteSubject, setErrorDeleteSubject] = useState(false);
    const [deleteSubjectDialog, setDeleteSubjectDialog] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);

    const [mutableGrades, setMutableGrades] = useState(myNumberGrades);
   

    // useCallbacks
    // common callbacks
    /**
     * useCallback para limpiar los campos de texto
     */
    const handleClearFields = useCallback(
        () => {
            setCourseName("");
            setDescription("");
            setLetter("");
            setType("");
            setGrade("");
            setNumber(1);
            setDisabled(true);
        },
        [setCourseName, setDescription, setLetter, setType, setGrade, setNumber, setDisabled],
    );

    /**
     * useCallback para manejar el cambio de numeros de curso por el tipo de nivel, si es Básica o Media
     */
    const handleNumberCourseGrade = useCallback(
        (grade) => {
            if (grade === null)
            {
                return;
            }
            
            setGrade(grade);
            setDisabled(false);

            if (myGrades.find(x => x === grade) === "Media")
            {
                return setMutableGrades(myNumberGrades.slice(0, 4));
            }
            
            return setMutableGrades(myNumberGrades);
        },
        [setGrade, setDisabled, setMutableGrades],
    );

    /**
     * useCallback para obtener los cursos desde la API Rest
     */
    const handleGetCourses = useCallback(
        async () => {
            setLoadingSubjects(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/testing-get-course`)
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setSubjects(Decrypt(result.data.data));
                    setLoadingSubjects(false);
                    setErrorSubjects(false);
                    setErrorCode(null);
                }
                else
                {
                    setLoadingSubjects(false);
                    setSubjects(undefined);
                    setErrorSubjects(true);
                    setErrorCode(result.data.code);
                }
            })
            .catch(error => {
                setLoadingSubjects(false);
                setSubjects(undefined);
                setErrorSubjects(true);
                
                if (error.response)
                {
                    return setErrorCode(error.response.data.code);
                }
                else
                {
                    return setErrorCode("GET_SUBJECTS_ERROR")
                }
            })
            .finally(() => {
                return () => {
                    setSubjects(null);
                    setErrorCode(null);
                    setLoadingSubjects(null);
                    setErrorSubjects(null);
                }
            });
        },
        [setLoadingSubjects, setErrorSubjects, setErrorCode, setSubjects],
    );

    /**
     * use callback para crear la asignatura en la base de datos
     */
    const handleCreateCourse = useCallback(
        async () => {
            if (type === null || grade === null || letter === null || courseName === null || description === null)
            {
                return showMessage("Complete todos los Datos", "info");
            }

            if (type === "" || grade === "" || letter === "" || courseName === "" || description === "")
            {
                return showMessage("Complete todos los Datos", "info");
            }

            if (myNumberGrades.find(x => x === number) === undefined)
            {
                return showMessage("Verifique el Numero Seleccionado del Curso", "info");
            }

            if (myGrades.find(x => x === grade) === undefined || myLetterGrades.find(x => x === letter) === undefined)
            {
                return showMessage("Verifique los Datos Seleccionados del Curso", "info");
            }

            let courseIntranet = new course(null, Encrypt(type), Encrypt(grade), Encrypt(number), Encrypt(letter), Encrypt(courseName), Encrypt(description));

            setLoadingPostSubject(true);      

            await axios.post(`${process.env.REACT_APP_API_URI}/create-course`, {
                courseData: Encrypt(courseIntranet),
            })
            .then(async result => {
                console.log(result);
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    await handleGetCourses();
                    setLoadingPostSubject(false);
                    setErrorPostSubject(false);
                    setErrorCode(null);
                    
                    hideNewCourseDialog();
                    handleClearFields();

                    return showMessage(result.data.message, result.data.type);
                }
                else
                {
                    setLoadingPostSubject(false);
                    setErrorPostSubject(true);
                    setErrorCode(result.data.code);

                    return;
                }
            })
            .catch(error => {
                setLoadingPostSubject(false);
                setErrorPostSubject(true);
                
                if (error.response)
                {
                    console.log(error.response);
                    return setErrorCode(error.response.data.code);
                }
                else
                {
                    return setErrorCode("POST_SUBJECT_ERROR");
                }
            })
            .finally(() => {
                return () => {
                    setLoadingPostSubject(null);
                    setErrorPostSubject(null);
                    setErrorCode(null);
                    setSubjects(null);
                }
            });
        },
        [type, grade, letter, number, courseName, description, handleGetCourses, setSubjects, setErrorCode, setErrorPostSubject, setLoadingPostSubject, handleClearFields],
    );

    


    // dialogs
    /**
     * useCallback para cerrar el dialogo de crear una nueva asignatura
     */
    const handleHideNewCourseDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            handleClearFields();
            hideNewCourseDialog();
        },
        [handleClearFields],
    );

    const handleShowNewCourseDialog = useCallback(
        (doc) => {
            if (doc === null)
            {
                return;
            }

            setSelectedSubject(doc);
            setDeleteSubjectDialog(true);
        },
        [setSelectedSubject, setDeleteSubjectDialog],
    );

    const handleHideDeleteCourseDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setDeleteSubjectDialog(false);
        },
        [setDeleteSubjectDialog],
    );


    // common callbacks
    const handleDeleteCourse = useCallback(
        async () => {
            if (selectedSubject === null)
            {
                return;
            }

            setLoadingDeleteSubject(true);

            await axios.delete(`${process.env.REACT_APP_API_URI}/delete-course`, {
                params: {
                    paramIdSubject: Encrypt(selectedSubject.id)
                }
            })
            .then(async result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    await handleGetCourses();
                    setLoadingDeleteSubject(false);
                    setErrorDeleteSubject(false);
                    setErrorCode(null);
                    handleHideDeleteCourseDialog();
                }
                else
                {
                    setLoadingDeleteSubject(false);
                    setErrorDeleteSubject(false);
                    setErrorCode(result.data.code);
                }
            })
            .catch(error => {
                setLoadingDeleteSubject(false);
                setErrorDeleteSubject(false);
                
                if (error.response)
                {
                    return setErrorCode(error.response.data.code);
                }
                else
                {
                    return setErrorCode("GET_SUBJECTS_ERROR")
                }
            })
            .finally(() => {
                return () => {
                    setLoadingDeleteSubject(null);
                    setErrorDeleteSubject(null);
                    setErrorCode(null);
                }
            });
        },
        [selectedSubject, setLoadingDeleteSubject, setErrorDeleteSubject, setErrorCode, handleHideDeleteCourseDialog],
    );


    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetCourses();
        }

        callQuery();

        return () => {
            setSubjects(null);
        }
    }, [setSubjects, handleGetCourses]);


    return (
        <Paper elevation={0}>
            <Paper variant="outlined" style={{ padding: 20, marginBottom: 20 }}>
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                    <Link to="/" style={{ textDecoration: "none", color: "#333" }}>Home</Link>
                    <Typography style={{ color: "#2074d4" }}>Manejar Asignaturas</Typography>
                </Breadcrumbs>
            </Paper> 

            <Card variant="outlined" style={{ marginBottom: 20 }}>
                <CardContent>
                    <Paper elevation={0} style={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="h6">Todas las asignaturas</Typography>
                        <Button variant="text" style={{ color: "#2074d4" }} onClick={showNewCourseDialog}>
                            <Typography variant="button">Añadir nueva asignatura</Typography>
                        </Button>   
                    </Paper>       

                    <Divider style={{ marginTop: 15, marginBottom: 15 }} />
                                    
                    <React.Fragment>
                    {
                        loadingSubjects === true ? (
                            <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Obteniendo las Asignaturas</Typography>
                            </Paper>
                        ) : errorSubjects === true ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode !== null ? (
                                        errorCode === "COURSES_NOT_FOUND" ? (
                                            "No existen asignaturas creadas aún"
                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                        ) : (
                                            "Algo inesperado ha ocurrido al obtener las asignaturas"
                                        )
                                    ) : (
                                        "Algo inesperado ha ocurrido al obtener las asignaturas"
                                    )
                                }
                                </Typography>

                                <React.Fragment>
                                {
                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={async () => await handleGetCourses()} style={{ color: "#2074d4" }}>
                                                <Typography variant="button">Recargar Asignaturas</Typography>
                                            </Button>
                                        </Paper>
                                    )
                                }
                                </React.Fragment>
                            </React.Fragment>
                        ) : subjects === null ? (
                            <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Obteniendo las Asignaturas</Typography>
                            </Paper>
                        ) : subjects === undefined ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode !== null ? (
                                        errorCode === "COURSES_NOT_FOUND" ? (
                                            "No existen asignaturas creadas aún"
                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                        ) : (
                                            "Algo inesperado ha ocurrido al obtener las asignaturas"
                                        )
                                    ) : (
                                        "Algo inesperado ha ocurrido al obtener las asignaturas"
                                    )
                                }
                                </Typography>

                                <React.Fragment>
                                {
                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={async () => await handleGetCourses()} style={{ color: "#2074d4" }}>
                                                <Typography variant="button">Recargar Asignaturas</Typography>
                                            </Button>
                                        </Paper>
                                    )
                                }
                                </React.Fragment>
                            </React.Fragment>
                        ) : subjects.length <= 0 ? (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center" }}>Al parecer no hay asignaturas creadas, recargue el contenido con el botón inferior</Typography>

                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                    <Button onClick={async () => await handleGetCourses()} style={{ color: "#2074d4" }}>
                                        <Typography variant="button">Recargar Asignaturas</Typography>
                                    </Button>
                                </Paper>
                            </React.Fragment>
                        ) : (
                            <Paper elevation={0}>
                                <List style={{ marginTop: 5 }}>
                                {
                                    subjects.map(doc => (
                                        <Paper key={doc.id} elevation={0}>
                                            <ListItem button onClick={() => history.push(`/subjects/${doc.id}`)}>
                                                <ListItemText primary={Decrypt(doc.data.courseName)} secondary={doc.data.code} />
                                                <ListItemSecondaryAction>
                                                    <IconButton onClick={() => handleShowNewCourseDialog(doc)} edge="end" aria-label="delete">
                                                        <Delete />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>

                                            <Divider />
                                        </Paper>
                                    ))
                                }
                                </List>

                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                    <Button onClick={async () => await handleGetCourses()} style={{ color: "#2074d4" }}>
                                        <Typography variant="button">Recargar Asignaturas</Typography>
                                    </Button>
                                </Paper>
                            </Paper>
                        )
                    }
                    </React.Fragment>                     
                </CardContent>
            </Card>  

            <Dialog open={newCourse} fullScreen={fullScreen} scroll="paper" onClose={handleHideNewCourseDialog}>
                <DialogTitle>Crear Asignatura</DialogTitle>

                <Paper elevation={0}>
                    <DialogContent>
                    {
                        loadingPostSubject === true ? (
                            <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <CircularProgress style={{ color: "#2074d4" }} />
                                    <Typography style={{ marginTop: 15 }}>Creando Asignatura</Typography>
                                </Paper>
                            </Paper>
                        ) : errorPostSubject === true ? (
                            <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(2% + 10px)" }}>
                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <React.Fragment>
                                    {
                                        errorCode !== null && (
                                            <React.Fragment>
                                                <Typography style={{ textAlign: "center" }}>
                                                {
                                                    errorCode !== null ? (
                                                        errorCode === "COURSE_PARAMS_INVALID" ? (
                                                            "Asegurese de que los tipos de datos sean correctos, intentelo nuevamente"
                                                        ) : errorCode === "COURSE_DATA_NULL" ? (
                                                            "Asegurese de enviar los datos de forma correcta, intentelo nuevamente porfavor"
                                                        ) : errorCode === "EXISTING_COURSE" ? (
                                                            "El curso que ha tratado de crear ya existe en el sistema, intentelo nuevamente"
                                                        ) : errorCode === "FIREBASE_CHECK_CODE_ERROR" ? (
                                                            "Ha ocurrido un error al procesar la solicitud, intentelo nuevamente"
                                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                                        ) : (
                                                            "Ha ocurrido un error al intentar registrar la asignatura, intentelo nuevamente"
                                                        )
                                                    ) : (
                                                        "Ha ocurrido un error al intentar registrar la asignatura, intentelo nuevamente"
                                                    )
                                                }
                                                </Typography>

                                                <React.Fragment>
                                                {
                                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                            <Button onClick={() => setErrorPostSubject(false)} style={{ color: "#2074d4" }}>
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
                                <DialogContentText>
                                    Completa los valores en el formulario para crear una nueva asignatura en intranet, que este vinculada a un curso
                                </DialogContentText>

                                <React.Fragment>
                                    <ThemeProvider theme={InputTheme}>
                                        <Typography style={{ color: "#2074d4" }}>Datos de la Asignatura</Typography>
                                        <Divider style={{ height: 2, marginBottom: 15, backgroundColor: "#2074d4" }} />

                                        <TextField variant="outlined" type="text" security="true" value={courseName} label="Nombre de la Asignatura" fullWidth onChange={(e) => setCourseName(e.target.value)} />

                                        <FormControl variant="outlined" fullWidth style={{ marginTop: 15 }}>
                                            <InputLabel>Materia de la Asignatura</InputLabel>
                                            <Select value={type} label="Tipo de Asignatura" security="true" onChange={(e) => setType(e.target.value)}>
                                            {
                                                myArrayCourses.map(doc => (
                                                    <MenuItem key={doc} value={doc}>{doc}</MenuItem>
                                                ))
                                            }
                                            </Select>
                                        </FormControl>

                                        <TextField variant="outlined" type="text" value={description} label="Descripción de la Asignatura" style={{ marginTop: 15 }} security="true" fullWidth multiline onChange={(e) => setDescription(e.target.value)} />
                                                
                                        <Typography style={{ marginTop: 15, color: "#2074d4" }}>Datos del Curso de la Asignatura</Typography>
                                        <Divider style={{ height: 2, backgroundColor: "#2074d4" }} />

                                        <Paper elevation={0} style={{ display: "flex" }}>
                                            <FormControl variant="outlined" style={{ marginTop: 15, width: "calc(100vh - 30px)", marginRight: 7.5 }}>
                                                <InputLabel>Grado del Curso</InputLabel>
                                                <Select value={grade} label="Grado del curso" security="true" onChange={(e) => handleNumberCourseGrade(e.target.value)}>
                                                {
                                                    myGrades.map(doc => (
                                                        <MenuItem key={doc} value={doc}>{doc}</MenuItem>
                                                    ))
                                                }
                                                </Select>
                                            </FormControl>

                                            <FormControl variant="outlined" style={{ marginTop: 15, width: "calc(100vh - 30px)", marginRight: 7.5, marginLeft: 7.5 }}>
                                                <InputLabel>Numero del Curso</InputLabel>
                                                <Select value={number} label="Numero del curso" security="true" disabled={disabled} onChange={(e) => setNumber(e.target.value)}>
                                                {
                                                    mutableGrades.map(doc => (
                                                        <MenuItem key={doc} value={doc}>{doc}</MenuItem>
                                                    ))
                                                }
                                                </Select>
                                            </FormControl>

                                            <FormControl variant="outlined" style={{ marginTop: 15, width: "calc(100vh - 30px)", marginLeft: 7.5 }}>
                                                <InputLabel>Letra del Curso</InputLabel>
                                                <Select value={letter} label="Letra del curso" security="true" onChange={(e) => setLetter(e.target.value)}>
                                                {
                                                    myLetterGrades.map(doc => (
                                                        <MenuItem key={doc} value={doc}>{doc}</MenuItem>
                                                    ))
                                                }
                                                </Select>
                                            </FormControl>
                                        </Paper>
                                    </ThemeProvider>
                                </React.Fragment>
                            </React.Fragment>
                        )
                    }
                    </DialogContent>
                    <DialogActions>
                            {
                                errorPostSubject === false && (
                                    loadingPostSubject === true ? (
                                        <Paper elevation={0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", padding: 5, marginRight: 15 }}>
                                            <CircularProgress style={{ color: "#2074d4" }} />
                                        </Paper>
                                    ) : (
                                        <React.Fragment>
                                            <Button color="inherit" onClick={handleHideNewCourseDialog}>
                                                <Typography variant="button">Cerrar Ventana</Typography>
                                            </Button>
                                            <Button style={{ color: "#2074d4" }} onClick={async () => await handleCreateCourse()}>
                                                <Typography variant="button">Crear Asignatura</Typography>
                                            </Button>
                                        </React.Fragment>
                                    )
                                )
                            }
                    </DialogActions>
                </Paper> 
            </Dialog>

            <Dialog open={deleteSubjectDialog} fullScreen={fullScreen} scroll="paper" onClose={handleHideNewCourseDialog}>
                <DialogTitle>Eliminar Asignatura</DialogTitle>

                <Paper elevation={0}>
                    <DialogContent>
                    {
                        selectedSubject === null ? (
                            <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <CircularProgress style={{ color: "#2074d4" }} />
                                    <Typography style={{ marginTop: 15 }}>Cargando Asignatura seleccionad</Typography>
                                </Paper>
                            </Paper>
                        ) : loadingDeleteSubject === true ? (
                            <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <CircularProgress style={{ color: "#2074d4" }} />
                                    <Typography style={{ marginTop: 15 }}>Creando Asignatura</Typography>
                                </Paper>
                            </Paper>
                        ) : errorDeleteSubject === true ? (
                            <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(2% + 10px)" }}>
                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <React.Fragment>
                                    {
                                        errorCode !== null && (
                                            <React.Fragment>
                                                <Typography style={{ textAlign: "center" }}>
                                                    Ha ocurrido un error al intentar eliminar la asignatura, intentelo nuevamente
                                                </Typography>

                                                <React.Fragment>
                                                {
                                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                            <Button onClick={() => setErrorDeleteSubject(false)} style={{ color: "#2074d4" }}>
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
                                <DialogContentText>
                                    Esta seguro de eliminar esta asignatura?, este paso es irreversible
                                </DialogContentText>
                            </React.Fragment>
                        )
                    }
                    </DialogContent>
                    <DialogActions>
                    {
                        errorDeleteSubject === false && (
                            loadingDeleteSubject === true ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", padding: 5, marginRight: 15 }}>
                                    <CircularProgress style={{ color: "#2074d4" }} />
                                </Paper>
                            ) : (
                                <React.Fragment>
                                    <Button color="inherit" onClick={handleHideDeleteCourseDialog}>
                                        <Typography variant="button">Cerrar Ventana</Typography>
                                    </Button>
                                    <Button style={{ color: "#2074d4" }} onClick={async () => await handleDeleteCourse()}>
                                        <Typography variant="button">Eliminar Asignatura</Typography>
                                    </Button>
                                </React.Fragment>
                            )
                        )
                    }
                    </DialogActions>
                </Paper>  
            </Dialog> 
        </Paper>
    );
};

export default ManageSubject;