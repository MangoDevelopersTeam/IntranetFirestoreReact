import React, { useCallback, useEffect, useState } from 'react';
import { useParams, withRouter, useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Breadcrumbs, Button, Card, CardContent, CircularProgress, ThemeProvider, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme, TextField, LinearProgress } from '@material-ui/core';
import { Feedback, NavigateNext } from '@material-ui/icons';

import { showMessage } from '../../helpers/message/handleMessage';
import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';

import { SELECT_USER } from '../../redux/userSlice';

import { homework } from '../../classes/homework';

import moment from 'moment'

import axios from 'axios';

import { storage } from '../../firebase';



const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const DetailedStudentHomework = () => {
    // uses
    const { idHomework } = useParams();
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));
    const user = useSelector(SELECT_USER);
    
    moment.locale('es', {
            months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
            monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
            weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
            weekdaysShort: 'Dom._Lun._Mar._Mier._Jue._Vier._Sab.'.split('_'),
            weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
        }
    );

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

    const [studentHomework, setStudentHomework] = useState(null);
    const [errorStudentHomework, setErrorStudentHomework] = useState(false);
    const [loadingStudentHomework, setLoadingStudentHomework] = useState(true);

    const [feedback, setFeedback] = useState(null);
    const [errorFeedback, setErrorFeedback] = useState(false);
    const [loadingFeedback, setLoadingFeedback] = useState(false);

    const [timeCount, setTimeCount] = useState("");
    const [inTime, setInTime] = useState(undefined);

    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    
    const [reference, setReference] = useState(null);
    const [cancelUpload, setCancelUpload] = useState(false);
    const [loadingUpload, setLoadingUpload] = useState(false);

    const [homeworkDialog, setHomeworkDialog] = useState(false);



    // functions
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    };

    const query = useQuery();
    const idUnit = query.get("unit");
    const idSubject = query.get("subject");
    


    // useCallbacks
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
                        console.log(Decrypt(result.data.data));

                        setErrorDetailedHomework(false);
                        setDetailedHomework(Decrypt(result.data.data));
                        setErrorCode(null);
                    }
                    else
                    {
                        console.log("PASO")
                        setErrorDetailedHomework(false);
                        setDetailedHomework(undefined);
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
                        console.log(error.response.status);
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

    const handleGetRemainingTime = useCallback(
        (reason) => {
            if (reason === null)
            {
                return;
            }

            if (typeof(reason) !== "string")
            {
                return;
            }

            if (reason === "UPLOAD_FILE" || reason === "GET_TIME_COUNT")
            {
                if (detailedHomework === null)
                {
                    return;
                }

                if (detailedHomework === undefined)
                {
                    return;
                }

                if (detailedHomework[0].data.limitTime === false)
                {
                    return;
                }

                let fechaLimite = moment(detailedHomework[0].data.limitDate);
                let fechaActual = moment(new Date());
                let tiempoRestante = "";

                let years = fechaActual.diff(fechaLimite, 'years');
                let months = fechaActual.diff(fechaLimite, 'months');
                let days = fechaActual.diff(fechaLimite, 'days');
                let hours = fechaActual.diff(fechaLimite, 'hours');
                let minutes = fechaActual.diff(fechaLimite, 'minutes');
                let seconds = fechaActual.diff(fechaLimite, 'seconds');
                
                if (years < 0 || months < 0 || days < 0 || hours < 0 || minutes < 0 || seconds < 0)
                {
                    tiempoRestante = `${reason === "UPLOAD_FILE" ? `Enviado` : ""} ${
                        years < 0 ? (
                            `${Math.abs(years)} años ${months < 0 ? `${Math.abs(months)} meses` : ""}`
                        ) : months < 0 ? (
                            `${Math.abs(months)} meses ${days < 0 ? `${Math.abs(days)} días` : ""}`
                        ) : days < 0 ? (
                            `${Math.abs(days)} días ${hours < 0 ? `${Math.abs(hours)} horas` : ""}`
                        ) : hours < 0 ? (
                            `${Math.abs(hours)} horas ${minutes < 0 ? `${Math.abs(minutes)} minutos` : ""}`
                        ) : minutes < 0 ? (
                            `${Math.abs(minutes)} minutos ${seconds < 0 ? `${Math.abs(seconds)} segundos` : ""}`
                        ) : (
                            `${Math.abs(seconds)} segundos`
                        )
                    } ${reason === "UPLOAD_FILE" ? `antes` : ""}`;
                    
                    setInTime(true);

                    if (reason === "UPLOAD_FILE")
                    {
                        return tiempoRestante;
                    }

                    if (reason === "GET_TIME_COUNT")
                    {
                        return setTimeCount(tiempoRestante);
                    }
                }
                else
                {
                    tiempoRestante = `${reason === "UPLOAD_FILE" ? `Enviado` : `La Tarea está retrasada por`} ${
                        years > 0 ? (
                            `${Math.abs(years)} años ${months > 0 ? `${Math.abs(months)} meses` : ""}`
                        ) : months > 0 ? (
                            `${Math.abs(months)} meses ${days > 0 ? `${Math.abs(days)} días` : ""}`
                        ) : days > 0 ? (
                            `${Math.abs(days)} días ${hours > 0 ? `${Math.abs(hours)} horas` : ""}`
                        ) : hours > 0 ? (
                            `${Math.abs(hours)} horas ${minutes > 0 ? `${Math.abs(minutes)} minutos` : ""}`
                        ) : minutes > 0 ? (
                            `${Math.abs(minutes)} minutos ${seconds > 0 ? `${Math.abs(seconds)} segundos` : ""}`
                        ) : (
                            `${Math.abs(seconds)} segundos`
                        )
                    } ${reason === "UPLOAD_FILE" ? `atrasado` : ""}`;

                    setInTime(false);

                    if (reason === "UPLOAD_FILE")
                    {
                        return tiempoRestante;
                    }

                    if (reason === "GET_TIME_COUNT")
                    {
                        return setTimeCount(tiempoRestante);
                    }
                }
            }
            else
            {
                return;
            }
        },
        [detailedHomework, setTimeCount, setInTime],
    );

    const handleSetFile = useCallback(
        (e) => {
           if (e.target.files[0])
           {
                setFile(e.target.files[0])
           } 
        },
        [setFile],
    );

    const handleCancelUploadFile = useCallback(
        () => {
            if (reference === null)
            {
                return;
            }

            reference.cancel();
            setProgress(0);

            return;
        },
        [reference, setProgress],
    );

    const handleGetStudentHomeworkInfo = useCallback(
        async () => {
            if (idHomework !== null && idSubject !== null && idUnit !== null)
            {
                setLoadingStudentHomework(true);

                await axios.get(`${process.env.REACT_APP_API_URI}/get-student-answer-information`, {
                    params: {
                        idSubjectParam: Encrypt(idSubject),
                        idFileParam: Encrypt(idHomework),
                        idUnitParam: Encrypt(idUnit)
                    }
                })
                .then(result => {
                    console.log(result);


                    if (result.status === 200 && result.data.code === "PROCESS_OK")
                    {
                        setErrorStudentHomework(false);
                        setErrorCode(null);
                        setLoadingStudentHomework(false);

                        return setStudentHomework(Decrypt(result.data.data));
                    }

                    if (result.status === 200 && result.data.code === "HOMEWORK_UNDEFINED")
                    {
                        setErrorStudentHomework(false);
                        setErrorCode(null);
                        setLoadingStudentHomework(false);

                        return setStudentHomework(undefined);
                    }
                    
                    setErrorStudentHomework(false);
                    setErrorCode(null);
                    setLoadingStudentHomework(false);

                    return setStudentHomework(undefined);
                })
                .catch(error => {
                    setErrorStudentHomework(true);
                    setStudentHomework(undefined);

                    if (error.response)
                    {
                        setErrorCode(error.response.data.code);
                    }
                    else
                    {
                        setErrorCode("GET_DETAILED_HOMEWORK_ERROR");
                    }
                })
                .finally(() => {
                    return () => {
                        setStudentHomework(null);
                        setErrorStudentHomework(null);
                        setErrorCode(null);
                        setLoadingStudentHomework(null);
                    }
                });
            }
        },
        [idHomework, idSubject, idUnit, setStudentHomework, setErrorStudentHomework, setErrorCode, setLoadingStudentHomework],
    );

    const handleUploadHomework = useCallback(
        async () => {
            if (idHomework === null || idUnit === null || idSubject === null)
            {
                return showMessage("Acción no permitida, faltan identificadores importantes", "error");
            }

            if (file === null)
            {
                return showMessage("Complete todos los campos", "info");
            }

            if (detailedHomework === null)
            {
                return;
            }

            let fileName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            let fileUpload = storage.ref(`course/${idSubject}/unit/${idUnit}/student/${Decrypt(Decrypt(user).email)}/homeworks/${idHomework}/${fileName}`).put(file);

            setReference(fileUpload);
            setLoadingUpload(true);
            setCancelUpload(true);

            fileUpload.on('state_changed', snapshot => {
                let progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(progress);
            }, (error) => {
                if (error.code === "storage/canceled")
                {
                    showMessage("La subida de la tarea ha sido cancelada", "info");
                }
                else
                {
                    showMessage(error.code, "error");
                }

                setReference(null);
                setLoadingUpload(false);
                setCancelUpload(false);
            }, async () => {
                await storage.ref(`course/${idSubject}/unit/${idUnit}/student/${Decrypt(Decrypt(user).email)}/homeworks/${idHomework}`).child(fileName).getDownloadURL()
                .then(async url => {
                    let actualDate = null;
                    let remainingTime = null;
                    let objectHomework = null;

                    if (detailedHomework[0].data.limitTime === true)
                    {
                        actualDate = new Date().toString();
                        remainingTime = handleGetRemainingTime("UPLOAD_FILE");
                        objectHomework = new homework(remainingTime, inTime, actualDate, false, Encrypt(url));
                    }
                    else
                    {
                        actualDate = new Date().toString();
                        objectHomework = new homework("", false, actualDate, false, Encrypt(url));
                    }

                    await axios.post(`${process.env.REACT_APP_API_URI}/post-student-homework`, {
                        objectData: Encrypt(objectHomework)
                    }, {
                        params: {
                            idSubjectParam: Encrypt(idSubject),
                            idUnitParam: Encrypt(idUnit),
                            idFileParam: Encrypt(idHomework)
                        },
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                    .then(async result => {
                        if (result.status === 201 && result.data.code === "PROCESS_OK")
                        {
                            setStudentHomework(Decrypt(result.data.data));

                            showMessage("Archivo subido correctamente", "success");
                            setHomeworkDialog(false);
                        }    
                    })
                    .catch(error => {
                        if (error.response)
                        {
                            console.log(error.message);
                            showMessage(error.response.message, "error");
                        }
                    });

                    setFile(null);
                })
                .catch(error => {
                    if (error.response)
                    {
                        console.log("GET DOWNLOAD URL", error.response);
                    }
                    
                    return;
                });
            });
        },
        [idHomework, idUnit, idSubject, file, inTime, handleGetRemainingTime],
    );

    const handleOpenHomeWorkDialog = useCallback(
        () => {
            setHomeworkDialog(true);
        },
        [setHomeworkDialog],
    );

    const handleCloseHomeworkDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setFile(null);
            setHomeworkDialog(false);
        },
        [setFile, setHomeworkDialog],
    );

    const handleGetFeedback = useCallback(
        async () => {
            if (idHomework === null || idSubject === null || idUnit === null || detailedHomework === null)
            {
                return;
            }

            setLoadingFeedback(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-student-feedback`, {
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
                    setErrorFeedback(false);
                    setErrorCode(null);
                    setLoadingFeedback(false);

                    return setFeedback(Decrypt(result.data.data));
                }

                if (result.status === 200 && result.data.code === "FEEDBACK_UNDEFINED")
                {
                    setErrorStudentHomework(false);
                    setErrorCode(null);
                    setLoadingStudentHomework(false);
                    
                    setErrorFeedback(false);
                    setErrorCode(null);
                    setLoadingFeedback(false);

                    return setFeedback(undefined);
                }
                
                setErrorFeedback(false);
                setErrorCode(null);
                setLoadingFeedback(false);

                return setFeedback(undefined);
            })
            .catch(error => {
                setErrorFeedback(true);
                setFeedback(undefined);

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
                    setFeedback(null);
                    setErrorFeedback(null);
                    setErrorCode(null);
                    setLoadingFeedback(null);
                }
            });
        },
        [idHomework, idSubject, idUnit, detailedHomework, setFeedback, setErrorFeedback, setErrorCode, setLoadingFeedback],
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

        if (authorized === true && subject !== null && subject !== undefined)
        {
            return callQuery();
        }
    }, [authorized, subject, handleGetHomeworkInfo]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetStudentHomeworkInfo();
        }

        if (authorized === true && subject !== null && subject !== undefined)
        {
            return callQuery();
        }
    }, [authorized, subject, handleGetStudentHomeworkInfo]);

    useEffect(() => {
        if (authorized === true && subject !== null && subject !== undefined)
        {
            return handleGetRemainingTime("GET_TIME_COUNT");
        }
    }, [authorized, subject, handleGetRemainingTime]);

    useEffect(() => {
        if (authorized === true && detailedHomework !== null && detailedHomework !== undefined)
        {
            if (subject !== null && subject !== undefined)
            {
                if (studentHomework !== null && studentHomework !== undefined)
                {
                    if (studentHomework[0].data.calificated === true)
                    {
                        let callQuery = async () => {
                            await handleGetFeedback();
                        }

                        callQuery();

                        return () => {
                            setFeedback(null);
                        }
                    }
                }
            }
        }    
    }, [authorized, subject, detailedHomework, studentHomework, handleGetFeedback]);



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
                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                        <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetAuthorizedAccess()}>
                                            <Typography variant="button">Recargar Verificar Acceso</Typography>
                                        </Button>
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
                            ) : detailedHomework === undefined ? (
                                <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(10% + 110px)" }}>
                                    <Typography style={{ marginTop: 15 }}>La Tarea/Actividad no existe, verifique los valores enviados en intentelo nuevamente</Typography>
                                </Paper>
                            ) : (
                                <Paper elevation={0}>
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

                                    <Card variant="outlined" style={{ marginBottom: 15 }}>
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
                                        loadingStudentHomework === true ? (
                                            <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(1% + 100px)" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                <Typography style={{ marginTop: 15 }}>Cargando datos</Typography>
                                            </Paper>
                                        ) : errorStudentHomework === true ? (
                                            <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                                <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(1% + 100px)" }}>
                                                    <Typography>
                                                    {
                                                        errorCode === null ? (      
                                                            "Ha ocurrido un error al obtener los detalles de la entrega"
                                                        ) : (
                                                            "Ha ocurrido un error al obtener los detalles de la entrega"
                                                        )
                                                    }
                                                    </Typography>

                                                    <React.Fragment>
                                                        <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetStudentHomeworkInfo()}>
                                                            <Typography variant="button">Recargar Datos de la entrega</Typography>
                                                        </Button>
                                                    </React.Fragment>
                                                </Paper>
                                            </Paper>
                                        ) : studentHomework === null ? (
                                            <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(1% + 100px)" }}>
                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                <Typography style={{ marginTop: 15 }}>Cargando datos</Typography>
                                            </Paper>
                                        ) : (
                                            <Paper elevation={0}>
                                                <Card elevation={0} variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="h5">Estado de la entrega</Typography>
                                                        <Divider style={{ marginTop: 15, marginBottom: 15 }} />

                                                        <TableContainer component={Paper} elevation={0}>
                                                            <Table>
                                                                <TableBody>
                                                                    <TableRow>
                                                                        <TableCell width={290} align="left">
                                                                            <Typography>Estado de la entrega</Typography>
                                                                        </TableCell>
                                                                        <TableCell align="left" style={studentHomework !== undefined ? { backgroundColor: "#CCF6CB" } : { backgroundColor: "white" }}>
                                                                        {
                                                                            studentHomework === undefined ? (
                                                                                <Typography>No entregado</Typography>
                                                                            ) : (
                                                                                <Typography style={{ color: "#50904E" }}>Enviado para calificar</Typography>
                                                                            )
                                                                        }
                                                                        </TableCell>
                                                                    </TableRow>

                                                                    <TableRow>
                                                                        <TableCell align="left">
                                                                            <Typography>Estado de la calificación</Typography>
                                                                        </TableCell>
                                                                        <TableCell align="left">
                                                                        {
                                                                            studentHomework === undefined ? (
                                                                                <Typography>Sin calificar</Typography>
                                                                            ) : (
                                                                                <React.Fragment>
                                                                                {
                                                                                    studentHomework[0].data.calificated === false ? (
                                                                                        <Typography>Sin calificar</Typography>
                                                                                    ) : (
                                                                                        <Typography>Calificado</Typography>
                                                                                    )
                                                                                }
                                                                                </React.Fragment>
                                                                            )
                                                                        }
                                                                        </TableCell>
                                                                    </TableRow>

                                                                    <React.Fragment>
                                                                    {
                                                                        detailedHomework[0].data.limitTime === true && (
                                                                            <React.Fragment>
                                                                                <TableRow>
                                                                                    <TableCell align="left">
                                                                                        <Typography>Fecha de entrega</Typography>
                                                                                    </TableCell>
                                                                                    <TableCell align="left">
                                                                                        <Typography>{moment(detailedHomework[0].data.limitDate).format('dddd D [de] MMMM [de] gggg[,] HH:mm')}</Typography>
                                                                                    </TableCell>
                                                                                </TableRow>

                                                                                <TableRow>
                                                                                    <TableCell align="left">
                                                                                        <Typography>Tiempo restante</Typography>
                                                                                    </TableCell>
                                                                                    <TableCell align="left" style={studentHomework !== undefined ? studentHomework[0].data.inTime === true ? {backgroundColor: "#CCF6CB" } : {backgroundColor: "#FAB9B9" } : {backgroundColor: "white" }}>
                                                                                        <React.Fragment>
                                                                                            {
                                                                                                console.log(studentHomework)
                                                                                            }
                                                                                        {
                                                                                            studentHomework === undefined ? (
                                                                                                <Typography color={inTime !== undefined && inTime === true ? `inherit` : `error`}>{timeCount}</Typography>
                                                                                            ) : (
                                                                                                <Typography style={studentHomework[0].data.inTime === true ? { color: "#50904E" } : { color: "red" }}>{studentHomework[0].data.remainingTime}</Typography>
                                                                                            )
                                                                                        }
                                                                                        </React.Fragment>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            </React.Fragment>
                                                                        )
                                                                    }
                                                                    </React.Fragment>

                                                                    <React.Fragment>
                                                                    {
                                                                        studentHomework !== undefined && (
                                                                            <TableRow>
                                                                                <TableCell align="left">
                                                                                    <Typography>Archivo enviado</Typography>
                                                                                </TableCell>

                                                                                <TableCell align="left">
                                                                                    <Typography style={{ color: "black" }} component="a" target="_blank" href={Decrypt(studentHomework[0].data.url)}>{decodeURI(Decrypt(studentHomework[0].data.url).split(RegExp("%2..*%2F(.*?)alt"))[1].replace("?", ""))}</Typography>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        )
                                                                    }
                                                                    </React.Fragment>
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                        
                                                        <React.Fragment>
                                                        {
                                                            studentHomework === undefined && (
                                                                <Button variant="outlined" onClick={handleOpenHomeWorkDialog} style={{ margin: "auto", marginTop: 15 }}>Agregar entrega</Button>
                                                            )
                                                        }
                                                        </React.Fragment>
                                                    </CardContent>
                                                </Card>

                                                <React.Fragment>
                                                {
                                                    studentHomework !== undefined && (
                                                        studentHomework[0].data.calificated === true && (
                                                            loadingFeedback === true ? (
                                                                <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(1% + 100px)" }}>
                                                                    <CircularProgress style={{ color: "#2074d4" }} />
                                                                    <Typography style={{ marginTop: 15 }}>Cargando Feedback</Typography>
                                                                </Paper>
                                                            ) : errorFeedback === true ? (
                                                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "calc(1% + 100px)" }}>
                                                                        <Typography>
                                                                        {
                                                                            errorCode === null ? (      
                                                                                "Ha ocurrido un error al obtener los detalles de la entrega"
                                                                            ) : (
                                                                                "Ha ocurrido un error al obtener los detalles de la entrega"
                                                                            )
                                                                        }
                                                                        </Typography>
                    
                                                                        <React.Fragment>
                                                                            <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetFeedback()}>
                                                                                <Typography variant="button">Recargar datos del feedback</Typography>
                                                                            </Button>
                                                                        </React.Fragment>
                                                                    </Paper>
                                                                </Paper>
                                                            ) : feedback === null ? (
                                                                <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "calc(1% + 100px)" }}>
                                                                    <CircularProgress style={{ color: "#2074d4" }} />
                                                                    <Typography style={{ marginTop: 15 }}>Cargando feedback</Typography>
                                                                </Paper>
                                                            ) : (
                                                                <React.Fragment>
                                                                    <Card variant="outlined" style={{ marginTop: 15 }}>
                                                                        <CardContent>
                                                                            <Typography variant="h5">Feedback de revisión</Typography>
                                                                            <Divider style={{ marginTop: 15, marginBottom: 15 }} />

                                                                            <Typography>{Decrypt(feedback[0].data.feedback)}</Typography>
                                                                        </CardContent>
                                                                    </Card>
                                                                </React.Fragment>
                                                            )
                                                        )
                                                    )
                                                }
                                                </React.Fragment>

                                                <Dialog open={homeworkDialog} maxWidth={"md"} fullWidth onClose={handleCloseHomeworkDialog} fullScreen={fullScreen} scroll="paper">
                                                    <DialogTitle>{`Subir archivo a la ${Decrypt(detailedHomework[0].data.name)}`}</DialogTitle>
                                                    <DialogContent>
                                                        <React.Fragment>
                                                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column" }}>
                                                            {
                                                                loadingUpload === true ? (
                                                                    <Paper elevation={0}  style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                                                                        <CircularProgress style={{ color: "#2074d4" }} />
                                                                        <Typography style={{ textAlign: "center", marginTop: 15 }}>El archivo se esta subiendo, espere un momento</Typography>
                                                                    </Paper>
                                                                ) : (
                                                                    <React.Fragment>
                                                                        <Typography style={{ color: "#2074d4" }}>Archivo que se subirá</Typography>
                                                                        <Divider style={{ height: 2, marginBottom: 15, backgroundColor: "#2074d4" }} />

                                                                        <ThemeProvider theme={InputTheme}>
                                                                            <TextField type="file" variant="outlined" security="true" fullWidth onChange={handleSetFile} style={{ marginBottom: 15 }} />
                                                                        </ThemeProvider>
                                                                    </React.Fragment>
                                                                )
                                                            }
                                                            </Paper>

                                                            <Typography style={{ marginTop: 15, color: "#2074d4" }}>Progreso de la subida</Typography>
                                                            <Divider style={{ height: 2, backgroundColor: "#2074d4" }} />
                                                                
                                                            <ThemeProvider theme={InputTheme}>
                                                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", marginTop: 15 }}>
                                                                    <Typography>{`${progress}%`}</Typography>
                                                                    <LinearProgress variant="determinate" style={{ marginLeft: "auto", marginTop: 8, width: "calc(100% - 50px)" }} value={progress} />
                                                                </Paper>
                                                            </ThemeProvider>
                                                        </React.Fragment>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <React.Fragment>
                                                        {
                                                            cancelUpload === true ? (
                                                                <Button style={{ color: "#34495E" }} onClick={handleCancelUploadFile}>
                                                                    <Typography variant="button">Cancelar Subida de Archivo</Typography>
                                                                </Button>
                                                            ) : (
                                                                <React.Fragment>
                                                                    <Button style={{ color: "#2074d4" }} onClick={async () => await handleUploadHomework()}>
                                                                        <Typography variant="button">Subir Archivo</Typography>
                                                                    </Button>

                                                                    <Button color="inherit" onClick={handleCloseHomeworkDialog}>
                                                                        <Typography variant="button">Cerrar Esta Ventana</Typography>
                                                                    </Button>
                                                                </React.Fragment>                    
                                                            )
                                                        }
                                                        </React.Fragment>                    
                                                    </DialogActions>
                                                </Dialog>
                                            </Paper>
                                        )
                                    }
                                    </Paper>
                                </Paper>
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


export default withRouter(DetailedStudentHomework);