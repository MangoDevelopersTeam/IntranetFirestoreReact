import React, { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Breadcrumbs, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Paper, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { AddCircleOutline, Info, NavigateNext, RemoveCircleOutline, Visibility } from '@material-ui/icons';

import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';
import { timeago } from '../../helpers/format/handleFormat';

import axios from 'axios';


const MyStudentsAnnotation = () => {
    const { id } = useParams();
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));

    const [loadingExistStudent, setLoadingExistStudent] = useState(true);
    const [errorExistStudent, setErrorExistStudent] = useState(false);
    const [existStudent, setExistStudent] = useState(null);
    const [errorCode, setErrorCode] = useState(null);

    const [loadingStudentAnnotations, setLoadingStudentAnnotations] = useState(true);
    const [errorStudentAnnotations, setErrorStudentAnnotations] = useState(false);
    const [studentAnnotations, setStudentAnnotations] = useState(null);

    const [loadingStudentInfo, setLoadingStudentInfo] = useState(true);
    const [errorStudentInfo, setErrorStudentInfo] = useState(false);
    const [studentInfo, setStudentInfo] = useState(null);

    const [loadingUserInfo, setLoadingUserInfo] = useState(false);
    const [errorUserInfo, setErrorUserInfo] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);
    const [moreInfoDialog, setMoreInfoDialog] = useState(false);


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

    const handleGetStudentAnnotations = useCallback(
        async () => {
            if (id === null)
            {
                return;
            }

            setLoadingStudentAnnotations(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-my-annotations-student`, {
                params: {
                    userIdParam: Encrypt(id)
                }
            })
            .then(result => {
                console.log("ANOTACIONES => ", result);
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setStudentAnnotations(Decrypt(result.data.data));
                    setErrorStudentAnnotations(false);
                    setErrorCode(null);
                }
                else
                {
                    setStudentAnnotations(undefined);
                    setErrorStudentAnnotations(true);
                    setErrorCode(result.data.code);
                }

                setLoadingStudentAnnotations(false);
            })
            .catch(error => {
                setStudentAnnotations(undefined);
                setErrorStudentAnnotations(true);

                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_ANNOTATIONS_ERROR");
                }

                setLoadingStudentAnnotations(false);
            })
            .finally(() => {
                return () => {
                    setLoadingStudentAnnotations(null);
                    setErrorStudentAnnotations(null);
                    setErrorCode(null);
                    setStudentAnnotations(null);
                }
            });
        },
        [id, setStudentAnnotations, setErrorCode, setErrorStudentAnnotations, setLoadingStudentAnnotations],
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

    const handleGetUserInfo = useCallback(
        async (uid) => {
            if (uid === null)
            {
                return;
            }

            setLoadingUserInfo(true);

            await axios.get(`${process.env.REACT_APP_API_URI}/get-user-info`, {
                params: {
                    idUserParam: Encrypt(uid)
                }
            })
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setUserInfo(Decrypt(result.data.data));
                    setErrorUserInfo(false);
                    setErrorCode(null);
                }
                else
                {
                    setUserInfo(undefined);
                    setErrorUserInfo(true);
                    setErrorCode(result.data.code);
                }

                setLoadingUserInfo(false);
            })
            .catch(error => {
                setUserInfo(undefined);
                setErrorUserInfo(true);

                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code); 
                }
                else
                {
                    setErrorCode("GET_ANNOTATIONS_ERROR");
                }

                setLoadingUserInfo(false);
            })
            .finally(() => {
                return () => {
                    setLoadingUserInfo(null);
                    setErrorUserInfo(null);
                    setErrorCode(null);
                    setUserInfo(null);
                }
            });
        },
        [setUserInfo, setErrorCode, setErrorUserInfo, setLoadingUserInfo],
    );



    const handleOpenMoreInfo = useCallback(
        async (doc) => {
            if (doc === null)
            {
                return
            }

            setSelectedAnnotation(doc);
            setMoreInfoDialog(true);
            await handleGetUserInfo(doc.data.created_by);
        },
        [setSelectedAnnotation, setMoreInfoDialog, handleGetUserInfo],
    );

    const handleCloseMoreInfo = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setMoreInfoDialog(false);
            setSelectedAnnotation(null);
            setUserInfo(null);

            return;
        },
        [setMoreInfoDialog, setSelectedAnnotation, setUserInfo],
    );


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
            await handleGetStudentAnnotations();
        }

        if (existStudent === true)
        {
            callQuery();
        
            return () => {
                setStudentAnnotations(null);
            }
        }
    }, [existStudent, setStudentAnnotations, handleGetStudentAnnotations]);

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
                    <Typography style={{ color: "#2074d4" }}>Anotaciones</Typography>
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
                                                    <Button onClick={async () => await handleGetStudentAnnotations()} style={{ color: "#2074d4" }}>
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
                                                    <Button onClick={async () => await handleGetStudentAnnotations()} style={{ color: "#2074d4" }}>
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
                                        <Typography variant="h6">Todas las anotaciones del alumno {`${Decrypt(studentInfo[0].data.name)} ${Decrypt(studentInfo[0].data.surname)}`}</Typography> 
                                        
                                        <Divider style={{ marginTop: 15, marginBottom: 15 }} />

                                        <Paper elevation={0} itemType="div">
                                        {
                                            loadingStudentAnnotations === true ? (
                                                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15 }}>
                                                    <CircularProgress style={{ color: "#2074d4" }} />
                                                    <Typography style={{ marginTop: 15 }}>Cargando las anotaciones del estudiante</Typography>
                                                </Paper>
                                            ) : errorStudentAnnotations === true ? (
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
                                                                ) : errorCode === "NO_ANNOTATIONS_EXIST" ? (
                                                                    "El alumno no tiene anotaciones asignadas, intentelo nuevamente"
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
                                                                        <Button onClick={async () => await handleGetStudentAnnotations()} style={{ color: "#2074d4" }}>
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
                                            ) : studentAnnotations === null ? (
                                                <Paper elevation={0} itemType="div" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 15 }}>
                                                    <CircularProgress style={{ color: "#2074d4" }} />
                                                    <Typography style={{ marginTop: 15 }}>Cargando las anotaciones del estudiante</Typography>
                                                </Paper>
                                            ) : studentAnnotations === undefined ? (
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
                                                                ) : errorCode === "NO_ANNOTATIONS_EXIST" ? (
                                                                    "El alumno no tiene anotaciones asignadas, intentelo nuevamente"
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
                                                                        <Button onClick={async () => await handleGetStudentAnnotations()} style={{ color: "#2074d4" }}>
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
                                                        studentAnnotations.map(doc => (
                                                            <Paper elevation={0} key={doc.id}>
                                                                <ListItem key={doc.id}>
                                                                    <ListItemText primary={
                                                                        <React.Fragment>
                                                                            <Paper elevation={0} style={{ display: "flex", maxWidth: "calc(100% - 100px)", flexDirection: "row", alignItems: "center" }}>
                                                                                <React.Fragment>
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
                                                                                </React.Fragment>
                                                                                
                                                                                <Typography style={{ marginLeft: 15 }}>{Decrypt(doc.data.description)}</Typography>
                                                                            </Paper>
                                                                        </React.Fragment>} secondary={<Typography variant="subtitle1" color="textSecondary" style={{ marginTop: 5 }}>{`Asignatura : ${Decrypt(doc.data.subjectName)} (${doc.data.code})`}</Typography>} />
                                                                                                                    
                                                                    <ListItemSecondaryAction>
                                                                        <React.Fragment>
                                                                            <Tooltip title={<Typography>Más Información</Typography>}>
                                                                                <IconButton edge="end" onClick={async () => await handleOpenMoreInfo(doc)} style={{ marginRight: 5 }}>
                                                                                    <Info />
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
                                                        <Button onClick={async () => await handleGetStudentAnnotations()} style={{ color: "#2074d4" }}>
                                                            <Typography variant="button">Recargar Anotaciones</Typography>
                                                        </Button>
                                                    </Paper>

                                                    <Dialog open={moreInfoDialog} maxWidth={"md"} fullWidth={false} onClose={handleCloseMoreInfo} fullScreen={fullScreen} scroll="paper">
                                                        <DialogTitle>Mas información acerca de esta Anotación</DialogTitle>
                                                        <DialogContent>
                                                            <React.Fragment>
                                                            {
                                                                selectedAnnotation === null ? (
                                                                    <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                        <Typography style={{ marginTop: 15 }}>Cargando Datos de la Anotación Seleccionada</Typography>
                                                                    </Paper>
                                                                ) : loadingUserInfo === true ? (
                                                                    <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                        <Typography style={{ marginTop: 15 }}>Cargando Datos del Autor de la anotación</Typography>
                                                                    </Paper>
                                                                ) : errorUserInfo === true ? (
                                                                    <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                        <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener la Información del autor de la Anotación</Typography>

                                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                        <Button onClick={async () => await handleGetUserInfo(selectedAnnotation.data.created_by)} style={{ color: "#2074d4" }}>
                                                                            <Typography variant="button">Recargar Información del autor</Typography>
                                                                        </Button>
                                                                    </Paper>
                                                                ) : userInfo === null ? (
                                                                    <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                        <Typography style={{ marginTop: 15 }}>Cargando la Información del Autor</Typography>
                                                                    </Paper>
                                                                ) : userInfo === undefined ? (
                                                                    <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                        <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener la Información del autor de la Anotación</Typography>

                                                                        <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                        <Button onClick={async () => await handleGetUserInfo(selectedAnnotation.data.created_by)} style={{ color: "#2074d4" }}>
                                                                            <Typography variant="button">Recargar Información del autor</Typography>
                                                                        </Button>
                                                                    </Paper>
                                                                ) : (
                                                                    <React.Fragment>
                                                                        <Typography>
                                                                        {`Esta Anotación fue creada por el 
                                                                            ${userInfo[0].data.level === "teacher" ? (
                                                                                `Profesor`
                                                                            ) : userInfo[0].data.level === "student" ? (
                                                                                `Estudiante`
                                                                            ) : userInfo[0].data.level === "admin" ? (
                                                                                `Administrador`
                                                                            ) : `Usuario`} ${Decrypt(userInfo[0].data.name)} ${Decrypt(userInfo[0].data.surname)}`}
                                                                        </Typography>
                                                                        <Typography style={{ marginTop: 5 }}>{`Esto fue creado ${timeago(new Date(selectedAnnotation.data.created_at._seconds * 1000))}`}</Typography>
                                                                    </React.Fragment>
                                                                )
                                                            }
                                                            </React.Fragment>
                                                        </DialogContent>                                       
                                                        <DialogActions>
                                                            <Button color="inherit" onClick={handleCloseMoreInfo}>
                                                                <Typography variant="button">Cerrar Esta Ventana</Typography>
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
    )
};

export default MyStudentsAnnotation;