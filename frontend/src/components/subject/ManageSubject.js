import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { Breadcrumbs, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, InputLabel, List, ListItem, ListItemText, MenuItem, Paper, Select, TextField, Typography, useMediaQuery, useTheme } from '@material-ui/core';
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
    const [courses, setCourses] = useState([]);
    const [mutableGrades, setMutableGrades] = useState(myNumberGrades);

    const [type, setType] = useState("");
    const [courseName, setCourseName] = useState("");
    const [description, setDescription] = useState("");

    const [grade, setGrade] = useState("");
    const [number, setNumber] = useState(1);
    const [letter, setLetter] = useState("");
    const [disabled, setDisabled] = useState(true);

    // functions
    /**
     * Función para limpiar los campos de texto
     */
    const clearFields = () => {
        setType("");
        setGrade("");
        setCourseName("");
        setDescription("");
        setNumber(1);
        setDisabled(true);
        setLetter("");
    };

    /**
     * Función para cerrar el dialogo de crear nuevo curso
     * @param {Event} event tipo de evento
     * @param {string} reason tipo de razón de cierre del dialogo
     * @returns no retorna nada
     */
    const handleCloseNewCourse = (event, reason) => {
        if (reason === 'backdropClick' || reason === "EscapeKeyDown") 
        {
            return;
        }

        clearFields();
        hideNewCourseDialog();
    };

    /**
     * Función para setear los numeros del curso dependiendo del grado
     * @param {String} grade grado del curso
     * @returns numeros correspondientes al grado
     */
    const handleNumberCourseGrade = (grade) => {
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
    };

    // useCallbacks
    /**
     * use callback para agregar el curso a la base de datos
     */
    const handleCreateCourse = useCallback(
        /**
         * Función para añadir el curso en la base de datos
         */
        async () => {
            if (type !== "" && grade !== "" && letter !== "" && courseName !== "" && description !== "")
            {
                if (myNumberGrades.find(x => x === number) !== undefined)
                {
                    if (myGrades.find(x => x === grade) !== undefined && myLetterGrades.find(x => x === letter) !== undefined)
                    {
                        const newCourse = new course(null, Encrypt(type), Encrypt(grade), Encrypt(number), Encrypt(letter), Encrypt(courseName), Encrypt(description));
                        console.log(newCourse);

                        await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/create-course", {
                            course: newCourse
                        })
                        .then(result => {
                            console.log(result);
                            if (result.data.code === "PROCESS_OK")
                            {
                                clearFields();
                                hideNewCourseDialog();
                                setCourses(Decrypt(result.data.data));
                            }
                            else
                            {
                                setCourses([]);
                            }

                            showMessage(result?.data?.message, result?.data?.type);
                        })
                        .catch((error) => {
                            showMessage(error.message, "error");
                            setCourses([]);
                        })
                        .finally(() =>  {
                            return () => {
                                setCourses(null);
                            }
                        });
                    }
                    else
                    {
                        return showMessage("Verifique los Datos del Curso", "warning");
                    }
                }
                else
                {
                    return showMessage("Verifique el numero del curso", "warning");
                }
            }   
            else
            {
                return showMessage("Complete todos los datos", "warning");
            }
        },
        [type, grade, letter, number, courseName, description],
    );

    /**
     * useCallback para obtener los cursos desde la API Rest
     */
    const handleGetCourses = useCallback(
        /**
         * Función para realizar la petición hacia la API de firebase para obtener los cursos
         */
        async () => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/testing-get-course", {
                params: {
                    page: 1
                },
            })
            .then(response => {
                if (response.data.code === "PROCESS_OK")
                {
                    setCourses(Decrypt(response.data.data))
                }
                else
                {
                    showMessage(response.data.message, response.data.type);
                    setCourses([]);
                }
            })
            .catch(error => {
                showMessage(error.message, "error");
                setCourses([]);
            })
            .finally(() => {
                return () => {
                    setCourses(null);
                }
            });
        },
        [],
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

    return (
        <div>
            <Paper variant="outlined" style={{ padding: 20, marginBottom: 20 }}>
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                    <Link to="/" style={{ textDecoration: "none", color: "#333" }}>Administrador</Link>
                    <Typography style={{ color: "#2074d4" }}>Manejar Asignaturas</Typography>
                </Breadcrumbs>
            </Paper> 

            <Card variant="outlined" style={{ marginBottom: 20 }}>
                <CardContent>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="h6">Todas las asignaturas</Typography>
                        <Button variant="text" style={{ color: "#2074d4" }} onClick={() => showNewCourseDialog()}>Añadir nuevo curso</Button>   
                    </div>       

                    <Divider style={{ marginTop: 15, marginBottom: 15 }} />
                                    
                    <div>
                    {
                        courses !== null ? (
                            courses?.length > 0 ? (
                                <div style={{ marginTop: 6 }}>
                                    <List>
                                    {
                                        courses?.map(course => (
                                            <Link key={course.id} to={`/subjects/${course?.id}`} style={{ color: "#333", textDecoration: "none" }}>
                                                <ListItem button key={course.id}>
                                                    <ListItemText primary={Decrypt(Decrypt(course.data).courseName)} secondary={Decrypt(course.data).code} />
                                                </ListItem>
                                            </Link>
                                            
                                        ))
                                    }
                                    </List>
                                </div>
                            ) : (
                                <Typography>Aun no hay Cursos Creados Aquí</Typography>
                            )
                        ) : (
                            <Typography>Cargando Cursos</Typography>
                        )    
                    }
                    </div>                     
                </CardContent>
            </Card>  

            <button onClick={handleGetCourses}>obtener asignaturas</button>

            <Dialog open={newCourse} fullScreen={fullScreen} scroll="paper" onClose={handleCloseNewCourse}>
                <DialogTitle>Crear Asignatura</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Completa los campos de texto para crear una nueva asignatura en intranet
                    </DialogContentText>
                    <>
                        <TextField variant="outlined" type="text" security="true" value={courseName} label="Nombre de la Asignatura" fullWidth onChange={(e) => setCourseName(e.target.value)} />

                        <FormControl variant="outlined" fullWidth style={{ marginTop: 15 }}>
                            <InputLabel>Tipo de Asignatura</InputLabel>
                            <Select onChange={(e) => setType(e.target.value)} value={type} label="Tipo de Asignatura" security="true">
                            {
                                myArrayCourses?.map(myCourse => (
                                    <MenuItem key={myCourse} value={myCourse}>{myCourse}</MenuItem>
                                ))
                            }
                            </Select>
                        </FormControl>

                        <div style={{ display: "flex" }}>
                            <FormControl variant="outlined" style={{ marginTop: 15, width: "calc(100vh - 30px)", marginRight: 7.5 }}>
                                <InputLabel>Grado del Curso</InputLabel>
                                <Select onChange={(e) => handleNumberCourseGrade(e.target.value)} value={grade} label="Grado del curso" security="true">
                                {
                                    myGrades.map(myGrade => (
                                        <MenuItem key={myGrade} value={myGrade}>{myGrade}</MenuItem>
                                    ))
                                }
                                </Select>
                            </FormControl>

                            <FormControl variant="outlined" style={{ marginTop: 15, width: "calc(100vh - 30px)", marginRight: 7.5, marginLeft: 7.5 }}>
                                <InputLabel>Numero del Curso</InputLabel>
                                <Select disabled={disabled} onChange={(e) => setNumber(e.target.value)} value={number} label="Numero del curso" security="true">
                                {
                                    mutableGrades.map(myNumberGrade => (
                                        <MenuItem key={myNumberGrade} value={myNumberGrade}>{myNumberGrade}</MenuItem>
                                    ))
                                }
                                </Select>
                            </FormControl>

                            <FormControl variant="outlined" style={{ marginTop: 15, width: "calc(100vh - 30px)", marginLeft: 7.5 }}>
                                <InputLabel>Letra del Curso</InputLabel>
                                <Select onChange={(e) => setLetter(e.target.value)} value={letter} label="Letra del curso" security="true">
                                {
                                    myLetterGrades.map(myLetterGrade => (
                                        <MenuItem key={myLetterGrade} value={myLetterGrade}>{myLetterGrade}</MenuItem>
                                    ))
                                }
                                </Select>
                            </FormControl>
                        </div>

                        <TextField variant="outlined" style={{ marginTop: 15 }} value={description} label="Descripción de la Asignatura" onChange={(e) => setDescription(e.target.value)} type="text" security="true" fullWidth multiline />
                    </>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={() => handleCloseNewCourse()}>
                        Cerrar Ventana
                    </Button>
                    <Button color="primary" style={{ color: "#2074d4" }} onClick={() => handleCreateCourse()}>
                        Crear Asignatura
                    </Button>
                </DialogActions>
            </Dialog> 
        </div>
    );
};

export default ManageSubject;