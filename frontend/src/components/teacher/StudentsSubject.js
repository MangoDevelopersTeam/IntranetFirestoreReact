import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { CircularProgress, List, ListItem, ListItemText, Typography, Divider, Paper, Breadcrumbs, Button, Card, CardContent, ListItemSecondaryAction, IconButton, Tooltip, useTheme, ThemeProvider, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, InputBase, Grid, createTheme, TextField, FormControl, MenuItem, Select, InputLabel, Menu } from '@material-ui/core';
import { AddCircleOutline, Delete, Edit, GridOn, NavigateNext, PlaylistAdd, PostAdd, RemoveCircleOutline, Replay, Visibility } from '@material-ui/icons';

import { showMessage } from '../../helpers/message/handleMessage';
import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';
import { timeago } from '../../helpers/format/handleFormat';

import axios from 'axios';

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
    const [subject,   setSubject] = useState(null);
    const [errorSubject, setErrorSubject] = useState(false);
    const [loadingSubject, setLoadingSubject] = useState(true);
    const [errorCode, setErrorCode] = useState(null);

    const [students, setStudents] = useState(null);
    const [errorStudents, setErrorStudents] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(true);

    const [grades, setGrades] = useState(null);
    const [errorGrades, setErrorGrades] = useState(false);
    const [loadingGrades, setLoadingGrades] = useState(true);

    const [annotations, setAnnotations] = useState(null);
    const [errorAnnotations, setErrorAnnotations] = useState(false);
    const [loadingAnnotations, setLoadingAnnotations] = useState(true);

    const [authorized,   setAuthorized] = useState(null);
    const [errorAuthorized, setErrorAuthorized] = useState(false);
    const [loadingAuthorized, setLoadingAuthorized] = useState(true);

    const [editAnnotation, setEditAnnotation] = useState(false);
    const [deleteAnnotation, setDeleteAnnotation] = useState(false);
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);

    const [helper, setHelper] = useState(null);
    const [errorHelper, setErrorHelper] = useState(false);
    const [loadingHelper, setLoadingHelper] = useState(true);

    const [gradesDialog, setGradesDialog] = useState(false);
    const [annotationDialog, setAnnotationDialog] = useState(false);

    const [type, setType] = useState("");
    const [description, setDescription] = useState("");

    
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [menuSelect, setMenuSelect] = useState(null);
    const [useFilter, setUseFilter] = useState(false);


    // useCallbacks
    /**
     * useCallback para obtener el detalle del curso
     */
    const handleGetDetailedSubject = useCallback(
        async () => {
            if (id === null)
            {
                return;
            }

            setLoadingSubject(true);

            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-detailed-course", {
                params: {
                    courseID: Encrypt(id)
                }
            })
            .then(result => {
                console.log("Asignatura response =", result);

                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setSubject(Decrypt(result.data.data));
                    setErrorSubject(false);
                    setErrorCode(null);
                }
                else
                {
                    setSubject(undefined);
                    setErrorSubject(true);
                    setErrorCode(result.data.code);
                }

                setLoadingSubject(false);
            })
            .catch(error => {
                setErrorSubject(true);
                setSubject(undefined);
                    
                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("GET_DETAILED_SUBJECT_ERROR");
                }

                setLoadingSubject(false);
            })
            .finally(() => {
                return () => {
                    setSubject(null); 
                    setErrorSubject(null);
                    setErrorCode(null);
                    setLoadingSubject(null);
                }
            });
        },
        [id, setSubject, setErrorSubject, setErrorCode, setLoadingSubject],
    );

    /**
     * useCallback para obtener los estudiantes de la asignatura relacionadas con el curso
     */
    const handleGetStudentsCourse = useCallback(
        async () => {
            if (id === null || authorized === false)
            {
                return;
            }
      
            setLoadingStudents(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-students-courses`, {
                params: {
                    subjectIdParam: Encrypt(id)
                }
            })
            .then(result => {
                console.log("estudiantes response =", result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {   
                    setStudents(Decrypt(result.data.data));
                    setErrorStudents(false);
                    setErrorCode(null);

                    setLoadingStudents(false);
                }
                else
                {
                    setStudents(undefined);
                    setErrorStudents(true);
                    setErrorCode(result.data.code);

                    setLoadingStudents(false);
                }

                setLoadingStudents(false);
            })
            .catch(error => {
                setErrorStudents(true);
                setStudents(undefined);
                    
                if (error.response)
                {
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("GET_STUDENTS_SUBJECT_ERROR");
                }

                setLoadingStudents(false);
            })
            .finally(() => {
                return () => {
                    setStudents(null); 
                    setErrorStudents(null);
                    setErrorCode(null);
                    setLoadingStudents(null);
                }
            });    
        },
        [id, authorized, setStudents, setErrorStudents, setErrorCode, setLoadingStudents],
    );

    /**
     * useCallback para obtener las notas del estudiante seleccionado
     */
    const handleGetGradesStudentCourse = useCallback(
        async (userId) => {
            if (id === null || userId === null || authorized === false)
            {
                return;
            }
            
            setLoadingGrades(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-grades-student-course`, {
                params: {
                    idCourse: Encrypt(id), 
                    idUser: Encrypt(userId)
                }
            })
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {   
                    setGrades(Decrypt(result.data.data));
                    setErrorGrades(false);
                    setErrorCode(null);
                }
                else
                {
                    setGrades(undefined);
                    setErrorGrades(true);
                    setErrorCode(result.data.code);
                }
                
                setLoadingGrades(false);
            })
            .catch(error => {
                setErrorGrades(true);
                setGrades(undefined);
                    
                if (error.response)
                {
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
        },
        [id, authorized, setLoadingGrades, setGrades, setErrorGrades, setErrorCode],
    );

    /**
     * useCallback para verificar si el alumno o profesor tiene asignación a este recurso
     */
    const handleGetAuthorizedAccess = useCallback(
        async () => {
            if (id === null)
            {
                return;
            }

            setLoadingAuthorized(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-authorized-access`, {
                params: {
                    idCourse: Encrypt(id)
                }
            })
            .then(result => {
                console.log("authorized response =", result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setAuthorized(result.data.data);
                    setErrorAuthorized(false);
                    setErrorCode(null);
                }
                else
                {
                    setAuthorized(undefined);
                    setErrorAuthorized(true);
                    setErrorCode(result.data.code);
                }

                setLoadingAuthorized(false);
            })
            .catch(error => {
                setErrorAuthorized(true);
                setAuthorized(undefined);

                if (error.response)
                {   
                    console.log(error.response);
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("GET_UNIT_FILES_ERROR");
                }

                setLoadingAuthorized(false);
            })
            .finally(() => {
                return () => {
                    setAuthorized(null);
                    setErrorAuthorized(null);
                    setErrorCode(null);
                }
            });
            
        },
        [id, setAuthorized, setErrorAuthorized, setErrorCode],
    );

    /**
     * useCallback para obtener al usuario profesor en el curso actual
     */
    const handleGetTeacherCourse = useCallback(
        async () => {
            if (id === null)
            {
                return
            }

            setLoadingHelper(true);
                
            await axios.get(`${process.env.REACT_APP_API_URI}/get-teacher-course`, {
                params: {
                    idCourse: Encrypt(id)
                }
            })
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    console.log(Decrypt(Decrypt(result.data.data)[0].data).helper);
                    if (Decrypt(Decrypt(result.data.data)[0].data).helper === true)
                    {
                        setHelper(true);
                    }
                    else
                    {
                        setHelper(false);
                    }

                    setErrorHelper(false);
                }
                else
                {
                    setHelper(undefined);
                    setErrorHelper(true);
                }

                setLoadingHelper(false);
            })
            .catch(() => {
                setHelper(undefined);
                setErrorHelper(true);
            })
            .finally(() => {
                return () => {
                    setHelper(null);
                    setErrorHelper(null);
                }
            });    
        },
        [id, setHelper, setErrorHelper],
    );

    /**
     * useCallback para obtener las anotaciones
     */
    const handleGetAnnotations = useCallback(
        async (idStudent) => {
            if (idStudent == null || id == null)
            {
                return;
            }
  
            setLoadingAnnotations(true);
            setUseFilter(false);
            
            await axios.get(`${process.env.REACT_APP_API_URI}/get-annotations-student-course`, {
                params: {
                    idUserParam: Encrypt(idStudent),
                    idSubjectParam: Encrypt(id)
                }
            })
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setAnnotations(Decrypt(result.data.data));
                    setErrorAnnotations(false);
                    setErrorCode(null);
                }
                else
                {
                    setAnnotations(undefined);
                    setErrorAnnotations(true);
                    setErrorCode(result.data.code);
                }

                setLoadingAnnotations(false);
            })
            .catch(error => {
                setErrorAnnotations(true);
                setAnnotations(undefined);
                    
                if (error.response)
                {
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("GET_DETAILED_SUBJECT_ERROR");
                }

                setLoadingAnnotations(false);
            })
            .finally(() => {
                return () => {
                    setAnnotations(null); 
                    setErrorAnnotations(null);
                    setErrorCode(null);
                    setLoadingAnnotations(null);
                }
            });
        },
        [id, setAnnotations, setLoadingAnnotations, setErrorAnnotations, setErrorCode, setUseFilter],
    );

    /**
     * useCallback para agregar una anotación
     */
    const handleAddAnnotation = useCallback(
        async () => {
            if (id === null || selectedStudent === null)
            {
                return;
            }
            
            if (type === "" || description === "")
            {
                return showMessage("Complete los campos de texto", "info");
            }

            if (type === "positive" || type === "negative" || type === "observation")
            {
                let object = {
                    idSubject: id,
                    type: type,
                    description: Encrypt(description)
                }

                await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/post-annotation-student-course", {
                    annotationData: Encrypt(object)
                }, {
                    params: {
                        idUserParam: Encrypt(selectedStudent.id),
                        idSubjectParam: Encrypt(id)
                    }
                })
                .then(result => {
                    console.log(result);
                    if (result.status === 201 && result.data.code === "PROCESS_OK")
                    {   
                        setErrorAnnotations(false);
                        setAnnotations(Decrypt(result.data.data));
                        setErrorCode(null);

                        setDescription("");
                        setType("");

                        showMessage("Anotación añadida correctamente", "success");
                    }
                    else
                    {
                        setErrorAnnotations(true);
                        setAnnotations(null);
                        setErrorCode(result.data.code);
                    }
                })
                .catch(error => {
                    if (error.response)
                    {
                        if (error.response.status === 400)
                        {
                            showMessage(error.response.data.message, error.response.data.type);
                        }
                        else if (error.response.status === 500)
                        {
                            setErrorCode(error.response.data.code);
                            setErrorAnnotations(true);
                            setAnnotations(null);

                            setLoadingAnnotations(false);
                        }                   
                    }
                    else
                    {
                        setErrorCode("GET_DETAILED_SUBJECT_ERROR");

                        setErrorCode(error.response.data.code);
                        setErrorAnnotations(true);
                        setAnnotations(null);
                            
                        setLoadingAnnotations(false);
                    }
                })
                .finally(() => {
                    return () => {
                        setAnnotations(null); 
                        setErrorAnnotations(null);
                        setErrorCode(null);
                        setLoadingAnnotations(null);
                    }
                });
            }
        }, 
        [id, selectedStudent, type, description, setAnnotations, setLoadingAnnotations, setErrorAnnotations, setErrorCode],
    );

    /**
     * useCallback para configurar el formulario de editar la anotación
     */
    const handleOpenEditAnnotation = useCallback(
        (doc) => {
            setSelectedAnnotation(doc);
            setType(doc.data.type);
            setDescription(Decrypt(doc.data.description));

            setEditAnnotation(true);
            setDeleteAnnotation(false);
        },
        [setSelectedAnnotation, setEditAnnotation, setDeleteAnnotation, setType, setDescription],
    );

    /**
     * useCallback para cancelar la acción de editar la anotación
     */
    const handleCancelEditAnnotation = useCallback(
        () => {
            setEditAnnotation(false);
            setDeleteAnnotation(false);

            setDescription("");
            setType("");
        }, 
        [setEditAnnotation, setDeleteAnnotation, setDescription, setType],
    );

    /**
     * useCallback para editar la anotación
     */
    const handleEditAnnotation = useCallback(
        async () => {
            if (selectedStudent === null || selectedAnnotation === null || id === null)
            {
                return;
            }

            let object = {
                idSubject: id,
                type: type,
                description: Encrypt(description),
            }

            if (type === "" || description === "")
            {
                return showMessage("Complete los campos de texto", "info");
            }
            
            if (type === "positive" || type === "negative" || type === "observation")
            {
                await axios.put("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/put-annotation-student-course", {
                    annotationData: Encrypt(object)
                }, {
                    params: {
                        idUserParam: Encrypt(selectedStudent.id),
                        idAnnotationParam: Encrypt(selectedAnnotation.id),
                        idSubjectParam: Encrypt(id)
                    }
                })
                .then(result => {
                    if (result.status === 200 && result.data.code === "PROCESS_OK")
                    {   
                        setAnnotations(Decrypt(result.data.data));
                        setErrorAnnotations(false);
                        setEditAnnotation(false);
                        setErrorCode(null);

                        setDescription("");
                        setType("");

                        showMessage("Anotación editada correctamente", "success");
                    }
                    else
                    {
                        setErrorAnnotations(true);
                        setErrorCode(result.data.code);
                        setAnnotations(null);
                    }
                })
                .catch(error => {
                    if (error.response)
                    {
                        if (error.response.status === 400)
                        {
                            showMessage(error.response.data.message, error.response.data.type);
                        }
                        else if (error.response.status === 500)
                        {
                            setErrorCode(error.response.data.code);
                            setErrorAnnotations(true);
                            setAnnotations(null);

                            setLoadingAnnotations(false);
                        }                   
                    }
                    else
                    {
                        setErrorCode("GET_DETAILED_SUBJECT_ERROR");

                        setErrorCode(error.response.data.code);
                        setErrorAnnotations(true);
                        setAnnotations(null);
                            
                        setLoadingAnnotations(false);
                    }
                })
                .finally(() => {
                    return () => {
                        setAnnotations(null); 
                        setErrorAnnotations(null);
                        setErrorCode(null);
                        setLoadingAnnotations(null);
                    }
                });
            }
        },
        [id, type, description, selectedStudent, selectedAnnotation, setAnnotations, setErrorAnnotations, setErrorCode, setLoadingAnnotations, setEditAnnotation],
    );
    
    /**
     * useCallback para configurar el formulario de eliminar la anotación
     */
    const handleOpenDeleteAnnotation = useCallback(
        (doc) => {
            setSelectedAnnotation(doc);
            setDeleteAnnotation(true);
            setEditAnnotation(false);
        },
        [setSelectedAnnotation, setEditAnnotation, setDeleteAnnotation],
    );

    /**
     * useCallback para canclear la operación de eliminar la anotación
     */
    const handleCancelDeleteAnnotation = useCallback(
        () => {
            setDeleteAnnotation(false);
            setEditAnnotation(false);

            setDescription("");
            setType("");
        },
        [setDeleteAnnotation, setEditAnnotation, setDescription, setType],
    );

    /**
     * useCallback para eliminar la anotación
     */
    const handleDeleteAnnotation = useCallback(
        async () => {
            if (selectedStudent !== null && selectedAnnotation !== null)
            {
                await axios.delete("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/delete-annotation-student-course", {
                    params: {
                        idSubjectParam: Encrypt(id), 
                        idUserParam: Encrypt(selectedStudent.id),
                        idAnnotationParam: Encrypt(selectedAnnotation.id)
                    }
                })
                .then(result => {
                    if (result.status === 200 && result.data.code === "PROCESS_OK")
                    {   
                        setAnnotations(Decrypt(result.data.data));
                        setErrorAnnotations(false);
                        setDeleteAnnotation(false);
                        setErrorCode(null);

                        showMessage("Anotación eliminada correctamente", "success");
                    }
                    else
                    {
                        setErrorAnnotations(true);
                        setErrorCode(result.data.code);
                        setAnnotations(null);
                    }
                })
                .catch(error => {
                    if (error.response)
                    {
                        if (error.response.status === 400)
                        {
                            showMessage(error.response.data.message, error.response.data.type);
                        }
                        else if (error.response.status === 500)
                        {
                            setErrorCode(error.response.data.code);
                            setErrorAnnotations(true);
                            setAnnotations(null);

                            setLoadingAnnotations(false);
                        }                   
                    }
                    else
                    {
                        setErrorCode("GET_DETAILED_SUBJECT_ERROR");

                        setErrorCode(error.response.data.code);
                        setErrorAnnotations(true);
                        setAnnotations(null);
                            
                        setLoadingAnnotations(false);
                    }
                })
                .finally(() => {
                    return () => {
                        setAnnotations(null); 
                        setErrorAnnotations(null);
                        setErrorCode(null);
                        setLoadingAnnotations(null);
                    }
                });
            }
        },
        [id, selectedStudent, selectedAnnotation, setAnnotations, setErrorAnnotations, setErrorCode, setLoadingAnnotations],
    );

    const handleAddGrades = useCallback(
        async (idUnit, numberUnit, nameUnit) => {
            if (id !== null && selectedStudent !== null && idUnit !== null && numberUnit !== null && nameUnit !== null)
            {
                let inputValue = document.getElementById(`grade${numberUnit}`).value;

                if (inputValue === "")
                {
                    return showMessage("Complete el campo de texto", "info");
                }

                if (/^\d+$/.test(inputValue) === false)
                {
                    return showMessage("Asegurese de ingresar solo numeros", "info");
                }
                
                let intValue = parseInt(inputValue); 
                
                let object = {
                    numberUnit: numberUnit,
                    nameUnit: nameUnit,
                    valueGrade: intValue
                };

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
                    if (result.status === 201 && result.data.code === "PROCESS_OK")
                    {   
                        setErrorGrades(false);
                        setGrades(Decrypt(result.data.data));
                        setErrorCode(null);

                        showMessage("Calificación añadida correctamente", "success");
                    }
                    else
                    {
                        setErrorGrades(true);
                        setGrades(null);
                        setErrorCode(result.data.code);
                    }
                })
                .catch(error => {
                    if (error.response)
                    {
                        if (error.response.status === 400)
                        {
                            showMessage(error.response.data.message, error.response.data.type);
                        }
                        else if (error.response.status === 500)
                        {
                            setErrorCode(error.response.data.code);
                            setErrorGrades(true);
                            setGrades(null);

                            setLoadingGrades(false);
                        }                   
                    }
                    else
                    {
                        setErrorCode(error.response.data.code);
                        setErrorGrades(true);
                        setGrades(null);
                            
                        setLoadingGrades(false);
                    }
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
        [id, selectedStudent, setGrades, setErrorGrades, setErrorCode, setLoadingGrades],
    );



    /**
     * useCallback para mostrar el dialogo de asignar notas
     */
    const handleOpenSetGrades = useCallback(
        async (doc) => {
            if (doc !== null)
            {
                setSelectedStudent(doc);
                setGradesDialog(true);

                if (grades === null)
                {
                    await handleGetGradesStudentCourse(doc.id)
                }
            }
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

            setGradesDialog(false);
            setGrades(null);
            setSelectedStudent(null);

            return
        },
        [setGradesDialog, setGrades, setSelectedStudent],
    );

    /**
     * useCallback para mostrar el dialogo de asignar notas
     */
    const handleOpenSetAnnotation = useCallback(
        async (doc) => {
            if (doc !== null)
            {
                setSelectedStudent(doc);
                setAnnotationDialog(true);

                if (annotations === null)
                {
                    await handleGetAnnotations(doc.id);
                }
            }
        },
        [annotations, setSelectedStudent, setAnnotationDialog, handleGetAnnotations],
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

            setAnnotationDialog(false);
            setAnnotations(null);
            setSelectedStudent(null);

            return;
        },
        [setAnnotationDialog, setAnnotations, setSelectedStudent],
    );


    /**
     * useCallback para filtrar las anotaciones desde la base de datos
     */
    const handleFilterAnnotations = useCallback(
        async (type) => {
            if (typeof(type) === "string" && selectedStudent !== null && id !== null)
            {
                if (type === "positive" || type === "negative" || type === "observation")
                {
                    setMenuSelect(null);
                    setUseFilter(true);
                    setLoadingAnnotations(true);
                    
                    await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-annotations-by-type-student-course", {
                        params: {
                            idUserParam: Encrypt(selectedStudent.id),
                            typeAnnotationParam: Encrypt(type)
                        }
                    })
                    .then(result => {
                        if (result.status === 200 && result.data.code === "PROCESS_OK")
                        {
                            setErrorAnnotations(false);
                            setAnnotations(Decrypt(result.data.data));
                            setErrorCode(null);
                        }
                        else
                        {
                            setErrorAnnotations(true);
                            setAnnotations(null);
                            setErrorCode(result.data.code);
                        }

                        setLoadingAnnotations(false);
                    })
                    .catch(error => {
                        if (error.response)
                        {
                            if (error.response.status === 400)
                            {
                                showMessage(error.response.data.message, error.response.data.type);
                            }
                            else if (error.response.status === 500)
                            {
                                setErrorCode(error.response.data.code);
                                setErrorAnnotations(true);
                                setAnnotations(null);

                                setLoadingAnnotations(false);
                            }                   
                        }
                        else
                        {
                            setErrorCode("GET_ANNOTATIONS_FILTERED_ERROR");

                            setErrorCode(error.response.data.code);
                            setErrorAnnotations(true);
                            setAnnotations(null);
                                
                            setLoadingAnnotations(false);
                        }
                    })
                    .finally(() => {
                        return () => {
                            setAnnotations(null); 
                            setErrorAnnotations(null);
                            setErrorCode(null);
                            setLoadingAnnotations(null);
                        }
                    });
                }
            }
        },
        [id, selectedStudent, setMenuSelect, setAnnotations, setErrorAnnotations, setErrorCode, setLoadingAnnotations, setUseFilter],
    );

    /**
     * useCallback para quitar el filtro que se le hace a la base de datos
     */
    const handleRemoveFilterAnnotations = useCallback(
        async () => {
            if (selectedStudent !== null)
            {
                setUseFilter(false);
                await handleGetAnnotations(selectedStudent.id);
            }
        },
        [selectedStudent, handleGetAnnotations],
    );


    // Functions
    /**
     * Función que cambia el valor al campo de texto manipulando el DOM 
     * @param {string} value valor de la nota
     */
    const handleChange = (value) => {
        document.getElementById("grade1").setAttribute("value", value)
    };

    /**
     * Función para manejar el filtro del menu
     * @param {any} event tipo de evento
     */
    const handleClickMenuFilter = (event) => {
        setMenuSelect(event.currentTarget);
    };
    
    /**
     * Función que cierra el filtro del menu
     */
    const handleCloseMenuFilter = () => {
        setMenuSelect(null);
    };


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

        if (authorized === true && subject !== null && subject !== undefined)
        {
            callQuery();

            return () => {
                setStudents(null);
            }
        }
    }, [authorized, subject, handleGetStudentsCourse, setStudents]); 

    useEffect(() => {
        let callQuery = async () => {
            await handleGetTeacherCourse();
        }

        if (authorized === true && subject !== null && subject !== undefined)
        {
            return callQuery();
        }
    }, [authorized, subject, handleGetTeacherCourse]);


    return (
        <Paper elevation={0} itemType="div">
        {
            loadingAuthorized === true ? (
                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(10% + 110px)" }}>
                    <CircularProgress style={{ color: "#2074d4" }} />
                    <Typography style={{ marginTop: 15 }}>Verificando acceso al Contenido</Typography>
                </Paper>
            ) : errorAuthorized === true ? (
                <Paper elevation={0} itemType="div" style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(10% + 110px)" }}>
                        <Typography>
                        {
                            errorCode !== null ? (
                                errorCode === "NO_ADDED" ? (
                                    "El identificador ingresado es incorrecto, o no estas asignado a este curso, intentelo nuevamente"
                                ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                    "Recargue la página para inicar sesión nuevamente, debido a que la sesión se ha vencido"
                                ) : (
                                    "Ha ocurrido un error al momento de verificar el Acceso al Contenido"
                                )
                            ) : (
                                "Ha ocurrido un error al momento de verificar el Acceso al Contenido"
                            )
                        }
                        </Typography>

                        <React.Fragment>
                        {
                            errorCode !== null && (
                                errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                    <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetAuthorizedAccess()}>
                                        <Typography variant="button">Recargar Verificar Acceso</Typography>
                                    </Button>
                                )
                            )
                        }
                        </React.Fragment>
                    </Paper>
                </Paper>
            ) : authorized === null ? (
                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(10% + 110px)" }}>
                    <CircularProgress style={{ color: "#2074d4" }} />
                    <Typography style={{ marginTop: 15 }}>Cargando Acceso al Curso</Typography>
                </Paper>
            ) : authorized === undefined ? (
                <Paper elevation={0} itemType="div" style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(10% + 110px)" }}>
                        <Typography>
                        {
                            errorCode !== null ? (
                                errorCode === "NO_ADDED" ? (
                                    "El identificador ingresado es incorrecto, o no estas asignado a este curso, intentelo nuevamente"
                                ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                    "Recargue la página para inicar sesión nuevamente, debido a que la sesión se ha vencido"
                                ) : (
                                    "Ha ocurrido un error al momento de verificar el Acceso al Contenido"
                                )
                            ) : (
                                "Ha ocurrido un error al momento de verificar el Acceso al Contenido"
                            )
                        }
                        </Typography>

                        <React.Fragment>
                        {
                            errorCode !== null && (
                                errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                    <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetAuthorizedAccess()}>
                                        <Typography variant="button">Recargar Verificar Acceso</Typography>
                                    </Button>
                                )
                            )
                        }
                        </React.Fragment>
                    </Paper>
                </Paper>
            ) : (
                <Paper elevation={0} itemType="div">
                {
                    loadingSubject === true ? (
                        <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(10% + 110px)" }}>
                            <CircularProgress style={{ color: "#2074d4" }} />
                            <Typography style={{ marginTop: 15 }}>Obteniendo los Datos del Curso</Typography>
                        </Paper>
                    ) : errorSubject === true ? (
                        <Paper elevation={0} itemType="div" style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(10% + 110px)" }}>
                                <Typography>
                                {
                                    errorCode !== null ? (
                                        errorCode === "COURSE_ID_NULL" ? (
                                            "Verifique el identificador enviado e intente nuevamente"
                                        ) : errorCode === "COURSE_ID_BAD_FORMATING" ? (
                                            "Verifique el formato del identificador enviado e intentelo nuevamente"
                                        ) : errorCode === "COURSE_ID_BAD_TYPE" ? (
                                            "Verifique el tipo de dato enviado, intentelo nuevamente"
                                        ) :  errorCode === "SUBJECT_NOT_FOUND" ? (
                                            "La asignatura no ha sido encontrada, verifique el identificador e intentelo nuevamente"
                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "Recargue la página para inicar sesión nuevamente, debido a que la sesión se ha vencido"
                                        ) : (
                                            "Ha ocurrido algo inesperado al obtener la asignatura"
                                        )
                                    ) : (
                                        "Ha ocurrido algo inesperado al obtener la asignatura"
                                    )
                                }
                                </Typography>

                                <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetDetailedSubject()}>
                                    <Typography variant="button">Recargar Contenido de la Asignatura</Typography>
                                </Button>
                            </Paper>
                        </Paper>
                    ) : subject === null ? (
                        <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(10% + 110px)" }}>
                            <CircularProgress style={{ color: "#2074d4" }} />
                            <Typography style={{ marginTop: 15 }}>Cargando Contenido de la Asignatura</Typography>
                        </Paper>
                    ) : subject === undefined ? (
                        <Paper elevation={0} itemType="div" style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(10% + 110px)" }}>
                                <Typography>
                                {
                                    errorCode !== null ? (
                                        errorCode === "COURSE_ID_NULL" ? (
                                            "Verifique el identificador enviado e intente nuevamente"
                                        ) : errorCode === "COURSE_ID_BAD_FORMATING" ? (
                                            "Verifique el formato del identificador enviado e intentelo nuevamente"
                                        ) : errorCode === "COURSE_ID_BAD_TYPE" ? (
                                            "Verifique el tipo de dato enviado, intentelo nuevamente"
                                        ) :  errorCode === "SUBJECT_NOT_FOUND" ? (
                                            "La asignatura no ha sido encontrada, verifique el identificador e intentelo nuevamente"
                                        ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                            "Recargue la página para inicar sesión nuevamente, debido a que la sesión se ha vencido"
                                        ) : (
                                            "Ha ocurrido algo inesperado al obtener la asignatura"
                                        )
                                    ) : (
                                        "Ha ocurrido algo inesperado al obtener la asignatura"
                                    )
                                }
                                </Typography>

                                <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetDetailedSubject()}>
                                    <Typography variant="button">Recargar Contenido de la Asignatura</Typography>
                                </Button>
                            </Paper>
                        </Paper>
                    ) : (
                        <React.Fragment>
                            <Paper style={{ padding: 20, marginBottom: 15 }} variant="outlined">
                                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                                    <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                                        Home
                                    </Link>
                                    <Link to="/my-subjects" style={{ textDecoration: "none", color: "#333" }}>
                                        Mis Asignaturas
                                    </Link>
                                    <Link to={`/subject/${id}`} style={{ textDecoration: "none", color: "#333" }}>
                                        {Decrypt(subject.subject)[0].data.code}
                                    </Link>
                                    <Typography style={{ color: "#2074d4" }}>Estudiantes</Typography>
                                </Breadcrumbs>
                            </Paper>

                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6">Todos los estudiantes de la asignatura {Decrypt(Decrypt(subject.subject)[0].data.courseName)}</Typography>
                                    <Divider style={{ marginTop: 15, marginBottom: 15 }} />

                                    <React.Fragment>
                                    {
                                        loadingStudents === true ? (
                                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                <Typography style={{ marginTop: 15 }}>Cargando Estudiantes ligados a Esta Asignatura</Typography>
                                            </Paper>
                                        ) : errorStudents === true ? (
                                            <Paper elevation={0} itemType="div" style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Typography>
                                                    {
                                                        errorCode !== null ? (
                                                            errorCode === "PARAM_NULL" ? (
                                                                "Verifique el identificador enviado e intente nuevamente"
                                                            ) : errorCode === "PARAM_BAD_FORMATING" ? (
                                                                "Verifique el formato del identificador enviado e intentelo nuevamente"
                                                            ) : errorCode === "PARAM_EMPTY" ? (
                                                                "Verifique el tipo de dato enviado, intentelo nuevamente"
                                                            ) :  errorCode === "NO_STUDENTS_FOUNDED" ? (
                                                                "No existen estudiantes compruebe nuevamente"
                                                            ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                                "Recargue la página para inicar sesión nuevamente, debido a que la sesión se ha vencido"
                                                            ) : (
                                                                "Ha ocurrido algo inesperado al obtener la asignatura"
                                                            )
                                                        ) : (
                                                            "Ha ocurrido algo inesperado al obtener la asignatura"
                                                        )
                                                    }
                                                    </Typography>
                                                    <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetStudentsCourse()}>
                                                        <Typography>Recargar Estudiantes de la asignatura</Typography>
                                                    </Button>
                                                </Paper>
                                            </Paper>
                                        ) : students === null ? (
                                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                <Typography style={{ marginTop: 15 }}>Cargando los Estudiantes de la Asignatura</Typography>
                                            </Paper>
                                        ) : students === undefined ? (
                                            <Paper elevation={0} itemType="div" style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Typography>
                                                    {
                                                        errorCode !== null ? (
                                                            errorCode === "PARAM_NULL" ? (
                                                                "Verifique el identificador enviado e intente nuevamente"
                                                            ) : errorCode === "PARAM_BAD_FORMATING" ? (
                                                                "Verifique el formato del identificador enviado e intentelo nuevamente"
                                                            ) : errorCode === "PARAM_EMPTY" ? (
                                                                "Verifique el tipo de dato enviado, intentelo nuevamente"
                                                            ) :  errorCode === "NO_STUDENTS_FOUNDED" ? (
                                                                "No existen estudiantes compruebe nuevamente"
                                                            ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                                "Recargue la página para inicar sesión nuevamente, debido a que la sesión se ha vencido"
                                                            ) : (
                                                                "Ha ocurrido algo inesperado al obtener la asignatura"
                                                            )
                                                        ) : (
                                                            "Ha ocurrido algo inesperado al obtener la asignatura"
                                                        )
                                                    }
                                                    </Typography>
                                                    <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetStudentsCourse()}>
                                                        <Typography>Recargar Estudiantes de la asignatura</Typography>
                                                    </Button>
                                                </Paper>
                                            </Paper>
                                        ) : (
                                            <React.Fragment>
                                                <List>
                                                {
                                                    students.map(doc => (
                                                        <Paper key={doc.id} elevation={0} itemType="div">
                                                            <ListItem>
                                                                <ListItemText style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: "50%" }} primary={`${Decrypt(doc.data.name)} ${Decrypt(doc.data.surname)}`} secondary={`Asignado a este Curso ${timeago(new Date(doc.data.created_at._seconds * 1000))}`} security="true" />

                                                                <ListItemSecondaryAction>
                                                                {
                                                                    loadingHelper === true ? (
                                                                        <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                            <CircularProgress style={{ color: "#2074d4" }} />
                                                                        </Paper>
                                                                    ) : errorHelper === true ? (
                                                                        <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                            <Tooltip title={<Typography>Recargar nivel</Typography>}>
                                                                                <IconButton onClick={async () => await handleGetTeacherCourse()}>
                                                                                    <Replay />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Paper>
                                                                    ) : helper === null ? (
                                                                        <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                            <CircularProgress style={{ color: "#2074d4" }} />
                                                                        </Paper>
                                                                    ) : helper === undefined ? (
                                                                        <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                            <Tooltip title={<Typography>Recargar nivel</Typography>}>
                                                                                <IconButton onClick={async () => await handleGetTeacherCourse()}>
                                                                                    <Replay />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Paper>
                                                                    ) : helper === false ? (
                                                                        <Paper elevation={0} style={{ width: "100%", display: "flex", flexDirection: "row", alignItems: "center" }}>
                                                                            <Tooltip title={<Typography>Asignar Notas a este Estudiante</Typography>}>
                                                                                <IconButton edge="end" onClick={async () => await handleOpenSetGrades(doc)} style={{ marginRight: 5 }}>
                                                                                    <GridOn />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title={<Typography>Asignar Anotaciones a este estudiante</Typography>}>
                                                                                <IconButton edge="end" onClick={async () => await handleOpenSetAnnotation(doc)} style={{ marginRight: 5 }}>
                                                                                    <PlaylistAdd />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Paper>
                                                                    ) : (
                                                                        <React.Fragment>
                                                                        </React.Fragment>
                                                                    )
                                                                }
                                                                </ListItemSecondaryAction>
                                                            </ListItem>
                                                                                
                                                            <Divider />
                                                        </Paper>
                                                    ))
                                                }
                                                </List>

                                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                    <Button onClick={async () => await handleGetStudentsCourse()} style={{ color: "#2074d4" }}>
                                                        <Typography variant="button">Recargar Estudiantes ligados a Esta Asignatura</Typography>
                                                    </Button>
                                                </Paper>
                                            </React.Fragment>
                                        )            
                                    }
                                    </React.Fragment>
                                </CardContent>
                            </Card>

                            <Dialog open={gradesDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseSetGrades} fullScreen={fullScreen} scroll="paper">
                                <DialogTitle>{selectedStudent === null ? "Asignar calificaciones al estudiante Seleccionado en esta Asignatura" : `Asignar calificaciones al Estudiante ${Decrypt(selectedStudent.data.name)} ${Decrypt(selectedStudent.data.surname)} en esta Asignatura`}</DialogTitle>
                                
                                <DialogContent>
                                    <React.Fragment>
                                    {
                                        selectedStudent === null ? (
                                            <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <Typography style={{ marginTop: 15 }}>Cargando Datos del Estudiante Seleccionado</Typography>
                                            </Paper>
                                        ) : (
                                            <React.Fragment>
                                            {
                                                loadingGrades === true ? (
                                                    <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                        <Typography style={{ marginTop: 15 }}>Cargando Calificaciones del Estudiante</Typography>
                                                    </Paper>
                                                ) : errorGrades === true ? (
                                                    <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                        <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener las Calificaciones del Estudiante</Typography>

                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                        <Button onClick={async () => await handleGetGradesStudentCourse(selectedStudent.id)} style={{ color: "#2074d4" }}>
                                                            <Typography variant="button">Recargar Calificaciones</Typography>
                                                        </Button>
                                                    </Paper>
                                                ) : grades === null ? (
                                                    <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                        <Typography style={{ marginTop: 15 }}>Cargando Calificaciones del Estudiante</Typography>
                                                    </Paper>
                                                ) : grades === undefined ? (
                                                    <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                        <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener las Calificaciones del Estudiante</Typography>

                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                        <Button onClick={async () => await handleGetGradesStudentCourse(selectedStudent.id)} style={{ color: "#2074d4" }}>
                                                            <Typography variant="button">Recargar Calificaciones</Typography>
                                                        </Button>
                                                    </Paper>
                                                ) : (
                                                    <React.Fragment>
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
                                                                    Decrypt(subject.units).map((doc, index) => (
                                                                        <TableRow key={doc.id}>
                                                                            <TableCell component="th" scope="row">
                                                                                {index + 1}
                                                                            </TableCell>
                                                                            <TableCell align="right">{doc.data.numberUnit}</TableCell>
                                                                            <TableCell align="right">{doc.data.unit}</TableCell>
                                                                            <TableCell align="right">
                                                                                <InputBase id={`grade${doc.data.numberUnit}`} placeholder="Nota" inputProps={{ 'aria-label': 'naked' }} style={{ width: 50 }} defaultValue={grades.find(x => x.id === doc.id) !== undefined ? grades.find(x => x.id === doc.id).data.valueGrade : ""} onChange={(e) => handleChange(e.target.value)} security="true" />
                                                                            </TableCell>
                                                                            <TableCell align="right">
                                                                                <Tooltip title={<Typography>Añadir Calificación en {doc.data.unit}</Typography>}>
                                                                                    <IconButton onClick={async () => await handleAddGrades(doc.id, doc.data.numberUnit, doc.data.unit)}>
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

                                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                            <Button onClick={async () => await handleGetGradesStudentCourse(selectedStudent.id)} style={{ color: "#2074d4" }}>
                                                                <Typography variant="button">Recargar Calificaciones</Typography>
                                                            </Button>
                                                        </Paper>
                                                    </React.Fragment>
                                                )
                                            }
                                            </React.Fragment>
                                        )
                                    }
                                    </React.Fragment>
                                </DialogContent>    

                                <DialogActions>
                                    <Button color="inherit" onClick={handleCloseSetGrades}>
                                        <Typography variant="button">Cerrar Esta Ventana</Typography>
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            <Dialog open={annotationDialog} maxWidth={"xl"} fullWidth={true} onClose={handleCloseSetAnnotation} fullScreen={fullScreen} scroll="paper">
                                <DialogTitle>{selectedStudent === null ? "Asignar Anotaciones al estudiante Seleccionado en esta Asignatura" : `Asignar Anotaciones al estudiante ${Decrypt(selectedStudent.data.name)} ${Decrypt(selectedStudent.data.surname)} en esta Asignatura`}</DialogTitle>
                                
                                <DialogContent>
                                    <React.Fragment>
                                    {
                                        selectedStudent === null ? (
                                            <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <Typography style={{ marginTop: 15 }}>Cargando Datos del Estudiante Seleccionado</Typography>
                                            </Paper>
                                        ) : (
                                            <React.Fragment>
                                                <Grid container direction="row" alignItems="flex-start">
                                                    <Grid item container md={7} alignItems="center" justifyContent="center">
                                                    {
                                                        loadingAnnotations === true ? (
                                                            <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                <Typography style={{ marginTop: 15 }}>Cargando las Anotaciones del Estudiante</Typography>
                                                            </Paper>
                                                        ) : errorAnnotations === true ? (
                                                            <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener las Anotaciones del Estudiante</Typography>

                                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                <Button onClick={async () => await handleGetAnnotations(selectedStudent.id)} style={{ color: "#2074d4" }}>
                                                                    <Typography variant="button">Recargar Annotaciones</Typography>
                                                                </Button>
                                                            </Paper>
                                                        ) : annotations === null ? (
                                                            <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                <Typography style={{ marginTop: 15 }}>Cargando las Anotaciones del Estudiante</Typography>
                                                            </Paper>
                                                        ) : annotations === undefined ? (
                                                            <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener las Anotaciones del Estudiante</Typography>

                                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                <Button onClick={async () => await handleGetAnnotations(selectedStudent.id)} style={{ color: "#2074d4" }}>
                                                                    <Typography variant="button">Recargar Annotaciones</Typography>
                                                                </Button>
                                                            </Paper>
                                                        ) : (
                                                            <React.Fragment>
                                                                <Card variant="outlined" style={{ width: "100%", maxHeight: "59vh", overflow: "auto", marginLeft: 5, marginRight: 5, marginTop: 15 }}>
                                                                    <CardContent>
                                                                        <Typography variant="h6">Todas las anotaciones del estudiante {Decrypt(selectedStudent.data.name)} {Decrypt(selectedStudent.data.surname)}</Typography>

                                                                        <React.Fragment>
                                                                        {
                                                                            annotations.length > 0 && (
                                                                                <React.Fragment>
                                                                                    <Button aria-haspopup="true" color="inherit" style={{ marginTop: 10 }} onClick={handleClickMenuFilter}>
                                                                                        <Typography variant="button">Filtrar Anotaciones</Typography>
                                                                                    </Button>

                                                                                    <Menu anchorEl={menuSelect} keepMounted open={Boolean(menuSelect)} onClose={handleCloseMenuFilter} style={{ marginTop: 50 }}>
                                                                                        <MenuItem onClick={async () => await handleFilterAnnotations("positive")}>Filtrar por Anotaciones Positivas</MenuItem>
                                                                                        <MenuItem onClick={async () => await handleFilterAnnotations("negative")}>Filtrar por Anotaciones Negativas</MenuItem>
                                                                                        <MenuItem onClick={async () => await handleFilterAnnotations("observation")}>Filtrar por Anotaciones de Observación</MenuItem>
                                                                                    </Menu>
                                                                                </React.Fragment>
                                                                            )
                                                                        }
                                                                        </React.Fragment>

                                                                        <List>
                                                                        {
                                                                            annotations.length <= 0 ? (
                                                                                <React.Fragment>
                                                                                    <Typography>No hay anotaciones creadas en este usuario, intente recargar anotaciones para refrescar las anotaciones</Typography>
                                                                                </React.Fragment>
                                                                            ) : annotations.map(doc => (
                                                                                <Paper key={doc.id} elevation={0}>
                                                                                    <ListItem key={doc.id}>
                                                                                        <ListItemText primary={
                                                                                            <React.Fragment>
                                                                                                <Paper elevation={0} style={{ display: "flex", maxWidth: "calc(100% - 100px)", flexDirection: "row", alignItems: "center" }}>
                                                                                                    {
                                                                                                        doc.data.type === "positive" ? (
                                                                                                            <Tooltip title={<Typography>Anotación Positiva</Typography>}>
                                                                                                                <AddCircleOutline color="primary" />
                                                                                                            </Tooltip>
                                                                                                        ) : doc.data.type === "negative" ? (
                                                                                                            <Tooltip title={<Typography>Anotación Negativa</Typography>}>
                                                                                                                <RemoveCircleOutline color="error" />
                                                                                                            </Tooltip>
                                                                                                        ) : doc.data.type === "observation" && (
                                                                                                            <Tooltip title={<Typography>Anotación de Observación</Typography>}>
                                                                                                                <Visibility color="inherit" />
                                                                                                            </Tooltip>
                                                                                                        )
                                                                                                    }

                                                                                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                                                                                        <Typography style={{ marginLeft: 15 }}>{Decrypt(doc.data.description)}</Typography>
                                                                                                        <Typography style={{ marginLeft: 15 }}>se creó en el dia {new Date(doc.data.created_at._seconds * 1000).toLocaleDateString()}</Typography>
                                                                                                    </Paper> 
                                                                                                </Paper>
                                                                                            </React.Fragment>} secondary={`Anotación creada ${timeago(new Date(doc.data.created_at._seconds * 1000))} ${doc.data.updated_at !== undefined ? `(Editado)` : ``}` } />
                                                                                                            
                                                                                        <ListItemSecondaryAction>
                                                                                            <React.Fragment>
                                                                                                <Tooltip title={<Typography>Eliminar esta Anotación</Typography>}>
                                                                                                    <IconButton edge="end" onClick={() => handleOpenDeleteAnnotation(doc)} style={{ marginRight: 5 }}>
                                                                                                        <Delete />
                                                                                                    </IconButton>
                                                                                                </Tooltip>

                                                                                                <Tooltip title={<Typography>Editar esta Anotación</Typography>}>
                                                                                                    <IconButton edge="end" onClick={() => handleOpenEditAnnotation(doc)} style={{ marginRight: 5 }}>
                                                                                                        <Edit />
                                                                                                    </IconButton>
                                                                                                </Tooltip>
                                                                                            </React.Fragment>
                                                                                        </ListItemSecondaryAction>
                                                                                    </ListItem>

                                                                                    <Divider />
                                                                                </Paper>
                                                                            ))
                                                                        }
                                                                        </List>

                                                                        <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />   
                                                                            <Button style={{ color: "#2074d4", marginBottom: 5 }} onClick={async () => await handleGetAnnotations(selectedStudent.id)}>
                                                                                <Typography variant="button">Recargar Anotaciones</Typography>
                                                                            </Button>
                                                            
                                                                            <React.Fragment>
                                                                            {
                                                                                useFilter === true && (
                                                                                    <Button style={{ color: "#34495E" }} onClick={async () => await handleRemoveFilterAnnotations()}>
                                                                                        <Typography variant="button">Quitar Filtro</Typography>
                                                                                    </Button>
                                                                                )
                                                                            }
                                                                            </React.Fragment>
                                                                        </Paper>                                                                                     
                                                                    </CardContent>
                                                                </Card>
                                                            </React.Fragment>
                                                        )
                                                    }
                                                    </Grid>

                                                    <Grid item container md={5} alignItems="center" justifyContent="center">
                                                        <Card variant="outlined" style={{ width: "100%", marginLeft: 5, marginRight: 5, marginTop: 15 }}>
                                                            <CardContent>
                                                                <Paper elevation={0} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                                                {
                                                                    selectedAnnotation === null ? (
                                                                        <Typography variant="h6">Crea una nueva anotación, o bien seleccione una anotación para editarla o eliminarla</Typography>
                                                                    ) : editAnnotation === true ? (
                                                                        <Typography variant="h6">Editar anotación {Decrypt(selectedAnnotation.data.description)}</Typography>
                                                                    ) : deleteAnnotation === true ? (
                                                                        <Typography variant="h6">Eliminar anotación {Decrypt(selectedAnnotation.data.description)}</Typography>
                                                                    ) : (
                                                                        <Typography variant="h6">Crea una nueva anotación, o bien seleccione una anotación para editarla o eliminarlan</Typography>
                                                                    )
                                                                    
                                                                }
                                                                </Paper>

                                                                <React.Fragment>
                                                                {
                                                                    deleteAnnotation === true ? (
                                                                        <React.Fragment>
                                                                            <Typography style={{ marginBottom: 15, marginTop: 15, textAlign: "center" }}>Esta seguro de Eliminar esta Anotación?</Typography>
                                                                        </React.Fragment>
                                                                    ) : (
                                                                        <React.Fragment>
                                                                            <Typography style={{ color: "#2074d4", marginTop: 15 }}>Datos de la anotación</Typography>
                                                                            <Divider style={{ height: 2, marginBottom: 15, backgroundColor: "#2074d4" }} />
                        
                                                                            <ThemeProvider theme={InputTheme}>
                                                                                <FormControl style={{ marginBottom: 15 }} variant="outlined" fullWidth>
                                                                                    <InputLabel>Tipo de Anotación</InputLabel>
                                                                                    <Select value={type} label="Tipo de Anotación" onChange={(e) => setType(e.target.value)}>
                                                                                        <MenuItem value="positive">Positiva</MenuItem>
                                                                                        <MenuItem value="negative">Negativa</MenuItem>
                                                                                        <MenuItem value="observation">Observación</MenuItem>  
                                                                                    </Select>
                                                                                </FormControl>

                                                                                <TextField type="text" label="Descripción" variant="outlined" security="true" value={description} fullWidth multiline onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: 15 }} />
                                                                            </ThemeProvider>
                                                                        </React.Fragment>
                                                                    )
                                                                }
                                                                </React.Fragment>

                                                                <React.Fragment>
                                                                {
                                                                    editAnnotation === true ? (
                                                                        <React.Fragment>
                                                                            <Button fullWidth style={{ color: "#2074d4", marginBottom: 10 }} onClick={handleEditAnnotation}>
                                                                                <Typography variant="button">Editar Anotación</Typography>
                                                                            </Button>
                                                                            <Button fullWidth style={{ color: "#34495E" }} onClick={handleCancelEditAnnotation}>
                                                                                <Typography variant="button">Cancelar Editar Anotación</Typography>
                                                                            </Button>
                                                                        </React.Fragment>         
                                                                    ) : deleteAnnotation === true ? (
                                                                        <React.Fragment>
                                                                            <Button fullWidth style={{ color: "#2074d4", marginBottom: 10 }} onClick={handleDeleteAnnotation}>
                                                                                <Typography variant="button">Eliminar Anotación</Typography>
                                                                            </Button>
                                                                            <Button fullWidth style={{ color: "#34495E" }} onClick={handleCancelDeleteAnnotation}>
                                                                                <Typography variant="button">Cancelar Eliminar Anotación</Typography>
                                                                            </Button>
                                                                        </React.Fragment>  
                                                                    ) : (
                                                                        <Button fullWidth style={{ color: "#2074d4" }} onClick={handleAddAnnotation}>
                                                                            <Typography variant="button">Crear Anotación</Typography>
                                                                        </Button>
                                                                    )
                                                                }
                                                                
                                                                </React.Fragment>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                </Grid>
                                            </React.Fragment>
                                        )
                                    }
                                    </React.Fragment>
                                </DialogContent>

                                <DialogActions>
                                    <Button color="inherit" onClick={handleCloseSetAnnotation}>
                                        <Typography variant="button">Cerrar Esta Ventana</Typography>
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </React.Fragment>
                    )
                }
                </Paper>
            )
        }
        </Paper>
    );
};

export default StudentsSubject;