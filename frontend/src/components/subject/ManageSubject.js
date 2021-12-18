import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { Breadcrumbs, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, InputLabel, List, ListItem, ListItemText, MenuItem, Paper, Select, TextField, Typography, useMediaQuery, useTheme, createTheme, ThemeProvider } from '@material-ui/core';
import { NavigateNext } from '@material-ui/icons';

import { hideNewCourseDialog, showNewCourseDialog } from '../../helpers/dialogs/handleDialogs';
import { clearAuthData } from '../../helpers/auth/handleGetLevel';
import { verifyValidToken } from '../../helpers/auth/handleTokenVerified';
import { showMessage } from '../../helpers/message/handleMessage';
import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';
import history from './../../helpers/history/handleHistory';

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

    const [mutableGrades, setMutableGrades] = useState(myNumberGrades);
    const [createSubjectProcess, setCreateSubjectProcess] = useState(false);
   

    // useCallbacks
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
     * useCallback para cerrar el dialogo de crear una nueva asignatura
     */
    const handleHideNewCourseDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "EscapeKeyDown") 
            {
                return;
            }

            handleClearFields();
            hideNewCourseDialog();
        },
        [handleClearFields],
    );

    /**
     * useCallback para manejar el cambio de numeros de curso por el tipo de nivel, si es Básica o Media
     */
    const handleNumberCourseGrade = useCallback(
        (grade) => {
            if (grade !== null)
            {
                setGrade(grade);
                setDisabled(false);

                if (myGrades.find(x => x === grade) === "Media")
                {
                    setMutableGrades(myNumberGrades.slice(0, 4));
                    return;
                }
                else
                {
                    setMutableGrades(myNumberGrades);
                    return;
                }
            }
        },
        [setGrade, setDisabled, setMutableGrades],
    );

    /**
     * use callback para crear la asignatura en la base de datos
     */
    const handleCreateCourse = useCallback(
        async () => {
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

            setCreateSubjectProcess(true);            

            await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/create-course", {
                course: courseIntranet,
            }, {
                headers: {
                    "content-type": "application/json"
                }
            })
            .then(result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    setSubjects(Decrypt(result.data.data));

                    handleClearFields();
                    hideNewCourseDialog();
                    showMessage(result.data.message, result.data.type);
                }
                else if (result.data.code === "EXISTING_COURSE")
                {   
                    showMessage(result.data.message, result.data.type);
                }
                else
                {
                    showMessage("Ha ocurrido un error inesperado mientras se procesaba la solicitud", "error");
                }
            })
            .catch(error => {
                if (error.response)
                {
                    if (error.response.data.code === "COURSE_PARAMS_INVALID")
                    {
                        showMessage("Asegurese de que los tipos de datos sean correctos", "error");
                    }
                    else if (error.response.data.code === "COURSE_DATA_NULL")
                    {
                        showMessage("Asegurese de enviar el curso correctamente", "error");
                    }
                    else if (error.response.data.code === "EXISTING_COURSE")
                    {
                        showMessage("El curso que ha tratado de crear ya existe", "warning");
                    }
                    else if (error.response.data.code === "FIREBASE_CHECK_CODE_ERROR")
                    {
                        showMessage("Ha ocurrido un error al procesar la petición")
                    }
                    else
                    {
                        showMessage("Ha ocurrido un error inesperado mientras se procesaba la solicitud", "error");
                    }
                }
            })
            .finally(() => {
                setCreateSubjectProcess(false);

                return () => {
                    setSubjects(null);
                }
            });
        },
        [type, grade, letter, number, courseName, description, setSubjects, setCreateSubjectProcess, handleClearFields],
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
                }
                else
                {
                    setSubjects(undefined);

                    setLoadingSubjects(false);
                    setErrorSubjects(true);
                }
            })
            .catch(error => {
                if (error.response)
                {
                    console.log("the error is", error.response);
                }

                setSubjects(undefined);
                setErrorSubjects(true);
                setLoadingSubjects(false);
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
        [setLoadingSubjects, setErrorSubjects, setSubjects],
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
                        ) : (
                            errorSubjects === true ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Typography>Ha Ocurrido un error al Momento de obtener las Asignaturas</Typography>
                                        <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetCourses()}>
                                            <Typography variant="button">Recargar Contenido de la Asignatura</Typography>
                                        </Button>
                                    </Paper>
                                </Paper>
                            ) : (
                                subjects === null ? (
                                    <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Cargando las Asignaturas</Typography>
                                    </Paper>
                                ) : (
                                    subjects === undefined ? (
                                        <Paper elevation={0}>
                                            <Typography style={{ textAlign: "center" }}>No existen Asignaturas aquí aún</Typography>

                                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                <Button onClick={async () => await handleGetCourses()} style={{ color: "#2074d4" }}>
                                                    <Typography variant="button">Recargar Asignaturas</Typography>
                                                </Button>
                                            </Paper>
                                        </Paper>
                                    ) : (
                                        subjects.length > 0 ? (
                                            <Paper elevation={0}>
                                                <List style={{ marginTop: 6 }}>
                                                {
                                                    subjects.map(doc => (
                                                        <Paper key={doc.id} elevation={0}>
                                                            <Link to={`/subjects/${doc.id}`} style={{ color: "#333", textDecoration: "none" }}>
                                                                <ListItem button>
                                                                    <ListItemText primary={Decrypt(doc.data.courseName)} secondary={doc.data.code} />
                                                                </ListItem>
                                                            </Link>

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
                                        ) : (
                                            <Paper elevation={0}>
                                                <Typography style={{ textAlign: "center" }}>No existen Asignaturas aquí aún</Typography>

                                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                    <Button onClick={async () => await handleGetCourses()} style={{ color: "#2074d4" }}>
                                                        <Typography variant="button">Recargar Asignaturas</Typography>
                                                    </Button>
                                                </Paper>
                                            </Paper>
                                        )
                                    )    
                                )
                            )
                        )
                    }
                    </React.Fragment>                     
                </CardContent>
            </Card>  

            <Dialog open={newCourse} fullScreen={fullScreen} scroll="paper" onClose={handleHideNewCourseDialog}>
                <DialogTitle>Crear Asignatura</DialogTitle>

                <Paper elevation={0}>
                {
                    createSubjectProcess === true ? (
                        <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                            <CircularProgress style={{ color: "#2074d4" }} />
                            <Typography style={{ marginTop: 15 }}>Procesando la solicitud</Typography>
                        </Paper>
                    ) : (
                        <Paper elevation={0}>
                            <DialogContent>
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
                            </DialogContent>
                            <DialogActions>
                                <Button color="inherit" onClick={handleHideNewCourseDialog}>
                                    <Typography variant="button">Cerrar Ventana</Typography>
                                </Button>
                                <Button style={{ color: "#2074d4" }} onClick={async () => await handleCreateCourse()}>
                                    <Typography variant="button">Crear Asignatura</Typography>
                                </Button>
                            </DialogActions>
                        </Paper>
                    )
                }
                </Paper>
            </Dialog> 
        </Paper>
    );
};

export default ManageSubject;