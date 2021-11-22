import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ThemeProvider } from '@material-ui/styles';
import { AddCircleOutline, Info, NavigateNext, RemoveCircleOutline, Visibility } from '@material-ui/icons';
import { Breadcrumbs, Button, CardContent, CircularProgress, createTheme, Paper, Typography, useMediaQuery, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Divider, List, ListItem, ListItemText, Tooltip, ListItemSecondaryAction, IconButton, useTheme, DialogContent, DialogActions, DialogTitle, Dialog } from '@material-ui/core';

import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';

import { timeago } from './../../helpers/format/handleFormat';

import axios from 'axios';

const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const MyAnnotationsStudent = () => {
    // uses
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));



    // useStates
    const [annotations, setAnnotations] = useState(null);
    const [errorAnnotations, setErrorAnnotations] = useState(false);
    const [loadingAnnotations, setLoadingAnnotations] = useState(true);
    const [errorCode, setErrorCode] = useState(null);

    const [userInfo, setUserInfo] = useState(null);
    const [errorUserInfo, setErrorUserInfo] = useState(false);
    const [loadingUserInfo, setLoadingUserInfo] = useState(false);

    const [moreInfoDialog, setMoreInfoDialog] = useState(false);
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);


    
    // useCallbacks
    /* ------ ANNOTATIONS CALLBACK ------ */
    /*
     * useCallback para obtener las calificaciones del alumno
     */
    const handleGetAnnotations = useCallback(
        async () => {
            setLoadingAnnotations(true);

            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-my-annotations-student")
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
                setErrorAnnotations(true);
                setAnnotations(null);
                    
                if (error.response)
                {
                    console.log(error.response);
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("GET_ANNOTATIONS_USER_ERROR");
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
        [setAnnotations, setErrorAnnotations, setErrorCode, setLoadingAnnotations],
    );
    /* ------ ANNOTATIONS CALLBACK ------ */


    /* ------ USER CALLBACK ------ /get-user-info */
    const handleGetUserInfo = useCallback(
        async (userId) => {
            if (userId !== null)
            {
                setLoadingUserInfo(true);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-user-info", {
                    params: {
                        idUserParam: Encrypt(userId)
                    }
                })
                .then(result => {
                    if (result.status === 200 && result.data.code === "PROCESS_OK")
                    {
                        setErrorUserInfo(false);
                        setUserInfo(Decrypt(result.data.data));
                        setErrorCode(null);
                    }
                    else
                    {
                        setErrorUserInfo(false);
                        setUserInfo(null);
                        setErrorCode(result.data.code);
                    }
                        
                    setLoadingUserInfo(false);
                })
                .catch(error => {
                    setErrorUserInfo(false);
                    setUserInfo(null);
                        
                    if (error.response)
                    {
                        console.log(error.response);
                        setErrorCode(error.response.data.code);
                    }
                    else
                    {
                        setErrorCode("GET_USER_INFO_ERROR");
                    }

                    setLoadingUserInfo(false);
                })
                .finally(() => {
                    return () => {
                        setUserInfo(null); 
                        setErrorUserInfo(null);
                        setErrorCode(null);
                        setLoadingUserInfo(null);
                    }
                });
            }
        },
        [setUserInfo, setErrorUserInfo, setErrorCode, setLoadingUserInfo],
    )
    /* ------ USER CALLBACK ------ */


    /* ------ DIALOG CALLBACKS ------ */
    /**
     * useCallback para mostrar el dialogo de más informción
     */
    const handleOpenMoreInfo = useCallback(
        async (doc) => {
            if (doc !== null)
            {
                setSelectedAnnotation(doc);
                setMoreInfoDialog(true);
                await handleGetUserInfo(doc.data.created_by);
            }
        },
        [setSelectedAnnotation, setMoreInfoDialog, handleGetUserInfo],
    );

    /**
     * useCallback para cerrar el dialogo de estudiantes
     */
    const handleCloseMoreInfo = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setMoreInfoDialog(false);
            setSelectedAnnotation(null);

            return;
        },
        [setMoreInfoDialog, setSelectedAnnotation],
    );
    /* ------ DIALOG CALLBACKS ------ */



    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetAnnotations();
        }

        callQuery();
        
        return () => {
            setAnnotations(null);
        }
    }, [handleGetAnnotations, setAnnotations]);



    return (
        <div>
            <Paper style={{ padding: 20, marginBottom: 15 }} variant="outlined">
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                    <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                        Home
                    </Link>
                                            
                    <Typography style={{ color: "#2074d4" }}>Mis Anotaciones</Typography>
                </Breadcrumbs>
            </Paper>

            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" style={{ marginBottom: 15 }}>Todas tus Anotaciones Vinculadas a Tí</Typography>
                                            
                    <Paper elevation={0}>
                    {
                        loadingAnnotations === true ? (
                            <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Obteniendo las Anotaciones</Typography>
                            </Paper>
                        ) : (
                            errorAnnotations === true ? (
                                <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                    <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Typography>
                                        {
                                            errorCode !== null ? (
                                                errorCode === "NO_ANNOTATIONS_EXIST" ? (
                                                    "No tienes anotaciones asignadas a ti aún"
                                                ) : (
                                                    "Ha ocurrido un error al momento de obtener tus Anotaciones"
                                                )
                                            ) : (
                                                "Ha ocurrido un error al momento de obtener tus Anotaciones"
                                            )
                                        }
                                        </Typography>
                                
                                        <React.Fragment>
                                        {
                                            errorCode !== null && (
                                                errorCode !== "FIREBASE_VERIFY_TOKEN_ERROR" && (
                                                    <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetAnnotations()}>
                                                        <Typography variant="button">Recargar Anotaciones</Typography>
                                                    </Button>
                                                )
                                            )
                                        }
                                        </React.Fragment>
                                    </Paper>
                                </Paper>
                            ) : (
                                annotations === null ? (
                                    <Paper elevation={0} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Cargando Anotaciones</Typography>
                                    </Paper>
                                ) : (
                                    annotations.length <= 0 ? (
                                        <Paper elevation={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
                                            <Paper elevation={0} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <Typography>No tienes anotaciones asignadas a ti aún</Typography>
                                        
                                                <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetAnnotations()}>
                                                    <Typography variant="button">Recargar Anotaciones</Typography>
                                                </Button>
                                            </Paper>
                                        </Paper>
                                    ) : (
                                        <React.Fragment>
                                            <List>
                                            {
                                                annotations.map(doc => (
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
                                                                        <IconButton edge="end" onClick={() => handleOpenMoreInfo(doc)} style={{ marginRight: 5 }}>
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
                                                <Button onClick={async () => await handleGetAnnotations()} style={{ color: "#2074d4" }}>
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
                                                        ) : (
                                                            <React.Fragment>
                                                            {
                                                                loadingUserInfo === true ? (
                                                                    <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                        <Typography style={{ marginTop: 15 }}>Cargando Datos del Autor de la anotación</Typography>
                                                                    </Paper>
                                                                ) : (
                                                                    errorUserInfo === true ? (
                                                                        <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                                                            <Typography style={{ marginTop: 15 }}>Ha ocurrido un error al obtener la Información del autor de la Anotación</Typography>

                                                                            <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                            <Button onClick={async () => await handleGetUserInfo(selectedAnnotation.data.created_by)} style={{ color: "#2074d4" }}>
                                                                                <Typography variant="button">Recargar Información del autor</Typography>
                                                                            </Button>
                                                                        </Paper>
                                                                    ) : (
                                                                        userInfo === null ? (
                                                                            <Paper elevation={0} style={{ flex: 1, height: "calc(100% - 30px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                                <Typography style={{ marginTop: 15 }}>Cargando la Información del Autor</Typography>
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
                                                                    )
                                                                )
                                                            }
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
                                )
                            )
                        )
                    }
                    </Paper>
                </CardContent>
            </Card>


        {/* {
            <React.Fragment>
                <Paper style={{ padding: 20, marginBottom: 15 }} variant="outlined">
                                        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                                            <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                                                Home
                                            </Link>
                                            <Link to="/my-subjects" style={{ textDecoration: "none", color: "#333" }}>
                                                Mis Asignaturas
                                            </Link>
                                            <Link to={`/subject/${Decrypt(subject.subject)[0].id}`} style={{ textDecoration: "none", color: "#333" }}>
                                                {Decrypt(subject.subject)[0].data.code}
                                            </Link>
                                            <Typography style={{ color: "#2074d4" }}>Mis Anotaciones</Typography>
                                        </Breadcrumbs>
                                    </Paper>

                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" style={{ marginBottom: 15 }}>Todas tus Anotaciones en la Asignatura {Decrypt(Decrypt(subject.subject)[0].data.courseName)}</Typography>
                                            
                                            <React.Fragment>
                                            {
                                                loadingAnnotations === true ? (
                                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", margin: 15 }}>
                                                        <CircularProgress style={{ color: "#2074d4" }} />
                                                    </div>
                                                ) : (
                                                    errorAnnotations === true ? (
                                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                <Typography>Ha ocurrido un error al momento de cargar las anotaciones</Typography>
                                                                <Button onClick={handleGetAnnotations} style={{ color: "#2074d4" }}>
                                                                    <Typography variant="button">Recargar Anotaciones</Typography>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        annotations === null ? (
                                                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", margin: 15 }}>
                                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                            </div>
                                                        ) : (
                                                            <React.Fragment>
                                                                <List>
                                                                {
                                                                    annotations.map(doc => (
                                                                        <ListItem key={doc.id}>
                                                                            <ListItemText primary={doc.data.description} secondary={doc.data.type} />
                                                                        </ListItem>
                                                                    ))
                                                                }
                                                                </List>

                                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                    <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                    <Button onClick={handleGetAnnotations} style={{ color: "#2074d4" }}>
                                                                        <Typography variant="button">Recargar Anotaciones</Typography>
                                                                    </Button>
                                                                </div>
                                                            </React.Fragment>
                                                        )
                                                    )
                                                )
                                            }
                                            </React.Fragment>
                                        </CardContent>
                                    </Card>
                                </React.Fragment>
                            
        } */}
        </div>
    );
};

export default MyAnnotationsStudent;