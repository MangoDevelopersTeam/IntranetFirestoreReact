import React, { useCallback, useEffect, useState } from 'react';
import { useParams, withRouter, useLocation, Link } from 'react-router-dom';

import { Avatar, Breadcrumbs, Button, Card, CardContent, CircularProgress, createTheme, ThemeProvider, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Paper, TextField, Tooltip, Typography, useMediaQuery, useTheme, Menu, MenuItem } from '@material-ui/core';
import { Delete, GetApp, LibraryBooks, MoreVert, NavigateNext, Person } from '@material-ui/icons';

import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';

import { showMessage } from './../../helpers/message/handleMessage';

import axios from 'axios';



const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const DetailedTeacherHomework = () => {
    // uses
    const { idHomework } = useParams();
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));
    


    // useStates
    const [subject,   setSubject] = useState(null);
    const [errorSubject, setErrorSubject] = useState(false);
    const [loadingSubject, setLoadingSubject] = useState(true);
    const [errorCode, setErrorCode] = useState(null);

    const [authorized,   setAuthorized] = useState(null);
    const [errorAuthorized, setErrorAuthorized] = useState(false);
    const [loadingAuthorized, setLoadingAuthorized] = useState(true);

    const [detailedHomework,   setDetailedHomework] = useState(null);
    const [errorDetailedHomework, setErrorDetailedHomework] = useState(false);
    const [loadingDetailedHomework, setLoadingDetailedHomework] = useState(true);

    const [students, setStudents] = useState(null);
    const [errorStudents, setErrorStudents] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(true);

    const [feedbackData, setFeedbackData] = useState(null);
    const [loadingFeedback, setLoadingFeedback] = useState(false);


    const [feedback, setFeedback] = useState("");
    const [selectedHomework, setSelectedHomework] = useState(null);


    const [loadingPostFeedback, setLoadingPostFeedback] = useState(false);
    const [errorPostfeedback, setErrorPostFeedback] = useState(false);

    const [loadingDeleteHomework, setLoadingDeleteHomework] = useState(false);
    const [errorDeleteHomework, setErrorDeleteHomework] = useState(false);

    const [loadingDeleteFeedback, setLoadingDeleteFeedback] = useState(false);
    const [errorDeleteFeedback, setErrorDeleteFeedback] = useState(false);

    const [loadingEditFeedback, setLoadingEditFeedback] = useState(false);
    const [errorEditFeedback, setErrorEditFeedback] = useState(false);



    const [feedbackDialog, setFeedbackDialog] = useState(false);
    const [deleteHomeworkDialog, setDeleteHomeworkDialog] = useState(false);
    const [deleteFeedbackDialog, setDeleteFeedbackDialog] = useState(false);
    const [editFeedbackDialog, setEditFeedbackDialog] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);



    // functions
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    


    const query = useQuery();
    const idSubject = query.get("subject");
    const idUnit = query.get("unit");



    // useCallbacks
    const handleOpenFeedbackDialog = useCallback(
        (doc) => {
            if (doc === null)
            {
                return;
            }

            setFeedbackDialog(true);
            setSelectedHomework(doc);
        },
        [setFeedbackDialog, setSelectedHomework],
    );

    const handleCloseFeedbackDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setFeedbackDialog(false);
            setSelectedHomework(null);
            setFeedback("");        
        },
        [setFeedback, setFeedbackDialog, setSelectedHomework],
    );

    const handleOpenDeleteHomeworkDialog = useCallback(
        (doc) => {
            if (doc === null)
            {
                return;
            }

            setDeleteHomeworkDialog(true);
            setSelectedHomework(doc);
        },
        [setDeleteHomeworkDialog, setSelectedHomework],
    );

    const handleCloseDeleteHomeworkDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setDeleteHomeworkDialog(false);
            setSelectedHomework(null);     
        },
        [setDeleteHomeworkDialog, setSelectedHomework],
    );



    const handleGetDetailedSubject = useCallback(
        async () => {
            if (idSubject !== null)
            {
                setLoadingSubject(true);

                await axios.get(`${process.env.REACT_APP_API_URI}/get-detailed-course`, {
                    params: {
                        courseID: Encrypt(idSubject)
                    }
                })
                .then(result => {
                    console.log(Decrypt(Decrypt(result.data.data).subject)[0]);

                    if (Decrypt(Decrypt(result.data.data).subject)[0].data === undefined)
                    {
                        setErrorSubject(true);
                        setSubject(undefined);
                        setErrorCode(result.data.code);
                    }
                    else
                    {
                        setErrorSubject(false);
                        setSubject(Decrypt(result.data.data));
                        setErrorCode(null);
                    }

                    setLoadingSubject(false);
                })
                .catch(error => {
                    setErrorSubject(true);
                    setSubject(undefined);
                    
                    if (error.response)
                    {
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
            }
        },
        [idSubject, setSubject, setErrorSubject, setErrorCode, setLoadingSubject],
    );

    const handleGetHomeworkInfo = useCallback(
        async () => {
            if (idHomework !== null && idSubject !== null && idUnit !== null)
            {
                setLoadingDetailedHomework(true);

                await axios.get(`${process.env.REACT_APP_API_URI}/get-homework-info`, {
                    params: {
                        idSubjectParam: Encrypt(idSubject),
                        idArchiveParam: Encrypt(idHomework),
                        idUnitParam: Encrypt(idUnit)
                    }
                })
                .then(result => {
                    if (result.status === 200 && result.data.code === "PROCESS_OK")
                    {
                        setErrorDetailedHomework(false);
                        setDetailedHomework(Decrypt(result.data.data));
                        setErrorCode(null);
                    }

                    setLoadingDetailedHomework(false);
                })
                .catch(error => {
                    if (error.response)
                    {               
                        setErrorCode(error.response.data.code);
                    }
                    else
                    {
                        setErrorCode("GET_DETAILED_HOMEWORK_ERROR");
                    }

                    setErrorDetailedHomework(true);
                    setDetailedHomework(undefined);
                    setLoadingDetailedHomework(false);
                })
                .finally(() => {
                    return () => {
                        setDetailedHomework(null); 
                        setErrorDetailedHomework(null);
                        setErrorCode(null);
                        setLoadingDetailedHomework(null);
                    }
                });
            }
        },
        [idHomework, idSubject, idUnit, setDetailedHomework, setErrorDetailedHomework, setErrorCode, setLoadingDetailedHomework],
    );

    const handleGetStudentsHomework = useCallback(
        async () => {
            if (idSubject !== null)
            {
                setLoadingStudents(true);

                await axios.get(`${process.env.REACT_APP_API_URI}/get-students-homework`, {
                    params: {
                        idSubjectParam: Encrypt(idSubject),
                        idFileParam: Encrypt(idHomework),
                        idUnitParam: Encrypt(idUnit)
                    }
                })
                .then(result => {
                    console.log(result);
                    console.log(Decrypt(result.data.data));

                    if (result.status === 200 && result.data.code === "PROCESS_OK")
                    {
                        setErrorStudents(false);
                        setStudents(Decrypt(result.data.data));
                    }
                    else if (result.data.code === "STUDENTS_DOESNT_EXIST")
                    {
                        setErrorStudents(false);
                        setStudents([]);
                    }

                    setLoadingStudents(false);
                })
                .catch(error => {
                    if (error.response)
                    {               
                        console.log(error.response);
                        setErrorCode(error.response.data.code);
                    }
                    else
                    {
                        setErrorCode("GET_STUDENTS_HOMEWORK_ERROR");
                    }

                    setErrorStudents(true);
                    setStudents(undefined);
                    setLoadingStudents(false);
                })
                .finally(() => {
                    return () => {
                        setStudents(null); 
                        setErrorStudents(null);
                        setErrorCode(null);
                        setLoadingStudents(null);
                    }
                })
            }
        },
        [idSubject, idHomework, idUnit, setStudents, setErrorStudents, setErrorCode, setLoadingStudents],
    );

    const handleGetAuthorizedAccess = useCallback(
        async () => {
            if (idSubject !== null)
            {
                setLoadingAuthorized(true);

                await axios.get(`${process.env.REACT_APP_API_URI}/get-authorized-access`, {
                    params: {
                        idCourse: Encrypt(idSubject)
                    }
                })
                .then(result => {
                    console.log(result);
                    if (result.status === 200 && result.data.code === "PROCESS_OK")
                    {
                        setErrorAuthorized(false);
                        setAuthorized(result.data.data);
                        setErrorCode(null);
                    }
                    else
                    {
                        setErrorAuthorized(true);
                        setAuthorized(false);
                        setErrorCode(result.data.code);
                    }

                    setLoadingAuthorized(false);
                })
                .catch(error => {
                    setErrorAuthorized(true);
                    setAuthorized(false);

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
            }
        },
        [idSubject, setAuthorized, setErrorAuthorized, setErrorCode],
    );

    const handleDeleteHomework = useCallback(
        async () => {
            if (idSubject === null || idHomework === null || idUnit === null || selectedHomework === null)
            {
                return;
            }

            setLoadingDeleteHomework(true);

            await axios.delete(`${process.env.REACT_APP_API_URI}/delete-student-homework`, {
                params: {
                    idSubjectParam: Encrypt(idSubject),
                    idFileParam: Encrypt(idHomework),
                    idUnitParam: Encrypt(idUnit),
                    idStudentParam: Encrypt(selectedHomework.student.id)
                }
            })
            .then(async result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setLoadingDeleteHomework(false);
                    setErrorDeleteHomework(false);
                    handleCloseDeleteHomeworkDialog();
                    setErrorCode(null);
                    await handleGetStudentsHomework();

                    return showMessage(result.data.message, result.data.type);
                }

                setLoadingDeleteHomework(false);
                setErrorDeleteHomework(true);
                setErrorCode(result.data.code);
            })
            .catch(error => {
                if (error.response)
                {
                    setLoadingDeleteHomework(false);
                    setErrorDeleteHomework(true);
                    console.log(error.response);
                    setErrorCode("DELETE_HOMEWORK_ERROR");
                }
            })
            .finally(() => {
                return () => {
                    setLoadingDeleteHomework(null);
                    setErrorDeleteHomework(null);
                    setErrorCode(null);
                }
            });
        },
        [idSubject, idHomework, idUnit, selectedHomework, setLoadingDeleteHomework, setErrorDeleteHomework, setErrorCode, handleCloseDeleteHomeworkDialog, handleGetStudentsHomework],
    );

    const handlePostFeedback = useCallback(
        async () => {
            if (idSubject === null || idHomework === null || idUnit === null || selectedHomework === null)
            {
                return;
            }

            if (feedback === "")
            {
                return showMessage("Complete todos los datos", "info");
            }

            let objectData = {
                feedback: Encrypt(feedback)
            }

            setLoadingPostFeedback(true);

            await axios.post(`${process.env.REACT_APP_API_URI}/post-teacher-feedback`, {
                objectData: Encrypt(objectData)
            }, {
                params: {
                    idSubjectParam: Encrypt(idSubject),
                    idFileParam: Encrypt(idHomework),
                    idUnitParam: Encrypt(idUnit),
                    idStudentParam: Encrypt(selectedHomework.student.id)
                }
            })
            .then(async result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    setLoadingPostFeedback(false);
                    setErrorPostFeedback(false);
                    handleCloseFeedbackDialog();
                    setErrorCode(null);
                    await handleGetStudentsHomework();

                    return showMessage(result.data.message, result.data.type);
                }

                setLoadingPostFeedback(false);
                setErrorPostFeedback(true);
                setErrorCode(result.data.code);
            })
            .catch(error => {
                if (error.response)
                {
                    setLoadingPostFeedback(false);
                    setErrorPostFeedback(true);
                    console.log(error.response);
                    setErrorCode("POST_FEEDBACK_ERROR");
                }
            })
            .finally(() => {
                return () => {
                    setLoadingPostFeedback(null);
                    setErrorPostFeedback(null);
                    setErrorCode(null);
                }
            });
        },
        [feedback, idSubject, idHomework, idUnit, selectedHomework, setLoadingPostFeedback, setErrorPostFeedback, setErrorCode, handleCloseFeedbackDialog, handleGetStudentsHomework],
    );

    const handleGetFeedback = useCallback(
        async (doc) => {
            if (idHomework === null || idSubject === null || idUnit === null || doc === null)
            {
                return;
            }

            if (doc === undefined)
            {
                return;
            }

            setLoadingFeedback(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-student-feedback`, {
                params: {
                    idSubjectParam: Encrypt(idSubject),
                    idFileParam: Encrypt(idHomework),
                    idUnitParam: Encrypt(idUnit),
                    idStudentParam: Encrypt(doc.student.id)
                }
            })
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setErrorCode(null);
                    setLoadingFeedback(false);
                    setFeedback(Decrypt(Decrypt(result.data.data)[0].data.feedback));

                    return setFeedbackData(Decrypt(result.data.data));
                }

                if (result.status === 200 && result.data.code === "FEEDBACK_UNDEFINED")
                {
                    setErrorCode(null);
                    setLoadingFeedback(false);

                    return setFeedbackData(undefined);
                }
                
                setErrorCode(null);
                setLoadingFeedback(false);

                return setFeedbackData(undefined);
            })
            .catch(error => {
                setFeedbackData(undefined);

                if (error.response)
                {
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("GET_FEEDBACK_ERROR");
                }

                setLoadingFeedback(false);
            })
            .finally(() => {
                return () => {
                    setFeedbackData(null);
                    setErrorCode(null);
                    setLoadingFeedback(null);
                }
            });
        },
        [idHomework, idSubject, idUnit, setFeedbackData, setErrorCode, setLoadingFeedback, setFeedback],
    );



    const handleOpenDeleteFeedbackDialog = useCallback(
        async (doc) => {
            if (doc === null)
            {
                return;
            }

            setSelectedHomework(doc);
            setAnchorEl(null);
            setDeleteFeedbackDialog(true);

            await handleGetFeedback(doc);
        },
        [setDeleteFeedbackDialog, setSelectedHomework, setAnchorEl, handleGetFeedback],
    );

    const handleCloseDeleteFeedbackDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setDeleteFeedbackDialog(false);
            setSelectedHomework(null);     
        },
        [setDeleteFeedbackDialog, setSelectedHomework],
    );

    const handleDeleteFeeback = useCallback(
        async () => {
            if (idSubject === null || idHomework === null || idUnit === null || selectedHomework === null || feedbackData === null)
            {
                return;
            }

            setLoadingDeleteFeedback(true);

            await axios.delete(`${process.env.REACT_APP_API_URI}/delete-student-feedback`, {
                params: {
                    idSubjectParam: Encrypt(idSubject),
                    idFileParam: Encrypt(idHomework),
                    idUnitParam: Encrypt(idUnit),
                    idStudentParam: Encrypt(selectedHomework.student.id),
                    idFeedbackParam: Encrypt(feedbackData[0].id)
                }
            })
            .then(async result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setLoadingDeleteFeedback(false);
                    setErrorDeleteFeedback(false);
                    setErrorCode(null);
                    handleCloseDeleteFeedbackDialog();
                    await handleGetStudentsHomework();
                    
                    return showMessage(result.data.message, result.data.type);
                }

                setLoadingDeleteFeedback(false);
                setErrorDeleteFeedback(true);
                setErrorCode(result.data.code);
            })
            .catch(error => {
                if (error.response)
                {
                    setLoadingDeleteFeedback(false);
                    setErrorDeleteFeedback(true);
                    console.log(error.response);
                    setErrorCode("DELETE_HOMEWORK_ERROR");
                }
            })
            .finally(() => {
                return () => {
                    setLoadingDeleteFeedback(null);
                    setErrorDeleteFeedback(null);
                    setErrorCode(null);
                }
            });
        },
        [idSubject, idHomework, idUnit, selectedHomework, feedbackData, setLoadingDeleteFeedback, setErrorDeleteFeedback, setErrorCode, handleCloseDeleteFeedbackDialog, handleGetStudentsHomework],
    );



    const handleOpenEditFeedbackDialog = useCallback(
        async (doc) => {
            if (doc === null)
            {
                return;
            }

            setSelectedHomework(doc);
            setAnchorEl(null);
            setEditFeedbackDialog(true);

            await handleGetFeedback(doc);
        },
        [setEditFeedbackDialog, setSelectedHomework, setAnchorEl, handleGetFeedback],
    );

    const handleCloseEditFeedbackDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setEditFeedbackDialog(false);
            setSelectedHomework(null);     
            setFeedback("");
        },
        [setEditFeedbackDialog, setSelectedHomework, setFeedback],
    );

    const handleEditFeedback = useCallback(
        async () => {
            if (idSubject === null || idHomework === null || idUnit === null || selectedHomework === null || feedbackData === null)
            {
                return;
            }

            if (feedback === "")
            {
                showMessage("Complete todos los campos de texto requeridos", "info");
            }

            setLoadingEditFeedback(true);

            let objectData = {
                feedback: Encrypt(feedback)
            }

            await axios.put(`${process.env.REACT_APP_API_URI}/update-student-feedback`, {
                objectData: Encrypt(objectData)
            } , {
                params: {
                    idSubjectParam: Encrypt(idSubject),
                    idFileParam: Encrypt(idHomework),
                    idUnitParam: Encrypt(idUnit),
                    idStudentParam: Encrypt(selectedHomework.student.id),
                    idFeedbackParam: Encrypt(feedbackData[0].id)
                }
            })
            .then(result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    setLoadingEditFeedback(false);
                    setErrorEditFeedback(false);
                    setErrorCode(null);
                    handleCloseEditFeedbackDialog();
                    
                    return showMessage(result.data.message, result.data.type);
                }

                setLoadingEditFeedback(false);
                setErrorEditFeedback(true);
                setErrorCode(result.data.code);
            })
            .catch(error => {
                if (error.response)
                {
                    setLoadingEditFeedback(false);
                    setErrorEditFeedback(true);
                    console.log(error.response);
                    setErrorCode("DELETE_HOMEWORK_ERROR");
                }
            })
            .finally(() => {
                return () => {
                    setLoadingEditFeedback(null);
                    setErrorEditFeedback(null);
                    setErrorCode(null);
                }
            });
        },
        [idSubject, idHomework, idUnit, selectedHomework, feedbackData, feedback, setLoadingEditFeedback, setErrorEditFeedback, setErrorCode, handleCloseEditFeedbackDialog],
    );



    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetAuthorizedAccess();
        }

        callQuery();

        return () => {
            setAuthorized(null);
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
            await handleGetHomeworkInfo();
        }

        if (authorized === true)
        {
            return callQuery();
        }
    }, [authorized, handleGetHomeworkInfo]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetStudentsHomework()
        }

        if (authorized === true)
        {
            return callQuery();
        }
    }, [authorized, handleGetStudentsHomework]);



    return (
        <Paper elevation={0}>
        {
            loadingAuthorized === true ? (
                <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(10% + 110px)" }}>
                    <CircularProgress style={{ color: "#2074d4" }} />
                    <Typography style={{ marginTop: 15 }}>Verificando acceso al Contenido</Typography>
                </Paper>
            ) : errorAuthorized === true ? (
                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(10% + 110px)" }}>
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
                <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(10% + 110px)" }}>
                    <CircularProgress style={{ color: "#2074d4" }} />
                    <Typography style={{ marginTop: 15 }}>Cargando Acceso al Curso</Typography>
                </Paper>
            ) : authorized === false ? (
                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Typography>No tienes acceso a este contenido, contactese con el administrador</Typography>
                    </Paper>
                </Paper>
            ) : (
                <Paper elevation={0}>
                {
                    loadingSubject === true ? (
                        <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(10% + 110px)" }}>
                            <CircularProgress style={{ color: "#2074d4" }} />
                            <Typography style={{ marginTop: 15 }}>Cargando datos de la Asignatura</Typography>
                        </Paper>
                    ) : errorSubject === true ? (
                        <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(10% + 110px)" }}>
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
                    ) : subject === null ? (
                        <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(10% + 110px)" }}>
                            <CircularProgress style={{ color: "#2074d4" }} />
                            <Typography style={{ marginTop: 15 }}>Cargando datos de la Asignatura</Typography>
                        </Paper>
                    ) : (
                        <Paper elevation={0}>
                        {
                            idHomework === null || idSubject === null || idUnit === null ? (
                                <Paper elevation={0}>
                                    <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                        <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(10% + 110px)" }}>
                                            <Typography>No ha enviado todos los parametros suficientes, verifique los datos enviados e intentelo nuevamente</Typography>
                                        </Paper>
                                    </Paper>
                                </Paper>
                            ) : idHomework === "" || query.get("subject") === "" || query.get("unit") === "" ? (
                                <Paper elevation={0}>
                                    <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                        <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(10% + 110px)" }}>
                                            <Typography>Asegurese de que haya enviado los parametros en la url de forma correcta, si no es así, verifique los parametros enviados e intentelo nuevamente</Typography>
                                        </Paper>
                                    </Paper>
                                </Paper>
                            ) : loadingDetailedHomework === true ? (
                                <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(10% + 110px)" }}>
                                    <CircularProgress style={{ color: "#2074d4" }} />
                                    <Typography style={{ marginTop: 15 }}>Cargando datos de la Tarea</Typography>
                                </Paper>
                            ) : errorDetailedHomework === true ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(10% + 110px)" }}>
                                        <Typography>
                                        {
                                            errorCode === null ? (      
                                                "Ha ocurrido un error al obtener la información de la tarea"
                                            ) : (
                                                errorCode === "HOMEWORK_NOT_FOUND" ? (
                                                    "La tarea no existe, por favor, ingrese bien el identificador de la tarea e Intentelo nuevamente"
                                                ) : (
                                                    "Ha ocurrido un error al obtener la información de la tarea"
                                                )
                                            )
                                        }
                                        </Typography>

                                        <React.Fragment>
                                            <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetHomeworkInfo()}>
                                                <Typography variant="button">Recargar Información de la Tarea</Typography>
                                            </Button>
                                        </React.Fragment>
                                    </Paper>
                                </Paper>
                            ) : detailedHomework === null ? (
                                <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(10% + 110px)" }}>
                                    <CircularProgress style={{ color: "#2074d4" }} />
                                    <Typography style={{ marginTop: 15 }}>Cargando información de la Tarea</Typography>
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
                                            <Link to={`/subject/${idSubject}`} style={{ textDecoration: "none", color: "#333" }}>
                                                {Decrypt(subject.subject)[0].data.code}
                                            </Link>
                                            <Typography style={{ color: "#2074d4" }}>{Decrypt(detailedHomework[0].data.name)}</Typography>
                                        </Breadcrumbs>
                                    </Paper>

                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h5">{Decrypt(detailedHomework[0].data.name)}</Typography>
                                            <Divider style={{ marginTop: 15, marginBottom: 15 }} />

                                            <React.Fragment>
                                            {
                                                Decrypt(detailedHomework[0].data.description).split(/[.\-*+_]/).map((doc, index) => (
                                                    <Paper key={index} elevation={0} itemType="div" security="true">
                                                        <br />
                                                        <Typography style={{ marginRight: 15 }}>{doc}</Typography>
                                                    </Paper>
                                                ))
                                            }
                                            </React.Fragment>
                                            
                                            <Paper elevation={0} itemType="div" security="true" style={{ marginTop: 30 }}>
                                                <Typography style={{ color: "black" }} component="a" target="_blank" href={Decrypt(detailedHomework[0].data.url)}>{decodeURI(Decrypt(detailedHomework[0].data.url).split(RegExp("%2..*%2F(.*?)alt"))[1].replace("?", ""))}</Typography>
                                            </Paper>
                                        </CardContent>
                                    </Card>

                                    <Paper elevation={0}>
                                    {
                                        loadingStudents === null ? (
                                            <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(5% + 20px)" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                <Typography style={{ marginTop: 15 }}>Cargando los usuarios de la asignatura</Typography>
                                            </Paper>
                                        ) : errorStudents === true ? (
                                            <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(5% + 20px)" }}>
                                                    <Typography>
                                                    {
                                                        errorCode === null ? (      
                                                            "Ha ocurrido un error al obtener los alumnos"
                                                        ) : (
                                                            errorCode === "COURSE_ID_NULL" ? (
                                                                "Verifique la Id del curso que se le envía"
                                                            ) : (
                                                                "Ha ocurrido un error al obtener los alumnos de la asignatura"
                                                            )
                                                        )
                                                    }
                                                    </Typography>

                                                    <React.Fragment>
                                                        <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetStudentsHomework()}>
                                                            <Typography variant="button">Recargar usuarios de esta asignatura</Typography>
                                                        </Button>
                                                    </React.Fragment>
                                                </Paper>
                                            </Paper>
                                        ) : students === null ? (
                                            <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(5% + 20px)" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                <Typography style={{ marginTop: 15 }}>Cargando alumnos</Typography>
                                            </Paper>
                                        ) : students === undefined ? (
                                            <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(5% + 20px)" }}>
                                                    <Typography>Ha ocurrido un error al intentar obtener a los alumnos</Typography>

                                                    <React.Fragment>
                                                        <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetStudentsHomework()}>
                                                            <Typography variant="button">Recargar usuarios de esta asignatura</Typography>
                                                        </Button>
                                                    </React.Fragment>
                                                </Paper>
                                            </Paper>
                                        ) : students.length <= 0 ? (
                                            <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(5% + 20px)" }}>
                                                    <Typography>No existen alumnos en esta asignatura aún</Typography>

                                                    <React.Fragment>
                                                        <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetStudentsHomework()}>
                                                            <Typography variant="button">Recargar alumnos en esta asignatura</Typography>
                                                        </Button>
                                                    </React.Fragment>
                                                </Paper>
                                            </Paper>
                                        ) : (
                                            <React.Fragment>
                                                <Card variant="outlined" style={{ marginTop: 15 }}>
                                                    <CardContent>
                                                        <Typography variant="h6">Alumnos de la asignatura</Typography>
            
                                                        <Divider style={{ marginTop: 15, marginBottom: 15 }} />
            
                                                        <List>
                                                        {
                                                            students.map(doc => (
                                                                <Paper key={doc.student.id} itemType="div" elevation={0}>
                                                                    <ListItem>
                                                                        <ListItemAvatar>
                                                                            <Avatar>
                                                                                <Person />
                                                                            </Avatar>
                                                                        </ListItemAvatar>

                                                                        <ListItemText primary={`${Decrypt(doc.student.data.name)} ${Decrypt(doc.student.data.surname)}`} />

                                                                        <React.Fragment>
                                                                        {
                                                                            doc.homework === null ? (
                                                                                <Typography>No enviado aún</Typography>
                                                                            ) : (
                                                                                <React.Fragment>
                                                                                    <React.Fragment>
                                                                                    {
                                                                                        doc.homework.data.limitTime === true ? (
                                                                                            <Typography style={doc.homework.data.inTime === true ? { color: "#50904E", marginRight: 190, marginLeft: 15 } : { color: "red", marginRight: 130 }}>{doc.homework.data.remainingTime}</Typography>
                                                                                        ) : (
                                                                                            <Typography style={{ marginRight: 190, marginLeft: 15 }}>Tarea enviada</Typography>
                                                                                        )
                                                                                    }
                                                                                    </React.Fragment>

                                                                                    <ListItemSecondaryAction>
                                                                                        <React.Fragment>
                                                                                        {
                                                                                            doc.homework.data.calificated === false ? (
                                                                                                <Tooltip title={<Typography>Asignar un feedback de la Tarea</Typography>}>
                                                                                                    <IconButton onClick={() => handleOpenFeedbackDialog(doc)} style={{ marginRight: 15 }}>
                                                                                                        <LibraryBooks />
                                                                                                    </IconButton>
                                                                                                </Tooltip>
                                                                                            ) : (
                                                                                                <React.Fragment>
                                                                                                    <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                                                                                                        <MenuItem onClick={async () => await handleOpenDeleteFeedbackDialog(doc)}>Eliminar feedback</MenuItem>
                                                                                                        <MenuItem onClick={async () => await handleOpenEditFeedbackDialog(doc)}>Editar feedback</MenuItem>
                                                                                                    </Menu>

                                                                                                    <Tooltip title={<Typography>Mas acciones en Feedback</Typography>}>
                                                                                                        <IconButton aria-haspopup={true} onClick={handleClick} style={{ marginRight: 15 }}>
                                                                                                            <MoreVert />
                                                                                                        </IconButton>
                                                                                                    </Tooltip>
                                                                                                </React.Fragment>
                                                                                            )
                                                                                        }
                                                                                        </React.Fragment>

                                                                                        <Tooltip title={<Typography>Descargar tarea subida</Typography>}>
                                                                                            <IconButton target="_blank" href={Decrypt(doc.homework.data.url)} style={{ marginRight: 15 }}>
                                                                                                <GetApp />
                                                                                            </IconButton>
                                                                                        </Tooltip>

                                                                                        <Tooltip title={<Typography>Eliminar entrega de tarea</Typography>}>
                                                                                            <IconButton onClick={() => handleOpenDeleteHomeworkDialog(doc)}>
                                                                                                <Delete />
                                                                                            </IconButton>
                                                                                        </Tooltip>
                                                                                    </ListItemSecondaryAction>
                                                                                </React.Fragment>
                                                                            )
                                                                        }
                                                                        </React.Fragment> 
                                                                    </ListItem>

                                                                    <Divider />
                                                                </Paper>
                                                            ))
                                                        }
                                                        </List>
                                                    </CardContent>
                                                </Card>

                                                <Dialog open={feedbackDialog} maxWidth={"md"} fullWidth onClose={handleCloseFeedbackDialog} fullScreen={fullScreen} scroll="paper">
                                                    <DialogTitle>{selectedHomework === null ? "Asignar feedback a la tarea enviada seleccionada" : `Asignar feedback a la tarea enviada por el alumno ${Decrypt(selectedHomework.student.data.name)} ${Decrypt(selectedHomework.student.data.surname)}`}</DialogTitle>
                                                    <DialogContent>
                                                    {
                                                        loadingPostFeedback === true ? (
                                                            <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15 }}>
                                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                                <Typography style={{ marginTop: 15 }}>Creando Feedback</Typography>
                                                            </Paper>
                                                        ) : errorPostfeedback === true ? (
                                                            <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 15 }}>
                                                                    <Typography>
                                                                    {
                                                                        errorCode !== null ? (
                                                                            errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                                                "Recargue la página para inicar sesión nuevamente, debido a que la sesión se ha vencido"
                                                                            ) : (
                                                                                "Ha ocurrido un error al momento de agregar el feedback"
                                                                            )
                                                                        ) : (
                                                                            "Ha ocurrido un error al momento de agregar el feedback"
                                                                        )
                                                                    }
                                                                    </Typography>

                                                                    <React.Fragment>
                                                                    {
                                                                        errorCode !== null && (
                                                                            errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                                                <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handlePostFeedback()}>
                                                                                    <Typography variant="button">Agregar feedback nuevamente</Typography>
                                                                                </Button>
                                                                            )
                                                                        )
                                                                    }
                                                                    </React.Fragment>
                                                                </Paper>
                                                            </Paper>
                                                        ) : (
                                                            <React.Fragment>
                                                                <Typography style={{ color: "#2074d4" }}>Feedback a asignar</Typography>
                                                                <Divider style={{ height: 2, marginBottom: 15, backgroundColor: "#2074d4" }} />

                                                                <ThemeProvider theme={InputTheme}>
                                                                    <TextField type="text" label="Feedback" variant="outlined" security="true" multiline fullWidth value={feedback} onChange={(e) => setFeedback(e.target.value)} style={{ marginBottom: 15 }} />
                                                                </ThemeProvider>
                                                            </React.Fragment>
                                                        )
                                                    }
                                                    </DialogContent>
                                                    <DialogActions>                                                     
                                                        <Button style={{ color: "#2074d4" }} onClick={async () => await handlePostFeedback()}>
                                                            <Typography variant="button">Crear feedback</Typography>
                                                        </Button>

                                                        <Button color="inherit" onClick={handleCloseFeedbackDialog}>
                                                            <Typography variant="button">Cerrar Esta Ventana</Typography>
                                                        </Button>                                                 
                                                    </DialogActions>
                                                </Dialog>

                                                <Dialog open={deleteHomeworkDialog} maxWidth={"md"} fullWidth onClose={handleCloseDeleteHomeworkDialog} fullScreen={fullScreen} scroll="paper">
                                                    <DialogTitle>{selectedHomework === null ? "Borrar la tarea seleccionada" : `Borrar la tarea enviada por el alummno ${Decrypt(selectedHomework.student.data.name)} ${Decrypt(selectedHomework.student.data.surname)}`}</DialogTitle>
                                                    <DialogContent>
                                                    {
                                                        loadingDeleteHomework === true ? (
                                                            <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15 }}>
                                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                                <Typography style={{ marginTop: 15 }}>Eliminando tarea</Typography>
                                                            </Paper>
                                                        ) : errorDeleteHomework === true ? (
                                                            <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 15 }}>
                                                                    <Typography>
                                                                    {
                                                                        errorCode !== null ? (
                                                                            errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                                                "Recargue la página para inicar sesión nuevamente, debido a que la sesión se ha vencido"
                                                                            ) : (
                                                                                "Ha ocurrido un error al momento de eliminar la tarea"
                                                                            )
                                                                        ) : (
                                                                            "Ha ocurrido un error al momento de eliminar la tarea"
                                                                        )
                                                                    }
                                                                    </Typography>

                                                                    <React.Fragment>
                                                                    {
                                                                        errorCode !== null && (
                                                                            errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                                                <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleDeleteHomework()}>
                                                                                    <Typography variant="button">Eliminar tarea nuevamente</Typography>
                                                                                </Button>
                                                                            )
                                                                        )
                                                                    }
                                                                    </React.Fragment>
                                                                </Paper>
                                                            </Paper>
                                                        ) : (
                                                            <Typography>Esta seguro de eliminar esta tarea?, este paso es irreversible y el alumno tendra que enviar nuevamente la tarea</Typography>
                                                        )
                                                    }
                                                    </DialogContent>
                                                    <DialogActions>
                                                    {
                                                        loadingDeleteHomework === false && (
                                                            <React.Fragment>                                                  
                                                                <Button style={{ color: "#2074d4" }} onClick={async () => await handleDeleteHomework()}>
                                                                    <Typography variant="button">Eliminar Tarea</Typography>
                                                                </Button>

                                                                <Button color="inherit" onClick={handleCloseDeleteHomeworkDialog}>
                                                                    <Typography variant="button">Cerrar Esta Ventana</Typography>
                                                                </Button>
                                                            </React.Fragment>
                                                        )
                                                    }
                                                    </DialogActions>
                                                </Dialog>

                                                <Dialog open={deleteFeedbackDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseDeleteFeedbackDialog} fullScreen={fullScreen} scroll="paper">
                                                    <DialogTitle>{selectedHomework === null ? "Borrar el feedback en la tarea seleccionada" : `Borrar el feedback de la tarea enviada por el alummno ${Decrypt(selectedHomework.student.data.name)} ${Decrypt(selectedHomework.student.data.surname)}`}</DialogTitle>
                                                    <DialogContent>
                                                        <React.Fragment>
                                                        {
                                                            selectedHomework === null ? (
                                                                <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                    <Typography style={{ marginTop: 15 }}>Cargando Datos de la tarea Seleccionada</Typography>
                                                                </Paper>
                                                            ) : (
                                                                <React.Fragment>
                                                                {
                                                                    loadingFeedback === true ? (
                                                                        <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                            <Typography style={{ marginTop: 15 }}>Cargando Datos del feedback</Typography>
                                                                        </Paper>
                                                                    ) : loadingFeedback === true ? (
                                                                        <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                            <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener el feedback</Typography>
                                                                            
                                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                            <Button onClick={async () => await handleGetFeedback()} style={{ color: "#2074d4" }}>Recargar Feedback</Button>
                                                                        </Paper>
                                                                    ) : feedbackData === null ? (
                                                                        <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                            <Typography style={{ marginTop: 15 }}>Cargando Datos del feedback</Typography>
                                                                        </Paper>
                                                                    ) : (
                                                                        <React.Fragment>
                                                                        {
                                                                            loadingDeleteFeedback === true ? (
                                                                                <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15 }}>
                                                                                    <CircularProgress style={{ color: "#2074d4" }} />
                                                                                    <Typography style={{ marginTop: 15 }}>Eliminando feedback</Typography>
                                                                                </Paper>
                                                                            ) : errorDeleteFeedback === true ? (
                                                                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                                                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 15 }}>
                                                                                        <Typography>
                                                                                        {
                                                                                            errorCode !== null ? (
                                                                                                errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                                                                    "Recargue la página para inicar sesión nuevamente, debido a que la sesión se ha vencido"
                                                                                                ) : (
                                                                                                    "Ha ocurrido un error al momento de eliminar el feedback"
                                                                                                )
                                                                                            ) : (
                                                                                                "Ha ocurrido un error al momento de eliminar el feedback"
                                                                                            )
                                                                                        }
                                                                                        </Typography>

                                                                                        <React.Fragment>
                                                                                        {
                                                                                            errorCode !== null && (
                                                                                                errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                                                                    <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleDeleteFeeback()}>
                                                                                                        <Typography variant="button">Eliminar feedback nuevamente</Typography>
                                                                                                    </Button>
                                                                                                )
                                                                                            )
                                                                                        }
                                                                                        </React.Fragment>
                                                                                    </Paper>
                                                                                </Paper>
                                                                            ) : (
                                                                                <React.Fragment>
                                                                                    <Typography>Esta seguro de eliminar este feedback?, este paso es irreversible y el tendra que crear nuevamente un feedback a esta tarea</Typography>

                                                                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                                        
                                                                                        <Button onClick={async () => await handleDeleteFeeback()} style={{ color: "#2074d4" }}>
                                                                                            <Typography variant="button">Eliminar feedback</Typography>
                                                                                        </Button>
                                                                                    </Paper>
                                                                                </React.Fragment>
                                                                            )
                                                                        }
                                                                        </React.Fragment>
                                                                    )
                                                                }
                                                                </React.Fragment>
                                                            )
                                                        }
                                                        </React.Fragment>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button color="inherit" onClick={handleCloseDeleteFeedbackDialog}>
                                                            <Typography variant="button">Cerrar Esta Ventana</Typography>
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>

                                                <Dialog open={editFeedbackDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseEditFeedbackDialog} fullScreen={fullScreen} scroll="paper">
                                                    <DialogTitle>{selectedHomework === null ? "Editar el feedback en la tarea seleccionada" : `Editar el feedback de la tarea enviada por el alummno ${Decrypt(selectedHomework.student.data.name)} ${Decrypt(selectedHomework.student.data.surname)}`}</DialogTitle>
                                                    <DialogContent>
                                                        <React.Fragment>
                                                        {
                                                            selectedHomework === null ? (
                                                                <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                    <Typography style={{ marginTop: 15 }}>Cargando Datos de la tarea Seleccionada</Typography>
                                                                </Paper>
                                                            ) : (
                                                                <React.Fragment>
                                                                {
                                                                    loadingFeedback === true ? (
                                                                        <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                            <Typography style={{ marginTop: 15 }}>Cargando Datos del feedback</Typography>
                                                                        </Paper>
                                                                    ) : loadingFeedback === true ? (
                                                                        <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                            <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener el feedback</Typography>
                                                                            
                                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                            <Button onClick={async () => await handleGetFeedback()} style={{ color: "#2074d4" }}>Recargar Feedback</Button>
                                                                        </Paper>
                                                                    ) : feedbackData === null ? (
                                                                        <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                            <Typography style={{ marginTop: 15 }}>Cargando Datos del feedback</Typography>
                                                                        </Paper>
                                                                    ) : (
                                                                        <React.Fragment>
                                                                        {
                                                                            loadingEditFeedback === true ? (
                                                                                <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15 }}>
                                                                                    <CircularProgress style={{ color: "#2074d4" }} />
                                                                                    <Typography style={{ marginTop: 15 }}>Editando feedback</Typography>
                                                                                </Paper>
                                                                            ) : errorEditFeedback === true ? (
                                                                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                                                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 15 }}>
                                                                                        <Typography>
                                                                                        {
                                                                                            errorCode !== null ? (
                                                                                                errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                                                                    "Recargue la página para inicar sesión nuevamente, debido a que la sesión se ha vencido"
                                                                                                ) : (
                                                                                                    "Ha ocurrido un error al momento de editar el feedback"
                                                                                                )
                                                                                            ) : (
                                                                                                "Ha ocurrido un error al momento de editar el feedback"
                                                                                            )
                                                                                        }
                                                                                        </Typography>

                                                                                        <React.Fragment>
                                                                                        {
                                                                                            errorCode !== null && (
                                                                                                errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                                                                    <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleEditFeedback()}>
                                                                                                        <Typography variant="button">Editar feedback nuevamente</Typography>
                                                                                                    </Button>
                                                                                                )
                                                                                            )
                                                                                        }
                                                                                        </React.Fragment>
                                                                                    </Paper>
                                                                                </Paper>
                                                                            ) : (
                                                                                <React.Fragment>
                                                                                    <Typography style={{ color: "#2074d4" }}>Feedback a editar</Typography>
                                                                                    <Divider style={{ height: 2, marginBottom: 15, backgroundColor: "#2074d4" }} />

                                                                                    <ThemeProvider theme={InputTheme}>
                                                                                        <TextField type="text" label="Feedback" variant="outlined" security="true" multiline fullWidth value={feedback} onChange={(e) => setFeedback(e.target.value)} style={{ marginBottom: 15 }} />
                                                                                    </ThemeProvider>

                                                                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                                        
                                                                                        <Button onClick={async () => await handleEditFeedback()} style={{ color: "#2074d4" }}>
                                                                                            <Typography variant="button">Editar feedback</Typography>
                                                                                        </Button>
                                                                                    </Paper>
                                                                                </React.Fragment>
                                                                            )
                                                                        }
                                                                        </React.Fragment>
                                                                    )
                                                                }
                                                                </React.Fragment>
                                                            )
                                                        }
                                                        </React.Fragment>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button color="inherit" onClick={handleCloseEditFeedbackDialog}>
                                                            <Typography variant="button">Cerrar Esta Ventana</Typography>
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>
                                            </React.Fragment>
                                        )
                                    }
                                    </Paper>
                                </React.Fragment>
                            )
                        }
                        </Paper>
                    )
                }
                </Paper>
            )
        }
        </Paper>
    );
};


export default withRouter(DetailedTeacherHomework);