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
    /* const [course, setCourse] = useState(null); */
    /* const [teachers, setTeachers] = useState(null); */
    /* const [students, setStudents] = useState(null); */

    const [course, setCourse] = useState(null);
    const [loadingCourse, setLoadingCourse] = useState(true);
    const [errorCourse, setErrorCourse] = useState(false);
    const [errorCode1, setErrorCode1] = useState(null);
    const [errorCode2, setErrorCode2] = useState(null);
    const [errorCode3, setErrorCode3] = useState(null);
    const [errorCode4, setErrorCode4] = useState(null);
    const [errorCode, setErrorCode] = useState(null);

    const [teachersCourse, setTeachersCourse] = useState(null);
    const [loadingTeachersCourse, setLoadingTeachersCourse] = useState(true);
    const [errorTeachersCourse, setErrorTeachersCourse] = useState(false);

    const [studentsCourse, setStudentsCourse] = useState(null);
    const [loadingStudentsCourse, setLoadingStudentsCourse] = useState(true);
    const [errorStudentsCourse, setErrorStudentsCourse] = useState(false);

    const [unitsCourse, setUnitsCourse] = useState(null);
    const [loadingUnitsCourse, setLoadingUnitsCourse] = useState(true);
    const [errorUnitsCourse, setErrorUnitsCourse] = useState(false);




    const [teachers, setTeachers] = useState(null);
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [errorTeachers, setErrorTeachers] = useState(false);

    const [students, setStudents] = useState(null);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [errorStudents, setErrorStudents] = useState(false);


    const [teacherDialog,   setTeacherDialog] = useState(false);
    const [studentsDialog, setStudentsDialog] = useState(false);
    const [unitsDialog,       setUnitsDialog] = useState(false);
    const [editUnitDialog, setEditUnitDialog] = useState(false);
    const [deleteUnitDialog, setDeleteUnitDialog] = useState(false);

    /* const [teachersCourse, setTeachersCourse] = useState(null);
    const [studentsCourse, setStudentsCourse] = useState(null);
    const [unitsCourse,       setUnitsCourse] = useState(null); */

    /* const [loadingTeachers, setLoadingTeachers] = useState(true); */
    /* const [loadingStudents, setLoadingStudents] = useState(true); */

    const [unitsFields,   setUnitsFields] = useState(0);
    const [unitSelected, setUnitSelected] = useState(null);

    const [unitName,     setUnitName] = useState("");


    // useCallbacks
    // common callbacks
    /**
     * useCallback para obtener la información del curso actual
     */
    const handleGetCourse = useCallback(
        async () => {
            if (id === null)
            {
                return;
            }

            setLoadingCourse(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-course`, {
                params: {
                    subjectIdParam: Encrypt(id)
                }
            })
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setCourse(Decrypt(result.data.data));
                    setErrorCourse(false);
                }
                else
                {
                    setCourse(undefined);
                    setErrorCourse(true);
                    setErrorCode1(result.data.code);
                }

                setLoadingCourse(false);
            })
            .catch(error => {
                setCourse(undefined);
                setErrorCourse(true);

                if (error.response)
                {
                    setErrorCode1(error.response.data.code); 
                }
                else
                {
                    setErrorCode1("GET_COURSE_ERROR");
                }

                setLoadingCourse(false);
            })
            .finally(() => {
                return () => {
                    setLoadingCourse(null);
                    setErrorCourse(null);
                    setCourse(null);
                }
            });
        },
        [id, setCourse, setErrorCode1, setErrorCourse, setLoadingCourse],
    );
    
    /**
     * useCallback para obtener los profesores de la asignatura
     */
    const handleGetTeachersCourse = useCallback(
        async () => {
            if (id === null)
            {
                return;
            }

            setLoadingTeachersCourse(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-teachers-courses`, {
                params: {
                    subjectIdParam: Encrypt(id)
                }
            })
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setTeachersCourse(Decrypt(result.data.data));
                    setErrorTeachersCourse(false);
                }
                else
                {
                    setTeachersCourse(undefined);
                    setErrorTeachersCourse(true);
                    setErrorCode2(result.data.code);
                }

                setLoadingTeachersCourse(false);
            })
            .catch(error => {
                setTeachersCourse(undefined);
                setErrorTeachersCourse(true);
                
                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode2(error.response.data.code); 
                }
                else
                {
                    setErrorCode2("GET_TEACHERS_ERROR");
                }

                setLoadingTeachersCourse(false);
            })
            .finally(() => {
                return () => {
                    setLoadingTeachersCourse(null);
                    setErrorTeachersCourse(null);
                    setTeachersCourse(null);
                }
            });
        },
        [id, setTeachersCourse, setErrorCode2, setErrorTeachersCourse, setLoadingTeachersCourse],
    );

    /**
     * useCallback para obtener los profesores de la asignatura
     */
    const handleGetStudentsCourse = useCallback(
        async () => {
            if (id === null)
            {
                return;
            }

            setLoadingStudentsCourse(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-students-courses`, {
                params: {
                    subjectIdParam: Encrypt(id)
                }
            })
            .then(result => {
                console.log(result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setStudentsCourse(Decrypt(result.data.data));
                    setErrorStudentsCourse(false);
                }
                else
                {
                    setStudentsCourse(undefined);
                    setErrorStudentsCourse(true);
                    setErrorCode3(result.data.code);
                }

                setLoadingStudentsCourse(false);
            })
            .catch(error => {
                setStudentsCourse(undefined);
                setErrorStudentsCourse(true);
                
                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode3(error.response.data.code); 
                }
                else
                {
                    setErrorCode3("GET_STUDENTS_ERROR");
                }

                setLoadingStudentsCourse(false);
            })
            .finally(() => {
                return () => {
                    setLoadingStudentsCourse(null);
                    setErrorStudentsCourse(null);
                    setStudentsCourse(null);
                }
            });
        },
        [id, setStudentsCourse, setErrorCode3, setErrorStudentsCourse, setLoadingStudentsCourse],
    );

    /**
     * useCallback para obtener las unidades de la asignatura
     */
    const handleGetUnitsCourse = useCallback(
        async () => {
            if (id === null)
            {
                return;
            }

            setLoadingUnitsCourse(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-units-course`, {
                params: {
                    subjectIdParam: Encrypt(id)
                }
            })
            .then(result => {
                console.log(result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setUnitsCourse(Decrypt(result.data.data));
                    setErrorUnitsCourse(false);
                }
                else
                {
                    setUnitsCourse(undefined);
                    setErrorUnitsCourse(true);
                    setErrorCode4(result.data.code);
                }

                setLoadingUnitsCourse(false);
            })
            .catch(error => {
                setUnitsCourse(undefined);
                setErrorUnitsCourse(true);
                
                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode4(error.response.data.code); 
                }
                else
                {
                    setErrorCode4("GET_UNITS_ERROR");
                }

                setLoadingUnitsCourse(false);
            })
            .finally(() => {
                return () => {
                    setLoadingUnitsCourse(null);
                    setErrorUnitsCourse(null);
                    setUnitsCourse(null);
                }
            });
        },
        [id, setUnitsCourse, setErrorCode4, setErrorUnitsCourse, setLoadingUnitsCourse],
    );

    /**
     * useCallback para obtener a los alumnos del sistema, que esten vinculados al curso de la asignatura
     */
    const handleGetStudents = useCallback(
        async (number, letter, grade) => {
            if (number === null || letter === null || grade === null)
            {
                return;
            }

            setLoadingStudents(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-students`, {
                params: {
                    number: number,
                    letter: letter,
                    grade: grade
                }
            })
            .then(result => {
                console.log(result);
                if (result.data.code === "PROCESS_OK")
                {
                    
                    setStudents(Decrypt(result.data.data));
                    setErrorStudents(false);
                }
                else
                {
                    setStudents(undefined);
                    setErrorStudents(true);
                    setErrorCode(result.data.code);
                }

                setLoadingStudents(false);
            })
            .catch(error => {
                setStudents(undefined);
                setErrorStudents(true);
                
                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_UNITS_ERROR");
                }

                setLoadingStudents(false);
            })
            .finally(() => {
                return () => {
                    setLoadingStudents(null);
                    setErrorStudents(null);
                    setStudents(null);
                }
            });
        },
        [setStudents, setLoadingStudents, setErrorStudents],
    );

    /**
     * useCallback para obtener a los profesores en los usuarios del sistema
     */
    const handleGetTeachers = useCallback(
        async (nameCourse) => {
            console.log("NAME COURSE", nameCourse);
            setLoadingTeachers(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-teachers`, {
                params: {
                    course: nameCourse
                }
            })
            .then(result => {
                if (result.data.code === "PROCESS_OK")
                {    
                    setTeachers(Decrypt(result.data.data));
                    setErrorTeachers(false);
                }
                else
                {
                    setTeachers(undefined);
                    setErrorTeachers(true);
                    setErrorCode(result.data.code);
                }

                setLoadingTeachers(false);
            })
            .catch(error => {
                setTeachers(undefined);
                setErrorTeachers(true);
                
                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_UNITS_ERROR");
                }

                setLoadingTeachers(false);
            })
            .finally(() => {
                return () => {
                    setLoadingTeachers(null);
                    setErrorTeachers(null);
                    setTeachers(null);
                }
            });
        },
        [setTeachers, setLoadingTeachers, setErrorTeachers],
    );

    



    // dialogs
    /**
     * useCallback para cerrar el dialogo de setear profesores para escoger
     */
    const handleCloseTeacherDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            return setTeacherDialog(false);
        },
        [setTeacherDialog],
    );
    /**
     * useCallback para obtener los profesores disponibles para escoger
     */
    const handleShowTeacherDialog = useCallback(
        async () => {
            if (course === null)
            {
                return;
            }

            setTeacherDialog(true);

            if (teachers === null)
            {
                let type = course.data.type;
                await handleGetTeachers(type);
            }
        },
        [teachers, course, setTeacherDialog, handleGetTeachers],
    );


    /**
     * useCallback para cerrar el dialogo de setear alumnos para escoger
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
     * useCallback para obtener los estudiantes disponibles para escoger
     */
    const handleShowStudentsDialog = useCallback(
        async () => {
            if (course === null)
            {
                return;
            }

            setStudentsDialog(true);

            if (students === null)
            {
                let number = course.data.number;
                let letter = course.data.letter;
                let grade = course.data.grade;

                await handleGetStudents(number, letter, grade);
            }
        },
        [students, course, setStudentsDialog, handleGetStudents],
    );


    /**
     * useCallback para cerrar el dialogo de crear unidades
     */
    const handleCloseUnitsDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setUnitsFields(0);
            return setUnitsDialog(false);
        },
        [setUnitsDialog],
    );
    /**
     * useCallback para abrir el dialogo de crear unidades
     */
    const handleShowUnitsDialog = useCallback(
        () => {
            if (course === null)
            {
                return;
            }

            setUnitsDialog(true);
        },
        [course, setUnitsDialog],
    );


    /**
     * useCallback para cerrar el dialogo de editar unidad
     */
    const handleCloseEditUnitDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setUnitSelected(null);
            return setEditUnitDialog(false);
        },
        [setUnitSelected, setEditUnitDialog],
    );
    /**
     * useCallback para abrir el dialogo de editar unidad
     */
    const handleShowEditUnitDialog = useCallback(
        (unit) => {
            if (course === null || unit === null)
            {
                return;
            }

            setUnitSelected(unit);
            setUnitName(unit.data.unit)
            return setEditUnitDialog(true);
        },
        [course, setUnitSelected, setEditUnitDialog],
    );
   

    /**
     * useCallback para cerrar el dialogo de eliminar unidad
     */
    const handleCloseDeleteUnitDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setUnitSelected(null);
            return setDeleteUnitDialog(false);
        },
        [setUnitSelected, setDeleteUnitDialog],
    );
    /**
     * useCallback para mostrar el dialogo de eliminar unidad
     */
    const handleShowDeleteUnitDialog = useCallback(
        (unit) => {
            if (course === null || unit === null)
            {
                return;
            }

            setUnitSelected(unit);
            return setDeleteUnitDialog(true);
        },
        [course, setUnitSelected, setDeleteUnitDialog],
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
            .then(async result => {
                if (result.data.code === "PROCESS_OK")
                {
                    await handleGetUnitsCourse();
                    showMessage(result.data.message, result.data.type);
                }
                else
                {
                    setUnitsCourse([]);
                    showMessage(result.data.message, result.data.type);
                }
            })
            .catch(error => {
                if (error.response)
                {
                    setUnitsCourse([]);
                console.log(error.response.data.message);
                }
                
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
            .then(async result => {
                if (result.data.code === "PROCESS_OK")
                {
                    await handleGetUnitsCourse();
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

    /**
     * useCallback para editar una unidad
     */
     const handleDeleteUnit = useCallback(
        async () => {
            if (id === null || unitSelected === null)
            {
                return;
            }
            
            await axios.delete(`${process.env.REACT_APP_API_URI}/delete-unit-course`, {
                params: {
                    paramIdSubject: Encrypt(id),
                    paramIdUnit: Encrypt(unitSelected.id)
                }
            })
            .then(async result => {
                if (result.data.code === "PROCESS_OK")
                {
                    await handleGetUnitsCourse();
                    handleCloseDeleteUnitDialog();
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
        [id, unitSelected],
    );


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
            await handleGetTeachersCourse();
            await handleGetStudentsCourse();
            await handleGetUnitsCourse();
        }

        if (course !== undefined && course !== null)
        {
            callQuery();

            return () => {
                setTeachersCourse(null);
                setStudentsCourse(null);
                setUnitsCourse(null);
            }
        }
    }, [course, handleGetTeachersCourse, handleGetStudentsCourse, handleGetUnitsCourse, setTeachersCourse, setStudentsCourse, setUnitsCourse]);


    return (
        <Paper elevation={0} itemType="div">
        {
            loadingCourse === true ? (
                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>
                    <CircularProgress style={{ color: "#2074d4" }} />
                    <Typography style={{ marginTop: 15 }}>Cargando el curso</Typography>
                </Paper>
            ) : errorCourse === true ? (
                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>1
                    <Typography style={{ textAlign: "center" }}>
                    {
                        errorCode1 !== null ? (
                            errorCode1 === "PARAM_NULL" ? (
                                "No puede enviar un parametro nulo, verifique el problema e intentelo nuevamente"
                            ) : errorCode1 === "PARAM_BAD_FORMATING" ? (
                                "Verifique el parametro enviado, e intentelo nuevamente"
                            ) : errorCode1 === "BAD_TYPES_PARAM" ? (
                                "Verifique el dato enviado al servidor, intentelo nuevamente porfavor"
                            ) : errorCode1 === "PARAM_EMPTY" ? (
                                "No puede enviar un parametro vacio al servidor, intentelo nuevamente"
                            ) : errorCode1 === "COURSE_NOT_FOUND" ? (
                                "La asignatura no fue encontrada, verifique el identificador e intentelo nuevamente"
                            ) : errorCode1 === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                            ) : (
                                "Ha ocurrido algo inesperado al obtener la asignatura, intentelo nuevamente"
                            )
                        ) : (
                            "Ha ocurrido algo inesperado al obtener la asignatura, intentelo nuevamente"
                        )
                    }
                    </Typography>

                    <React.Fragment>
                    {
                        errorCode1 !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                <Button onClick={async () => await handleGetCourse()} style={{ color: "#2074d4" }}>
                                    <Typography variant="button">Recargar Asignatura</Typography>
                                </Button>
                            </Paper>
                        )
                    }
                    </React.Fragment>
                </Paper>
            ) : course === null ? (
                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>
                    <CircularProgress style={{ color: "#2074d4" }} />
                    <Typography style={{ marginTop: 15 }}>Cargando el curso</Typography>
                </Paper>
            ) : course === undefined ? (
                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>
                    <Typography style={{ textAlign: "center" }}>
                    {
                        errorCode1 !== null ? (
                            errorCode1 === "PARAM_NULL" ? (
                                "No puede enviar un parametro nulo, verifique el problema e intentelo nuevamente"
                            ) : errorCode1 === "PARAM_BAD_FORMATING" ? (
                                "Verifique el parametro enviado, e intentelo nuevamente"
                            ) : errorCode1 === "BAD_TYPES_PARAM" ? (
                                "Verifique el dato enviado al servidor, intentelo nuevamente porfavor"
                            ) : errorCode1 === "PARAM_EMPTY" ? (
                                "No puede enviar un parametro vacio al servidor, intentelo nuevamente"
                            ) : errorCode1 === "COURSE_NOT_FOUND" ? (
                                "La asignatura no fue encontrada, verifique el identificador e intentelo nuevamente"
                            ) : errorCode1 === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                            ) : (
                                "Ha ocurrido algo inesperado al obtener la asignatura, intentelo nuevamente"
                            )
                        ) : (
                            "Ha ocurrido algo inesperado al obtener la asignatura, intentelo nuevamente"
                        )
                    }
                    </Typography>

                    <React.Fragment>
                    {
                        errorCode1 !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                <Button onClick={async () => await handleGetCourse()} style={{ color: "#2074d4" }}>
                                    <Typography variant="button">Recargar Asignatura</Typography>
                                </Button>
                            </Paper>
                        )
                    }
                    </React.Fragment>
                </Paper>
            ) : (
                <React.Fragment>
                    <Paper variant="outlined" style={{ padding: 20 }}>
                        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                            <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                                Home
                            </Link>
                            <Link to="/subjects" style={{ textDecoration: "none", color: "#333" }}>
                                Manejar Asignaturas
                            </Link>
                            <Typography style={{ color: "#2074d4" }}>Asignatura {course.data.code}</Typography>
                        </Breadcrumbs>
                    </Paper>

                    <Card variant="outlined" style={{ marginTop: 15 }}>
                        <CardContent>
                            <Typography variant="h5">Curso {course.data.code}</Typography>  
                            <Typography variant="h6" color="textSecondary">{Decrypt(course.data.courseName)}</Typography>  
                        </CardContent>
                    </Card>

                    <Card variant="outlined" style={{ marginTop: 15 }}>
                    {
                        loadingTeachersCourse === true ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15, padding: 15 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando profesores de la asignatura</Typography>
                            </Paper>
                        ) : teachersCourse === null ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15, padding: 15 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando profesores de la asignatura</Typography>
                            </Paper>
                        ) : (
                            <React.Fragment>
                                <CardContent>
                                {
                                    errorTeachersCourse === true ? (
                                        <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15 }}>
                                            <Typography style={{ textAlign: "center" }}>
                                            {
                                                errorCode2 !== null ? (
                                                    errorCode2 === "PARAM_NULL" ? (
                                                        "No puede enviar un parametro nulo, verifique el problema e intentelo nuevamente"
                                                    ) : errorCode2 === "PARAM_BAD_FORMATING" ? (
                                                        "Verifique el parametro enviado, e intentelo nuevamente"
                                                    ) : errorCode2 === "BAD_TYPES_PARAM" ? (
                                                        "Verifique el dato enviado al servidor, intentelo nuevamente porfavor"
                                                    ) : errorCode2 === "PARAM_EMPTY" ? (
                                                        "No puede enviar un parametro vacio al servidor, intentelo nuevamente"
                                                    ) : errorCode2 === "GET_TEACHERS_ERROR" ? (
                                                        "Sin docentes o ayudantes asignados"
                                                    ) : errorCode2 === "NO_TEACHERS_FOUNDED" ? (
                                                        "Sin docentes o ayudantes asignados"
                                                    ) : errorCode2 === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                        "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                                    ) : (
                                                        "Ha ocurrido algo inesperado al obtener la asignatura, intentelo nuevamente"
                                                    )
                                                ) : (
                                                    "Ha ocurrido algo inesperado al obtener la asignatura, intentelo nuevamente"
                                                )
                                            }
                                            </Typography>

                                            <React.Fragment>
                                            {
                                                errorCode2 !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                        <Button onClick={async () => await handleGetTeachersCourse()} style={{ color: "#2074d4" }}>
                                                            <Typography variant="button">Recargar Contenido</Typography>
                                                        </Button>
                                                    </Paper>
                                                )
                                            }
                                            </React.Fragment>
                                        </Paper>
                                    ) : (
                                        <React.Fragment>
                                            <Typography variant="h5">Información acerca de los Profesores y Ayudantes</Typography>

                                            <Typography variant="h6" color="textSecondary">Existen {teachersCourse.filter(x => x.data.helper === false).length} profesores en este curso</Typography>
                                            <Typography variant="h6" color="textSecondary">Existen {teachersCourse.filter(x => x.data.helper === true).length} ayudantes en este curso</Typography>
                                        </React.Fragment>
                                    )
                                }
                                </CardContent>
                                <CardActions>
                                    <Button style={{ color: "#2074d4" }} onClick={() => handleShowTeacherDialog()}>Establecer un docente a cargo</Button>
                                </CardActions>
                            </React.Fragment>
                        )
                    }
                    </Card>

                    <Card variant="outlined" style={{ marginTop: 15 }}>
                    {
                        loadingStudentsCourse === true ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15, padding: 15 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando estudiantes de la asignatura</Typography>
                            </Paper>
                        ) : studentsCourse === null ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15, padding: 15 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando estudiantes de la asignatura</Typography>
                            </Paper>
                        ) : (
                            <React.Fragment>
                                <CardContent>
                                {
                                    errorStudentsCourse === true ? (
                                        <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15 }}>
                                            <Typography style={{ textAlign: "center" }}>
                                            {
                                                errorCode3 !== null ? (
                                                    errorCode3 === "PARAM_NULL" ? (
                                                        "No puede enviar un parametro nulo, verifique el problema e intentelo nuevamente"
                                                    ) : errorCode3 === "PARAM_BAD_FORMATING" ? (
                                                        "Verifique el parametro enviado, e intentelo nuevamente"
                                                    ) : errorCode3 === "BAD_TYPES_PARAM" ? (
                                                        "Verifique el dato enviado al servidor, intentelo nuevamente porfavor"
                                                    ) : errorCode3 === "PARAM_EMPTY" ? (
                                                        "No puede enviar un parametro vacio al servidor, intentelo nuevamente"
                                                    ) : errorCode3 === "GET_STUDENTS_ERROR" ? (
                                                        "Sin alumnos asignados"
                                                    ) : errorCode3 === "NO_STUDENTS_FOUNDED" ? (
                                                        "Sin alumnos asignados"
                                                    ) : errorCode3 === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                        "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                                    ) : (
                                                        "Ha ocurrido algo inesperado al obtener la asignatura, intentelo nuevamente"
                                                    )
                                                ) : (
                                                    "Ha ocurrido algo inesperado al obtener la asignatura, intentelo nuevamente"
                                                )
                                            }
                                            </Typography>

                                            <React.Fragment>
                                            {
                                                errorCode3 !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                        <Button onClick={async () => await handleGetStudentsCourse()} style={{ color: "#2074d4" }}>
                                                            <Typography variant="button">Recargar Contenido</Typography>
                                                        </Button>
                                                    </Paper>
                                                )
                                            }
                                            </React.Fragment>
                                        </Paper>
                                    ) : (
                                        <React.Fragment>
                                            <Typography variant="h5">Información acerca de los Estudiantes</Typography> 

                                            <Typography variant="h6" color="textSecondary">{`Existen ${studentsCourse.length} Estudiantes`}</Typography>
                                        </React.Fragment>
                                    )
                                }
                                </CardContent>
                                <CardActions>
                                    <Button style={{ color: "#2074d4" }} onClick={async () => await handleShowStudentsDialog()}>Establecer alumnos a esta asignatura</Button>
                                </CardActions>
                            </React.Fragment>
                        )
                    }
                    </Card>

                    <Card variant="outlined" style={{ marginTop: 15 }}>
                    {
                        loadingUnitsCourse === true ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15, padding: 15 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando unidades de la asignatura</Typography>
                            </Paper>
                        ) : unitsCourse === null ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15, padding: 15 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando units de la asignatura</Typography>
                            </Paper>
                        ) : (
                            <React.Fragment>
                                <CardContent>
                                    <React.Fragment>
                                    {
                                        errorUnitsCourse === true ? (
                                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15 }}>
                                                <Typography style={{ textAlign: "center" }}>
                                                {
                                                    errorCode4 !== null ? (
                                                        errorCode4 === "PARAM_NULL" ? (
                                                            "No puede enviar un parametro nulo, verifique el problema e intentelo nuevamente"
                                                        ) : errorCode4 === "PARAM_BAD_FORMATING" ? (
                                                            "Verifique el parametro enviado, e intentelo nuevamente"
                                                        ) : errorCode4 === "BAD_TYPES_PARAM" ? (
                                                            "Verifique el dato enviado al servidor, intentelo nuevamente porfavor"
                                                        ) : errorCode4 === "PARAM_EMPTY" ? (
                                                            "No puede enviar un parametro vacio al servidor, intentelo nuevamente"
                                                        ) : errorCode4 === "GET_UNITS_ERROR" ? (
                                                            "No hay unidades creadas aún"
                                                        ) : errorCode4 === "NO_UNITS_FOUNDED" ? (
                                                            "No hay unidades creadas aún"
                                                        ) : errorCode4 === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                            "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                                        ) : (
                                                            "Ha ocurrido algo inesperado al obtener la asignatura, intentelo nuevamente"
                                                        )
                                                    ) : (
                                                        "Ha ocurrido algo inesperado al obtener la asignatura, intentelo nuevamente"
                                                    )
                                                }
                                                </Typography>

                                                <React.Fragment>
                                                {
                                                    errorCode4 !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                            <Button onClick={async () => await handleGetUnitsCourse()} style={{ color: "#2074d4" }}>
                                                                <Typography variant="button">Recargar Contenido</Typography>
                                                            </Button>
                                                        </Paper>
                                                    )
                                                }
                                                </React.Fragment>
                                            </Paper>
                                        ) : (
                                            <React.Fragment>
                                                <Typography variant="h5">Unidades del curso</Typography>

                                                <List>
                                                {
                                                    unitsCourse.map(doc => (
                                                        <Paper elevation={0} itemType="div" key={doc.id}>
                                                            <ListItem>
                                                                <ListItemText primary={`Unidad ${doc.data.numberUnit} : ${doc.data.unit}`} secondary={`Creado hace ${timeago(new Date(doc.data.created_at._seconds * 1000))}`} security="true" />
                                                                <ListItemSecondaryAction security="true">
                                                                    <Tooltip title={`Borrar Unidad ${doc.data.numberUnit}`}>
                                                                        <IconButton edge="end" onClick={() => handleShowDeleteUnitDialog(doc)}>
                                                                            <Delete />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title={`Editar Unidad ${doc.data.numberUnit}`}>
                                                                        <IconButton style={{ marginLeft: 15 }} edge="end" onClick={() => handleShowEditUnitDialog(doc)}>
                                                                            <Edit />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </ListItemSecondaryAction>
                                                            </ListItem>
                                                            <Divider style={{ marginBottom: 10 }} />
                                                        </Paper>
                                                    ))
                                                }
                                                </List>

                                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                    <Button onClick={async () => await handleGetUnitsCourse()} style={{ color: "#2074d4" }}>
                                                        <Typography variant="button">Recargar Unidades</Typography>
                                                    </Button>
                                                </Paper>
                                            </React.Fragment>
                                        )
                                    }
                                    </React.Fragment>
                                </CardContent>
                                <CardActions>
                                    <Button style={{ color: "#2074d4" }} onClick={() => handleShowUnitsDialog()}>Establecer unidades a esta Asignatura</Button>   
                                </CardActions>
                            </React.Fragment>
                        )
                    }
                    </Card>


                    <Dialog open={studentsDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseStudentsDialog} fullScreen={fullScreen} scroll="paper">
                        <DialogTitle>Asignar estudiantes a la asignatura {Decrypt(course.data.courseName)}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Asigna estudiantes del curso {`${course.data.grade} ${course.data.number}º${course.data.letter}`} para la asignatura {course.data.type}
                            </DialogContentText>

                            <Accordion variant="outlined">
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography>Ver Alumnos</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                    {
                                        loadingStudents === true ? (
                                            <Paper elevation={0} itemType="div" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                            </Paper>
                                        ) : errorStudents === true ? (
                                            <React.Fragment>
                                                <Typography style={{ textAlign: "center" }}>
                                                    Ha ocurrido un error al obtener los estudiantes del sistema
                                                </Typography>

                                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                    <Button onClick={async () => await handleGetStudents(course.data.number, course.data.letter, course.data.grade)} style={{ color: "#2074d4" }}>
                                                        <Typography variant="button">Recargar Estudiantes</Typography>
                                                    </Button>
                                                </Paper>
                                            </React.Fragment>
                                        ) : students === null ? (
                                            <Paper elevation={0} itemType="div" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                            </Paper>
                                        ) : (
                                            students.length > 0 ? ( 
                                                <React.Fragment>
                                                    <List style={{ width: "100%" }}>
                                                    {
                                                        students.map(doc => (
                                                            <StudentListItem key={doc.id} subjectId={id} course={course} student={doc} students={students} studentsCourse={studentsCourse} setStudentsCourse={setStudentsCourse} />
                                                        ))
                                                    }
                                                    </List> 

                                                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                        <Button onClick={async () => await handleGetStudents(course.data.number, course.data.letter, course.data.grade)} style={{ color: "#2074d4" }}>Recargar Estudiantes</Button>
                                                    </Paper>
                                                </React.Fragment>
                                            ) : (
                                                <React.Fragment>
                                                    <Typography style={{ textAlign: "center" }}>No existen alumnos a esta asignatura del curso</Typography>
                                                                
                                                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                        <Button onClick={async () => await handleGetStudents(Decrypt(course).number, Decrypt(course).letter, Decrypt(course).grade)} style={{ color: "#2074d4" }}>Recargar Estudiantes</Button>
                                                    </Paper>
                                                </React.Fragment>     
                                            )
                                        )
                                    }
                                    </Paper>
                                </AccordionDetails>
                            </Accordion>                                       
                        </DialogContent>
                        <DialogActions>
                            <Button color="inherit" onClick={() => setStudentsDialog(false)}>
                                Cerrar Ventana
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog open={teacherDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseTeacherDialog} fullScreen={fullScreen} scroll="paper">
                        <DialogTitle>Asignar profesores a la asignatura {Decrypt(course.data.courseName)}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Asigna un profesor o dos profesores para la asignatura {Decrypt(course.data.courseName)}
                            </DialogContentText>

                            <Accordion variant="outlined">
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography>Ver Profesores</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                    {
                                        loadingTeachers === true ? (
                                            <Paper elevation={0} itemType="div" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                            </Paper>
                                        ) : errorTeachers === true ? (
                                            <React.Fragment>
                                                <Typography style={{ textAlign: "center" }}>
                                                    Algo inesperado acaba de ocurrir al obtener los docentes del sistema
                                                </Typography>

                                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                    <Button onClick={async () => await handleGetTeachers(course.data.type)} style={{ color: "#2074d4" }}>
                                                        <Typography variant="button">Recargar Docentes</Typography>
                                                    </Button>
                                                </Paper>
                                            </React.Fragment>
                                        ) : teachers === null ? (
                                            <Paper elevation={0} itemType="div" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                            </Paper>
                                        ) : (
                                            teachers.length > 0 ? ( 
                                                <React.Fragment>
                                                    <List style={{ width: "100%" }}>
                                                    {
                                                        teachers.map(teacher => (
                                                            <TeacherListItem key={teacher.id} subjectId={id} course={course} teacher={teacher} teachers={teachers} teachersCourse={teachersCourse} setTeachersCourse={setTeachersCourse} />
                                                        ))
                                                    }
                                                    </List> 

                                                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                        <Button onClick={async () => await handleGetTeachers(course.data.type)} style={{ color: "#2074d4" }}>Recargar Docentes</Button>
                                                    </Paper>
                                                </React.Fragment>
                                            ) : (
                                                <React.Fragment>
                                                    <Typography style={{ textAlign: "center" }}>No existen docentes a esta asignatura del curso</Typography>
                                                                
                                                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                        <Button onClick={async () => await handleGetTeachers(course.data.type)} style={{ color: "#2074d4" }}>Recargar Docentes</Button>
                                                    </Paper>
                                                </React.Fragment>     
                                            )
                                        )
                                    }
                                    </Paper>
                                </AccordionDetails>
                            </Accordion>
                        </DialogContent>
                        <DialogActions>
                            <Button color="inherit" onClick={() => setTeacherDialog(false)}>
                                Cerrar Ventana
                            </Button>
                        </DialogActions>
                    </Dialog>


                    <Dialog open={unitsDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseUnitsDialog} fullScreen={fullScreen} scroll="paper">
                        <DialogTitle>Crear unidades en el curso {Decrypt(course.data.courseName)}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Asigna y crea unidades al curso {`${course.data.grade} ${course.data.number}º${course.data.letter}`} para la asignatura {course.data.type}
                            </DialogContentText>
                                    
                            <div id="units" />

                            <Divider style={{ marginTop: 15, marginBottom: 15 }} />

                            <Button startIcon={<PlaylistAdd />} style={{ color: "#2074d4" }} onClick={() => handleAddUnitField()}>Añadir unidad</Button>      
                            
                            <React.Fragment>
                            {
                                unitsFields > 0 && (
                                    <Button startIcon={<Delete />} style={{ color: "#34495E", marginLeft: 15 }} onClick={() => handleRemoveUnitField()}>Remover ultima unidad</Button>
                                )
                            }
                            </React.Fragment>
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
                                    <DialogTitle>Editar {`Unidad ${unitSelected.data.numberUnit} : ${unitSelected.data.unit}`}</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Edite los valores de la {`unidad ${unitSelected.data.numberUnit} : ${unitSelected.data.unit}`}
                                        </DialogContentText>

                                        <TextField type="text"   label="Nombre de la unidad" variant="outlined" security="true" value={unitName} fullWidth onChange={(e) => setUnitName(e.target.value)} style={{ marginBottom: 15 }} />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button color="inherit" onClick={handleCloseEditUnitDialog}>Cerrar Ventana</Button>
                                        <Button onClick={() => handleEditUnit()} style={{ color: "#2074d4" }}>Editar Unidad</Button>
                                    </DialogActions>
                                </>
                            )
                        }
                        </Dialog>
                    
                        <Dialog open={deleteUnitDialog} maxWidth={"sm"} fullWidth={true} onClose={handleCloseDeleteUnitDialog} fullScreen={fullScreen} scroll="paper">
                        {
                            unitSelected !== null && (
                                <>
                                    <DialogTitle>Eliminar {`Unidad ${unitSelected.data.numberUnit} : ${unitSelected.data.unit}`}</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Esta seguro de eliminar esta unidad?
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button color="inherit" onClick={handleCloseDeleteUnitDialog}>Cancelar</Button>
                                        <Button onClick={async () => await handleDeleteUnit()} style={{ color: "#2074d4" }}>Eliminar unidad</Button>

                                        </DialogActions>
                                        </>
                                    )
                                }      
                        </Dialog>

                </React.Fragment>
            )
        }
        </Paper>
    )
}

export default Subject
