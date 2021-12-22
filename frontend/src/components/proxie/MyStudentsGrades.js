import React, { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Breadcrumbs, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { FormatListNumbered, NavigateNext } from '@material-ui/icons';

import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';

import axios from 'axios';


const MyStudentsAnnotation = () => {
    // uses
    const { id } = useParams();
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));

    // useStates
    const [loadingExistStudent, setLoadingExistStudent] = useState(true);
    const [errorExistStudent, setErrorExistStudent] = useState(false);
    const [existStudent, setExistStudent] = useState(null);
    const [errorCode, setErrorCode] = useState(null);

    const [loadingStudentSubjects, setLoadingStudentSubjects] = useState(true);
    const [errorStudentSubjects, setErrorStudentSubjects] = useState(false);
    const [studentSubjects, setStudentSubjects] = useState(null);

    const [loadingStudentInfo, setLoadingStudentInfo] = useState(true);
    const [errorStudentInfo, setErrorStudentInfo] = useState(false);
    const [studentInfo, setStudentInfo] = useState(null);

    const [loadingGrades, setLoadingGrades] = useState(false);
    const [errorGrades, setErrorGrades] = useState(false);
    const [grades, setGrades] = useState(null);
    
    const [loadingUnits, setLoadingUnits] = useState(false);
    const [errorUnits, setErrorUnits] = useState(false);
    const [units, setUnits] = useState(null);
    
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [situation, setSituation] = useState(null);
    const [average, setAverage] = useState(null);
    
    const [gradesDialog, setGradesDialog] = useState(false);


    // useCallbacks
    const handleGetExistStudent = useCallback(
        async () => {
            if (id === null)
            {
                return;
            }

            setLoadingExistStudent(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-student-assignation`, {
                params: {
                    studentIdParam: Encrypt(id)
                }
            })
            .then(result => {
                console.log(result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setExistStudent(result.data.data);
                    setErrorExistStudent(false);
                    setErrorCode(null);
                }
                else
                {
                    setExistStudent(undefined);
                    setErrorExistStudent(true);
                    setErrorCode(result.data.code);
                }

                setLoadingExistStudent(false);
            })
            .catch(error => {
                setExistStudent(undefined);
                setErrorExistStudent(true);

                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_STUDENT_ERROR");
                }

                setLoadingExistStudent(false);
            })
            .finally(() => {
                return () => {
                    setLoadingExistStudent(null);
                    setErrorExistStudent(null);
                    setErrorCode(null);
                    setExistStudent(null);
                }
            });
        },
        [id, setExistStudent, setErrorCode, setErrorExistStudent, setLoadingExistStudent],
    );

    const handleGetStudentSubjects = useCallback(
        async () => {
            if (id === null)
            {
                return;
            }

            setLoadingStudentSubjects(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-my-students-subjects`, {
                params: {
                    studentIdParam: Encrypt(id)
                }
            })
            .then(result => {
                console.log("ANOTACIONES => ", result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setStudentSubjects(Decrypt(result.data.data));
                    setErrorStudentSubjects(false);
                    setErrorCode(null);
                }
                else
                {
                    setStudentSubjects(undefined);
                    setErrorStudentSubjects(true);
                    setErrorCode(result.data.code);
                }

                setLoadingStudentSubjects(false);
            })
            .catch(error => {
                setStudentSubjects(undefined);
                setErrorStudentSubjects(true);

                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_ANNOTATIONS_ERROR");
                }

                setLoadingStudentSubjects(false);
            })
            .finally(() => {
                return () => {
                    setLoadingStudentSubjects(null);
                    setErrorStudentSubjects(null);
                    setErrorCode(null);
                    setStudentSubjects(null);
                }
            });
        },
        [id, setStudentSubjects, setErrorCode, setErrorStudentSubjects, setLoadingStudentSubjects],
    );

    const handleGetStudentInfo = useCallback(
        async () => {
            if (id === null)
            {
                return;
            }

            setLoadingStudentInfo(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-user-info`, {
                params: {
                    idUserParam: Encrypt(id)
                }
            })
            .then(result => {
                console.log("USUARIO => ", result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setStudentInfo(Decrypt(result.data.data));
                    setErrorStudentInfo(false);
                    setErrorCode(null);
                }
                else
                {
                    setStudentInfo(undefined);
                    setErrorStudentInfo(true);
                    setErrorCode(result.data.code);
                }

                setLoadingStudentInfo(false);
            })
            .catch(error => {
                setStudentInfo(undefined);
                setErrorStudentInfo(true);

                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_ANNOTATIONS_ERROR");
                }

                setLoadingStudentInfo(false);
            })
            .finally(() => {
                return () => {
                    setLoadingStudentInfo(null);
                    setErrorStudentInfo(null);
                    setErrorCode(null);
                    setStudentInfo(null);
                }
            });
        },
        [id, setStudentInfo, setErrorCode, setErrorStudentInfo, setLoadingStudentInfo],
    );



    const handleGetUnits = useCallback(
        async (id) => {
            if (id === null)
            {
                return;
            }

            setLoadingUnits(true);

            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-units-course", {
                params: {
                    subjectIdParam: Encrypt(id)
                }
            })
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    console.log("UNITS : ", Decrypt(result.data.data));

                    setUnits(Decrypt(result.data.data));
                    setErrorUnits(false);
                    setErrorCode(null);
                }
                else
                {
                    setUnits(undefined);
                    setErrorUnits(true);
                    setErrorCode(result.data.code);
                }

                setLoadingUnits(false);
            })
            .catch(error => {
                setErrorUnits(true);
                setUnits(undefined);
                    
                if (error.response)
                {
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("GET_DETAILED_SUBJECT_ERROR");
                }

                setLoadingUnits(false);   
            })
            .finally(() => {
                return () => {
                    setUnits(null); 
                    setErrorUnits(null);
                    setErrorCode(null);
                    setLoadingUnits(null);
                }
            });    
        },
        [setUnits, setErrorUnits, setErrorCode, setLoadingUnits],
    );

    const handleGetGrades = useCallback(
        async (doc) => {
            if (doc === null || id === null)
            {
                return;
            }
                
            setLoadingGrades(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-my-grades-student`, {
                params: {
                    idSubjectParam: Encrypt(doc.id),
                    userIdParam: Encrypt(id)
                }    
            })
            .then(result => {
                console.log(Decrypt(result.data.data));
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
                    console.log(error.response);
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
        [id, setGrades, setErrorGrades, setErrorCode, setLoadingGrades],
    );

    const calculateAverage = useCallback(
        async () => {
            if (grades !== null)
            {
                let numberGrades = grades.length;
                let plusNumbers = 0;

                await grades.forEach((doc, index) => {
                    plusNumbers += doc.data.valueGrade;

                    if (index === numberGrades - 1)
                    {
                        setAverage(Math.round(plusNumbers/numberGrades));

                        console.log("THE AVERAGE IS ", plusNumbers/numberGrades);

                        if (plusNumbers/numberGrades >= 40)
                        {
                            setSituation("Aprobado");
                        }
                        else
                        {
                            setSituation("Reprobado");
                        }
                    }
                })
            }
        },
        [grades, setAverage, setSituation],
    );



    const handleOpenStudentGrades = useCallback(
        async (doc) => {
            if (doc === null)
            {
                return;
            }

            setSelectedSubject(doc);
            setGradesDialog(true);

            if (grades === null)
            {   
                await handleGetGrades(doc);
                await handleGetUnits(doc.id);
            }
        },
        [grades, setGradesDialog, setSelectedSubject, handleGetGrades, handleGetUnits],
    );

    const handleCloseStudentGrades = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setGradesDialog(false);
            setGrades(null);
            setUnits(null);
            setAverage(null);
            setSituation(null);
            setSelectedSubject(null);

            return;
        },
        [setGradesDialog, setGrades, setUnits, setAverage, setSituation, setSelectedSubject],
    );


    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetExistStudent();
        }

        callQuery();
        
        return () => {
            setExistStudent(null);
        }
    }, [setExistStudent, handleGetExistStudent]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetStudentSubjects();
        }

        if (existStudent === true)
        {
            callQuery();
        
            return () => {
                setStudentSubjects(null);
            }
        }
    }, [existStudent, setStudentSubjects, handleGetStudentSubjects]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetStudentInfo();
        }

        if (existStudent === true)
        {
            callQuery();
        
            return () => {
                setStudentInfo(null);
            }
        }
    }, [existStudent, setStudentInfo, handleGetStudentInfo]);

    useEffect(() => {
        let callQuery = async () => {
            await calculateAverage();
        }

        if (grades !== null)
        {
            return callQuery();
        }
    }, [grades, calculateAverage]);


    return (
        <Paper elevation={0} itemType="div">
            <Paper variant="outlined" itemType="div" style={{ padding: 20, marginBottom: 15 }}>
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                    <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                        Home
                    </Link>
                    <Link to="/my-students" style={{ textDecoration: "none", color: "#333" }}>
                        Mis Estudiantes
                    </Link>
                    <Typography style={{ color: "#2074d4" }}>Asignaturas</Typography>
                </Breadcrumbs>
            </Paper>

            <React.Fragment>
            {
                loadingExistStudent === true ? (
                    <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>
                        <CircularProgress style={{ color: "#2074d4" }} />
                        <Typography style={{ marginTop: 15 }}>Verificando el estudiante</Typography>
                    </Paper>
                ) : errorExistStudent === true ? (
                    <React.Fragment>
                    {
                        errorCode !== null && (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode === "STUDENT_NOT_FOUND" ? (
                                        "El estudiante no esta asignado a ti, o esta mal ingresado el identificador, intentelo nuevamente"
                                    ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                        "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                    ) : (
                                        "Ha ocurrido un error, intente obtener el estudiante nuevamente"
                                    )
                                }
                                </Typography>

                                <React.Fragment>
                                {
                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={async () => await handleGetExistStudent()} style={{ color: "#2074d4" }}>
                                                <Typography variant="button">Recargar Estudiantes</Typography>
                                            </Button>
                                        </Paper>
                                    )
                                }
                                </React.Fragment>
                            </Paper>
                        )
                    }
                    </React.Fragment>
                ) : existStudent === null ? (
                    <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>
                        <CircularProgress style={{ color: "#2074d4" }} />
                        <Typography style={{ marginTop: 15 }}>Cargando la verificación del estudiante</Typography>
                    </Paper>
                ) : existStudent === undefined ? (
                    <React.Fragment>
                    {
                        errorCode !== null && (
                            <React.Fragment>
                                <Typography style={{ textAlign: "center" }}>
                                {
                                    errorCode === "STUDENT_NOT_FOUND" ? (
                                        "El estudiante no esta asignado a ti, o esta mal ingresado el identificador, intentelo nuevamente"
                                    ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                        "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente o bien"
                                    ) : (
                                        "Ha ocurrido un error, intente obtener el estudiante nuevamente"
                                    )
                                }
                                </Typography>

                                <React.Fragment>
                                {
                                    errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                        <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                            <Button onClick={async () => await handleGetExistStudent()} style={{ color: "#2074d4" }}>
                                                <Typography variant="button">Recargar verificar estudiante</Typography>
                                            </Button>
                                        </Paper>
                                    )
                                }
                                </React.Fragment>
                            </React.Fragment>
                        )
                    }
                    </React.Fragment>
                ) : existStudent === false ? (
                    <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>
                        <Typography style={{ marginTop: 15 }}>El estudiante no esta asignado a ti, o no existe, intentalo nuevamente</Typography>

                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                        <Button onClick={async () => await handleGetExistStudent()} style={{ color: "#2074d4" }}>
                            <Typography variant="button">Recargar</Typography>
                        </Button>
                    </Paper>
                ) : (
                    <React.Fragment>
                    {
                        loadingStudentInfo === true ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Datos</Typography>
                            </Paper>
                        ) : errorStudentInfo === true ? (
                            <React.Fragment>
                            {
                                errorCode !== null && (
                                    <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>
                                        <Typography style={{ textAlign: "center" }}>
                                        {
                                            errorCode === "PARAMS_BAD_FORMATING" ? (
                                                "Envíe los parametros correctamente e intentelo nuevamente"
                                            ) : errorCode === "BAD_TYPES_PARAM" ? (
                                                "Asegurese de enviar los datos correctamente e intentelo nuevamente"
                                            ) : errorCode === "PARAMS_EMPTY" ? (
                                                "Asegurese de enviar los datos porfavor"
                                            ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                            ) : (
                                                "Ha ocurrido un error al procesar la solicitud"
                                            )
                                        }
                                        </Typography>

                                        <React.Fragment>
                                        {
                                            errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                    <Button onClick={async () => await handleGetStudentSubjects()} style={{ color: "#2074d4" }}>
                                                        <Typography variant="button">Intentar Nuevamente</Typography>
                                                    </Button>
                                                </Paper>
                                            )
                                        }
                                        </React.Fragment>
                                    </Paper>
                                )
                            }
                            </React.Fragment>
                        ) : studentInfo === null ? (
                            <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Datos</Typography>
                            </Paper>
                        ) : studentInfo === undefined ? (
                            <React.Fragment>
                            {
                                errorCode !== null && (
                                    <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>
                                        <Typography style={{ textAlign: "center" }}>
                                        {
                                            errorCode === "PARAMS_BAD_FORMATING" ? (
                                                "Envíe los parametros correctamente e intentelo nuevamente"
                                            ) : errorCode === "BAD_TYPES_PARAM" ? (
                                                "Asegurese de enviar los datos correctamente e intentelo nuevamente"
                                            ) : errorCode === "PARAMS_EMPTY" ? (
                                                "Asegurese de enviar los datos porfavor"
                                            ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                            ) : (
                                                "Ha ocurrido un error al procesar la solicitud"
                                            )
                                        }
                                        </Typography>

                                        <React.Fragment>
                                        {
                                            errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                    <Button onClick={async () => await handleGetStudentSubjects()} style={{ color: "#2074d4" }}>
                                                        <Typography variant="button">Intentar Nuevamente</Typography>
                                                    </Button>
                                                </Paper>
                                            )
                                        }
                                        </React.Fragment>
                                    </Paper>
                                )
                            }
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6">Todas las asignaturas ligadas al alumno {`${Decrypt(studentInfo[0].data.name)} ${Decrypt(studentInfo[0].data.surname)}`}</Typography> 
                                        
                                        <Divider style={{ marginTop: 15, marginBottom: 15 }} />

                                        <Paper elevation={0} itemType="div">
                                        {
                                            loadingStudentSubjects === true ? (
                                                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15 }}>
                                                    <CircularProgress style={{ color: "#2074d4" }} />
                                                    <Typography style={{ marginTop: 15 }}>Cargando las asignatuas del estudiante</Typography>
                                                </Paper>
                                            ) : errorStudentSubjects === true ? (
                                                <React.Fragment>
                                                {
                                                    errorCode !== null && (
                                                        <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>
                                                            <Typography style={{ textAlign: "center" }}>
                                                            {
                                                                errorCode === "PARAMS_BAD_FORMATING" ? (
                                                                    "Envíe los parametros correctamente e intentelo nuevamente"
                                                                ) : errorCode === "BAD_TYPES_PARAM" ? (
                                                                    "Asegurese de enviar los datos correctamente e intentelo nuevamente"
                                                                ) : errorCode === "PARAMS_EMPTY" ? (
                                                                    "Asegurese de enviar los datos porfavor"
                                                                ) : errorCode === "NO_COURSES_EXIST" ? (
                                                                    "El alumno no tiene aignaturas asignadas, intentelo nuevamente"
                                                                ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                                    "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                                                ) : (
                                                                    "Ha ocurrido un error al procesar la solicitud"
                                                                )
                                                            }
                                                            </Typography>

                                                            <React.Fragment>
                                                            {
                                                                errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                        <Button onClick={async () => await handleGetStudentSubjects()} style={{ color: "#2074d4" }}>
                                                                            <Typography variant="button">Recargar anotaciones</Typography>
                                                                        </Button>
                                                                    </Paper>
                                                                )
                                                            }
                                                            </React.Fragment>
                                                        </Paper>
                                                    )
                                                }
                                                </React.Fragment>
                                            ) : studentSubjects === null ? (
                                                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15 }}>
                                                    <CircularProgress style={{ color: "#2074d4" }} />
                                                    <Typography style={{ marginTop: 15 }}>Cargando las asignaturas del estudiante</Typography>
                                                </Paper>
                                            ) : studentSubjects === undefined ? (
                                                <React.Fragment>
                                                {
                                                    errorCode !== null && (
                                                        <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 150 }}>
                                                            <Typography style={{ textAlign: "center" }}>
                                                            {
                                                                errorCode === "PARAMS_BAD_FORMATING" ? (
                                                                    "Envíe los parametros correctamente e intentelo nuevamente"
                                                                ) : errorCode === "BAD_TYPES_PARAM" ? (
                                                                    "Asegurese de enviar los datos correctamente e intentelo nuevamente"
                                                                ) : errorCode === "PARAMS_EMPTY" ? (
                                                                    "Asegurese de enviar los datos porfavor"
                                                                ) : errorCode === "NO_COURSES_EXIST" ? (
                                                                    "El alumno no tiene aignaturas asignadas, intentelo nuevamente"
                                                                ) : errorCode === "FIREBASE_VERIFY_TOKEN_ERROR" ? (
                                                                    "La sesión ha expirado, recargue el navegador para inciar sesión nuevamente"
                                                                ) : (
                                                                    "Ha ocurrido un error al procesar la solicitud"
                                                                )
                                                            }
                                                            </Typography>

                                                            <React.Fragment>
                                                            {
                                                                errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                                    <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                        <Button onClick={async () => await handleGetStudentSubjects()} style={{ color: "#2074d4" }}>
                                                                            <Typography variant="button">Recargar anotaciones</Typography>
                                                                        </Button>
                                                                    </Paper>
                                                                )
                                                            }
                                                            </React.Fragment>
                                                        </Paper>
                                                    )
                                                }
                                                </React.Fragment>
                                            ) : (
                                                <React.Fragment>
                                                    <List>
                                                    {
                                                        studentSubjects.map(doc => (
                                                            <Paper elevation={0} key={doc.id}>
                                                                <ListItem key={doc.id}>
                                                                    <ListItemText primary={Decrypt(doc.data.name)} secondary={doc.data.code} />
                                                                    <ListItemSecondaryAction>
                                                                        <Tooltip title={<Typography>Ver notas en esta asignatura</Typography>}>
                                                                            <IconButton edge="end" onClick={async () => await handleOpenStudentGrades(doc)} style={{ marginRight: 5 }}>
                                                                                <FormatListNumbered />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </ListItemSecondaryAction>
                                                                </ListItem>

                                                                <Divider />
                                                            </Paper>
                                                        ))
                                                    }
                                                    </List>
                                                    
                                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                        <Button onClick={async () => await handleGetStudentSubjects()} style={{ color: "#2074d4" }}>
                                                            <Typography variant="button">Recargar Asignaturas</Typography>
                                                        </Button>
                                                    </Paper>

                                                    <Dialog open={gradesDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseStudentGrades} fullScreen={fullScreen} scroll="paper">
                                                        <DialogTitle>{selectedSubject === null ? `Calificaciones del estudiante ${Decrypt(studentInfo[0].data.name)} ${Decrypt(studentInfo[0].data.surname)} en esta asignatura` : `Calificaciones del estudiante ${Decrypt(studentInfo[0].data.name)} ${Decrypt(studentInfo[0].data.surname)} en la asignatura ${Decrypt(selectedSubject.data.name)}`}</DialogTitle>
                                                        <DialogContent>
                                                        {
                                                            selectedSubject === null ? (
                                                                <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                    <Typography style={{ marginTop: 15 }}>Cargando Datos de la asignatura Seleccionada</Typography>
                                                                </Paper>
                                                            ) : loadingUnits === true ? (
                                                                <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                    <Typography style={{ marginTop: 15 }}>Cargando Unidades</Typography>
                                                                </Paper>
                                                            ) : errorUnits === true ? (
                                                                <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                    <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener las unidades del curso</Typography>
                                                                                    
                                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                    <Button onClick={async () => await handleGetUnits(selectedSubject.id)} style={{ color: "#2074d4" }}>Recargar Unidades</Button>
                                                                </Paper>
                                                            ) : units === null ? (
                                                                <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                    <Typography style={{ marginTop: 15 }}>Cargando Unidades</Typography>
                                                                </Paper>
                                                            ) : units === undefined ? (
                                                                <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                    <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener las unidades del curso</Typography>
                                                                                    
                                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                    <Button onClick={async () => await handleGetUnits(selectedSubject.id)} style={{ color: "#2074d4" }}>Recargar Unidades</Button>
                                                                </Paper>
                                                            ) : (
                                                                <React.Fragment>
                                                                {
                                                                    loadingGrades === true ? (
                                                                        <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                            <Typography style={{ marginTop: 15 }}>Cargando Calificaciones del estudiante</Typography>
                                                                        </Paper>
                                                                    ) : errorGrades === true ? (
                                                                        <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                            <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener las calificaciones del estudiante</Typography>
                                                                                            
                                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                            <Button onClick={async () => await handleGetGrades(selectedSubject)} style={{ color: "#2074d4" }}>Recargar Calificaciones</Button>
                                                                        </Paper>
                                                                    ) : grades === null ? (
                                                                        <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                            <Typography style={{ marginTop: 15 }}>Cargando Calificaciones del estudiante</Typography>
                                                                        </Paper>
                                                                    ) : grades === undefined ? (
                                                                        <Paper elevation={0} itemType="div" style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                            <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener las calificaciones del estudiante</Typography>
                                                                                            
                                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                            <Button onClick={async () => await handleGetGrades(selectedSubject)} style={{ color: "#2074d4" }}>Recargar Calificaciones</Button>
                                                                        </Paper>
                                                                    ) : (
                                                                        <React.Fragment>
                                                                            <TableContainer component={Paper} style={{ marginBottom: 15 }} elevation={0} variant="outlined">
                                                                                <Table>
                                                                                    <TableHead security="true" style={{ backgroundColor: "#2074d4" }}>
                                                                                        <TableRow>
                                                                                            <TableCell align="center" style={{ color: "#FFF" }}>Nº Calificación</TableCell>
                                                                                            <TableCell align="center" style={{ color: "#FFF" }}>Nº de la Unidad</TableCell>
                                                                                            <TableCell align="center" style={{ color: "#FFF" }}>Nombre de la Unidad</TableCell>
                                                                                            <TableCell align="center" style={{ color: "#FFF" }}>Nota</TableCell>
                                                                                        </TableRow>
                                                                                    </TableHead>

                                                                                    <TableBody>
                                                                                        <React.Fragment>
                                                                                        {
                                                                                            units.map((doc, index) => (
                                                                                                <TableRow key={doc.id}>
                                                                                                    <TableCell align="center" component="th" scope="row">{index + 1}</TableCell>
                                                                                                    <TableCell align="center">{doc.data.numberUnit}</TableCell>
                                                                                                    <TableCell align="center">{doc.data.unit}</TableCell>
                                                                                                    <TableCell align="center">
                                                                                                        <Typography color={grades.length > 0 ? grades.find(x => x.id === doc.id) !== undefined && grades.find(x => x.id === doc.id).data.valueGrade >= 40 ? `primary` : `error` : `inherit`}>{grades.length > 0 ? grades.find(x => x.id === doc.id) !== undefined ? grades.find(x => x.id === doc.id).data.valueGrade : "" : "?"}</Typography>
                                                                                                    </TableCell>
                                                                                                </TableRow>
                                                                                            ))
                                                                                        }
                                                                                        </React.Fragment>

                                                                                        <TableRow>
                                                                                            <TableCell rowSpan={1} />
                                                                                            <TableCell align="right" colSpan={2}>Promedio</TableCell>
                                                                                            <TableCell align="center">
                                                                                                <Typography color={grades.length > 0 && average !== null ? average >= 40 ? `primary` : `error` : `inherit`}>{grades.length > 0 ? average !== null ? average : "Cargando" : "?"}</Typography>
                                                                                            </TableCell>
                                                                                        </TableRow>

                                                                                        <TableRow>
                                                                                            <TableCell rowSpan={1} />
                                                                                            <TableCell align="right" colSpan={2}>Situación</TableCell>
                                                                                            <TableCell align="center">
                                                                                                <Typography>{grades.length > 0 ? situation !== null ? situation : "Cargando" : "?"}</Typography>
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    </TableBody>
                                                                                </Table>
                                                                            </TableContainer>

                                                                            <Paper elevation={0} itemType="div" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                                <Button onClick={async () => await handleGetGrades(selectedSubject)} style={{ color: "#2074d4" }}>
                                                                                    <Typography variant="button">Recargar Calificaciones</Typography>
                                                                                </Button>
                                                                            </Paper>
                                                                        </React.Fragment>
                                                                    )
                                                                }
                                                                </React.Fragment>
                                                            )
                                                        }
                                                        </DialogContent>
                                                        <DialogActions>
                                                            <Button color="inherit" onClick={handleCloseStudentGrades}>
                                                                <Typography variant="button">Cerrar Ventana</Typography>
                                                            </Button>
                                                        </DialogActions>
                                                    </Dialog>
                                                </React.Fragment>
                                            )
                                        }
                                        </Paper>
                                    </CardContent>
                                </Card>
                            </React.Fragment>
                        )
                    }
                    </React.Fragment>
                )
            }
            </React.Fragment>
        </Paper>
    );
};

export default MyStudentsAnnotation;