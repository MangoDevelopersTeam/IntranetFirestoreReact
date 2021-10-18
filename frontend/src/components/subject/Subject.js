import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactDOM from 'react-dom';

import { Delete, Edit, ExpandMore, NavigateNext, PlaylistAdd } from '@material-ui/icons';
import { Accordion, AccordionDetails, AccordionSummary, Breadcrumbs, Button, Card, CardActions, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Paper, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';

import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';
import { showMessage } from '../../helpers/message/handleMessage';

import TeacherListItem from './TeacherListItem';
import StudentListItem from './StudentListItem';
import Loading from '../others/Loading';
import Error from '../others/Error';

import axios from 'axios';

import { timeago } from './../../helpers/format/handleFormat'

const Subject = () => {
    // uses
    const { id } = useParams();
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));


    // useStates
    const [course,     setCourse] = useState(null);
    const [teachers, setTeachers] = useState(null);
    const [students, setStudents] = useState(null);

    const [teacherDialog,   setTeacherDialog] = useState(false);
    const [studentsDialog, setStudentsDialog] = useState(false);
    const [unitsDialog,       setUnitsDialog] = useState(false);
    const [editUnitDialog, setEditUnitDialog] = useState(false);
    const [deleteUnitDialog, setDeleteUnitDialog] = useState(false);

    const [teachersCourse, setTeachersCourse] = useState(null);
    const [studentsCourse, setStudentsCourse] = useState(null);
    const [unitsCourse,       setUnitsCourse] = useState(null);

    const [loadingTeachers, setLoadingTeachers] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(true);

    const [unitsFields,   setUnitsFields] = useState(0);
    const [unitSelected, setUnitSelected] = useState(null);

    const [unitName,     setUnitName] = useState("");


    // functions
    /**
     * Función para cerrar el dialogo de los profesores en la asignatura
     * @param {Event} event evento
     * @param {String} reason tipo de evento que se detecta
     * @returns no retorna acción
     */
    const handleCloseTeacherDialog = (event, reason) => {
        if (reason === 'backdropClick' || reason === "escapeKeyDown") 
        {
            return;
        }

        return setTeacherDialog(false);
    };

    /**
     * Función para abrir el dialog de los profesores, que hará además una petición para obtener lso profesores
     */
    const handleShowTeacherDialog = async () => {
        if (teachers === null)
        {
            let type = Decrypt(course).type;
            await handleGetTeachers(type);
        }
 
        setTeacherDialog(true);
    };



    /**
     * Función para cerrar el dialogo de los estudiantes en la asignatura
     * @param {Event} event evento
     * @param {String} reason tipo de evento que se detecta
     * @returns no retorna acción
     */
    const handleCloseStudentsDialog = (event, reason) => {
        if (reason === 'backdropClick' || reason === "escapeKeyDown") 
        {
            return;
        }

        return setStudentsDialog(false);
    };

    /**
     * Función para abrir el dialog de los profesores, que hará además una petición para obtener lso profesores
     */
    const handleShowStudentsDialog = async () => {
        if (students === null)
        {
            let number = Decrypt(course).number;
            let letter = Decrypt(course).letter;
            let grade = Decrypt(course).grade;

            await handleGetStudents(number, letter, grade);
        }
 
        setStudentsDialog(true);
    };


    
    /**
     * Función para cerrar el dialogo de las unidades en la asignatura
     * @param {Event} event evento
     * @param {String} reason tipo de evento que se detecta
     * @returns no retorna acción
     */
    const handleCloseUnitsDialog = (event, reason) => {
        if (reason === 'backdropClick' || reason === "escapeKeyDown") 
        {
            return;
        }

        setUnitsFields(0);
        return setUnitsDialog(false);
    };

    /**
     * Función para abrir el dialog de los profesores, que hará además una petición para obtener lso profesores
     */
    const handleShowUnitsDialog = async () => {
        setUnitsDialog(true);
    };



    /**
     * Función para cerrar el dialogo de editar una unidad 
     * @param {Event} event evento
     * @param {String} reason tipo de evento que se detecta
     * @returns no retorna acción
     */
    const handleCloseEditUnitDialog = (event, reason) => {
        if (reason === 'backdropClick' || reason === "escapeKeyDown") 
        {
            return;
        }

        setUnitSelected(null);
        setUnitName(null);

        return setEditUnitDialog(false);
    };

    /**
     * Función para abrir el dialog de los profesores, que hará además una petición para obtener lso profesores
     */
    const handleShowEditUnitDialog = async (unit) => {
        setUnitSelected(unit);
        setUnitName(Decrypt(unit.data).unit);

        setEditUnitDialog(true);
    };



    /**
     * Función para cerrar el dialogo de editar una unidad 
     * @param {Event} event evento
     * @param {String} reason tipo de evento que se detecta
     * @returns no retorna acción
     */
    const handleCloseDeleteUnitDialog = (event, reason) => {
        if (reason === 'backdropClick' || reason === "escapeKeyDown") 
        {
            return;
        }

        setUnitSelected(null);
        return setDeleteUnitDialog(false);
    };

    /**
     * Función para abrir el dialog de los profesores, que hará además una petición para obtener lso profesores
     */
    const handleShowDeleteUnitDialog = async (unit) => {
        setUnitSelected(unit);
        setDeleteUnitDialog(true);
    };



    // useCallbacks
    /**
     * useCallback para obtener la información del curso actual
     */
    const handleGetCourse = useCallback(
        async () => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-course", {
                params: {
                    id: id
                }
            })
            .then(result => {
                if (result.data.code !== "PROCESS_OK")
                {
                    showMessage(result.data.message, result.data.type);
                }

                setCourse(result.data.data);
            })
            .catch(error => {
                showMessage(error.response.data.error.message, "error");    
                setCourse(undefined);
            })
            .finally(() => {
                return () => {
                    setCourse(null);
                }
            });
        },
        [id, setCourse],
    );
    
    /**
     * useCallback para obtener a los profesores en los usuarios del sistema
     */
    const handleGetTeachers = useCallback(
        async (nameCourse) => {
            setLoadingTeachers(true);

            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-teachers", {
                params: {
                    course: nameCourse
                }
            })
            .then(result => {
                if (result.data.code === "PROCESS_OK")
                {
                    setTeachers(Decrypt(result.data.data));
                }
                else
                {
                    showMessage(result.data.message, result.data.type);
                    setTeachers([]);
                }
            })
            .catch(() => {
                showMessage(`No hay profesores ligadas a la asignatura ${nameCourse}`, "warning"); 
                setTeachers([]);
            })
            .finally(() => {
                setLoadingTeachers(false);

                return () => {
                    setTeachers(null);
                }
            });
        },
        [setTeachers, setLoadingTeachers],
    );

    /**
     * useCallback para obtener a los alumnos del sistema, que esten vinculados al curso de la asignatura
     */
    const handleGetStudents = useCallback(
        async (number, letter, grade) => {
            setLoadingStudents(true);

            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-students", {
                params: {
                    number: number,
                    letter: letter,
                    grade: grade
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
                showMessage(error.result.data.message, "error");
                setStudents([]);
            })
            .finally(() => {
                setLoadingStudents(false);

                return () => {
                    setStudents(null);
                }
            });
        },
        [setStudents, setLoadingStudents],
    );



    /**
     * useCallback para obtener los profesores de la asignatura
     */
    const handleGetTeachersCourse = useCallback(
        async (courseId) => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-teachers-courses", {
                params: {
                    id: courseId
                }
            })
            .then(result => {
                if (result.data.code === "PROCESS_OK")
                {
                    setTeachersCourse(Decrypt(result.data.data));
                }
                else
                {
                    setTeachersCourse([]);
                }
            })
            .catch(error => {
                showMessage(error.response.data.message, "error");
                setTeachersCourse([]);
            })
            .finally(() => {
                return () => {
                    setTeachersCourse(null);
                }
            });
        },
        [setTeachersCourse],
    );

    /**
     * useCallback para obtener los profesores de la asignatura
     */
    const handleGetStudentsCourse = useCallback(
        async (courseId) => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-students-courses", {
                params: {
                    id: courseId
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
                showMessage(error.response.data.message, "error");
                setStudentsCourse([]);
            })
            .finally(() => {
                return () => {
                    setStudentsCourse(null);
                }
            });
        },
        [setStudentsCourse],
    );

    /**
     * useCallback para obtener los cursos de la asignatura
     */
    const handleGetUnitsCourse = useCallback(
        async (courseId) => {
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-units-course", {
                params: {
                    id: courseId
                }
            })
            .then(result => {
                if (result.data.code === "PROCESS_OK")
                {   
                    let data = Decrypt(result.data.data);
                    setUnitsCourse(data);
                }
                else
                {
                    setUnitsCourse([]);
                }
            })
            .catch(error => {
                showMessage(error.response.data.message, "error");
                setUnitsCourse([]);
            })
            .finally(() => {
                return () => {
                    setUnitsCourse(null);
                }
            });
        },
        [setUnitsCourse],
    );



    /**
     * useCallback para añadir un campo de texto de unidades del curso
     */
    const handleAddUnitField = useCallback(
        () => {
            if (unitsFields < 5)
            {
                setUnitsFields(unitsFields + 1);

                let unitsSize = unitsCourse !== null ? unitsCourse.length : 0;

                let unitsContainer = document.getElementById("units");
                let div = document.createElement('div');
                div.id = `element-${unitsFields + unitsSize}`;

                ReactDOM.render(
                    <TextField id={`unidad-${unitsFields + unitsSize}`} label={`Unidad ${1 + unitsFields + unitsSize}`} variant="outlined" fullWidth={true} style={{ marginTop: 15 }} container={div} />,
                    unitsContainer.appendChild(div)
                );
            }
            else
            {
                showMessage(`Solo puedes tener un maximo de ${unitsFields} campos de texto`, "info");
            }
        },
        [unitsFields, unitsCourse, setUnitsFields],
    );

    /**
     * useCallback para remover un campo de texto de unidades del curso
     */
    const handleRemoveUnitField = useCallback(
        () => {
            if (unitsFields > 0)
            {
                setUnitsFields(unitsFields - 1);

                let unitsContainer = document.getElementById("units");
                unitsContainer.removeChild(unitsContainer.lastChild);
            }
            else
            {
                showMessage("No existen campos de texto a eliminar", "warning");
            }
        },
        [unitsFields, setUnitsFields],
    );

    /**
     * useCallback para verificar si los campos de texto no son nulos
     */
    const handleCheckUnitField = useCallback(
        () => {
            let unitsSize = unitsCourse !== null ? unitsCourse.length : 0;
            let i = unitsFields - 1

            for (i; i >= 0; i--)
            {
                let unitField = document.getElementById(`unidad-${i + unitsSize}`);
                let unitFieldTextvalue = unitField.value;

                if (unitFieldTextvalue === "")
                {
                    return false;
                }
            }

            return true;
        },
        [unitsCourse, unitsFields],
    );

    /**
     * useCallback para agregar unidades en firestore
     */
    const handleAddUnits = useCallback(
        async () => {
            if (unitsFields <= 0)
            {
                return showMessage("Agrega un campo de texto para continuar", "info");
            }

            if (handleCheckUnitField() === false)
            {
                return showMessage("Completa los campos de texto", "info");
            }

            let unitsSize = unitsCourse !== null ? unitsCourse.length : 0;
            let array = [];

            for (let i = 0; i < unitsFields; i++)
            {
                let unitField = document.getElementById(`unidad-${i + unitsSize}`);
                let unitFieldTextvalue = unitField.value;

                array.push({
                    unit: unitFieldTextvalue,
                    numberUnit: i + 1 + unitsSize
                });
            }

            await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/post-units-course", {
                units: Encrypt(array)
            }, {
                params: {
                    id: Encrypt(id)
                }
            })
            .then(result => {
                if (result.data.code === "PROCESS_OK")
                {
                    setUnitsCourse(Decrypt(result.data.data));
                    showMessage(result.data.message, result.data.type);
                }
                else
                {
                    setUnitsCourse([]);
                    showMessage(result.data.message, result.data.type);
                }
            })
            .catch(error => {
                setUnitsCourse([]);
                console.log(error.response.data.message);
            })
            .finally(() => {
                return () => {
                    setUnitsCourse(null);
                }
            });
        },
        [id, unitsFields, unitsCourse, handleCheckUnitField, setUnitsCourse],
    );

    /**
     * useCallback para editar una unidad
     */
    const handleEditUnit = useCallback(
        async () => {
            if (unitName === "" || unitName === null)
            {
                return showMessage("Debe completar el campo Nombre de la unidad", "warning");
            }

            let object = {
                name: unitName,
            };
            
            await axios.put("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/edit-unit-course", {
                unitData: Encrypt(object)
            }, {
                params: {
                    paramIdSubject: Encrypt(id),
                    paramIdUnit: Encrypt(unitSelected.id)
                }
            })
            .then(result => {
                if (result.data.code === "PROCESS_OK")
                {
                    setUnitsCourse(Decrypt(result.data.data));
                    handleCloseEditUnitDialog();
                    showMessage(result.data.message, result.data.type);
                }
                else
                {
                    console.log(result)
                    showMessage(result.data.message, result.data.type);
                }
            })
            .catch(error => {
                console.log(error.response.data.error.message);
            })
            .finally(() => {
                return () => {
                    setUnitsCourse(null);
                }
            });
        },
        [id, unitName, unitSelected],
    );


    // HACER EL DE BORRAR UNIDAD


    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetCourse();
        };

        callQuery();

        return () => {
            setCourse(null);
        };
    }, [handleGetCourse, setCourse]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetTeachersCourse(id);
            await handleGetStudentsCourse(id);
            await handleGetUnitsCourse(id);
        }

        if (course !== undefined)
        {
            callQuery();

            return () => {
                setTeachersCourse(null);
                setStudentsCourse(null);
                setUnitsCourse(null);
            }
        }
    }, [id, course, handleGetTeachersCourse, handleGetStudentsCourse, handleGetUnitsCourse, setTeachersCourse, setStudentsCourse, setUnitsCourse]);


    return (
        <div>
        {
            course !== null ? (
                course !== undefined ? (
                    <div>
                        <Paper variant="outlined" style={{ padding: 20 }}>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                                <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                                    Administrador
                                </Link>
                                <Link to="/subjects" style={{ textDecoration: "none", color: "#333" }}>
                                    Manejar Asignaturas
                                </Link>
                                <Typography style={{ color: "#2074d4" }}>Asignatura {Decrypt(course)?.code}</Typography>
                            </Breadcrumbs>
                        </Paper>

                        <Card variant="outlined" style={{ marginTop: 15 }}>
                            <CardContent>
                                <Typography variant="h5">Curso {Decrypt(course)?.code}</Typography>  
                                <Typography variant="h6" color="textSecondary">{Decrypt(Decrypt(course)?.courseName)}</Typography>  
                            </CardContent>
                        </Card>
                        
                        <Card variant="outlined" style={{ marginTop: 15 }}>
                        {
                            teachersCourse === null ? (
                                <div style={{ display: "flex", justifyContent: "end", alignItems: "center", marginTop: 30, marginBottom: 30 }}>
                                    <CircularProgress style={{ color: "#2074d4", margin: "auto" }} />
                                </div>
                            ) : (
                                <>
                                    <CardContent>
                                            <Typography variant="h5">Información acerca de los Profesores y Ayudantes</Typography>       
                                        {
                                            teachersCourse.length > 0 ? (
                                                <>
                                                    <Typography variant="h6" color="textSecondary">existen {teachersCourse.filter(x => Decrypt(x.data).helper === false).length} profesores en este curso</Typography>
                                                    <Typography variant="h6" color="textSecondary">existen {teachersCourse.filter(x => Decrypt(x.data).helper === true).length} ayudantes en este curso</Typography>
                                                </>
                                            ) : (
                                                <Typography variant="h6" color="textSecondary">Sin docentes o ayudantes asignados</Typography>
                                            )   
                                        }
                                    </CardContent>
                                    <CardActions>
                                            <Button style={{ color: "#2074d4" }} onClick={() => handleShowTeacherDialog()}>Establecer un docente a cargo</Button>
                                    </CardActions>
                                </>
                            )
                        }
                        </Card>

                        <Card variant="outlined" style={{ marginTop: 15 }}>
                        {
                            studentsCourse === null ? (
                                <div style={{ display: "flex", justifyContent: "end", alignItems: "center", marginTop: 30, marginBottom: 30 }}>
                                    <CircularProgress style={{ color: "#2074d4", margin: "auto" }} />
                                </div>
                            ) : (
                                <>
                                    <CardContent>
                                        <Typography variant="h5">Información acerca de los Estudiantes</Typography>       
                                    {
                                        studentsCourse.length > 0 ? (
                                            <Typography variant="h6" color="textSecondary">{`Existen ${studentsCourse.length} Estudiantes`}</Typography>
                                        ) : (
                                            <Typography variant="h6" color="textSecondary">Sin Estudiantes Asignados</Typography>
                                        )                   
                                    }
                                    </CardContent>
                                    <CardActions>
                                        <Button style={{ color: "#2074d4" }} onClick={() => handleShowStudentsDialog()}>Establecer alumnos a esta asignatura</Button>          
                                    </CardActions>
                                </>
                            )
                        }
                        </Card>

                        <Card variant="outlined" style={{ marginTop: 15 }}>
                        {
                            unitsCourse === null ? (
                                <div style={{ display: "flex", justifyContent: "end", alignItems: "center", marginTop: 30, marginBottom: 30 }}>
                                    <CircularProgress style={{ color: "#2074d4", margin: "auto" }} />
                                </div>
                            ) : (
                                <>
                                    <CardContent>
                                        <Typography variant="h5">Unidades del curso</Typography>      
                                    {
                                        unitsCourse.length > 0 ? (
                                            <List>
                                            {
                                                unitsCourse.map(doc => (
                                                    <div key={doc.id}>
                                                        <ListItem>
                                                            <ListItemText primary={`Unidad ${Decrypt(doc.data).numberUnit} : ${Decrypt(doc.data).unit}`} secondary={Decrypt(doc.data)?.updated === null ? "" : Decrypt(doc.data).updated === true ?  `Editado ${timeago(new Date(Decrypt(doc.data).updated_at._seconds * 1000))}` : ""} security="true" />
                                                            <ListItemSecondaryAction security="true">
                                                                <Tooltip title={`Borrar Unidad ${Decrypt(doc.data).numberUnit}`}>
                                                                    <IconButton edge="end" onClick={() => handleShowDeleteUnitDialog(doc)}>
                                                                        <Delete />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title={`Editar Unidad ${Decrypt(doc.data).numberUnit}`}>
                                                                    <IconButton style={{ marginLeft: 15 }} edge="end" onClick={() => handleShowEditUnitDialog(doc)}>
                                                                        <Edit />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </ListItemSecondaryAction>
                                                        </ListItem>
                                                        <Divider style={{ marginBottom: 10 }} />
                                                    </div>
                                                ))
                                            }
                                            </List>
                                        ) : (
                                            <Typography variant="h6" color="textSecondary">Sin Unidades Creadas</Typography>
                                        )
                                    }
                                    </CardContent>
                                    <CardActions>
                                        <Button style={{ color: "#2074d4" }} onClick={() => handleShowUnitsDialog()}>Establecer unidades a esta Asignatura</Button>          
                                    </CardActions>
                                </>
                            )
                        }
                        </Card>



                        <Dialog open={teacherDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseTeacherDialog} fullScreen={fullScreen} scroll="paper">
                            <DialogTitle>Asignar profesores a la asignatura {Decrypt(Decrypt(course)?.courseName)}</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Asigna un profesor o dos profesores para la asignatura {Decrypt(Decrypt(course)?.courseName)}
                                </DialogContentText>

                                <Accordion variant="outlined">
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography>Ver Profesores</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                        {
                                            loadingTeachers === true ? (
                                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <CircularProgress style={{ color: "#2074d4" }} />
                                                </div>
                                            ) : (
                                                teachers.length > 0 ? ( 
                                                    <>
                                                        <List style={{ width: "100%" }}>
                                                        {
                                                            teachers.map(teacher => (
                                                                <TeacherListItem key={teacher.id} subjectId={id} course={course} teacher={teacher} teachers={teachers} teachersCourse={teachersCourse} setTeachersCourse={setTeachersCourse} />
                                                            ))
                                                        }
                                                        </List>

                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                            <Button onClick={async () => await handleGetTeachers(Decrypt(course).type)} style={{ color: "#2074d4" }}>Recargar Profesores</Button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Typography style={{ textAlign: "center" }}>No existen profesores que impartán este curso</Typography>
                                                        
                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                            <Button onClick={async () => await handleGetTeachers(Decrypt(course).type)} style={{ color: "#2074d4" }}>Recargar Asignaturas</Button>
                                                        </div>
                                                    </>
                                                )
                                            )
                                        }
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                            </DialogContent>
                            <DialogActions>
                                <Button color="inherit" onClick={() => setTeacherDialog(false)}>
                                    Cerrar Ventana
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog open={studentsDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseStudentsDialog} fullScreen={fullScreen} scroll="paper">
                            <DialogTitle>Asignar estudiantes a la asignatura {Decrypt(Decrypt(course)?.courseName)}</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Asigna estudiantes del curso {`${Decrypt(course).grade} ${Decrypt(course).number}º${Decrypt(course).letter}`} para la asignatura {Decrypt(course).type}
                                </DialogContentText>

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
                                                students.length > 0 ? ( 
                                                    <>
                                                        <List style={{ width: "100%" }}>
                                                        {
                                                            students.map(doc => (
                                                                <StudentListItem key={doc.id} subjectId={id} course={course} student={doc} students={students} studentsCourse={studentsCourse} setStudentsCourse={setStudentsCourse} />
                                                            ))
                                                        }
                                                        </List> 

                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                            <Button onClick={async () => await handleGetStudents(Decrypt(course).number, Decrypt(course).letter, Decrypt(course).grade)} style={{ color: "#2074d4" }}>Recargar Estudiantes</Button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Typography style={{ textAlign: "center" }}>No existen alumnos a esta asignatura del curso</Typography>
                                                                    
                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                            <Button onClick={async () => await handleGetStudents(Decrypt(course).number, Decrypt(course).letter, Decrypt(course).grade)} style={{ color: "#2074d4" }}>Recargar Estudiantes</Button>
                                                        </div>
                                                    </>
                                                )
                                            )
                                        }
                                        </div>
                                    </AccordionDetails>
                                </Accordion>                                       
                            </DialogContent>
                            <DialogActions>
                                <Button color="inherit" onClick={() => setStudentsDialog(false)}>
                                    Cerrar Ventana
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog open={unitsDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseUnitsDialog} fullScreen={fullScreen} scroll="paper">
                            <DialogTitle>Crear unidades en el curso {Decrypt(Decrypt(course)?.courseName)}</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Asigna y crea unidades al curso {`${Decrypt(course).grade} ${Decrypt(course).number}º${Decrypt(course).letter}`} para la asignatura {Decrypt(course).type}
                                </DialogContentText>
                                    
                                <div id="units" />

                                <Divider style={{ marginTop: 15, marginBottom: 15 }} />

                                <Button startIcon={<PlaylistAdd />} style={{ color: "#2074d4" }} onClick={() => handleAddUnitField()}>Añadir unidad</Button>      
                            {
                                unitsFields > 0 && (
                                    <Button startIcon={<Delete />} style={{ color: "#34495E", marginLeft: 15 }} onClick={() => handleRemoveUnitField()}>Remover ultima unidad</Button>
                                )
                            }
                            </DialogContent>
                            <DialogActions>
                                <Button color="inherit" onClick={handleCloseUnitsDialog}>Cerrar Ventana</Button>
                                <Button onClick={() => handleAddUnits()} style={{ color: "#2074d4" }}>Crear Unidades</Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog open={editUnitDialog} maxWidth={"sm"} fullWidth={true} onClose={handleCloseEditUnitDialog} fullScreen={fullScreen} scroll="paper">
                        {
                            unitSelected !== null && (
                                <>
                                    <DialogTitle>Editar {`Unidad ${Decrypt(unitSelected.data).numberUnit} : ${Decrypt(unitSelected.data).unit}`}</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Edite los valores de la {`unidad ${Decrypt(unitSelected.data).numberUnit} : ${Decrypt(unitSelected.data).unit}`}
                                        </DialogContentText>

                                        <TextField type="text"   label="Nombre de la unidad" variant="outlined" security="true" value={unitName} fullWidth onChange={(e) => setUnitName(e.target.value)} style={{ marginBottom: 15 }} />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button color="inherit" onClick={handleCloseEditUnitDialog}>Cerrar Ventana</Button>
                                        <Button onClick={() => handleEditUnit()} style={{ color: "#2074d4" }}>Crear Unidades</Button>
                                    </DialogActions>
                                </>
                            )
                        }
                        </Dialog>

                        <Dialog open={deleteUnitDialog} maxWidth={"sm"} fullWidth={true} onClose={handleCloseDeleteUnitDialog} fullScreen={fullScreen} scroll="paper">
                        {
                            unitSelected !== null && (
                                <>
                                    <DialogTitle>Eliminar {`Unidad ${Decrypt(unitSelected.data).numberUnit} : ${Decrypt(unitSelected.data).unit}`}</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Esta seguro de eliminar esta unidad?
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button color="inherit" onClick={handleCloseDeleteUnitDialog}>Cancelar</Button>
                                        <Button /* onClick={() => handleEditUnit()} */ style={{ color: "#2074d4" }}>Eliminar unidad</Button>
                                        {/**hacer boton para eliminar y mandar los ids al backend */}
                                    </DialogActions>
                                </>
                            )
                        }      
                        </Dialog>
                    </div>
                ) : (
                    <Error elem={"La asignatura"} reason={"de la asignatura, verifique el identificador de la asignatura e intentelo nuevamente"} />  
                )     
            ) : (
                <Loading />
            )
        } 
        </div>
    )
}

export default Subject
