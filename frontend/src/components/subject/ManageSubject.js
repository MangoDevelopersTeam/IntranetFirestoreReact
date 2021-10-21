import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { Breadcrumbs, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, InputLabel, List, ListItem, ListItemText, MenuItem, Paper, Select, TextField, Typography, useMediaQuery, useTheme } from '@material-ui/core';
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

const ManageSubject = () => {
    // uses
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));
    const newCourse = useSelector(SELECT_NEW_COURSE);


    // useStates
    const [courses, setCourses] = useState(null);
    const [mutableGrades, setMutableGrades] = useState(myNumberGrades);

    const [type, setType] = useState("");
    const [courseName, setCourseName] = useState("");
    const [description, setDescription] = useState("");

    const [grade, setGrade] = useState("");
    const [number, setNumber] = useState(1);
    const [letter, setLetter] = useState("");
    const [disabled, setDisabled] = useState(true);

    const [loading, setLoading] = useState(true);
    const [process, setProcess] = useState(false);
    const [error, setError] = useState(false);
   

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

            setProcess(true);            

            await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/create-course", {
                course: courseIntranet,
            }, {
                headers: {
                    "content-type": "application/json"
                }
            })
            .then(result => {
                console.log(result);
                if (result?.data?.code === "PROCESS_OK")
                {
                    setCourses(Decrypt(result?.data?.data));

                    hideNewCourseDialog();
                    handleClearFields();
                    showMessage(result?.data?.message, result?.data?.type);            
                }
                else if (result?.data?.code === "EXISTING_COURSE")
                {   
                    showMessage(result?.data?.message, result?.data?.type);
                }
                else
                {
                    showMessage("Ha ocurrido un error inesperado mientras se procesaba la solicitud", "error");
                }
            })
            .catch(error => {
                if (error?.response?.data?.code === "COURSE_PARAMS_INVALID")
                {
                    showMessage("Asegurese de que los tipos de datos sean correctos", "error");
                }
                else if (error?.response?.data?.code === "COURSE_DATA_NULL")
                {
                    showMessage("Asegurese de enviar el curso correctamente", "error");
                }
                else if (error?.response?.data?.code === "EXISTING_COURSE")
                {
                    showMessage("El curso que ha tratado de crear ya existe", "warning");
                }
                else if (error?.response?.data?.code === "FIREBASE_CHECK_CODE_ERROR")
                {
                    showMessage("Ha ocurrido un error al procesar la petición")
                }
                else
                {
                    showMessage("Ha ocurrido un error inesperado mientras se procesaba la solicitud", "error");
                }
            })
            .finally(() => {
                setProcess(false);

                return () => {
                    setCourses(null);
                }
            });
        },
        [type, grade, letter, number, courseName, description, setCourses, handleClearFields],
    );

    /**
     * useCallback para obtener los cursos desde la API Rest
     */
    const handleGetCourses = useCallback(
        /**
         * Función para realizar la petición hacia la API de firebase para obtener los cursos
         */
        async () => {
            setLoading(true);

            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/testing-get-course", {
                params: {
                    page: 1
                },
            })
            .then(response => {
                if (response.data.code === "PROCESS_OK")
                {
                    setCourses(Decrypt(response.data.data));

                    setLoading(false);
                    setError(false);
                }
                else
                {
                    showMessage(response.data.message, response.data.type);
                    setCourses([]);

                    setLoading(false);
                    setError(true);
                }
            })
            .catch(error => {
                showMessage(error.message, "error");
                setCourses([]);

                setLoading(false);
                setError(true);
            })
            .finally(() => {
                return () => {
                    setCourses(null);
                    setLoading(null);
                    setError(null);
                }
            });
        },
        [setLoading, setError, setCourses],
    );

    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            let responseTokenVerified = verifyValidToken();

            if (responseTokenVerified === false)
            {
                clearAuthData();
                history.push("/");

                return showMessage("La sesión se ha caducado, inicie sesión nuevamente", "info");
            }
        };

        return callQuery();
    }, []);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetCourses()
        }

        callQuery();

        return () => {
            setCourses(null);
        }
    }, [setCourses, handleGetCourses]);

    return (
        <div>
            <Paper variant="outlined" style={{ padding: 20, marginBottom: 20 }}>
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                    <Link to="/" style={{ textDecoration: "none", color: "#333" }}>Home</Link>
                    <Typography style={{ color: "#2074d4" }}>Manejar Asignaturas</Typography>
                </Breadcrumbs>
            </Paper> 

            <Card variant="outlined" style={{ marginBottom: 20 }}>
                <CardContent>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="h6">Todas las asignaturas</Typography>
                        <Button variant="text" style={{ color: "#2074d4" }} onClick={showNewCourseDialog}>Añadir nueva asignatura</Button>   
                    </div>       

                    <Divider style={{ marginTop: 15, marginBottom: 15 }} />
                                    
                    <div>
                    {
                        loading === true ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                            </div>
                        ) : (
                            error === true ? (
                                <>
                                    <Typography style={{ textAlign: "center" }}>Ha ocurrido un error cuando se estaba obteniendo las asignturas</Typography>

                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                        <Button onClick={async () => await handleGetCourses()} style={{ color: "#2074d4" }}>Recargar Asignaturas</Button>
                                    </div>
                                </>
                            ) : (
                                courses === null ? (
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                    </div>
                                ) : (
                                    courses.length > 0 ? (
                                        <>
                                            <List style={{ marginTop: 6 }}>
                                            {
                                                courses.map(doc => (
                                                    <div key={doc.id}>
                                                        <Link to={`/subjects/${doc.id}`} style={{ color: "#333", textDecoration: "none" }}>
                                                            <ListItem button>
                                                                <ListItemText primary={Decrypt(Decrypt(doc.data).courseName)} secondary={Decrypt(doc.data).code} />
                                                            </ListItem>
                                                        </Link>
                                                        <Divider />
                                                    </div>
                                                ))
                                            }
                                            </List>

                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                <Button onClick={async () => await handleGetCourses()} style={{ color: "#2074d4" }}>Recargar Asignaturas</Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Typography style={{ textAlign: "center" }}>No existen Asiguantuas aún</Typography>

                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                <Button onClick={async () => await handleGetCourses()} style={{ color: "#2074d4" }}>Recargar Asignaturas</Button>
                                            </div>
                                        </>
                                    )
                                )
                            )
                        )
                    }
                    </div>                     
                </CardContent>
            </Card>  

            <Dialog open={newCourse} fullScreen={fullScreen} scroll="paper" onClose={handleHideNewCourseDialog}>
                <DialogTitle>Crear Asignatura</DialogTitle>
            {
                process === true ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 478 }}>
                        <Paper elevation={0} style={{ marginLeft: 300, marginRight: 300 }}>
                            <CircularProgress style={{ color: "#2074d4", margin: "auto" }} />
                        </Paper>   
                    </div>
                ) : (
                    <>
                        <DialogContent>
                            <DialogContentText>
                                Completa los valores en el formulario para crear una nueva asignatura en intranet, que este vinculada a un curso
                            </DialogContentText>
                            <>
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

                                <div style={{ display: "flex" }}>
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
                                </div>
                            </>
                        </DialogContent>
                        <DialogActions>
                            <Button color="inherit" onClick={handleHideNewCourseDialog}>
                                Cerrar Ventana
                            </Button>
                            <Button style={{ color: "#2074d4" }} onClick={handleCreateCourse}>
                                Crear Asignatura
                            </Button>
                        </DialogActions>
                    </>
                )
            }
            </Dialog> 
        </div>
    );
};

export default ManageSubject;